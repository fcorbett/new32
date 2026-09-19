import { useEffect, useRef, useState } from "react";

type LazyMapEmbedProps = {
  src: string;
  title: string;
  /** Extra classes on the sized placeholder wrapper. */
  className?: string;
};

/**
 * Placeholder until near the viewport, then mounts the Maps iframe.
 * Keeps Maps off the critical path / Home Lighthouse first paint.
 */
export function LazyMapEmbed({ src, title, className = "" }: LazyMapEmbedProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    if (shouldLoad) return;
    const el = containerRef.current;
    if (!el) return;

    if (typeof IntersectionObserver === "undefined") {
      setShouldLoad(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [shouldLoad]);

  return (
    <div ref={containerRef} className={className}>
      {shouldLoad ? (
        <iframe
          title={title}
          src={src}
          className="absolute inset-0 w-full h-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
      ) : null}
    </div>
  );
}
