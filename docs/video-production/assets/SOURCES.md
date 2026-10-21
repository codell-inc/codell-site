# 動画制作 LP の素材

画像3点は2026年10月20日に built-in imagegen で新規生成しました。クライアントや実在する納品事例を表す画像ではありません。WebP への変換・縮小は sharp で行い、元の生成画像は作業領域に保持しています。

| 配置ファイル | 用途 | サイズ |
| --- | --- | --- |
| `hero.webp` | 山並みを望む人物のコンセプトイメージ | 1659×948 / 約88 KB |
| `product-concept.webp` | 架空の飲料の商品紹介イメージ | 1200×675 / 約109 KB |
| `interior-concept.webp` | 架空の住空間の紹介イメージ | 1200×675 / 約172 KB |

生成プロンプトは以下のとおりです。

## Hero

Use case: photorealistic-natural. Asset type: wide hero photograph for a Japanese commissioned video production landing page. Create a cinematic editorial photograph, wide 16:9, of a lone adult Japanese traveler seen from behind at the far right third, wearing a muted dark navy outdoor jacket, contemplating layers of misty forested Japanese mountains at sunrise. Restrained natural blue-gray and teal mountains, warm pale sky, gentle sunlight touching shoulder. Left half should be beautiful light open foggy mountain sky and subtle distant ridges with ample negative space for dark navy Japanese headline; no text in the image. Expansive, quiet, sophisticated, tangible photographic texture, understated film grain, real lens depth, not a fantasy landscape. Person occupies right third with back and head visible, never looking at camera. This is a conceptual visual for a creative video production service, not an image of a specific client or actual project. No logos, no typography, no watermark, no cameras, no UI, no collage. 1792x1024 or equivalent wide landscape.

## Product concept

Use case: product-mockup. Asset type: conceptual product film still for a Japanese creative video production landing page, landscape 16:9. Sophisticated editorial commercial photograph of one unbranded amber glass beverage bottle with a plain cream paper label without writing, standing on a weathered stone in a small sunlit outdoor botanical garden. Sparse green leaves, tiny water droplets, backlit morning light, shallow depth of field, refined olive green, golden amber and pale cream palette. Art-directed yet plausible, premium photographic texture. Wide medium close shot, product at center, elegantly restrained. No letters, no text, no logos, no watermark, no humans. This is an illustrative fictional product, not a real client or completed project.

## Interior concept

Use case: photorealistic-natural. Asset type: conceptual interior promotional film still for a Japanese video production service, landscape 16:9. A beautifully composed contemporary Japanese living room with warm oak floor, pale plaster walls, low linen sofa, one timber coffee table and floor to ceiling windows revealing softly lit trees. Quiet morning sun with long delicate shadows. Interior architecture editorial photograph, natural materials, sophisticated restrained sandy beige and pale green tones, realistic lens and fine texture, very clean but lived-in. Balanced horizontal composition. No people, no letters, no brands, no logos, no watermark, no UI. This is an illustrative scene and not an actual client project.

## 実動画

- ソノバデ: main `5351c6b` に既存の `/sonovade/assets/lp/sonovade-pr-v1.mp4` と `movie-poster.jpg` をそのまま参照。動画は31.6秒、H.264/AAC、1920×1080。自社サービスの紹介映像として表示しています。
- KiDUKi: `codell-inc/codell-site` commit `362572d7ff8cb938845893115016a2a8cf9c21af` にある `kiduki/static/videos/hero.mp4` と `kiduki/static/images/hero-poster.jpg` のバイトを、このページ専用の `kiduki-pr.mp4` / `kiduki-poster.jpg` として収録。動画は32.6秒、H.264/AAC、1920×1080。自社サービスの紹介映像として表示しています。PR #14 のルート・ビルド・配備設定への依存はありません。
- KiDUKi MP4 SHA-256: `c72df40bd9ce398454a42397a8a99edbe2c4574ab859948f5044076b4b4554d9`
- KiDUKi poster SHA-256: `faab24c8e5491439622fc8b1223911bf72a00630c0efda471d75690bbafb9a14`

提供された `image(6).png` はレイアウト・内容・色の参考としてのみ使用し、サイトや PR には収録していません。参照画像の転送 URL は含めていません。
