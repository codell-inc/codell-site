# KiDUKi LP のリポジトリ移管

## Scope and acceptance

KiDUKi の公開 LP を `codell-inc/kiduki/apps/landing/web` から `codell-inc/codell-site/kiduki` に移管する。会社サイト、Sonovade、問い合わせ、privacy と GitHub Pages `main/docs` は維持する。Care/Home のアプリ・Glass・リリース処理は移管しない。

| 公開対象 | URL / path | 維持する配信先 |
| --- | --- | --- |
| 会社サイト | `https://codell.jp/` | GitHub Pages、`main/docs` |
| LP production | `https://kiduki.codell.jp/` | Worker `kiduki-landing`、Static Assets |
| LP staging | `https://staging.kiduki.codell.jp/` | Pages `kiduki-landing-staging`、`production_branch=staging`、Basic 認証 |
| LP assets | `/videos/*`、`/images/*`、`/kiduki-logo.svg`、`/manus-routes.json`、`/_app/*` | LP の各 hostname の root から配信 |

移管元は staging `8ad0c28c90d3f43611907fb9e13e6c25fc6bc035`、production/main `8ed756558c3fc8c9d056eee4ba590043ba45f8ad`。LP source/config の両 branch 間差分はない。全 static asset とページ component/copy を維持し、共有 palette のみ LP 内へ移す。新しい `codell.jp/kiduki` やリダイレクトは追加しない。

独立した SvelteKit ビルドにより root 相対 URL と既存描画を維持する。Astro の `tsconfig.json` では `kiduki` を除外し、別 TypeScript 設定で検査する。会社サイトの依存・ページ・生成物は変更しない。

## Safe merge and handover order

以下は将来の運用手順であり、この PR 作成作業では merge、配備、workflow 停止、Environment/secret/変数の設定、DNS 変更を一切実行していない。

1. **この codell-site PR を先にレビュー・マージする。** `kiduki-deploy.yml` は `workflow_dispatch` のみ、`main` 限定。さらに `KIDUKI_DEPLOY_OWNER=codell-site` の明示 gate があり、merge だけでは公開環境を変更しない。会社サイトの既存 Pages 公開は通常どおり。
2. **既存アクセスの移管準備を運用担当が行う。** codell-site には現在 `github-pages` Environment だけが存在する。LP 用の `staging` / `production` の保護設定と、既存アカウントの `CLOUDFLARE_ACCOUNT_ID`（variable または既存 secret）・`CLOUDFLARE_API_TOKEN` を利用できるか確認する。この作業で credentials の新規作成・secret のコピー/変更・権限拡大はしない。既存権限で利用できなければ移管を止め、旧配信を継続する。
3. **旧 writer を止める。** kiduki の `Deploy Landing staging` / `Deploy Landing production` を運用担当が無効化し、実行中・待機中の deploy run がないことを確認する。二つの repository の concurrency group は相互排他にならない。LP 専用 workflow 以外やアプリ/Glass の workflow は変更しない。切替中の LP 編集を凍結し、移管元 SHA 以降に LP 更新があれば先に同期する。Worker の既存 version と Pages deployment ID を rollback 用に記録する。
4. **staging の owner gate を有効にし、codell-site/main から staging を手動配備する。** preflight は既存 project、branch、active domain と production-slot の `BASIC_AUTH_USER` / `BASIC_AUTH_PASSWORD` secret 名を読むだけ。Pages の branch `staging` が production slot なので、secret 値を GitHub や新コードへ移す必要はない。匿名の `/`・画像・動画・`/_app` が 401、既存認証で 200、動画の再生・seek・画像・リンク・各幅の表示を確認する。欠落 secret は preflight で停止し、middleware 自体も 503 で閉じる。
5. **staging の受入後だけ production の owner gate を有効にし、本番を手動配備する。** preflight は `kiduki.codell.jp` の既存 Worker 所有と workers.dev / preview 無効を GET で検証する。domain を付け替える helper、routes、zone/DNS API は持ち込まない。既存 Worker の assets だけを更新する。匿名 `/` が 200、WWW-Authenticate なし、動画/画像/リンクと desktop/mobile を確認する。既存 asset URL を変えず、動画 Range/seek も確認する。
6. **両環境の実 URL の受入証跡を残した後だけ kiduki の cleanup PR をマージする。** cleanup は staging を対象とし、通常の承認済みリリースで main に反映する。旧 repo の source、LP 専用 CI/deploy/helper を削除する。共有 auth、tokens、Care/Home 用出力 helper は残す。bun.lock 整理は旧 repo の既存アプリ deploy の path filter にも該当するため、運用担当は通常の staging/main 配備日程を確認する。LP 移管のためにアプリ release 条件や Glass 配信を変更しない。

