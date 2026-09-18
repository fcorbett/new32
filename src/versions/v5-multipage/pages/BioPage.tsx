import { Link, useParams, Navigate } from "react-router";
import type { ReactNode } from "react";
import { getMemberBySlug } from "../content/team";
import { pages } from "../content/nav";
import { PageMeta } from "../components/PageMeta";
import { PageHero } from "../components/PageHero";
import { Prose } from "../components/Prose";
import { CallBand } from "../components/CallBand";
import { Breadcrumbs } from "../components/Breadcrumbs";
import { JsonLd } from "../components/JsonLd";
import { ScrollReveal } from "../components/ScrollReveal";
import { PictureImage } from "../components/PictureImage";
import { absoluteAssetUrl, personSchema } from "../content/schema";
import { useVersionPath } from "../hooks/useVersionPath";

function linkPhrase(
  text: string,
  phrase: string,
  to: string,
): ReactNode {
  const idx = text.indexOf(phrase);
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <Link
        to={to}
        className="text-[var(--pnw-moss)] underline hover:text-[var(--pnw-clay)]"
      >
        {phrase}
      </Link>
      {text.slice(idx + phrase.length)}
    </>
  );
}

export function BioPage() {
  const { slug } = useParams<{ slug: string }>();
  const member = slug ? getMemberBySlug(slug) : undefined;
  const homeTo = useVersionPath();
  const aboutTo = useVersionPath(pages.about.path);
  const servicesTo = useVersionPath(pages.services.path);

  if (!member) {
    return <Navigate to={aboutTo} replace />;
  }

  const schema = personSchema({
    name: member.name,
    slug: member.slug,
    image: absoluteAssetUrl(member.image.img.src),
    shortBlurb: member.shortBlurb,
    personSchema: member.personSchema,
  });

  return (
    <>
      <PageMeta title={member.seoTitle} description={member.seoDescription} />
      {schema && <JsonLd data={schema} />}
      <Breadcrumbs
        items={[
          { name: "Home", to: homeTo },
          { name: "About", to: aboutTo },
          { name: member.name },
        ]}
      />
      <PageHero
        eyebrow={member.roleLabel}
        title={member.name}
        lead={member.shortBlurb}
      />
      <div className="w-full px-6 md:px-16 py-12 md:py-16">
        <div className="pnw-container">
          <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-10 md:gap-14 items-start">
            <ScrollReveal>
              <div className="relative aspect-[4/5] overflow-hidden bg-[var(--pnw-stone-deep)] border border-[var(--pnw-border)]">
                <PictureImage
                  picture={member.image}
                  alt={`${member.name}, ${member.roleLabel} at new32`}
                  sizes="280px"
                  loading="eager"
                  fetchpriority="high"
                  className="absolute inset-0 w-full h-full"
                  imgClassName="absolute inset-0 w-full h-full object-cover object-top"
                />
              </div>
            </ScrollReveal>
            <ScrollReveal delay={0.08}>
              <Prose className="max-w-[65ch]">
                {member.bio.map((p) => (
                  <p key={p.slice(0, 48)}>
                    {member.slug === "dr-stacy-gilmore"
                      ? linkPhrase(p, "Family and Cosmetic Dentistry", servicesTo)
                      : member.slug === "dr-beth-shaw"
                        ? linkPhrase(p, "cosmetic dentistry", servicesTo)
                        : p}
                  </p>
                ))}
              </Prose>
              <Link
                to={aboutTo}
                className="pnw-text-link inline-flex mt-8 text-sm font-semibold text-[var(--pnw-moss)] underline hover:text-[var(--pnw-clay)] transition-colors"
              >
                Back to about
              </Link>
            </ScrollReveal>
          </div>
        </div>
      </div>
      <CallBand />
    </>
  );
}
