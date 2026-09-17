import { Link } from "react-router";
import { pages } from "../content/nav";
import { doctors, staff, type TeamMember } from "../content/team";
import { useVersionPath } from "../hooks/useVersionPath";
import { PictureImage } from "./PictureImage";
import { ScrollReveal } from "./ScrollReveal";

const bioButtonClassName =
  "inline-flex items-center justify-center px-5 py-2.5 min-h-[44px] border border-[var(--pnw-moss)] text-[var(--pnw-moss)] text-sm font-semibold hover:bg-[var(--pnw-moss)] hover:text-[var(--pnw-white)] transition-colors";

function DoctorRow({ member, delay }: { member: TeamMember; delay: number }) {
  const bioTo = useVersionPath(`${pages.about.path}/${member.slug}`);

  return (
    <ScrollReveal delay={delay}>
      <article className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-6 md:gap-10 items-start py-10 border-b border-[var(--pnw-border)]">
        <div className="relative aspect-[4/5] overflow-hidden bg-[var(--pnw-stone-deep)] border border-[var(--pnw-border)]">
          <PictureImage
            picture={member.image}
            alt={`${member.name}, ${member.roleLabel} at new32`}
            sizes="240px"
            loading="lazy"
            className="absolute inset-0 w-full h-full"
            imgClassName={
              member.slug === "dr-beth-shaw"
                ? "absolute inset-0 w-full h-full object-cover scale-130 origin-center object-[center_50%] -translate-x-[4%]"
                : "absolute inset-0 w-full h-full object-cover object-top"
            }
          />
        </div>
        <div>
          <p className="font-semibold text-[var(--pnw-moss)] text-sm tracking-wide mb-2">
            {member.roleLabel}
          </p>
          <h3 className="font-display text-[var(--pnw-ink)] text-2xl md:text-3xl mb-4">
            {member.name}
          </h3>
          <p className="text-[var(--pnw-ink-soft)] text-base leading-relaxed mb-5 max-w-[65ch]">
            {member.shortBlurb}
          </p>
          <Link to={bioTo} className={bioButtonClassName}>
            About {member.name}
          </Link>
        </div>
      </article>
    </ScrollReveal>
  );
}

function StaffCard({ member, delay }: { member: TeamMember; delay: number }) {
  const bioTo = useVersionPath(`${pages.about.path}/${member.slug}`);

  return (
    <ScrollReveal delay={delay}>
      <article className="relative flex flex-col h-full border border-[var(--pnw-border)] bg-[var(--pnw-white)] hover:border-[var(--pnw-moss)]/50 transition-colors group">
        <Link
          to={bioTo}
          className="absolute inset-0 z-10"
          aria-label={`About ${member.name}`}
        />
        <div className="relative aspect-square overflow-hidden bg-[var(--pnw-stone-deep)] border-b border-[var(--pnw-border)]">
          <PictureImage
            picture={member.image}
            alt={`${member.name}, ${member.roleLabel} at new32`}
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            loading="lazy"
            className="absolute inset-0 w-full h-full"
            imgClassName={
              member.slug === "renita"
                ? "absolute inset-0 w-full h-full object-cover object-[center_40%]"
                : "absolute inset-0 w-full h-full object-cover object-top"
            }
          />
        </div>
        <div className="flex flex-col flex-1 p-5">
          <span className="text-xs font-semibold tracking-wide text-[var(--pnw-moss)] uppercase mb-1">
            {member.roleLabel}
          </span>
          <h3 className="font-display text-[var(--pnw-ink)] text-xl mb-2">
            {member.name}
          </h3>
          <p className="text-[var(--pnw-ink-soft)] text-sm leading-relaxed mb-4 flex-1 max-w-[65ch]">
            {member.shortBlurb}
          </p>
          <span
            className={`${bioButtonClassName} pointer-events-none w-fit group-hover:bg-[var(--pnw-moss)] group-hover:text-[var(--pnw-white)]`}
            aria-hidden
          >
            About {member.name}
          </span>
        </div>
      </article>
    </ScrollReveal>
  );
}

export function TeamRoster() {
  return (
    <div className="mt-12 md:mt-16">
      <section aria-labelledby="our-dentists-heading">
        <h2
          id="our-dentists-heading"
          className="font-display text-[var(--pnw-ink)] text-2xl md:text-3xl mb-2"
        >
          Our dentists
        </h2>
        <div>
          {doctors.map((member, i) => (
            <DoctorRow key={member.slug} member={member} delay={i * 0.06} />
          ))}
        </div>
      </section>

      <section aria-labelledby="our-team-heading" className="mt-12 md:mt-16">
        <h2
          id="our-team-heading"
          className="font-display text-[var(--pnw-ink)] text-2xl md:text-3xl mb-6 md:mb-8"
        >
          Our team
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {staff.map((member, i) => (
            <StaffCard key={member.slug} member={member} delay={i * 0.04} />
          ))}
        </div>
      </section>
    </div>
  );
}
