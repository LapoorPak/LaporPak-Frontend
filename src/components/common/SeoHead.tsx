import { useEffect } from "react";
import { useLocation } from "react-router";
import {
  getCanonicalUrl,
  getSeoForPath,
  getStructuredData,
  siteImage,
  siteName,
} from "@/config/seo";

function setMeta(name: string, content: string, attribute: "name" | "property" = "name") {
  let element = document.head.querySelector<HTMLMetaElement>(
    `meta[${attribute}="${name}"]`
  );

  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, name);
    document.head.appendChild(element);
  }

  element.content = content;
}

function setLink(rel: string, href: string) {
  let element = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);

  if (!element) {
    element = document.createElement("link");
    element.rel = rel;
    document.head.appendChild(element);
  }

  element.href = href;
}

export function SeoHead() {
  const { pathname } = useLocation();

  useEffect(() => {
    const seo = getSeoForPath(pathname);
    const canonicalUrl = getCanonicalUrl(seo.path);
    const robots = seo.noIndex
      ? "noindex, nofollow"
      : "index, follow, max-image-preview:large";

    document.documentElement.lang = "id";
    document.title = seo.title;

    setMeta("description", seo.description);
    setMeta("keywords", seo.keywords);
    setMeta("robots", robots);
    setMeta("googlebot", robots);
    setMeta("application-name", siteName);

    setMeta("og:type", "website", "property");
    setMeta("og:locale", "id_ID", "property");
    setMeta("og:site_name", siteName, "property");
    setMeta("og:title", seo.title, "property");
    setMeta("og:description", seo.description, "property");
    setMeta("og:url", canonicalUrl, "property");
    setMeta("og:image", siteImage, "property");

    setMeta("twitter:card", "summary_large_image");
    setMeta("twitter:title", seo.title);
    setMeta("twitter:description", seo.description);
    setMeta("twitter:image", siteImage);

    setLink("canonical", canonicalUrl);

    const structuredDataId = "laporpak-structured-data";
    let structuredData = document.getElementById(structuredDataId);
    if (!structuredData) {
      structuredData = document.createElement("script");
      structuredData.id = structuredDataId;
      structuredData.setAttribute("type", "application/ld+json");
      document.head.appendChild(structuredData);
    }
    structuredData.textContent = JSON.stringify(getStructuredData(seo));
  }, [pathname]);

  return null;
}