受入前の cleanup merge は不可。旧 source が残る期間は無停止切替・rollback に必要であり、恒久的な二重管理にはしない。新 workflow の自動 push 配備はこの移管には含めない。

## Rollback

配備前の preflight/権限検証で止まった場合は既存配信がそのまま残る。新配備後に不具合があれば新 workflow の gate を外し、進行中 run の終了を確認してから、記録した Worker version / Pages deployment を既存の承認済み運用経路で戻す。新旧 writer を同時に有効にしない。cleanup 前なら旧 LP workflow を運用担当が再有効化し、既知の SHA を既存経路で配備できる。cleanup 後は必要な旧 commit の復元 PR を作り、レビューしてから配備する。DNS、domain、resource、secret を削除しない。

## Verification design

- `kiduki/tests/deployment.test.mjs`: API mock で GET だけが実行されること、Worker/domain の所有、Pages branch/domain、production slot の secret 名を確認。所有不在・異なる branch・pending domain・secret 不在・403 では失敗し、provisioning しない。fixture build に既存 media と古い function marker を置き、staging 出力は全パス auth を含み、production 再生成では Functions と marker が残らず、media の bytes を保つことを検証する。
- `kiduki/tests/staging-auth.test.ts`: 匿名 HTML/画像/動画/scripts/well-known は 401、正しい Basic 認証（password の colon 含む）は 200、不正/壊れた header は 401、設定不在は 503。production output にはこの middleware 自体が存在しないことを出力テストで別に確認する。
- 既存 LP の 12 テスト: copy、CTA、法務リンク、hero 動画・header の契約、IntersectionObserver の callback/解除、static files の 25 MiB 上限を移管先でも検証する。
- 会社サイトの既存 13 テスト、Astro check/build、既存 `docs/` の差分ゼロを確認する。
- CI では二つの build/check と LP lint/test、staging Functions の local compile、production Worker の `--dry-run` を実行し、deploy は行わない。

## Execution evidence and remaining checks

この節には PR 作成時点の実施結果を追記する。リモート配備、DNS/TLS、実 URL の新 repo からの受入は手順 4–5 まで未実施であり、local build の成功で代用しない。

2026-10-20、ユーザーの Mac の独立した checkout で以下を確認した。

| 検証 | 実測結果 |
| --- | --- |
| 会社サイト | 既存テスト 13 件成功、Astro check は 0 error / warning / hint、4 routes の build 成功。既存 `src/`・`public/`・`docs/` 生成物・root lockfile の差分なし |
| LP | Bun 1.4.0 frozen install、Biome lint、既存12件＋auth4件＋配備/出力8件の計24テスト、svelte-check（0 error / warning）、Vite static build が成功 |
| 配備準備 | staging Functions local compile 成功。production の出力は Function marker なし。Wrangler 4.135.0 の dry-run は assets 33 files、binding なしで成功。remote deploy は未実施 |
| GitHub Actions | actionlint 1.7.12 で追加 workflow 2本の検証成功 |
| 素材・表示データ | static 9 files、`src/lib` 5 files、`src/routes` 3 files が元とバイト単位で一致。MP4 SHA-256 `c72df40bd9ce398454a42397a8a99edbe2c4574ab859948f5044076b4b4554d9` |
| local HTTP | LP と会社トップ・Sonovade は 200。MP4 Range 0–1023 は 206、Content-Range `bytes 0-1023/9853505`、1024 bytes |
| Chrome 実ブラウザ | DevTools の responsive viewport 1440・390・320px。全幅で `innerWidth == document.documentElement.scrollWidth`、読み込み不良画像0、video `paused=false / readyState=4 / error=null`。見出し、CTA、画像、全体 layout を目視確認 |
| 現公開の baseline | production の匿名 HEAD は 200 / Basic challenge なし、staging は 401 / Basic challenge / no-store。既存サイトを変更していない |

移管後の local screenshots: [desktop](../kiduki/evidence/after-1440.png)、[390px](../kiduki/evidence/after-390.png)、[320px](../kiduki/evidence/after-320.png)。移管前の公開受入 screenshots は [元の production 記録](https://github.com/codell-inc/kiduki/tree/8ed756558c3fc8c9d056eee4ba590043ba45f8ad/specs/20261020-landing-production-deploy/evidence) を参照。動画の frame は撮影時刻で異なる。

ローカル shell の Node は 26.5.0、CI と配備 workflow は元の運用と同じ 22.22.2 に固定している。Vitest 実行時に既存 Svelte plugin の `optimizeDeps.esbuildOptions` deprecated warning が出るが、検査・build は成功している。Wrangler の local log は workspace 外書込を避けるため一時フォルダへ出力した。
