import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";
import {
  isConfiguredHref,
  landingContent,
  pendingMarker,
} from "../src/lib/features/landing/content";

const page = new URL("../src/lib/features/landing/components/LandingPage.svelte", import.meta.url);

describe("KiDUKi landing copy", () => {
  it("uses the Figma tagline, lead, features, and scenes", () => {
    expect(landingContent.tagline.title).toBe(
      "ARグラス × 独自のソフトウェアで、業界を支える新たなインフラを作る",
    );
    expect(landingContent.tagline.desktopLines.join("")).toBe(landingContent.tagline.title);
    expect(landingContent.tagline.mobileLines.join("")).toBe(landingContent.tagline.title);
    expect(landingContent.meta.title).toBe(`KiDUKi | ${landingContent.tagline.title}`);
    expect(landingContent.meta.description).toBe(landingContent.tagline.title);
    expect(landingContent.tagline.subtitle).toBe("ARグラス × AI で、介護・家事代行の現場を支える");
    expect(landingContent.lead.text).toBe("今・誰に・何をすべきか。その答えを、目の前に。");
    expect(landingContent.features.items.map((item) => item.title)).toEqual([
      "スカウター",
      "音声記録",
      "画面共有",
    ]);
    expect(landingContent.useCases.items.map((item) => item.title)).toEqual(["介護", "家事代行"]);
    expect(landingContent.device.title).toBe("Rokid Glass 3について");
    expect(landingContent.device.heading.join("")).toContain("Rokid Glass");
    expect(landingContent.closing.title).toBe("新人でも、迷わず動ける現場へ。");
  });

  it("keeps unfinished facts as replaceable placeholders", () => {
    expect(landingContent.device.specs.map((spec) => spec.value)).toEqual([
      "Micro LED・回折光導波路／480 × 640・30°",
      "約50g（±1g）",
      "210mAh",
      "Wi-Fi 6・Bluetooth 5.3",
    ]);
    expect(landingContent).not.toHaveProperty("news");
    expect(JSON.stringify(landingContent)).not.toContain("お知らせ");
    expect(landingContent.support.rows).toEqual([]);
  });

  it("keeps the company name link and hides an empty address and Rokid line", () => {
    expect(landingContent.company).toEqual({
      title: "会社情報",
      name: "株式会社Codell",
      href: "https://codell.jp",
      address: "",
    });
    expect(
      `${landingContent.rokidTrademark.before}${landingContent.rokidTrademark.name}${landingContent.rokidTrademark.after}`,
    ).toBe("Rokid は Hangzhou Lingban Technology Co., Ltd. の商標または登録商標です。");
    expect(landingContent.rokidTrademark.name).toBe("Hangzhou Lingban Technology Co., Ltd.");
    expect(landingContent.device.disclaimer).toEqual([
      "KiDUKi は Rokid の公式製品ではありません。",
    ]);
    expect(landingContent.copyright).toBe("© 2026 Codell Inc.");
    expect(landingContent.contact).toEqual({
      label: "お問い合わせ",
      href: "https://codell.jp/contact.html",
      note: "導入・サービスに関するお問い合わせ",
    });
    expect(JSON.stringify(landingContent.company)).not.toContain("代表者");
    expect(JSON.stringify(landingContent.company)).not.toContain("設立");
    expect(landingContent.company).not.toHaveProperty("rows");
    const footer = {
      company: landingContent.company,
      support: landingContent.support,
      legal: landingContent.legal,
      copyright: landingContent.copyright,
      rokidTrademark: `${landingContent.rokidTrademark.before}${landingContent.rokidTrademark.name}${landingContent.rokidTrademark.after}`,
      contact: landingContent.contact,
    };
    expect(JSON.stringify(footer)).not.toContain(pendingMarker);
    expect(JSON.stringify(footer)).not.toContain("【要確認】");
    expect(JSON.stringify(footer)).not.toContain("受付時間");
  });
});

describe("KiDUKi landing links", () => {
  it("points contact and the company site at the published addresses", () => {
    const contactPage = "https://codell.jp/contact.html";
    expect(landingContent.contact).toEqual({
      label: "お問い合わせ",
      href: contactPage,
      note: "導入・サービスに関するお問い合わせ",
    });
    expect(landingContent.contact).not.toHaveProperty("email");
    expect(JSON.stringify(landingContent)).not.toContain("mailto:");
    expect(landingContent.company.name).toBe("株式会社Codell");
    expect(landingContent.company.href).toBe("https://codell.jp");
    expect(landingContent.nav.map((item) => item.href)).toEqual([
      "#features",
      "#use-cases",
      contactPage,
    ]);
  });

  it("keeps unset footer links in the data and publishes only the privacy policy", () => {
    expect(landingContent.support.links).toEqual([
      { label: "よくある質問", href: "" },
      { label: "使い方マニュアル", href: "" },
      { label: "サポート窓口", href: "" },
    ]);
    expect(landingContent.legal).toEqual([
      { label: "プライバシーポリシー", href: "https://codell.jp/privacy/" },
      { label: "利用規約", href: "" },
    ]);
    expect(landingContent.support.links.filter((link) => isConfiguredHref(link.href))).toEqual([]);
    expect(landingContent.legal.filter((link) => isConfiguredHref(link.href))).toEqual([
      { label: "プライバシーポリシー", href: "https://codell.jp/privacy/" },
    ]);
    expect(isConfiguredHref(pendingMarker)).toBe(false);
    expect(isConfiguredHref("https://codell.jp/contact.html")).toBe(true);
    expect(landingContent.hero.src).toBe("/videos/hero.mp4");
    expect(landingContent.hero.poster).toBe("/images/hero-poster.jpg");
  });
});

