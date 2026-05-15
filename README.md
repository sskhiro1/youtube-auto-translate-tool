# YouTube Auto Translator

YouTubeリンクを入力して翻訳先の言語を選ぶと、動画ページを開き、字幕の自動翻訳設定まで進めるChrome拡張機能です。

公開ページ:

```text
https://youtube-translate-tool.netlify.app/
```

## できること

- `youtube.com` / `youtu.be` / Shorts URLを通常の動画URLに変換
- YouTubeのUIを英語表示に寄せて、自動翻訳メニューを探しやすくする
- Google Cloud Translation NMTの公式対応リストに合わせた194言語候補を表示
- 字幕ボタン、設定、Subtitles/CC、Auto-translate、言語選択を自動クリック
- YouTubeチャンネルURLを連携し、そのチャンネルの動画で常に自動翻訳を設定

## 翻訳エンジンについて

- 現在のChrome拡張は、YouTube内蔵の自動翻訳メニューを操作します。
- 言語候補はGoogle Cloud TranslationのNMT対応言語を基準に194言語へ拡張済みです。
- DeepL ProやGoogle Cloud Translation APIで実際に字幕ファイルを生成するには、APIキーをサーバー側に設定する必要があります。
- 対応数を最大化するならGoogle Cloud Translation、主要言語の品質を優先するならDeepLを優先し、DeepL非対応言語はGoogleへフォールバックする構成が適しています。

## インストール

1. Chromeで `chrome://extensions/` を開く
2. 右上の「デベロッパーモード」をオン
3. 「パッケージ化されていない拡張機能を読み込む」を押す
4. このフォルダを選ぶ

```text
/Users/ssk/Desktop/名称未設定フォルダ/youtube-auto-translate-tool/extension
```

## 使い方

公開ページの入力欄は動作確認用です。YouTube上で字幕メニューを自動操作するには、Chrome拡張機能として読み込んでください。

1. Chromeの拡張機能アイコンから「YouTube Auto Translator」を開く
2. YouTubeリンクを貼る
3. 翻訳先言語を検索して選ぶ
4. 「開いて自動設定」を押す

## チャンネル連携

1. 翻訳先言語を選ぶ
2. YouTubeチャンネルURLを貼る
3. 「このチャンネルの動画で常に自動翻訳」をオン
4. 「チャンネル連携」を押す

連携後は、そのチャンネルの動画ページを開くたびに保存済みの翻訳先へ自動設定します。

## 注意点

- 元動画に字幕または自動生成字幕がない場合は、自動翻訳を設定できません。
- YouTubeの画面構造が変わると、自動クリック部分の調整が必要になることがあります。
- ブラウザ拡張の制約上、YouTube側が表示しているメニューを実際にクリックして設定します。
