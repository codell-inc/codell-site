# KiDUKi LP の移管・自動配信

移管先: https://github.com/codell-inc/codell-site/pull/14  /  受入後の旧 source cleanup: https://github.com/codell-inc/kiduki/pull/462

## Scope and public URLs

KiDUKi の公開 LP を `codell-inc/kiduki/apps/landing/web` から `codell-inc/codell-site/kiduki` に移管する。会社サイトは従来の Astro / GitHub Pages `main/docs` を維持し、サービスメニューと既存 KiDUKi 製品紹介から公開 LP へ案内する。Sonovade の項目・レイアウトと既存 KiDUKi logo / demo 素材を使用し、現行 LP の介護・家事代行向け説明に合わせる。Care/Home のアプリ・Glass・release 処理は移管しない。

| 対象 | URL | 維持する配信先 |
| --- | --- | --- |
| 会社サイト | `https://codell.jp/` | GitHub Pages `main/docs` |
| LP production | `https://kiduki.codell.jp/` | Worker `kiduki-landing`、Static Assets |
| LP staging | `https://staging.kiduki.codell.jp/` | Pages `kiduki-landing-staging`、`production_branch=staging`、Basic 認証 |

LP の `/images/*`、`/videos/*`、`/kiduki-logo.svg`、`/manus-routes.json` と `/_app/*` は各 LP hostname の root から配信する。`codell.jp/kiduki` や新しい redirect は追加しない。Astro の `docs/` と LP の `build/` は分離し、依存と型検査も独立させる。

移管元は staging `8ad0c28c90d3f43611907fb9e13e6c25fc6bc035`、production/main `8ed756558c3fc8c9d056eee4ba590043ba45f8ad`。LP source/config は両 branch で同一。static 9 files はバイト単位で保持する。レビューで確認した scouter 画像の不一致だけを修正し、最初の機能は `feature-01.jpg`、Hero poster は従来の `hero-poster.jpg` に分離する。

## Automatic delivery contract

`.github/workflows/kiduki-deploy.yml` は **main の全 push** で自動実行する。path filter がないため、この移管 PR の初回 merge も対象となる。以後、毎回の workflow_dispatch や所有者変数の設定は不要。workflow_dispatch は復旧時に main の pipeline を再実行する任意の経路として残す。

1. `verify`: 会社サイトの既存 tests/build と、LP の frozen install、lint、tests、check、static build、staging Functions compile、production dry-run を実行。失敗時はどの環境にも配備しない。検証した `build/` を commit SHA 名の artifact として保存する。
2. `staging`: 同じ SHA の artifact を取得し、旧 commit の再実行なら現在の main との SHA 比較で停止する。既存 project/branch/domain と Pages production-slot の Basic 認証 secret 名を GET のみで検証してから配備する。匿名 HTML/画像/動画/scripts が 401・Basic challenge・no-store であることを確認する。
3. `production`: staging job が成功した場合だけ、**同じ artifact** を使用する。最新 main と既存 Worker/domain・workers.dev/preview 無効を確認し、Static Assets を更新する。公開 HTML、artifact と同じ `/_app/version.json`、画像/logo/WebM の 200、MP4 の Range 206 を確認する。

workflow 全体を `kiduki-main-deploy` concurrency group で直列化し、進行中の配備は cancel しない。旧 SHA の rerun が新しい main を後から上書きすることも防ぐ。旧 repository の concurrency は別スコープのため、初回の旧 writer 停止は下記の必須条件である。

production には Basic 認証の Functions・`_routes.json`・`_worker.js` を含めない。staging middleware は全パスを保護し、secret 不在時は 503 で閉じる。preflight は provision、domain/DNS 変更、secret 変更をしない。既存資源が見つからない、所有が違う、認証が足りない場合は失敗する。

## One-time setup before merging #14

以下は **未実行の運用作業**。今回の作業では merge、remote deploy、workflow 停止、Environment/secret/variable 設定、DNS 変更を実行していない。

2026-10-20 の read-only 確認では、codell-site の repository secrets/variables は空、Environment は `github-pages` のみ。旧 kiduki の staging/production には `CLOUDFLARE_ACCOUNT_ID` / `CLOUDFLARE_API_TOKEN` の名前を確認した。値は取得していない。organization secrets の適用範囲確認は GitHub API の 403（org admin / actions-secrets 権限不足）で拒否されたため、organization から継承できるかは未確定。再試行・権限拡張はしない。

新 repo に本当に必要なのは次の接続設定だけ。

- `CLOUDFLARE_ACCOUNT_ID`: repository variable で共通設定、または各 Environment の variable / 既存 secret を使用できる。
- `staging` Environment の `CLOUDFLARE_API_TOKEN`: 既存 Pages `kiduki-landing-staging` の参照・配備に使う既存資格情報。
- `production` Environment の `CLOUDFLARE_API_TOKEN`: 既存 Worker `kiduki-landing` の参照・配備に使う既存資格情報。
- Environment を main の配備に適用する。毎回の手動承認を必須にする保護設定では自動配信が approval 待ちになるため、所有者は意図する保護ポリシーを確認する。

**既存 credential の新 repo への永続的な複製・設定には、その操作前の具体的な承認が必要。現在未承認・未実行。** GitHub の secret API は値を返さないため、既存の安全な保管元または所有者による設定が必要。新 token 作成や既存権限の拡張を前提にしない。不足なら配備を停止し、別途判断する。secret 値を会話・PR・artifact・log へ出さない。

