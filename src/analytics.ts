import { useEffect, useRef } from "react";
import { useLocation } from "react-router";

/** GA4 property already used by this site. */
export const GA4_MEASUREMENT_ID = "G-PQ3X8RDYHS";

/** Production Universal Analytics ID (sunset; still sent via gtag). */
export const UA_TRACKING_ID = "UA-1545556-9";

export const GA_TRACKING_IDS = [GA4_MEASUREMENT_ID, UA_TRACKING_ID] as const;

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export function trackPageView(pagePath: string) {
  for (const id of GA_TRACKING_IDS) {
    window.gtag?.("config", id, { page_path: pagePath });
  }
}

/** Sends SPA navigations to both GA IDs. Initial pageview comes from index.html. */
export function AnalyticsPageViews() {
  const location = useLocation();
  const isFirstPath = useRef(true);

  useEffect(() => {
    if (isFirstPath.current) {
      isFirstPath.current = false;
      return;
    }
    trackPageView(location.pathname + location.search);
  }, [location.pathname, location.search]);

  return null;
}
