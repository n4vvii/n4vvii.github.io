# 公開手順

このリポジトリはビルド不要の静的サイトです。Cloudflare Pagesの公開対象はリポジトリ直下の . です。現在の本番URLは https://n4vvii.com/ 、Pagesの既定URLは https://n4vvii-portfolio.pages.dev/ です。

## Google Analytics（GA4）

`analytics.js` に測定IDを1か所だけ設定しています。`n4vvii.com` と `www.n4vvii.com` でのみGoogleのgtagを読み込み、ローカル・Pages既定URL・その他のホストでは送信しません。フッターにはCookie利用、個人を直接特定する情報をAnalyticsへ意図的に送らないこと、Googleのオプトアウト方法、問い合わせ内容の保存先とIPアドレスを保存しないことを表示しています。

## Google AdSense（審査準備）

`index.html` のheadに運営者ID `ca-pub-2854845503175082` の審査用スクリプトを設定しています。リポジトリ直下の `ads.txt` は `https://n4vvii.com/ads.txt` で `text/plain` として公開します。広告枠は審査準備の段階では設置しません。

## 問い合わせWorker（先に作成済み）

フォーム送信先は `contact-worker/` のCloudflare Workerです。静的ポートフォリオとは別に、D1へ問い合わせを保存します。WorkerとPagesの初回デプロイ、`n4vvii.com` の接続は完了しています。

    cd /Users/na/Master/Portfolio/n4vvii.github.io/contact-worker
    wrangler d1 execute n4vvii-contact --remote --file schema/0001_initial.sql
    openssl rand -hex 32 | wrangler secret put RATE_LIMIT_SALT
    wrangler secret put TURNSTILE_SECRET
    wrangler deploy

`TURNSTILE_SECRET` はプロンプトにだけ入力し、ファイル・JSON・Gitに保存しません。WorkerのURLを `content/site.json` の `contact.form.endpoint` に設定します。

Turnstile Widgetには `n4vvii.com` と `www.n4vvii.com` を許可済みです。将来ホスト名を追加するときは、Turnstileの許可ホスト名と `contact-worker/wrangler.toml` の `ALLOWED_ORIGINS` を同時に更新してからWorkerを再デプロイします。

受信箱は公開しません。Mac上で次を実行して http://127.0.0.1:8788 を開きます。

    cd /Users/na/Master/Portfolio/n4vvii.github.io/contact-worker
    node admin/admin-server.mjs

以下は、新規環境で同じ構成を作る場合、または公開内容を更新する場合の手順です。

## 1. ドメインを用意する

1. n4vvii.com を購入します。
2. Cloudflareにログインし、Cloudflare Dashboardで n4vvii.com をZoneとして追加します。
3. ドメイン購入先の管理画面で、Cloudflareが表示するネームサーバーへ変更します。
4. ネームサーバーの反映を待ちます。

独自ドメインのトップ（apex domain）をCloudflare Pagesに割り当てるには、ドメインをCloudflareのZoneとして管理する必要があります。

## 2. ローカル内容を最終確認する

    cd /Users/na/Master/Portfolio/n4vvii.github.io
    git switch renewal-2026
    python3 -m http.server 4173

PC幅と390px幅で確認し、内容に問題がなければサーバーを停止します。

## 3. GitHubへ反映する

これはユーザー確認後に実行してください。

    cd /Users/na/Master/Portfolio/n4vvii.github.io
    git switch renewal-2026
    git push --force-with-lease origin renewal-2026:main

この手順では、ポートフォリオのソースを `main` に置きます。`main` を転送ページで上書きしません。

## 4. Cloudflare Pagesプロジェクトを作る

Wranglerのログイン状態を確認し、プロジェクトを作成して初回デプロイします。

    npx wrangler whoami
    npx wrangler pages project create n4vvii-portfolio --production-branch main
    npx wrangler pages deploy . --project-name n4vvii-portfolio

すでに同名プロジェクトが存在する場合は、作成コマンドを飛ばしてdeployだけ実行します。

デプロイ後、まず https://n4vvii-portfolio.pages.dev/ で表示を確認します。

## 5. n4vvii.comをPagesへ割り当てる

1. Cloudflare Dashboardの Workers & Pages を開きます。
2. n4vvii-portfolio を開きます。
3. Custom domains → Set up a domain を選びます。
4. n4vvii.com を入力して続行します。
5. Cloudflareが示すDNS・証明書の状態が有効になるまで待ちます。
6. https://n4vvii.com/ と https://www.n4vvii.com/ の扱いを確認します。トップは n4vvii.com を正とします。

## 6. GitHub Pagesを転送ページへ切り替える

このリポジトリには github-pages-redirect/index.html として転送用ページを別ディレクトリに用意しています。Cloudflare Pagesの表示確認後、ユーザー確認を取ってから実行します。

    cd /Users/na/Master/Portfolio/n4vvii.github.io
    git switch renewal-2026
    git subtree split --prefix=github-pages-redirect -b gh-pages
    git push --force-with-lease origin gh-pages

GitHubのリポジトリ設定で **Pages → Build and deployment → Branch** を `gh-pages`、フォルダを `/(root)` に変更します。APIで切り替える場合は次を実行します。

    gh api --method PUT repos/n4vvii/n4vvii.github.io/pages -f 'source[branch]=gh-pages' -f 'source[path]=/'

GitHub Pagesの静的ファイルだけではHTTP 301を返せないため、転送ページはmeta refreshとJavaScript、通常リンクの3段構成です。n4vvii.github.io のルートアクセスを https://n4vvii.com/ へ送ります。

## 7. 公開後の確認

    curl -I https://n4vvii.com/
    curl -I https://n4vvii.github.io/

ブラウザでもトップ、Ninedbase、X、GitHub、Ko-fiのリンクを確認します。

## 参考にした公式ドキュメント

- https://developers.cloudflare.com/pages/configuration/wrangler-configuration/
- https://developers.cloudflare.com/pages/configuration/custom-domains/
- https://developers.cloudflare.com/workers/wrangler/commands/pages/
