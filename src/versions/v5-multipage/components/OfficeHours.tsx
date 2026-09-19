import {
  fax,
  location,
  officeHours,
  phone,
} from "../../../content/siteFacts";
import { CallCta } from "./CallCta";
import { LazyMapEmbed } from "./LazyMapEmbed";
import { ScrollReveal } from "./ScrollReveal";

export function OfficeHours() {
  return (
    <section
      className="w-full px-6 md:px-16 py-16 md:py-20 bg-[var(--pnw-white)]"
      aria-labelledby="hours-heading"
    >
      <div className="pnw-container">
        <ScrollReveal>
          <h2
            id="hours-heading"
            className="font-display text-[var(--pnw-ink)] text-2xl md:text-3xl mb-2"
          >
            Hours &amp; location
          </h2>
          <p className="text-[var(--pnw-ink-soft)] text-sm md:text-base mb-8 leading-relaxed">
            {location.parkingNote}
          </p>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-12">
          <ScrollReveal delay={0.08}>
            <table className="w-full text-sm md:text-base text-[var(--pnw-ink)]">
              <caption className="sr-only">Office hours</caption>
              <tbody>
                {officeHours.map(({ day, hours }) => (
                  <tr
                    key={day}
                    className="border-b border-[var(--pnw-border)] last:border-0"
                  >
                    <th
                      scope="row"
                      className="py-3 pr-6 text-left font-medium text-[var(--pnw-ink-soft)] w-32"
                    >
                      {day}
                    </th>
                    <td className="py-3 font-normal">{hours}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="mt-8 flex flex-col gap-3 text-sm md:text-base">
              <a
                href={location.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="pnw-text-link text-[var(--pnw-ink)] underline hover:text-[var(--pnw-moss)] transition-colors"
              >
                {location.address}
              </a>
              <p className="text-[var(--pnw-ink-soft)]">
                <span className="font-medium text-[var(--pnw-ink)]">
                  Phone:
                </span>{" "}
                <a
                  href={phone.tel}
                  className="underline hover:text-[var(--pnw-moss)] transition-colors"
                >
                  {phone.display}
                </a>
              </p>
              <p className="text-[var(--pnw-ink-soft)]">
                <span className="font-medium text-[var(--pnw-ink)]">
                  Fax:
                </span>{" "}
                {fax}
              </p>
            </div>

            <CallCta variant="mobileOnly" className="mt-8" />
          </ScrollReveal>

          <ScrollReveal delay={0.16}>
            <LazyMapEmbed
              src={location.mapsEmbedUrl}
              title="Map to new32 Cosmetic and Family Dentistry"
              className="relative min-h-[220px] md:min-h-[280px] h-full bg-[var(--pnw-stone)] border border-[var(--pnw-border)] overflow-hidden"
            />
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
