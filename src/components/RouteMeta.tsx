import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { useContent } from "../context/ContentContext";
import { routeMeta } from "../utils/seo";

export default function RouteMeta() {
  const { pathname } = useLocation();
  const { language } = useLanguage();
  const { projects, notes, loading } = useContent();
  useEffect(() => {
    const meta = routeMeta(pathname, language, projects, notes);
    // Delay the missing-entry verdict while public CMS content is loading.
    const indexable = meta.indexable || (loading && /^(\/projects\/|\/notes\/)/.test(pathname));
    const update = (selector: string, attribute: string, value: string) => {
      let element = document.head.querySelector(selector);
      if (!element) {
        element = document.createElement(selector.startsWith("link") ? "link" : "meta");
        const match = selector.match(/\[(name|property|rel)="([^"]+)"\]/);
        if (match) element.setAttribute(match[1], match[2]);
        document.head.appendChild(element);
      }
      element.setAttribute(attribute, value);
    };
    document.title = meta.title;
    update('meta[name="description"]', "content", meta.description);
    update('link[rel="canonical"]', "href", meta.canonical);
    update('meta[name="robots"]', "content", indexable ? "index,follow" : "noindex,follow");
    for (const key of ["title", "description", "image"] as const) {
      update(`meta[property="og:${key}"]`, "content", meta[key]);
      update(`meta[name="twitter:${key}"]`, "content", meta[key]);
    }
    update('meta[property="og:url"]', "content", meta.canonical);
    update('meta[property="og:type"]', "content", meta.type);
    const schema = document.head.querySelector('script[type="application/ld+json"]');
    if (schema) schema.textContent = JSON.stringify({ "@context": "https://schema.org", "@type": meta.type === "article" ? "Article" : "WebPage", name: meta.title, headline: meta.title, description: meta.description, url: meta.canonical, author: { "@type": "Person", name: "Christian Silva" } });
  }, [pathname, language, projects, notes, loading]);
  return null;
}
