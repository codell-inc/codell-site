# 動画制作サービス LP

公開URLとcanonicalは `https://video.codell.jp/`。既存Astro構成の `/video-production/` から専用配布物を `dist/video/index.html` に生成します。問い合わせは会社サイトの `https://codell.jp/contact.html` に接続します。

## 2026年10月21日のデザイン更新

今回添付された縦長の参考画像に合わせ、全面写真のヒーロー、手書きの「想いを、もっと動かす。」、斜めの写真コラージュ、制作事例2本、夕景の料金表、写真付きの5段階の制作工程、納品物、FAQ、街の夕景の問い合わせ導線に再構成しました。

PCでは制作事例と料金を2列、工程を5列に配置。スマートフォンでは縦並びにし、人物写真の表示位置と見出しの大きさを調整しています。生成したコンセプト写真は制作事例の実動画と分けて使用しています。出典と生成プロンプトは [SOURCES.md](../../public/video-production/assets/SOURCES.md) に記載しました。

書体は手書き見出しにYomogi（400）、本文にNoto Sans JP（400/500/700）、金額・補助表記にBarlow Condensed（600/700）。Klee Oneによる端正な表現、一般的なゴシックによる見出しも検討しましたが、参考画像の手書き感に合わせてYomogiを採用しました。本文16px、補助12–14px、セクション見出し24–36px、ヒーローは画面幅に応じて可変。Google Fontsから `display=swap` で読み込み、遅い回線では読み込み後に書体が切り替わる場合があります。

ソノバデとKiDUKiは既存の実動画・サービス説明を保持しています。再生ボタンを押すとネイティブの動画操作を表示し、別の動画を再生した際には先の動画を停止します。JavaScriptが無効でも標準の動画操作とFAQが利用できます。アニメーションを減らす端末設定にも対応しています。

料金条件は2026年10月31日までのお申し込みで50,000円（税別）、11月1日以降は70,000円（税別）。30秒・初稿確認後の修正1回・MP4フルHDなどの基本条件は料金表下の開閉欄に収めています。サムネイルや別サイズの制作は個別相談として表示します。日付による価格の自動切り替えはありません。

## 検証

```sh
npm run build
npm test
npm run test:build
npm run preview -- --host 127.0.0.1 --port 4324
```

- Astro check: 0 errors / 0 warnings / 0 hints。5ルートのビルド成功。
- 既存17テスト成功。料金詳細用の開閉欄追加に合わせ、FAQの検査対象を区別しました。
- 公開用ビルドを1440×1000、390×844、320×800で目視確認。768px・1024pxも含め横はみ出し0、画像不良0。
- 両動画の操作による再生、再生位置の進行、別動画再生時の停止を確認。再生エラーなし。
- FAQのEnter展開・Space閉鎖、JavaScript無効時の動画操作とFAQ展開を確認。
- 問い合わせCTAから `/contact.html` に遷移し、既存フォーム1件の存在を確認。送信は行っていません。
- ブラウザーのコンソールエラー0。
- 会社トップ、問い合わせ、プライバシー、ソノバデの生成HTMLに差分なし。

[更新後PC](evidence/redesign-desktop-1440.jpg) / [更新後390px](evidence/redesign-mobile-390.jpg) / [更新後320px](evidence/redesign-mobile-320.jpg)

初版の検証画像と `browser-metrics.json` は2026年10月20日の記録として残しています。

## video.codell.jp の自動公開

`.github/workflows/video-production-ci.yml` はPRと作業ブランチでテスト・ビルド・公開設定の検査だけを実行します。mainへのpush、またはmainを選んだ手動実行では、検証済みの同一artifactをCloudflare Worker `codell-video` へ配備します。GitHub Environment は使用しません。古いmainの再実行は停止します。

`wrangler.video.jsonc` のCustom Domain設定により、初回の本番配備時に `video.codell.jp` の接続を作成します。`workers.dev` とプレビューURLは無効です。repository secret の `CLOUDFLARE_API_TOKEN` と repository variable の `CLOUDFLARE_ACCOUNT_ID` を利用します（Account ID は既存の repository secret も参照可能）。tokenには対象アカウントのWorkers Scripts編集と、codell.jpのWorkers Routes書き込み権限が必要です。設定方式は [Cloudflare公式Custom Domains](https://developers.cloudflare.com/workers/configuration/routing/custom-domains/) に準拠しています。

```sh
npm ci
npm test
npm run build:video
npm run test:build
npx wrangler deploy --dry-run --config wrangler.video.jsonc
npx wrangler dev --local --config wrangler.video.jsonc --port 8788
```

配布物にはLPが参照する画像・CSS・動画だけを含め、会社ページやCNAME、生成プロンプト、未使用画像を含めません。robots.txtとsitemap.xmlは専用ドメインを指します。`/video-production` と `/video-production/` は `/` へ301で移動し、素材のURLは維持します。会社トップ・プライバシー・問い合わせは会社ドメインへのリンクです。

元のソノバデ動画は保持し、配信用にH.264/AAC・フルHD・31.6秒、10,084,150 bytesの `sonovade-pr.mp4` を作成しました。2本とも1ファイル25 MiB以下です。サイズ超過や不足した素材があればビルドを失敗させます。

本番配備後は、公開HTMLが同じartifactであること、CSS・ヒーロー画像・両動画の取得内容を自動検証します。動画のRange要求が200で返る場合も、全ファイルのバイト一致を確認します。初回のDNS・証明書反映を待って再確認します。

初回公開設定時には、テスト32件、ビルド、Wrangler 4.151.3のdry-run、ローカルWorkerでの配布物一致・301・404・両動画の実再生を確認しました。当時は production GitHub Environment の既存 token と account ID を確認していましたが、2026年10月21日に同じ資格情報を repository の secret / variable に移しました。以後はこの repository scope の設定を使用します。
