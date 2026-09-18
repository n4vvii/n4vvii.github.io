# 編集方法

サイトの文言・リンク・作品情報は、すべて content/site.json にまとめています。HTMLやCSSを触らず、JSONの値を変更して保存してください。

## 変更する場所

| 項目 | 変わる場所 |
| --- | --- |
| site.title / site.description | ブラウザのタイトルと検索向け説明 |
| nav | 上部メニューの表示名とリンク先 |
| hero | トップの見出し、説明、ボタン、右側のメモ |
| work | 作品セクションの見出しと説明 |
| projects | 作品名、状態、説明、リンク、タグ、作品ごとの短いキャプション |
| about | プロフィールと右側の「recipe」メモ |
| contact.links | X、GitHub、Discordの表示名・説明・URL |
| contact.kofi | フッターのKo-fiリンク |
| footer | フッターの文言 |

## 作品を追加・変更するとき

projects の中の1つのオブジェクトが1作品です。title、description、link、linkLabel、tags を変更すれば、作品カードの内容が変わります。

visual は現在 database と calculator に対応しています。見た目の種類を増やす場合だけ、HTML/CSS/JavaScriptの変更が必要です。

## ローカルで確認する

リポジトリのルートで、次を実行します。

    python3 -m http.server 4173

ブラウザで http://127.0.0.1:4173/ を開きます。JSONをfetchするため、index.htmlをダブルクリックする方法ではなくローカルHTTPサーバーを使ってください。

JSONを編集したら、ブラウザを再読み込みして確認します。
