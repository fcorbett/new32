import { PictureImage } from "../components/PictureImage";
import { galleryPage } from "../content/pages";
import { PageMeta } from "../components/PageMeta";
import { PageHero } from "../components/PageHero";
import { CallBand } from "../components/CallBand";
import { Breadcrumbs } from "../components/Breadcrumbs";
import { JsonLd } from "../components/JsonLd";
import { ScrollReveal } from "../components/ScrollReveal";
import { useVersionPath } from "../hooks/useVersionPath";
import { absoluteAssetUrl, canonicalUrl } from "../content/schema";

export function GalleryPage() {
  const homeTo = useVersionPath();
  const galleryImages = galleryPage.sections.flatMap((section) =>
    section.photos.map((photo) => absoluteAssetUrl(photo.picture.img.src)),
  );
  const schema = {
    "@context": "https://schema.org",
    "@type": "ImageGallery",
    name: "new32 Gallery",
    description: galleryPage.seo.description,
    url: canonicalUrl("/gallery"),
    image: galleryImages,
  };

  return (
    <>
      <PageMeta
        title={galleryPage.seo.title}
        description={galleryPage.seo.description}
      />
      <JsonLd data={schema} />
      <Breadcrumbs
        items={[{ name: "Home", to: homeTo }, { name: "Gallery" }]}
      />
      <PageHero title={galleryPage.h1} lead={galleryPage.lead} />
      <div className="w-full px-6 md:px-16 py-12 md:py-16">
        <div className="pnw-container space-y-14 md:space-y-16">
          {galleryPage.sections.map((section, sIndex) => (
            <section key={section.heading} aria-labelledby={`gallery-${sIndex}`}>
              <ScrollReveal>
                <h2
                  id={`gallery-${sIndex}`}
                  className="font-display text-[var(--pnw-ink)] text-2xl md:text-3xl mb-6"
                >
                  {section.heading}
                </h2>
              </ScrollReveal>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                {section.photos.map((photo, i) => (
                  <ScrollReveal
                    key={`${section.heading}-${i}`}
                    delay={i * 0.06}
                    scale
                    className="relative aspect-[4/3] overflow-hidden bg-[var(--pnw-stone-deep)]"
                  >
                    <PictureImage
                      picture={photo.picture}
                      alt={photo.alt}
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      loading={sIndex === 0 && i === 0 ? "eager" : "lazy"}
                      fetchpriority={
                        sIndex === 0 && i === 0 ? "high" : undefined
                      }
                      className="absolute inset-0 w-full h-full"
                      imgClassName="absolute inset-0 w-full h-full object-cover"
                    />
                  </ScrollReveal>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
      <CallBand />
    </>
  );
}
