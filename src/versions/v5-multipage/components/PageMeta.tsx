import { useEffect } from "react";
import { useLocation } from "react-router";
import { canonicalUrl } from "../content/schema";
import { applyHeadToDocument, useHead } from "./HeadContext";

type PageMetaProps = {
  title: string;
  description: string;
  /** e.g. "noindex, follow" for 404 */
  robots?: string;
  /** Override pathname-derived canonical (404 points at the homepage). */
  canonical?: string;
};

/**
 * Sets document head for SEO/AEO/sharing.
 * During SSR, writes into HeadProvider bag; on the client, syncs the DOM.
 */
export function PageMeta({
  title,
  description,
  robots,
  canonical: canonicalOverride,
}: PageMetaProps) {
  const { pathname } = useLocation();
  const canonical = canonicalOverride ?? canonicalUrl(pathname);
  const { head, setHead } = useHead();

  const patch = {
    title,
    description,
    canonical,
    robots,
    ogTitle: title,
    ogDescription: description,
    ogUrl: canonical,
  };

  // Synchronous write so SSR can read head after renderToString.
  setHead(patch);

  useEffect(() => {
    setHead(patch);
    applyHeadToDocument(head);
  }, [title, description, canonical, robots, pathname]);

  return null;
}
