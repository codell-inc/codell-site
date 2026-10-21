export const pendingMarker = "【要入力】" as const;
export const unconfirmedMarker = "【要確認】" as const;
export const rokidTrademark = {
  before: "Rokid は ",
  name: "Hangzhou Lingban Technology Co., Ltd.",
  after: " の商標または登録商標です。",
} as const;

export function isConfiguredHref(href: string): boolean {
  return href.length > 0 && !href.startsWith("【");
}

const featureScenes = {
  scouter: {
    image: "/images/feature-01.jpg",
    imageAlt: "利用者と向き合うスタッフ。視線の先に注意点の表示がある。",
  },
  voice: {
    image: "/images/feature-02.jpg",
    imageAlt: "テーブルを挟んで利用者と話すスタッフ。",
  },
  share: {
    image: "/images/feature-03.jpg",
    imageAlt: "画面の映像を指さしながら確認するスタッフ。",
  },
} as const;

const mediaCoverage = {
  id: "media",
  eyebrow: "MEDIA",
  title: "メディア掲載",
  lead: "介護の現場を支える取り組みが、新聞・テレビと公開記事で紹介されています。",
  groups: [
    {
      id: "press",
      title: "新聞・テレビ",
      items: [
        {
          outlet: "徳島新聞",
          date: "2026/9/6",
          title: "徳島新聞にKiDUKiの取り組みが掲載されました",
          description:
            "AIとARを活用した介護支援端末「KiDUKi」と、介護現場の人手不足解消を目指すCodellの取り組みが紹介されました",
          href: "https://www.topics.or.jp/articles/-/1489587",
        },
        {
          outlet: "NHK「四国らしんばん」",
          date: "2026/9/4",
          title: "NHK「四国らしんばん」に代表・江田岬毅が出演しました",
          description:
            "神山まるごと高専の学生起業家を追うドキュメンタリー「野心の行く先〜“起業家育成”高専のいま〜」で、代表・江田岬毅の挑戦が紹介されました",
          href: "https://www.web.nhk/tv/an/s-rashinban/pl/series-tep-211VG8ZQ7K/ep/N9KNMLVX67",
        },
        {
          outlet: "朝日新聞",
          date: "2026/7/17・徳島面25面",
          title: "朝日新聞にKiDUKiの取り組みが掲載されました",
          description:
            "「AI＋眼鏡 よりよい介護」と題して、介護現場を支えるAI・AR技術とCodellの開発活動が紹介されました",
          href: "https://www.asahi.com/sp/articles/ASV7H3J4ZV7HPUTB002M.html",
        },
        {
          outlet: "NHK「とく6徳島」「ギュッと！四国」",
          date: "2026/5/22・23",
          title: "NHKのニュース番組でCodellのDCONへの挑戦が紹介されました",
          description: "DCON2026に挑むCodellの活動が、徳島・四国のニュース番組で紹介されました",
          href: "https://www.web.nhk/tv/pl/series-tep-YZ7QN63ZX2/ep/XQXNK22VG2",
        },
        {
          outlet: "テレビトクシマ「ステップ」",
          date: "2026/5/1",
          title: "テレビトクシマ「ステップ」でCodellが紹介されました",
          description: "DCON2026本戦に向けたCodellの取り組みが紹介されました",
          href: "https://youtu.be/8ePlhPIXFNc",
        },
      ],
    },
    {
      id: "articles",
      title: "公開記事",
      items: [
        {
          outlet: "神山まるごと高専公式note",
          date: "2026/7/17",
          title: "代表・江田岬毅が語りました",
          description:
            "代表・江田岬毅が、DCONへの挑戦、介護現場との対話、Codellの立ち上げについて語りました",
          href: "https://kamiyamakosen-edu.note.jp/n/n571da9685314",
        },
        {
          outlet: "ウォーカープラス",
          date: "2026/5/29",
          title: "DCON2026の大会報道",
          description:
            "DCON2026の大会報道で、Codellの文部科学大臣賞・トヨタ自動車賞受賞が紹介されました",
          href: "https://www.walkerplus.com/article/1398319/",
        },
        {
          outlet: "教育家庭新聞／KKS Web",
          date: "2026/5/27",
          title: "DCON2026の大会報道",
          description:
            "DCON2026の大会報道で、Codellの文部科学大臣賞受賞と介護支援システムが紹介されました",
          href: "https://www.kknews.co.jp/post_ict/260525_4a",
        },
      ],
    },
  ],
} as const;

