import { Link } from "react-router-dom";
import Icon from "./Icon";

export default function Logo({ compact = false }) {
  return (
    <Link to="/" className="group flex items-center gap-space-sm" aria-label="ClipCutter home">
      <span className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-primary-container via-inverse-primary to-secondary-container shadow-[0_0_18px_rgba(124,58,237,0.35)]">
        <Icon name="content_cut" className="rotate-[-18deg] text-[19px] text-on-primary-container" />
        <span className="absolute inset-x-0 top-0 h-px bg-white/40" />
      </span>
      <span className={`${compact ? "text-headline-md" : "text-headline-md"} font-semibold tracking-tight text-on-surface`}>
        Clip<span className="text-primary">Cutter</span>
      </span>
      {!compact && (
        <span className="rounded-full bg-surface-container-high px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-secondary">
          Local
        </span>
      )}
    </Link>
  );
}
