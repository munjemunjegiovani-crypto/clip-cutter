import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";

export default function Layout() {
  const location = useLocation();

  // Keep the page at the top on navigation, but honour hash links on the landing page.
  useEffect(() => {
    if (location.hash) {
      const target = document.getElementById(location.hash.slice(1));
      if (target) {
        window.setTimeout(() => target.scrollIntoView({ behavior: "smooth", block: "start" }), 0);
        return;
      }
    }
    window.scrollTo(0, 0);
  }, [location.pathname, location.hash]);

  return (
    <div className="relative flex min-h-screen flex-col bg-surface">
      <div className="ambient-mesh" aria-hidden="true" />
      <Header />
      <main className="relative z-10 w-full flex-1 pt-16">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
