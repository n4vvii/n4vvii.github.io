# 公開手順

このリポジトリはビルド不要の静的サイトです。Cloudflare Pagesの公開対象はリポジトリ直下の . です。wrangler.toml は設定だけ用意してあり、この作業ではデプロイしていません。

以下は、ドメイン購入と内容確認が終わったあとに上から順番に実行する手順です。

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
    git add index.html styles.css script.js content/site.json EDITING.md DEPLOY.md wrangler.toml github-pages-redirect
    git commit -m "Renew n4vvii portfolio"
    git push -u origin renewal-2026

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
    cp github-pages-redirect/index.html index.html
    git add index.html
    git commit -m "Redirect GitHub Pages to n4vvii.com"
    git push origin main

GitHub Pagesの静的ファイルだけではHTTP 301を返せないため、転送ページはmeta refreshとJavaScript、通常リンクの3段構成です。n4vvii.github.io のルートアクセスを https://n4vvii.com/ へ送ります。

## 7. 公開後の確認

    curl -I https://n4vvii.com/
    curl -I https://n4vvii.github.io/

ブラウザでもトップ、Ninedbase、X、GitHub、Ko-fiのリンクを確認します。

## 参考にした公式ドキュメント

- https://developers.cloudflare.com/pages/configuration/wrangler-configuration/
- https://developers.cloudflare.com/pages/configuration/custom-domains/
- https://developers.cloudflare.com/workers/wrangler/commands/pages/
