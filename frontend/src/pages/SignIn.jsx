import { Link } from "react-router-dom";
import Icon from "../components/Icon";

export default function SignIn() {
  return (
    <div className="relative flex min-h-[70vh] w-full items-center justify-center overflow-hidden px-gutter py-space-xl md:px-gutter-lg">
      <div className="pointer-events-none absolute left-1/2 top-0 h-[320px] w-[640px] -translate-x-1/2 rounded-full bg-primary-container/20 blur-[130px]" />
      <div className="pointer-events-none absolute -right-32 bottom-0 h-72 w-72 rounded-full bg-secondary/15 blur-[110px]" />

      <div className="relative z-10 w-full max-w-md">
        <div className="mb-space-lg text-center">
          <span className="mb-space-sm inline-flex items-center gap-space-xs rounded-full bg-surface-container-high px-space-md py-1 font-mono text-code-xs uppercase tracking-widest text-secondary">
            <span className="h-1.5 w-1.5 rounded-full bg-secondary" />
            Local app
          </span>
          <h1 className="mt-space-sm text-headline-lg text-on-surface">Sign in</h1>
          <p className="mt-1 text-body-md text-on-surface-variant">
            No accounts required for local use.
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl bg-surface-container-low/80 shadow-xl backdrop-blur-xl">
          <div className="flex flex-col gap-space-md p-space-lg">
            <div className="flex items-center gap-space-sm rounded-xl bg-secondary/10 p-space-sm">
              <Icon name="lock" className="text-[20px] text-secondary" />
              <p className="text-body-sm text-on-surface-variant">
                ClipCutter runs entirely on your machine. Accounts are not needed.
              </p>
            </div>

            <button
              type="button"
              className="flex w-full items-center justify-center gap-space-xs rounded-xl bg-surface-container-high py-3 text-label-lg text-on-surface-variant shadow-sm"
              disabled
            >
              <Icon name="person" className="text-[18px]" />
              <span>Sign in (not enabled)</span>
            </button>

            <div className="flex items-center gap-space-sm text-on-surface-variant">
              <span className="h-px flex-1 bg-outline-variant/30" />
              <span className="font-mono text-code-xs">or</span>
              <span className="h-px flex-1 bg-outline-variant/30" />
            </div>

            <Link
              to="/upload"
              className="flex w-full items-center justify-center gap-space-xs rounded-xl bg-gradient-to-r from-primary-container to-secondary py-3 text-label-lg text-on-primary-container shadow-xl transition-all hover:-translate-y-0.5"
            >
              <Icon name="upload_file" className="text-[18px]" />
              <span>Continue to upload</span>
            </Link>
          </div>

          <div className="border-t border-outline-variant/20 px-space-lg py-space-sm text-center">
            <Link to="/" className="text-body-sm text-on-surface-variant transition-colors hover:text-on-surface">
              Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
