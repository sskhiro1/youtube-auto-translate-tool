# YouTube Auto Translator

YouTubeリンクを入力して翻訳先の言語を選ぶと、動画ページを開き、字幕の自動翻訳設定まで進めるChrome拡張機能です。

公開ページ:

```text
https://youtube-translate-tool.netlify.app/
```

## できること

- `youtube.com` / `youtu.be` / Shorts URLを通常の動画URLに変換
- YouTubeのUIを英語表示に寄せて、自動翻訳メニューを探しやすくする
- できるだけ多くのYouTube/Google翻訳系の言語候補を選択肢として表示
- 字幕ボタン、設定、Subtitles/CC、Auto-translate、言語選択を自動クリック

## インストール

1. Chromeで `chrome://extensions/` を開く
2. 右上の「デベロッパーモード」をオン
3. 「パッケージ化されていない拡張機能を読み込む」を押す
4. このフォルダを選ぶ

```text
/Users/ssk/Desktop/名称未設定フォルダ/youtube-auto-translate-tool/extension
```

## 使い方

1. Chromeの拡張機能アイコンから「YouTube Auto Translator」を開く
2. YouTubeリンクを貼る
3. 翻訳先言語を検索して選ぶ
4. 「開いて自動設定」を押す

## 注意点

- 元動画に字幕または自動生成字幕がない場合は、自動翻訳を設定できません。
- YouTubeの画面構造が変わると、自動クリック部分の調整が必要になることがあります。
- ブラウザ拡張の制約上、YouTube側が表示しているメニューを実際にクリックして設定します。