describe("KiDUKi landing media", () => {
  const press = landingContent.media.groups[0];
  const articles = landingContent.media.groups[1];

  it("lists five press items newest first, then three public articles", () => {
    expect(landingContent.media).toMatchObject({
      id: "media",
      eyebrow: "MEDIA",
      title: "メディア掲載",
      lead: "介護の現場を支える取り組みが、新聞・テレビと公開記事で紹介されています。",
    });
    expect(landingContent.media.groups.map((group) => group.title)).toEqual([
      "新聞・テレビ",
      "公開記事",
    ]);
    expect(press?.items).toHaveLength(5);
    expect(articles?.items).toHaveLength(3);
    expect(press?.items.map((item) => [item.outlet, item.date])).toEqual([
      ["徳島新聞", "2026/9/6"],
      ["NHK「四国らしんばん」", "2026/9/4"],
      ["朝日新聞", "2026/7/17・徳島面25面"],
      ["NHK「とく6徳島」「ギュッと！四国」", "2026/5/22・23"],
      ["テレビトクシマ「ステップ」", "2026/5/1"],
    ]);
    expect(articles?.items.map((item) => [item.outlet, item.date])).toEqual([
      ["神山まるごと高専公式note", "2026/7/17"],
      ["ウォーカープラス", "2026/5/29"],
      ["教育家庭新聞／KKS Web", "2026/5/27"],
    ]);
    expect(articles?.items.map((item) => item.outlet)).not.toContain("NHK「四国らしんばん」");
    expect(press?.items.map((item) => item.outlet)).not.toContain("神山まるごと高専公式note");
  });

  it("keeps the supplied headline, summary, and https link on every item", () => {
    expect(press?.items.map((item) => [item.title, item.description, item.href])).toEqual([
      [
        "徳島新聞にKiDUKiの取り組みが掲載されました",
        "AIとARを活用した介護支援端末「KiDUKi」と、介護現場の人手不足解消を目指すCodellの取り組みが紹介されました",
        "https://www.topics.or.jp/articles/-/1489587",
      ],
      [
        "NHK「四国らしんばん」に代表・江田岬毅が出演しました",
        "神山まるごと高専の学生起業家を追うドキュメンタリー「野心の行く先〜“起業家育成”高専のいま〜」で、代表・江田岬毅の挑戦が紹介されました",
        "https://www.web.nhk/tv/an/s-rashinban/pl/series-tep-211VG8ZQ7K/ep/N9KNMLVX67",
      ],
      [
        "朝日新聞にKiDUKiの取り組みが掲載されました",
        "「AI＋眼鏡 よりよい介護」と題して、介護現場を支えるAI・AR技術とCodellの開発活動が紹介されました",
        "https://www.asahi.com/sp/articles/ASV7H3J4ZV7HPUTB002M.html",
      ],
      [
        "NHKのニュース番組でCodellのDCONへの挑戦が紹介されました",
        "DCON2026に挑むCodellの活動が、徳島・四国のニュース番組で紹介されました",
        "https://www.web.nhk/tv/pl/series-tep-YZ7QN63ZX2/ep/XQXNK22VG2",
      ],
      [
        "テレビトクシマ「ステップ」でCodellが紹介されました",
        "DCON2026本戦に向けたCodellの取り組みが紹介されました",
        "https://youtu.be/8ePlhPIXFNc",
      ],
    ]);
    expect(articles?.items.map((item) => [item.title, item.description, item.href])).toEqual([
      [
        "代表・江田岬毅が語りました",
        "代表・江田岬毅が、DCONへの挑戦、介護現場との対話、Codellの立ち上げについて語りました",
        "https://kamiyamakosen-edu.note.jp/n/n571da9685314",
      ],
      [
        "DCON2026の大会報道",
        "DCON2026の大会報道で、Codellの文部科学大臣賞・トヨタ自動車賞受賞が紹介されました",
        "https://www.walkerplus.com/article/1398319/",
      ],
      [
        "DCON2026の大会報道",
        "DCON2026の大会報道で、Codellの文部科学大臣賞受賞と介護支援システムが紹介されました",
        "https://www.kknews.co.jp/post_ict/260525_4a",
      ],
    ]);

    const published = JSON.stringify(landingContent.media);
    expect(published).not.toMatch(/slack/i);
    expect(published).not.toContain("今見られる");
    expect(published).not.toContain("全国");
    expect(published).not.toContain("所属校インタビュー");
    for (const group of [press, articles]) {
      expect(group?.items.every((item) => isConfiguredHref(item.href))).toBe(true);
      expect(group?.items.every((item) => item.href.startsWith("https://"))).toBe(true);
      for (const item of group?.items ?? []) {
        expect(item).not.toHaveProperty("image");
        expect(item).not.toHaveProperty("logo");
        expect(item).not.toHaveProperty("src");
      }
    }
  });
});

