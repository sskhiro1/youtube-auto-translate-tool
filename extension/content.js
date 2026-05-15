const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function textOf(element) {
  return [
    element.textContent,
    element.getAttribute("aria-label"),
    element.getAttribute("title")
  ]
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

function includesAny(element, patterns) {
  const text = textOf(element).toLowerCase();
  return patterns.some((pattern) => text.includes(pattern.toLowerCase()));
}

function normalizeChannelPath(urlOrPath) {
  try {
    const url = urlOrPath.startsWith("/")
      ? new URL(urlOrPath, "https://www.youtube.com")
      : new URL(urlOrPath);
    const parts = url.pathname.split("/").filter(Boolean);

    if (parts[0]?.startsWith("@")) return `/${parts[0].toLowerCase()}`;
    if (["channel", "user", "c"].includes(parts[0]) && parts[1]) {
      return `/${parts[0].toLowerCase()}/${parts[1].toLowerCase()}`;
    }
  } catch {
    return "";
  }

  return "";
}

function currentVideoChannelPath() {
  const ownerLink = [
    ...document.querySelectorAll("ytd-video-owner-renderer a[href], #owner a[href], #upload-info a[href]")
  ].find((link) => normalizeChannelPath(link.getAttribute("href")));

  return ownerLink ? normalizeChannelPath(ownerLink.getAttribute("href")) : "";
}

async function isLinkedChannelVideo(settings) {
  if (!settings.autoApplyLinkedChannel || !settings.linkedChannelUrl) return false;

  const targetPath = normalizeChannelPath(settings.linkedChannelUrl);
  if (!targetPath) return false;

  const started = Date.now();
  while (Date.now() - started < 10000) {
    const videoPath = currentVideoChannelPath();
    if (videoPath) return videoPath === targetPath;
    await sleep(250);
  }

  return false;
}

async function waitForElement(selector, timeout = 12000) {
  const started = Date.now();

  while (Date.now() - started < timeout) {
    const element = document.querySelector(selector);
    if (element) return element;
    await sleep(250);
  }

  throw new Error(`Could not find ${selector}`);
}

async function waitForMenuItem(patterns, timeout = 6000) {
  const started = Date.now();

  while (Date.now() - started < timeout) {
    const items = [
      ...document.querySelectorAll(".ytp-panel-menu .ytp-menuitem"),
      ...document.querySelectorAll(".ytp-panel-menu [role='menuitem']"),
      ...document.querySelectorAll(".ytp-popup .ytp-menuitem"),
      ...document.querySelectorAll(".ytp-popup [role='menuitem']")
    ];
    const item = items.find((candidate) => includesAny(candidate, patterns));
    if (item) return item;
    await sleep(200);
  }

  throw new Error(`Could not find menu item: ${patterns.join(", ")}`);
}

function showStatus(message, tone = "info") {
  let box = document.querySelector("#yt-auto-translate-status");

  if (!box) {
    box = document.createElement("div");
    box.id = "yt-auto-translate-status";
    box.style.cssText = [
      "position:fixed",
      "right:16px",
      "bottom:16px",
      "z-index:2147483647",
      "max-width:320px",
      "padding:12px 14px",
      "border-radius:8px",
      "background:#14191b",
      "color:#fff",
      "font:13px/1.45 system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif",
      "box-shadow:0 10px 30px rgba(0,0,0,.25)"
    ].join(";");
    document.documentElement.appendChild(box);
  }

  box.style.background = tone === "error" ? "#a3131a" : "#14191b";
  box.textContent = message;
}

async function clickSettings() {
  const settings = await waitForElement(".ytp-settings-button");
  if (!settings.getAttribute("aria-expanded")?.includes("true")) {
    settings.click();
    await sleep(400);
  }
}

async function enableCaptions() {
  const button = document.querySelector(".ytp-subtitles-button");
  if (!button) return;

  const pressed = button.getAttribute("aria-pressed");
  const unavailable = textOf(button).toLowerCase().includes("unavailable");
  if (pressed !== "true" && !unavailable) {
    button.click();
    await sleep(600);
  }
}

async function chooseAutoTranslateLanguage(languageName) {
  await clickSettings();

  const subtitles = await waitForMenuItem([
    "subtitles/cc",
    "subtitles",
    "closed captions"
  ]);
  subtitles.click();
  await sleep(500);

  const autoTranslate = await waitForMenuItem(["auto-translate", "auto translate"]);
  autoTranslate.click();
  await sleep(700);

  const desired = await waitForMenuItem([languageName]);
  desired.click();
}

async function applyAutoTranslate() {
  const settings = await chrome.storage.local.get([
    "autoApply",
    "autoApplyLinkedChannel",
    "linkedChannelUrl",
    "targetLanguageName",
    "targetLanguageCode"
  ]);

  if (!settings.targetLanguageName) return;
  if (!location.href.includes("/watch")) return;

  const shouldApply = settings.autoApply || (await isLinkedChannelVideo(settings));
  if (!shouldApply) return;

  if (lastAppliedUrl === location.href) return;
  lastAppliedUrl = location.href;

  showStatus(`Preparing YouTube auto-translate: ${settings.targetLanguageName}`);

  try {
    await waitForElement(".html5-video-player", 20000);
    await enableCaptions();
    await chooseAutoTranslateLanguage(settings.targetLanguageName);
    if (settings.autoApply) await chrome.storage.local.set({ autoApply: false });
    showStatus(`Auto-translate set to ${settings.targetLanguageName}`);
    setTimeout(() => document.querySelector("#yt-auto-translate-status")?.remove(), 4500);
  } catch (error) {
    lastAppliedUrl = "";
    showStatus(
      `自動設定できませんでした。字幕が無い動画、またはYouTubeの表示変更の可能性があります。${error.message}`,
      "error"
    );
  }
}

let lastUrl = "";
let lastAppliedUrl = "";
setInterval(() => {
  if (location.href !== lastUrl) {
    lastUrl = location.href;
    applyAutoTranslate();
  }
}, 1000);

applyAutoTranslate();
