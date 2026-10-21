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

## 2026年10月21日 デザイン更新用の補助写真

以下の8点は built-in imagegen で新規生成した架空のイメージです。実在の顧客・制作現場・納品実績を示す写真ではありません。サービス・工程写真7点は、4列×2行のコンタクトシート（1774×887、RGB、不透明）の各パネルを sharp で機械的に切り出して WebP に変換しました。問い合わせ背景は別途生成した横長写真（2172×724、RGB、不透明）を1920px幅に縮小して WebP に変換しました。生成画像への加筆や合成はしていません。

| 配置ファイル | 用途 | サイズ |
| --- | --- | --- |
| `design/service-product.webp` | 青い美容液ボトルの商品映像イメージ | 440×440 |
| `design/service-landscape.webp` | 山岳・観光の映像イメージ | 440×440 |
| `design/process-01.webp` | ヒアリング | 438×292 |
| `design/process-02.webp` | 企画・構成 | 438×292 |
| `design/process-03.webp` | 動画制作 | 438×292 |
| `design/process-04.webp` | 確認・修正 | 438×292 |
| `design/process-05.webp` | 納品 | 438×292 |
| `design/city-dusk.webp` | 問い合わせ背景の東京の夕景 | 1920×640 |

### 補助写真のコンタクトシート生成プロンプト

Use case: photorealistic-natural. Asset type: clean photographic contact sheet for a premium Japanese video-production landing page. Produce ONE exact 4-column by 2-row grid of eight equally sized rectangular photo panels, all panels touching edge-to-edge, absolutely no gutters, no border, no frame and no text. Overall contact sheet landscape with 2:1 aspect ratio. Each panel is an independent complete realistic commercial photograph. Across all panels: beautiful natural texture, polished cinematic lighting and plausible people, no typography, no logos, no watermark. TOP ROW FROM LEFT TO RIGHT: (1) a sleek unbranded dark blue serum bottle caught in a dynamic splash of clear water against rich dark teal background, high-end product commercial close-up; (2) dramatic snow-capped alpine mountains above a lush pine valley under a sunny pale blue sky, pristine tourism film frame; (3) three adult Japanese business people having a warm professional consultation around a light wood table in a modern bright meeting room, candid eye-level medium wide photo; (4) close overhead photo of hands drawing a film storyboard with clean black ink boxes and simple sketches on off-white paper on a wooden creative desk, no readable words. BOTTOM ROW FROM LEFT TO RIGHT: (1) professional video editor's desk with a wide monitor showing generic non-readable editing timeline and cinematic portrait preview, darker studio, sophisticated colorful timeline strips, no identifiable software logos; (2) over-shoulder view of an adult Japanese client reviewing a promotional video on a laptop at a bright desk, close view of laptop screen with generic video thumbnail, no readable words; (3) close editorial photo of two professionals passing a thin tablet across a desk at the end of a creative project, screen is minimal and indistinct, hands realistic, no words; (4) panoramic Tokyo city skyline at sunset with tall office buildings, peach-pink clouds fading to violet blue-hour sky, horizon low enough for spacious peach sky. Avoid blending across panel boundaries, each subject stays in its own quarter-width and half-height rectangle. No captions, no text anywhere.

### 問い合わせ背景の生成プロンプト

Use case: photorealistic-natural. Asset type: wide full-width contact-section photographic background for a premium Japanese video-production website. Create a cinematic realistic panoramic photograph of the Tokyo skyline at blue-hour dusk from an elevated viewpoint, wide 3:1 landscape composition. Dense buildings form a restrained dark silhouette along the bottom third, with a few graceful tall buildings including distant Tokyo Tower. Beautiful broad open peach-pink and muted violet clouds fill the upper two thirds, fading into deep blue at the upper corners, richly atmospheric yet natural. Soft glowing office windows, dark charcoal navy city buildings, romantic sophisticated cinematic color grade. Center upper sky must remain quiet and readable beneath white website text added later. Fine realistic texture, high-quality editorial architecture photography. No text, no logos, no watermark, no borders.

## 料金背景の山並み（2026年10月21日）

`design/mountain-dusk.webp` は built-in imagegen で新規生成した架空の夕景です。人物・建築物を含まない山岳写真（2172×724、RGB、不透明）を sharp で1920×640に縮小し、WebPに変換しました。料金セクションの背景として使用します。

生成プロンプト：

Use case: photorealistic-natural. Asset type: full-width photographic pricing background for a premium Japanese video-production landing page. Create a panoramic 3:1 landscape photograph of layered alpine peaks and valleys at sunset. Deep navy and blue-gray mountain silhouettes overlap in the lower half, with subtle soft atmospheric haze between the mountain ranges. Pale peach, dusty rose and muted violet dusk clouds fill the upper half. A low warm setting-sun glow appears at the far right edge. Quiet, expansive, elegant cinematic landscape photography with realistic lens texture and natural atmospheric color. The central area stays visually calm to sit behind website pricing cards added later. No people, no buildings, no roads, no text, no logos, no watermark, no border.



## 2026年10月21日 ヒーロー写真

`hero-cinematic.webp` は built-in imagegen で新規生成した架空の人物・街のイメージです（1672×941、約106 KB）。sharpでWebPに変換しました。人物は実在の顧客・スタッフではありません。参照LPの構図・光・色をもとに、文字を含めず生成しています。

### 生成プロンプト

Use case: photorealistic-natural. Asset type: full bleed 16:9 cinematic hero photograph for a Japanese AI video production studio website. Create a beautifully art-directed editorial commercial photograph of an adult Japanese woman in her late twenties in profile, her face at the right third, looking slightly upward to the right with a calm quietly optimistic expression. Long dark brown hair flowing dramatically to the left in the wind, cream translucent textured blouse, soft golden sunlight on her face. Framing is medium close portrait shoulders and head, body extends below frame, head has generous space above for website navigation. Out-of-focus Tokyo city skyline in distance at sunset, blue teal sky on left and soft peach amber evening light on right, premium cinematic shallow depth of field, natural photographic skin detail. Keep entire left 42 percent dark blue teal and visually calm with only distant bokeh and a little flowing hair, enough negative space for a white handwritten Japanese headline added in HTML. Face around x=73%, y=42%, never near far edge. Wide landscape 16:9, 2048x1152. Sophisticated, airy, emotional, reminiscent of Japanese beauty cinema commercial, warm rimlight and cool shadows. No lettering, no logos, no text, no watermarks, no borders, no UI. This is a fictional concept image.
