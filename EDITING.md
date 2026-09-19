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
| contact.form | 問い合わせフォームの文言、Worker送信先、Turnstileの公開site key |
| contact.kofi | フッターのKo-fiリンク |
| footer | フッターの文言 |
| privacy | フッターのGoogle Analytics・AdSense・Cookie・問い合わせ保存に関する短い表記 |

## 作品を追加・変更するとき

projects の中の1つのオブジェクトが1作品です。title、description、stack、link を変更すれば、作品カードの内容が変わります。stack はサムネイル直下に通常の文字で表示され、複数の技術は `SwiftUI / iOS` のように「 / 」区切りでそのまま記載します。カードの文言は日本語、それ以外（見出し・About・フッター・ナビなど）は英語です。カード全体が link のURLを開くリンクです。

visual は現在 database と calculator に対応しています。見た目の種類を増やす場合だけ、HTML/CSS/JavaScriptの変更が必要です。

## 問い合わせフォーム

`contact.form` の文言はフォームに表示されます。`endpoint` はWorkerの `https://...workers.dev/api/contact` のURL、`turnstileSiteKey` は公開してよいTurnstile site keyです。Turnstileの**secret keyはここやJSONには絶対に書かず**、Cloudflare WorkerのSecretとしてだけ保存します。

フォームは対象・本文・任意の返信先だけを扱います。返信先はXやGitHubなどのIDを想定しており、メールアドレスは入力しないよう案内しています。

## ローカルで確認する

リポジトリのルートで、次を実行します。

    python3 -m http.server 4173

ブラウザで http://127.0.0.1:4173/ を開きます。JSONをfetchするため、index.htmlをダブルクリックする方法ではなくローカルHTTPサーバーを使ってください。

JSONを編集したら、ブラウザを再読み込みして確認します。

右上の月／太陽ボタンでライト・ダークを切り替えられます。初期表示はOSの設定に合わせ、手動の切り替えはそのページを開いている間だけ反映されます。

## Google Analytics

測定IDは `analytics.js` の1か所だけに設定しています。本番の `n4vvii.com` でだけ送信し、ローカルHTTPサーバー・Pagesの既定URL・その他のホストでは送信しません。測定IDを変更するときは、このファイルの `measurementId` を変更してください。

## Google AdSense

運営者IDは `index.html` のAdSenseスクリプトに設定しています。審査用の `ads.txt` はリポジトリ直下にあり、Cloudflare Pagesでは `https://n4vvii.com/ads.txt` として公開されます。広告枠はまだ設置していません。
