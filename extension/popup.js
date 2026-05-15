const urlInput = document.querySelector("#youtubeUrl");
const searchInput = document.querySelector("#languageSearch");
const select = document.querySelector("#languageSelect");
const openButton = document.querySelector("#openButton");
const channelInput = document.querySelector("#channelUrl");
const channelAutoApply = document.querySelector("#channelAutoApply");
const linkChannelButton = document.querySelector("#linkChannelButton");
const openChannelButton = document.querySelector("#openChannelButton");
const clearChannelButton = document.querySelector("#clearChannelButton");
const status = document.querySelector("#status");

const japaneseNames = new Intl.DisplayNames(["ja"], { type: "language" });
const manualJapaneseNames = {
  "zh-Hans": "中国語（簡体）",
  "zh-Hant": "中国語（繁体）",
  fil: "フィリピン語",
  gom: "コンカニ語",
  "mni-Mtei": "メイテイ語（マニプリ語）"
};
const languages = window.YTAutoTranslateLanguages.map((language) => {
  let japaneseName = manualJapaneseNames[language.code];

  try {
    japaneseName ||= japaneseNames.of(language.code);
  } catch {
    japaneseName ||= language.name;
  }

  return { ...language, japaneseName };
});

function normalize(value) {
  return value.trim().toLowerCase();
}

function renderLanguages(filter = "") {
  const needle = normalize(filter);
  const matches = languages.filter((language) => {
    const haystack = `${language.code} ${language.name}`.toLowerCase();
    const localizedHaystack = `${haystack} ${language.japaneseName}`.toLowerCase();
    return localizedHaystack.includes(needle);
  });

  select.replaceChildren(
    ...matches.map((language) => {
      const option = document.createElement("option");
      option.value = language.code;
      option.textContent = `${language.japaneseName} / ${language.name} (${language.code})`;
      option.dataset.name = language.name;
      return option;
    })
  );

  if (!select.value && select.options.length > 0) {
    select.options[0].selected = true;
  }
}

function toWatchUrl(rawUrl) {
  let parsed;

  try {
    parsed = new URL(rawUrl.trim());
  } catch {
    throw new Error("YouTubeリンクを正しく入力してください。");
  }

  const host = parsed.hostname.replace(/^www\./, "");
  if (host === "youtu.be") {
    const videoId = parsed.pathname.split("/").filter(Boolean)[0];
    if (!videoId) throw new Error("動画IDが見つかりません。");
    parsed = new URL(`https://www.youtube.com/watch?v=${videoId}`);
  } else if (host === "youtube.com" || host === "m.youtube.com") {
    if (parsed.pathname.startsWith("/shorts/")) {
      const videoId = parsed.pathname.split("/").filter(Boolean)[1];
      parsed = new URL(`https://www.youtube.com/watch?v=${videoId}`);
    } else {
      parsed.hostname = "www.youtube.com";
    }
  } else {
    throw new Error("YouTubeのURLを入力してください。");
  }

  parsed.searchParams.set("hl", "en");
  parsed.searchParams.set("cc_load_policy", "1");
  return parsed.toString();
}

function toChannelUrl(rawUrl) {
  let parsed;

  try {
    parsed = new URL(rawUrl.trim());
  } catch {
    throw new Error("YouTubeチャンネルURLを正しく入力してください。");
  }

  const host = parsed.hostname.replace(/^www\./, "");
  if (host !== "youtube.com" && host !== "m.youtube.com") {
    throw new Error("YouTubeチャンネルのURLを入力してください。");
  }

  const parts = parsed.pathname.split("/").filter(Boolean);
  const first = parts[0] || "";
  const isHandle = first.startsWith("@");
  const isChannel = first === "channel" && parts[1];
  const isUser = first === "user" && parts[1];
  const isC = first === "c" && parts[1];

  if (!isHandle && !isChannel && !isUser && !isC) {
    throw new Error("@name、/channel/、/user/、/c/ のチャンネルURLを入力してください。");
  }

  parsed.hostname = "www.youtube.com";
  parsed.search = "";
  parsed.hash = "";
  return parsed.toString().replace(/\/$/, "");
}

async function restoreState() {
  const stored = await chrome.storage.local.get([
    "targetLanguageCode",
    "lastUrl",
    "linkedChannelUrl",
    "autoApplyLinkedChannel"
  ]);
  const fallback = stored.targetLanguageCode || "ja";

  urlInput.value = stored.lastUrl || "";
  channelInput.value = stored.linkedChannelUrl || "";
  channelAutoApply.checked = Boolean(stored.autoApplyLinkedChannel);
  renderLanguages();
  select.value = fallback;
  if (!select.value) select.value = "ja";
}

searchInput.addEventListener("input", () => renderLanguages(searchInput.value));

openButton.addEventListener("click", async () => {
  const selected = select.selectedOptions[0];
  if (!selected) return;

  openButton.disabled = true;
  status.textContent = "YouTubeを開いて設定します...";

  try {
    const url = toWatchUrl(urlInput.value);
    await chrome.storage.local.set({
      autoApply: true,
      lastUrl: urlInput.value.trim(),
      targetLanguageCode: selected.value,
      targetLanguageName: selected.dataset.name
    });

    await chrome.tabs.create({ url });
    status.textContent = "開きました。動画画面で自動設定が走ります。";
  } catch (error) {
    status.textContent = error.message;
  } finally {
    openButton.disabled = false;
  }
});

linkChannelButton.addEventListener("click", async () => {
  const selected = select.selectedOptions[0];
  if (!selected) return;

  linkChannelButton.disabled = true;
  status.textContent = "チャンネルを連携しています...";

  try {
    const channelUrl = toChannelUrl(channelInput.value);
    channelInput.value = channelUrl;

    await chrome.storage.local.set({
      linkedChannelUrl: channelUrl,
      autoApplyLinkedChannel: channelAutoApply.checked,
      targetLanguageCode: selected.value,
      targetLanguageName: selected.dataset.name
    });

    status.textContent = "連携しました。このチャンネルの動画で自動翻訳します。";
  } catch (error) {
    status.textContent = error.message;
  } finally {
    linkChannelButton.disabled = false;
  }
});

channelAutoApply.addEventListener("change", async () => {
  await chrome.storage.local.set({ autoApplyLinkedChannel: channelAutoApply.checked });
  status.textContent = channelAutoApply.checked
    ? "チャンネル自動翻訳をオンにしました。"
    : "チャンネル自動翻訳をオフにしました。";
});

openChannelButton.addEventListener("click", async () => {
  try {
    const channelUrl = toChannelUrl(channelInput.value);
    await chrome.tabs.create({ url: channelUrl });
  } catch (error) {
    status.textContent = error.message;
  }
});

clearChannelButton.addEventListener("click", async () => {
  await chrome.storage.local.remove(["linkedChannelUrl", "autoApplyLinkedChannel"]);
  channelInput.value = "";
  channelAutoApply.checked = false;
  status.textContent = "チャンネル連携を解除しました。";
});

restoreState();
