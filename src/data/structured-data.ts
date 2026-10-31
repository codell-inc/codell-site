// schema.org nodes shared by every page. Pages add their own nodes and refer to the company by `organizationId`.
export type StructuredDataNode = Record<string, unknown>;

export const organizationId = (site: URL) => new URL("/#organization", site).href;
export const websiteId = (site: URL) => new URL("/#website", site).href;

export function organizationNode(site: URL): StructuredDataNode {
  return {
    "@type": "Organization",
    "@id": organizationId(site),
    name: "株式会社Codell",
    alternateName: "Codell",
    url: new URL("/", site).href,
    logo: new URL("/assets/codell-favicon.png", site).href,
    slogan: "社会の違和感を、前進する力に。",
    foundingDate: "2026-07-30",
    telephone: "+81-80-9305-6375",
    address: {
      "@type": "PostalAddress",
      addressCountry: "JP",
      addressRegion: "徳島県",
      addressLocality: "名西郡神山町",
      streetAddress: "神領大埜地299-1",
    },
  };
}

export function websiteNode(site: URL): StructuredDataNode {
  return {
    "@type": "WebSite",
    "@id": websiteId(site),
    url: new URL("/", site).href,
    name: "Codell",
    inLanguage: "ja",
    publisher: { "@id": organizationId(site) },
  };
}

/** Serializes a JSON-LD graph so it is safe to inline in a <script> element. */
export function serializeGraph(nodes: StructuredDataNode[]): string {
  return JSON.stringify({ "@context": "https://schema.org", "@graph": nodes }).replace(/</g, "\\u003c");
}
