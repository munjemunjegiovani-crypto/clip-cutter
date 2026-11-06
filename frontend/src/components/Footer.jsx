import { Link } from "react-router-dom";
import Logo from "./Logo";
import Icon from "./Icon";

const supportEmail = import.meta.env.VITE_SUPPORT_EMAIL || "support@example.com";

const legalLinks = [
  { to: "/terms", label: "Terms of Service" },
  { to: "/privacy", label: "Privacy & Data Deletion" },
  { to: "/takedown", label: "Copyright / Takedown" },
];

export default function Footer() {
  return (
    <footer className="relative z-10 mt-space-2xl w-full border-t border-outline-variant/20 bg-surface-container-lowest">
      <div className="w-full px-gutter py-space-xl md:px-gutter-lg">
        <div className="mb-space-lg flex flex-col items-center justify-between gap-space-lg md:flex-row">
          <div className="flex flex-col items-center gap-1 md:items-start">
            <Logo compact />
            <span className="text-body-sm text-on-surface-variant">
              Motion and sound highlight cutter — runs locally.
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-space-md md:gap-space-lg">
            {legalLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="text-body-sm text-on-surface-variant transition-colors hover:text-on-surface"
              >
                {link.label}
              </Link>
            ))}
            <a
              href={`mailto:${supportEmail}`}
              className="text-body-sm text-on-surface-variant transition-colors hover:text-on-surface"
            >
              Support
            </a>
            <span className="flex items-center gap-1 text-body-sm text-on-surface-variant">
              <span className="h-1.5 w-1.5 rounded-full bg-secondary" />
              Local
            </span>
          </div>

          <div className="flex items-center gap-space-xs rounded-full bg-surface-container px-space-md py-1.5 font-mono text-code-xs text-on-surface-variant">
            <Icon name="terminal" className="text-[16px] text-secondary" />
            FFmpeg · OpenCV
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-space-sm border-t border-outline-variant/20 pt-space-md font-mono text-code-xs text-on-surface-variant sm:flex-row">
          <p>© 2026 ClipCutter. Local-first video tool.</p>
          <p className="flex items-center gap-space-xs">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-secondary" />
            <span>No cloud services · No paid APIs</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
