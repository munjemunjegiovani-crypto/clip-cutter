import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import Logo from "./Logo";
import Icon from "./Icon";
import ThemeToggle from "./ThemeToggle";
import avatar from "../assets/images/avatar.jpg";

const navItems = [
  { to: "/results", label: "Studio" },
  { to: "/upload", label: "Upload" },
  { to: "/dashboard", label: "Dashboard" },
  { to: "/#pricing", label: "Pricing" },
  { to: "/#faq", label: "FAQ" },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-outline-variant/20 bg-surface-dim/80 shadow-[0_4px_24px_rgba(0,0,0,0.24)] backdrop-blur-2xl">
      <div className="flex h-16 w-full items-center justify-between px-gutter md:px-gutter-lg">
        <div className="flex items-center gap-space-lg">
          <Logo />
          <nav className="ml-space-md hidden items-center gap-space-md md:flex" aria-label="Main navigation">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `text-label-lg transition-colors ${
                    isActive && !item.to.includes("#")
                      ? "font-semibold text-primary drop-shadow-[0_0_8px_rgba(210,187,255,0.4)]"
                      : "text-on-surface-variant hover:text-on-surface"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-space-sm md:gap-space-md">
          <ThemeToggle />
          <Link to="/signin" className="hidden items-center gap-space-xs sm:flex" title="Local sign-in">
            <span className="relative flex items-center">
              <img
                src={avatar}
                alt="Open local sign-in page"
                className="h-8 w-8 rounded-full object-cover ring-1 ring-outline-variant/50"
              />
              <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-secondary ring-2 ring-surface-dim shadow-[0_0_6px_rgba(76,215,246,0.6)]" />
            </span>
            <Icon name="keyboard_arrow_down" className="text-[20px] text-on-surface-variant" />
          </Link>
          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface md:hidden"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((open) => !open)}
          >
            <Icon name={mobileOpen ? "close" : "menu"} className="text-[22px]" />
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-outline-variant/20 bg-surface-dim/95 px-gutter py-space-md backdrop-blur-2xl md:hidden">
          <nav className="flex flex-col gap-1" aria-label="Mobile navigation">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className="rounded-lg px-3 py-2.5 text-label-lg text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface"
              >
                {item.label}
              </Link>
            ))}
            <Link
              to="/signin"
              onClick={() => setMobileOpen(false)}
              className="mt-2 flex items-center gap-space-sm rounded-lg bg-surface-container px-3 py-2.5 text-label-lg text-on-surface"
            >
              <img src={avatar} alt="" className="h-6 w-6 rounded-full object-cover" />
              Sign in
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
