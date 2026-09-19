import type { ReactNode } from "react";
import {
  fax,
  location,
  officeHours,
  phone,
} from "../../../content/siteFacts";
import { ContactForm } from "../../../app/components/ContactForm";
import { contactPage } from "../content/pages";
import { PageMeta } from "../components/PageMeta";
import { PageHero } from "../components/PageHero";
import { CallBand } from "../components/CallBand";
import { CallCta } from "../components/CallCta";
import { Breadcrumbs } from "../components/Breadcrumbs";
import { JsonLd } from "../components/JsonLd";
import { LazyMapEmbed } from "../components/LazyMapEmbed";
import { ScrollReveal } from "../components/ScrollReveal";
import { dentistSchema, canonicalUrl } from "../content/schema";
import { useVersionPath } from "../hooks/useVersionPath";

function linkTel(text: string): ReactNode {
  const phrase = phone.display;
  const idx = text.indexOf(phrase);
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <a
        href={phone.tel}
        className="text-[var(--pnw-moss)] underline hover:text-[var(--pnw-clay)]"
      >
        {phrase}
      </a>
      {text.slice(idx + phrase.length)}
    </>
  );
}

export function ContactPage() {
  const homeTo = useVersionPath();

  return (
    <>
      <PageMeta
        title={contactPage.seo.title}
        description={contactPage.seo.description}
      />
      <JsonLd data={dentistSchema(canonicalUrl("/contact-us"))} />
      <Breadcrumbs
        items={[{ name: "Home", to: homeTo }, { name: "Contact" }]}
      />
      <PageHero title={contactPage.h1} lead={linkTel(contactPage.lead)} />
      <div className="w-full px-6 md:px-16 py-12 md:py-16">
        <div className="pnw-container">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-12">
            <ScrollReveal>
              <div className="flex flex-col gap-3 text-sm md:text-base text-[var(--pnw-ink)]">
                <p>
                  <span className="font-medium">Our address is:</span>
                  <br />
                  <a
                    href={location.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="pnw-text-link underline hover:text-[var(--pnw-moss)]"
                  >
                    {location.address}
                  </a>
                </p>
                <p>
                  PH:{" "}
                  <a
                    href={phone.tel}
                    className="underline hover:text-[var(--pnw-moss)]"
                  >
                    {phone.display}
                  </a>
                </p>
                <p>FX: {fax}</p>
                <ul className="mt-4 space-y-1 text-[var(--pnw-ink-soft)]">
                  {officeHours.map(({ day, hours }) => (
                    <li key={day}>
                      {day}: {hours}
                    </li>
                  ))}
                </ul>
                <CallCta variant="mobileOnly" className="mt-6" />
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
              <LazyMapEmbed
                src={location.mapsEmbedUrl}
                title="Map to new32 Cosmetic and Family Dentistry"
                className="relative min-h-[280px] h-full bg-[var(--pnw-stone)] border border-[var(--pnw-border)] overflow-hidden"
              />
            </ScrollReveal>
          </div>
        </div>
      </div>
      <section
        className="w-full px-6 md:px-16 py-16 md:py-20 bg-[var(--pnw-stone)]"
        aria-labelledby="contact-form-heading"
      >
        <div className="pnw-container">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
            <ScrollReveal className="lg:col-span-5">
              <h2
                id="contact-form-heading"
                className="font-display text-[var(--pnw-ink)] text-2xl md:text-3xl mb-3"
              >
                Get in touch
              </h2>
              <p className="text-[var(--pnw-ink-soft)] text-sm md:text-base leading-relaxed mb-4">
                Prefer to send a note? Tell us a little about yourself and how
                you’d like to be reached — we’ll follow up from the office.
              </p>
              <p className="text-[var(--pnw-ink-soft)] text-sm leading-relaxed">
                Or call us anytime during office hours. We’re glad you’re here.
              </p>
            </ScrollReveal>

            <ScrollReveal delay={0.08} className="lg:col-span-7">
              <div className="rounded-2xl border border-[var(--pnw-border)] bg-[var(--pnw-white)] px-5 py-6 md:px-8 md:py-8 shadow-[0_1px_0_rgba(35,32,25,0.04)]">
                <ContactForm />
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>
      <CallBand />
    </>
  );
}