`CLOUDFLARE_ZONE_ID`、`CUSTOM_DOMAINS_ACTIVE`、`KIDUKI_DEPLOY_OWNER`、新しい DNS/domain は不要。Pages の `BASIC_AUTH_USER` / `BASIC_AUTH_PASSWORD` は既存 Pages production slot のまま使い、GitHub へ複製しない。

## Safe merge and handover order

1. **#14 を merge する前に**、所有者が上記の既存接続設定を利用可能にする。会社サイトの既存 GitHub Pages 設定は変更しない。
2. **初回だけ旧 writer を停止する。** kiduki の `Deploy Landing staging` / `Deploy Landing production` を運用担当が無効化し、実行中・待機中 run の終了を確認する。旧 LP 編集を凍結し、移管元以降に LP 更新があれば同期する。現在の Worker version / Pages deployment ID を rollback 用に記録する。旧アプリ・Glass workflow は止めない。
3. **#14 を main に merge する。** 追加された service link は既に公開中の LP を向く。新自動 pipeline は verify → staging → production を同じ artifact で実行する。資格情報が不足すれば preflight で止まり、既存配信は維持される。停止した旧 workflow を同時に再有効化しない。
4. 自動 job の結果に加え、既存 Basic 認証での staging 200、production の匿名 200、動画の再生/seek、画像・リンク、desktop/mobile を実 URL で受け入れ、SHA/deployment ID と証跡を記録する。匿名 staging 401 の自動チェックは認証後の本文確認の代用にはしない。
5. **両環境の受入後だけ #462 を staging に merge する。** 旧 source、LP 専用 CI/deploy/helper を削除する。main 反映は既存の通常 release 手順。共有 auth/tokens/Care/Home 用 helper は残す。旧 root bun.lock はアプリ deploy の path filter に含まれるため、cleanup merge/release 日程は運用担当が調整する。LP のためにアプリ release 条件や Glass 配信を変更しない。

#462 の受入前 merge は不可。初回の接続設定と旧 workflow 停止をコードで完了したようには扱わない。新 repo の標準 GITHUB_TOKEN は private な旧 repo の workflow 停止を検証する権限を持たないため、停止の証跡は運用担当が確認する。このための cross-repo token は作成しない。

## Rollback

preflight 前に止まれば現行配信は変わらない。配備後の smoke failure は「配備自体が失敗した」と同義ではないため、workflow の deploy step と実 URL / version を先に確認する。新自動 workflow を運用担当が停止し、進行中 run の終了を待ってから、記録した Worker version / Pages deployment を承認済み経路で復元する。新旧 writer を同時に有効にしない。cleanup 前は旧 source を保持し、必要なら旧 workflow だけを戻せる。cleanup 後は既知 commit の復元 PR をレビューしてから配備する。DNS/domain/resource/secret は削除しない。

## Verification design and evidence

- 会社サイトの既存13 tests、Astro check/build。PC/スマホでサービスメニューの Sonovade と KiDUKi、公開 LP へのリンク、既存の素材を使う製品紹介 CTA を確認する。`docs/` の HTML は生成元を直して再生成する。
- LP 既存 tests は copy/link/video/observer と 25 MiB 上限。追加した `KiDUKi feature imagery` は scouter が alt に合う `feature-01.jpg` を使い、Hero poster は従来値を保つことを検証。旧設定で Red を確認して修正する。
- `tests/deployment.test.mjs`: GET-only の既存 target/secret 検証と、staging Functions・production static 出力分離。所有不在/branch不一致/pending/secret不在/403 は拒否。
- `tests/staging-auth.test.ts`: 各 public path の匿名401、正しい Basic200、不正401、設定不在503。
- `tests/publication.test.mjs`: 匿名 staging 401/challenge/no-store、公開 production HTML/画像/動画 Range、検証済み artifact version を模擬 HTTP で確認。public staging、challenge欠落、誤ったHTML、Range非対応、古いversionを拒否。実装前に missing module で Red を確認。
- actionlint で main push（path filterなし）・verify→staging→production・artifact連携を含む追加 workflow を検証する。PR CI は remote deploy せず、Functions compile / Worker dry-run まで確認する。

移管時に確認済みの media: static 9 files は元と byte-identical、MP4 9,853,505 bytes、SHA-256 `c72df40bd9ce398454a42397a8a99edbe2c4574ab859948f5044076b4b4554d9`。LP の local Chrome 1440/390/320px は横はみ出し・画像欠落なし、video paused=false / readyState=4 / error=null。local MP4 Range は206/1024 bytes。先行移管の [screenshots](../kiduki/evidence/) と [旧公開記録](https://github.com/codell-inc/kiduki/tree/8ed756558c3fc8c9d056eee4ba590043ba45f8ad/specs/20261020-landing-production-deploy/evidence) は baseline として保持する。追加指示に対応した最終結果は PR #14 の CI/表示証跡に記録する。

Vitest の推移依存を含め Vite 6.4.3 に固定し、親 Astro の node_modules を退避した LP 単独のクリーン検証も成功している。単独 config 探索時の親 Astro 不在 warning と、LP 自体の型検査成功を区別する。今回の自動配信はまだ remote 実行しておらず、初回の credential 設定・旧 writer 停止・配備後受入は未実施。
