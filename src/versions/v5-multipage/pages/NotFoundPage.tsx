import { Link } from "react-router";
import { PageMeta } from "../components/PageMeta";
import { pages } from "../content/nav";
import { useVersionPath } from "../hooks/useVersionPath";

export function NotFoundPage() {
  const homeTo = useVersionPath();
  const contactTo = useVersionPath(pages.contact.path);

  return (
    <>
      <PageMeta
        title="Page not found | new32 Cosmetic and Family Dentistry"
        description="The page you requested could not be found. Visit new32 Cosmetic and Family Dentistry in Seattle or contact us to schedule."
        robots="noindex, follow"
        canonical="https://new32dental.com/"
      />
      <div className="w-full px-6 md:px-16 py-20 md:py-28">
        <div className="pnw-container max-w-[40rem]">
          <p className="text-sm font-semibold uppercase tracking-wider text-[var(--pnw-moss)] mb-3">
            404
          </p>
          <h1 className="font-display text-[var(--pnw-ink)] text-4xl md:text-5xl mb-4">
            Page not found
          </h1>
          <p className="text-[var(--pnw-ink-soft)] text-lg leading-relaxed mb-8">
            That link does not match a page on our site. You can return home or
            reach out to schedule a visit.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              to={homeTo}
              className="inline-flex items-center justify-center px-5 py-3 bg-[var(--pnw-moss)] text-white text-sm font-semibold hover:bg-[var(--pnw-clay)] transition-colors"
            >
              Back to home
            </Link>
            <Link
              to={contactTo}
              className="inline-flex items-center justify-center px-5 py-3 border border-[var(--pnw-border)] text-[var(--pnw-ink)] text-sm font-semibold hover:border-[var(--pnw-moss)] transition-colors"
            >
              Contact us
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
