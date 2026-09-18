import { Outlet, useLocation } from "react-router";
import { useEffect, useRef } from "react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { StickyMobileBar } from "./StickyMobileBar";

export function SiteLayout() {
  const { pathname } = useLocation();
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    mainRef.current?.focus();
  }, [pathname]);

  return (
    <>
      <a href="#main-content" className="pnw-skip-link">
        Skip to content
      </a>
      <Navbar />
      <main id="main-content" ref={mainRef} tabIndex={-1}>
        <Outlet />
      </main>
      <Footer />
      <StickyMobileBar />
    </>
  );
}
