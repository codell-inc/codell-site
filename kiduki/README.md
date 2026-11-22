# KiDUKi landing

`codell-inc/kiduki` の `apps/landing/web` を移管した公開 LP。移管元は staging `8ad0c28c90d3f43611907fb9e13e6c25fc6bc035`（LP は production/main と同一）。SvelteKit / Tailwind v4 の静的アプリで、Care/Home の API・認証・業務 contract には依存しない。

本番 `https://kiduki.codell.jp/` は既存 Worker `kiduki-landing`、staging `https://staging.kiduki.codell.jp/` は既存 Pages `kiduki-landing-staging`。`/kiduki` への URL 変更はしない。会社サイトの Astro ビルドと GitHub Pages の `docs/` 出力は独立している。

## Development

このディレクトリで Bun 1.4.0 と Node 22.22.x を使う。依存と lockfile は会社サイトの npm 構成から独立している。

```sh
bun install --frozen-lockfile
bun run dev
bun run lint
bun run test
bun run check
bun run build
```

local dev は port 4173。必要な場合だけ `LANDING_DEV_HOST` / `LANDING_DEV_ALLOWED_HOSTS` を起動時に指定する。local dev に Basic 認証はない。

`build/` が静的出力。`bun run prepare:staging` / `bun run prepare:production` で `.pages-deploy/` を生成する。staging には全パスを守る Basic 認証 middleware と `_routes.json` を加える。secret が欠ける場合も 503 で閉じる。本番には Functions・認証を含めない。生成物と秘密値は commit しない。

## Content and assets

コピーとリンクは `src/lib/features/landing/content.ts`。コンポーネント・コピー・画像・動画は移管元を引き継ぎ、レビュー指摘の scouter 画像だけ alt に合う `feature-01.jpg` に修正した。Hero poster の `hero-poster.jpg` は維持する。元 monorepo のブランド palette を `src/brand.css` で所有し、package 間の依存を解消した。Svelte / Vite / Vitest は移管元の版を固定している。Vitest の推移依存も `overrides` で Vite 6.4.3 に揃え、親 Astro の依存なしで検証できる。

`static/` の全 asset はバイト単位で引き継ぐ。Hero は `/videos/hero.mp4`（9,853,505 bytes）、ポスターは `/images/hero-poster.jpg`。`hero.webm`、`/kiduki-logo.svg`、`/manus-routes.json` と既存画像のパスも維持する。動画は 16:9、ミュート・ループ・自動再生。低モーション時も動画の挙動を維持する。固定ヘッダーは Hero の可視状態で背景を切り替える。メディア差し替え時は 25 MiB 上限を含むテストを実行する。

## Deployment and verification

配備前の既存リソース検証は `scripts/preflight.mjs` が GET のみで行う。プロジェクト作成、domain/DNS 変更、secret 更新は行わない。main の全 push で会社サイトと LP の検証後、同一 artifact を staging → production の順に自動配備する。旧 SHA の rerun は拒否し、workflow 全体を直列化する。毎回の workflow_dispatch や所有者変数は不要。初回だけ既存接続設定と旧 writer 停止が必要。

配備 workflow・必要な既存環境設定・移管/rollback の順序・受入条件は [移行手順](../docs/kiduki-migration.md) を正とする。

`tests/landing-page.test.ts` は表示コピー・リンク・動画とヘッダーの契約、`hero-visibility.test.ts` は Hero の監視と解除、`static-assets.test.ts` は配信ファイル上限を検証する。移行固有のテスト設計と実施記録も移行手順に記載している。
