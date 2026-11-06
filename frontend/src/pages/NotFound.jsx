import { Link } from "react-router-dom";
import Icon from "../components/Icon";

export default function NotFound() {
  return (
    <div className="relative flex min-h-[70vh] w-full flex-col items-center justify-center px-gutter py-space-2xl text-center">
      <span className="mb-space-md flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-container-low text-secondary shadow-xl">
        <Icon name="search_off" className="text-[32px]" />
      </span>
      <span className="font-mono text-code-xs uppercase tracking-widest text-secondary">404</span>
      <h1 className="mt-1 text-headline-lg text-on-surface">This page does not exist</h1>
      <p className="mt-space-sm max-w-md text-body-md text-on-surface-variant">
        Check the address or go back to the landing page.
      </p>
      <Link
        to="/"
        className="mt-space-lg inline-flex items-center gap-space-xs rounded-xl bg-surface-container-high px-space-lg py-3 text-label-lg text-on-surface shadow-md transition-colors hover:bg-surface-bright"
      >
        <Icon name="home" className="text-[18px] text-secondary" />
        Back to home
      </Link>
    </div>
  );
}
