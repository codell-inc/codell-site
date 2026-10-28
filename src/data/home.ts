export const processSteps = [
  {
    title: "課題を聞き切る",
    description: "業務の背景、制約、現場の迷いまで深く整理します。まだ言葉になっていない違和感から、変革の起点を見つけます。",
    image: "/assets/process-01-hearing-578.webp",
    srcset: "/assets/process-01-hearing-578.webp 578w",
    alt: "介護現場で課題を聞く様子",
    width: 577,
    height: 370,
  },
  {
    title: "プロダクトにする",
    description: "個別の課題を、業界に共通する価値へ変換して設計します。プロトタイプを通じて、使われる形を素早く確かめます。",
    image: "/assets/process-02-product-976.webp",
    srcset: "/assets/process-02-product-480.webp 480w, /assets/process-02-product-976.webp 976w",
    alt: "介護現場でKiDUKiを使用する様子",
    width: 976,
    height: 902,
  },
  {
    title: "現場で育てる",
    description: "実際の使われ方を見ながら、業務に根づく形へ磨き込みます。導入後も現場の声を取り込み、価値を更新し続けます。",
    image: "/assets/process-03-field-growth-960.webp",
    srcset: "/assets/process-03-field-growth-480.webp 480w, /assets/process-03-field-growth-960.webp 960w",
    alt: "現場と開発チームがプロダクトを改善する様子",
    width: 1456,
    height: 1092,
  },
  {
    title: "業界全体に拡大",
    description: "一社から始まった変化を、同じ課題を持つ業界全体へ広げます。現場発のプロダクトを、新しい業界標準へ育てます。",
    image: "/assets/process-04-industry-960.webp",
    srcset: "/assets/process-04-industry-480.webp 480w, /assets/process-04-industry-960.webp 960w",
    alt: "複数の介護スタッフへプロダクトが広がる様子",
    width: 1456,
    height: 1092,
  },
] as const;

export const workItems = [
  {
    title: "ARアプリ開発",
    description: "現場の作業や制約を整理し、ARグラスなどのスマートデバイスを使った活用方法から提案します。ハンズフリーの情報端末で、スマホやタブレットが適さない現場にも実装します。",
    image: "/assets/work-ar-640.webp",
    srcset: "/assets/work-ar-320.webp 320w, /assets/work-ar-640.webp 640w",
    alt: "ARデバイスを装着して操作する人のイラスト",
  },
  {
    title: "スマホアプリ開発",
    description: "業務フローを整理し、改善につながる専用アプリを企画・開発します。公開後は関連企業やグループ企業へ展開しやすい形まで設計します。",
    image: "/assets/work-app-640.webp",
    srcset: "/assets/work-app-320.webp 320w, /assets/work-app-640.webp 640w",
    alt: "スマートフォンを操作する人のイラスト",
  },
  {
    title: "AI開発",
    description: "既存業務のどこにAIを活用すべきかを検討し、具体的な使い方をご提案します。小さな検証から現場導入まで、業界の実務に合わせて開発します。",
    image: "/assets/work-ai-640.webp",
    srcset: "/assets/work-ai-320.webp 320w, /assets/work-ai-640.webp 640w",
    alt: "AIチャットを活用するイラスト",
  },
] as const;

export const members = [
  { name: "江田岬毅", role: "CEO", description: "業界の新しいスタンダードをCodellで作っていきます！！", image: "/assets/EdaMisaki-800.webp", srcset: "/assets/EdaMisaki-400.webp 400w, /assets/EdaMisaki-800.webp 800w" },
  { name: "相木絆煌", role: "CTO", description: "AIとの価値共創で、よりCreativeな社会実装を実現します。", image: "/assets/AikiKiduki-800.webp", srcset: "/assets/AikiKiduki-400.webp 400w, /assets/AikiKiduki-800.webp 800w" },
  { name: "宮野柊太", role: "COO", description: "新しいサービスを考え、実際に運用していくときのワクワク感が大好きです！", image: "/assets/MiyanoShuta-800.webp", srcset: "/assets/MiyanoShuta-400.webp 400w, /assets/MiyanoShuta-800.webp 800w" },
  { name: "尾崎仁瑚", role: "CDO", description: "プロダクトにあわせ、複雑な機能を迷わず使える体験を作ります！", image: "/assets/OzakiNico-800.webp", srcset: "/assets/OzakiNico-400.webp 400w, /assets/OzakiNico-800.webp 800w" },
] as const;

export const productFeatures = [
  { key: "scouter", title: "スカウター機能", description: "ARグラス上に利用者ごとの注意点やケア情報を表示し、視線を外さず確認できます。", video: "/assets/kiduki-scouter.mp4", poster: "/assets/kiduki-scouter-poster-1280.webp" },
  { key: "voice", title: "音声記録機能", description: "作業中の気づきや申し送りを音声で記録し、手を止めずに情報を残せます。", video: "/assets/kiduki-voice.mp4", poster: "/assets/kiduki-voice-poster-1280.webp" },
  { key: "share", title: "画面共有機能", description: "ARグラスの映像を遠隔の担当者と共有し、現場を見ながら指示を受けられます。", video: "/assets/kiduki-share.mp4", poster: "/assets/kiduki-share-poster-1280.webp" },
] as const;