describe("KiDUKi landing route", () => {
  it("provides a skip link, the hero video slot, and the published destinations", async () => {
    const source = await readFile(page, "utf8");

    expect(source).toContain('href="#main-content"');
    expect(source).toContain('<main id="main-content"');
    expect(source).toContain("sticky top-0");
    expect(source).toContain("aspect-video h-auto w-full object-contain");
    expect(source).toContain("autoplay");
    expect(source).not.toContain("node.pause()");
    expect(source).not.toContain("window.matchMedia");
    expect(source).toContain("muted");
    expect(source).not.toContain("<track");
    expect(source).toContain("loop");
    expect(source).toContain("playsinline");
    expect(source).toContain("poster={landingContent.hero.poster}");
    expect(source).toContain("landingContent.hero.src");
    expect(source).toContain("landingContent.contact.href");
    expect(source).not.toContain("mailto:");
    expect(source).not.toContain("contact.email");
    expect(source).not.toContain("<form");
    const routes = JSON.parse(
      await readFile(new URL("../static/manus-routes.json", import.meta.url), "utf8"),
    ) as { routes: { title: string }[] };
    expect(routes.routes[0]?.title).toBe(landingContent.meta.title);
    expect(routes.routes[0]?.title).toContain(landingContent.tagline.title);
    expect(source).toContain("{#if landingContent.company.address}");
    expect(source).toContain("isConfiguredHref(link.href)");
    expect(source).toContain("{#if showSupport}");
    expect(source).toContain("lg:flex-1");
    expect(source).toContain("landingContent.rokidTrademark");
    expect(source).toContain('class="whitespace-nowrap"');
    expect(source).toContain("{landingContent.rokidTrademark.name}");
    expect(source).toContain(`{#if landingContent.rokidTrademark.name}
              {@render rokidTrademarkText()}
              <br>
            {/if}
            {#each landingContent.device.disclaimer`);
    expect(source).toContain("{#if landingContent.rokidTrademark.name}");
    expect(source).not.toContain("受付時間");
    expect(source).toContain("landingContent.tagline.desktopLines");
    expect(source).toContain("landingContent.tagline.mobileLines");
    expect(source).toContain('aria-label="サイト内ナビゲーション"');
    expect(source).not.toContain("ページ内ナビゲーション");
    expect(source).toContain("text-[26px]");
    expect(source).toContain("max-[389px]:text-[24px]");
    expect(source).toContain("lg:text-[40px]");
    expect(source).toContain("xl:text-[48px]");
    expect(source).toContain("landingContent.media");
    expect(source).toContain("id={landingContent.media.id}");
    expect(source).toContain("item.outlet");
    expect(source).toContain("item.date");
    expect(source).toContain("item.title");
    expect(source).toContain("item.description");
    expect(source).toContain('target="_blank"');
    expect(source).toContain('rel="noopener"');
    expect(source).not.toContain("landingContent.news");
    expect(source).not.toContain('aria-labelledby="news-title"');
    expect(source).not.toContain("お知らせ");
    expect(source).not.toContain("一覧を見る");
    const mediaBlock = source.slice(
      source.indexOf("id={landingContent.media.id}"),
      source.indexOf('aria-labelledby="contact-title"'),
    );
    expect(mediaBlock).not.toContain("<img");
    expect(mediaBlock).not.toContain("slack");
    expect(source).not.toContain("home.kiduki.codell.jp");
    expect(source).not.toContain("care.kiduki.codell.jp");
  });
});

describe("KiDUKi landing focus ring", () => {
  it("pairs the bright green ring with a dark outer halo so both light and dark surfaces clear 3:1", async () => {
    const source = await readFile(new URL("../src/app.css", import.meta.url), "utf8");
    const block = source.slice(source.indexOf(":focus-visible"), source.indexOf("@media"));

    expect(block).toContain("outline: 2px solid #1f2a1c");
    expect(block).toContain("outline-offset: 4px");
    expect(block).toContain("0 0 0 2px #ffffff");
    expect(block).toContain("0 0 0 4px var(--kiduki-green-500)");
  });
});
