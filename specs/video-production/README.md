# 動画制作サービス LP（Draft）

## ルートと統合方針

- 提案ルート: `/video-production/`（canonical: `https://codell.jp/video-production/`）。この PR では公開していません。
- main からの独立ブランチ `feat/video-production-landing`。作業開始時の `5351c6b` から、並行して追加された最新 main `104b9fe09cda32a5b7de59cfc808e8623b064fb4` へ rebase 済みです。PR #14 のマージや KiDUKi の配備切替は不要です。
- 既存 Astro 構成を使い、`src/pages/video-production/index.astro` を `docs/video-production/index.html` に静的出力します。既存の会社・問い合わせ・プライバシー・ソノバデのページは変更していません。
- 会社トップのサービスカード追加や KiDUKi LP 移管は別タスクです。本 PR は専用ページと sitemap のルート追加に限定します。
- 別タスクの checkout は読み取りのみ。本作業は別 clone `/Users/kizuki/Documents/Codex/2026-10-20/task-2/codell-site` で実施しました。
- 問い合わせ CTA はすべて既存の `/contact.html` に接続します。新規の送信処理や送信先は追加していません。

## デザインと内容

添付 `image(6).png` を本作業の Mac に取得し、1536×1024 PNG の読み取りと目視確認を行ってから実装しました。4列の図は連続する4区間として扱い、LP を1ページに構成しています。白・ネイビー・青と、コーラルの相談・料金 CTA、大きな見出し、余白を継承しました。

制作例、商品／サービス紹介、6つの活用シーン、4つの強み、料金、5段階の進行、納品形式、FAQ、問い合わせを実装しています。自社サービスの実動画2本と、AI生成の静止画イメージを明確に区別しました。生成画像と動画の出所・生成プロンプトは [SOURCES.md](../../public/video-production/assets/SOURCES.md) に記載しています。

動画は利用者の操作で再生するネイティブコントロールを使用します。自動再生はありません。概要テキスト、操作名、インライン再生、ダウンロードのフォールバックを用意しました。FAQ は JavaScript に依存しない `details` / `summary` で、Enter・Space の開閉とフォーカス表示を確認しました。ページ内ナビゲーションは小さな画面でも表示されます。

## 検証

```sh
npm ci
npm run build
node --test tests/*.test.mjs
npm run preview -- --host 127.0.0.1 --port 4323
```

- Astro check: 0 errors / 0 warnings / 0 hints。静的5ルートのビルド成功。
- 最新 main の既存14件と、本番出力のリンク・素材・実動画・問い合わせ経路を検証する3件の合計17 tests 成功。
- 本番出力をローカルで表示し、1440×1000、390×844、320×800 で目視確認。横はみ出し0、画像不良0。
- 両動画の再生・停止を実操作。両方とも `readyState=4` / `error=null`、実再生中の `currentTime > 13` を確認。ソノバデ31.6秒、KiDUKi32.6秒。
- 320px で料金アンカー到達時の section top は約150px、固定ヘッダー下端は約93px。見出しは隠れません。
- FAQ の Enter 展開・Space 閉鎖、問い合わせ CTA の `/contact.html` 遷移と既存フォームの存在を確認。問い合わせの送信はしていません。
- 公開済みの `https://codell.jp/contact.html` と `https://kiduki.codell.jp/` は読み取りで HTTP 200 を確認。ローカル MP4 の Range 取得は 206 / 1024 bytes を確認。
- 既存4ページと互換問い合わせルートの生成 HTML、および既存 source・lockfile に差分がないことを確認。
- PR 向けに `Video production landing checks` を追加。ビルドと全テストを実行し、デプロイ処理は含みません。

[PC 全体](evidence/desktop-1440.jpg) / [390px 全体](evidence/mobile-390.jpg) / [320px 全体](evidence/mobile-320.jpg) / [FAQ 320px](evidence/faq-320.jpg) / [動画再生 320px](evidence/video-playback-320.jpg) / [実測値](evidence/browser-metrics.json)

## 公開前に確認する内容

料金は提供された提案内容を保持しています。2026年10月31日までのお申し込みは50,000円（税別）、11月1日から70,000円（税別）、30秒・修正1回・MP4フルHDです。キャンペーン条件と提供範囲は事業側で最終確認してください。日付で自動切替する実装ではないため、11月以降に公開する場合はキャンペーン表示を更新します。

納期や権利の扱い、追加制作・修正の費用、縦型対応は未確定の条件を約束せず、相談時に個別確認する文章にしています。架空の受託実績、顧客の声、効果数値は掲載していません。
