import {
  location,
  officeHours,
  phone,
  reviews,
} from "../../../content/siteFacts";
import { reviewsV1 } from "../../../content/reviewsV1";

export const SITE_ORIGIN = "https://new32dental.com";
export const SITE_NAME = "new32 Cosmetic and Family Dentistry";
/** W3C date for sitemap lastmod (matches siteFacts.lastUpdated: May 2026). */
export const SITEMAP_LASTMOD = "2026-05-01";

export const OG_IMAGE_URL = `${SITE_ORIGIN}/og-image.jpg`;
export const OG_IMAGE_WIDTH = 1200;
export const OG_IMAGE_HEIGHT = 630;
export const OG_IMAGE_ALT =
  "new32 Cosmetic and Family Dentistry team in Seattle's University District";

/** Canonical absolute URL (no trailing slash except home). */
export function canonicalUrl(path = "/"): string {
  if (!path || path === "/") return `${SITE_ORIGIN}/`;
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_ORIGIN}${normalized.replace(/\/$/, "")}`;
}

/**
 * Absolute production URL for a Vite asset path.
 * Strips the Vite base prefix so GH Pages builds still emit new32dental.com URLs.
 */
export function absoluteAssetUrl(src: string): string {
  if (src.startsWith("http://") || src.startsWith("https://")) return src;
  const base = import.meta.env.BASE_URL || "/";
  let path = src.startsWith("/") ? src : `/${src}`;
  if (base !== "/") {
    const prefix = base.endsWith("/") ? base.slice(0, -1) : base;
    if (path === prefix) path = "/";
    else if (path.startsWith(`${prefix}/`)) path = path.slice(prefix.length);
  }
  return `${SITE_ORIGIN}${path}`;
}

export function dentistSchema(pageUrl?: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Dentist",
    name: SITE_NAME,
    telephone: phone.display,
    url: pageUrl ?? `${SITE_ORIGIN}/`,
    image: OG_IMAGE_URL,
    address: {
      "@type": "PostalAddress",
      streetAddress: "4915 25th Ave NE, Suite 107",
      addressLocality: "Seattle",
      addressRegion: "WA",
      postalCode: "98105",
      addressCountry: "US",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 47.6654,
      longitude: -122.3012,
    },
    openingHoursSpecification: officeHours
      .filter((h) => h.hours !== "Closed")
      .map((h) => ({
        "@type": "OpeningHoursSpecification",
        dayOfWeek: h.day,
        opens: "07:00",
        closes: "15:00",
      })),
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: reviews.google.rating,
      reviewCount: reviews.google.count,
    },
    sameAs: [
      reviews.google.url,
      reviewsV1.yelp.url,
      location.googlePlacesUrl,
    ],
  };
}

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: `${SITE_ORIGIN}/`,
    publisher: {
      "@type": "Dentist",
      name: SITE_NAME,
      url: `${SITE_ORIGIN}/`,
    },
  };
}

export function serviceSchema(serviceNames: string[]) {
  return {
    "@context": "https://schema.org",
    "@type": "Dentist",
    name: SITE_NAME,
    url: canonicalUrl("/our-services"),
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Dental services",
      itemListElement: serviceNames.map((name) => ({
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name,
          provider: {
            "@type": "Dentist",
            name: SITE_NAME,
          },
          areaServed: {
            "@type": "City",
            name: "Seattle",
          },
        },
      })),
    },
  };
}

export function personSchema(member: {
  name: string;
  slug?: string;
  /** Absolute or site-relative image URL string */
  image: string;
  shortBlurb: string;
  personSchema?: { jobTitle: string; alumniOf?: string[] };
}) {
  if (!member.personSchema) return null;

  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: member.name,
    jobTitle: member.personSchema.jobTitle,
    description: member.shortBlurb,
    image: member.image,
    ...(member.slug
      ? { url: canonicalUrl(`/about/${member.slug}`) }
      : {}),
    worksFor: {
      "@type": "Dentist",
      name: SITE_NAME,
    },
    ...(member.personSchema.alumniOf
      ? {
          alumniOf: member.personSchema.alumniOf.map((org) => ({
            "@type": "CollegeOrUniversity",
            name: org,
          })),
        }
      : {}),
  };
}
