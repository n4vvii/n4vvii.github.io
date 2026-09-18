# 編集方法

サイトの文言・リンク・作品情報は、すべて content/site.json にまとめています。HTMLやCSSを触らず、JSONの値を変更して保存してください。

## 変更する場所

| 項目 | 変わる場所 |
| --- | --- |
| site.title / site.description | ブラウザのタイトルと検索向け説明 |
| site.profile | ヘッダーに表示する名前（クリック不可） |
| nav | 上部メニューの表示名とリンク先 |
| socials | ヘッダーのGitHub・Xアイコンの表示名とURL |
| hero | トップの見出し、説明、ボタン、右側のメモ |
| projectsSection | 作品セクションの見出しと説明 |
| projects | 作品名、短い説明、使用技術、リンク |
| about | プロフィールと右側のメモ |
| contact.links | X・GitHubの表示名、説明、URL、アイコン |
| contact.kofi | フッターのKo-fiリンク |
| footer | フッターの文言 |

## 作品を追加・変更するとき

projects の中の1つのオブジェクトが1作品です。title、description、stack、link、linkLabel を変更すれば、作品カードの内容が変わります。現在、作品カード内の表示文は日本語にしています。

visual は現在 database と calculator に対応しています。見た目の種類を増やす場合だけ、HTML/CSS/JavaScriptの変更が必要です。

## ローカルで確認する

リポジトリのルートで、次を実行します。

    python3 -m http.server 4173

ブラウザで http://127.0.0.1:4173/ を開きます。JSONをfetchするため、index.htmlをダブルクリックする方法ではなくローカルHTTPサーバーを使ってください。

JSONを編集したら、ブラウザを再読み込みして確認します。

右上の月／太陽ボタンでライト・ダークを切り替えられます。選択したテーマはブラウザに保存されます。
