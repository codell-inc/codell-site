# Codell website

会社サイト `https://codell.jp` と KiDUKi の公開 LP を管理する。

- 会社サイト: Astro、`src/pages/` が生成元。`npm ci` → `npm run build` で `docs/` を生成する。GitHub Pages は `main` の `/docs` を公開する。`docs/` の HTML は直接編集しない。
- KiDUKi: [`kiduki/`](kiduki/README.md) に独立した SvelteKit 静的アプリを置く。公開 URL は `https://kiduki.codell.jp/`、staging は `https://staging.kiduki.codell.jp/`。会社サイトの `docs/` へは出力しない。
- 動画制作: [`仕様・公開手順`](specs/video-production/README.md)。`npm run build:video` で専用配布物を `dist/video/` に生成し、mainへの反映後に `https://video.codell.jp/` へ自動配備する。

両サイトのテスト・ビルドは `KiDUKi migration checks` が検証する。KiDUKi は main の全 push で検証後、同じ build artifact を staging → production へ自動配備する。初回 merge も対象となり、毎回の手動実行や所有者変数は不要。移管の条件・安全な順序・運用上の未実施項目は [移行手順](docs/kiduki-migration.md) を参照。