export const landingContent = {
  meta: {
    title: "KiDUKi | ARグラス × 独自のソフトウェアで、業界を支える新たなインフラを作る",
    description: "ARグラス × 独自のソフトウェアで、業界を支える新たなインフラを作る",
  },
  hero: {
    src: "/videos/hero.mp4",
    poster: "/images/hero-poster.jpg",
    label: "KiDUKi 紹介動画",
  },
  contact: {
    label: "お問い合わせ",
    href: "https://codell.jp/contact.html",
    note: "導入・サービスに関するお問い合わせ",
  },
  nav: [
    { label: "特長", href: "#features" },
    { label: "活用シーン", href: "#use-cases" },
    { label: "お問い合わせ", href: "https://codell.jp/contact.html" },
  ],
  tagline: {
    title: "ARグラス × 独自のソフトウェアで、業界を支える新たなインフラを作る",
    desktopLines: ["ARグラス × 独自のソフトウェアで、", "業界を支える新たなインフラを作る"],
    mobileLines: ["ARグラス × ", "独自のソフトウェアで、", "業界を支える", "新たなインフラを作る"],
    subtitle: "ARグラス × AI で、介護・家事代行の現場を支える",
  },
  lead: {
    text: "今・誰に・何をすべきか。その答えを、目の前に。",
    mobileLines: ["今・誰に・何をすべきか。", "その答えを、目の前に。"],
  },
  features: {
    id: "features",
    eyebrow: "FEATURES",
    title: "できること",
    items: [
      {
        number: "01",
        title: "スカウター",
        description: "利用者ごとの注意点を、視線を外さず確認。",
        ...featureScenes.scouter,
      },
      {
        number: "02",
        title: "音声記録",
        description: "会話しながら、記録は自動で残る。",
        ...featureScenes.voice,
      },
      {
        number: "03",
        title: "画面共有",
        description: "現場の視界を本部と共有し、遠隔で指示を受ける。",
        ...featureScenes.share,
      },
    ],
  },
  useCases: {
    id: "use-cases",
    eyebrow: "USE CASES",
    title: "活用シーン",
    items: [
      { title: "介護", ...featureScenes.voice },
      { title: "家事代行", ...featureScenes.share },
    ],
  },
  device: {
    eyebrow: "DEVICE",
    title: "Rokid Glass 3について",
    heading: ["KiDUKiは、", "ARグラス「Rokid Glass」で動作します。"],
    body: [
      "メガネのようにかけるだけで、視界に必要な情報を表示。",
      "介護・家事代行の現場で、手元から目を離さずに使えます。",
    ],
    disclaimer: ["KiDUKi は Rokid の公式製品ではありません。"],
    specs: [
      { label: "表示方式", value: "Micro LED・回折光導波路／480 × 640・30°" },
      { label: "重さ", value: "約50g（±1g）" },
      { label: "バッテリー", value: "210mAh" },
      { label: "接続", value: "Wi-Fi 6・Bluetooth 5.3" },
    ],
  },
  media: mediaCoverage,
  closing: {
    id: "contact",
    title: "新人でも、迷わず動ける現場へ。",
    mobileLines: ["新人でも、", "迷わず動ける現場へ。"],
  },
  company: {
    title: "会社情報",
    name: "株式会社Codell",
    href: "https://codell.jp",
    address: "",
  },
  support: {
    title: "サポート",
    links: [
      { label: "よくある質問", href: "" },
      { label: "使い方マニュアル", href: "" },
      { label: "サポート窓口", href: "" },
    ],
    rows: [],
  },
  legal: [
    { label: "プライバシーポリシー", href: "https://codell.jp/privacy/" },
    { label: "利用規約", href: "" },
  ],
  copyright: "© 2026 Codell Inc.",
  rokidTrademark,
  logos: {
    kiduki: "/kiduki-logo.svg",
    codell: "/images/codell-logo-white.png",
  },
} as const;
