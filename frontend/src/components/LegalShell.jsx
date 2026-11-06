import { Link } from "react-router-dom";
import Icon from "./Icon";

export default function LegalShell({ icon, eyebrow, title, description, updated, sections, contact }) {
  return (
    <div className="relative w-full overflow-hidden px-gutter py-space-lg md:px-gutter-lg lg:py-space-xl">
      <div className="pointer-events-none absolute -right-32 top-0 h-96 w-96 rounded-full bg-primary-container/20 blur-[130px]" />
      <div className="pointer-events-none absolute -left-40 bottom-0 h-80 w-80 rounded-full bg-secondary/10 blur-[120px]" />

      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-space-lg">
        <div className="flex flex-col gap-space-md rounded-2xl bg-surface-container-low/70 p-space-lg shadow-xl backdrop-blur-xl md:flex-row md:items-center md:justify-between md:p-space-xl">
          <div className="flex items-start gap-space-md">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-container/25 text-primary">
              <Icon name={icon} className="text-[26px]" />
            </span>
            <div>
              <span className="font-mono text-code-xs uppercase tracking-widest text-secondary">{eyebrow}</span>
              <h1 className="mt-1 text-headline-lg tracking-tight text-on-surface md:text-headline-xl-mobile">
                {title}
              </h1>
              <p className="mt-1 max-w-2xl text-body-md text-on-surface-variant">{description}</p>
              <span className="mt-space-sm inline-flex items-center gap-1 rounded bg-surface-container-high px-space-xs py-1 font-mono text-code-xs text-on-surface-variant">
                <Icon name="update" className="text-[14px]" />
                Last updated: {updated}
              </span>
            </div>
          </div>
          <Link
            to="/upload"
            className="inline-flex w-fit items-center gap-space-xs rounded-xl bg-surface-container-high px-space-md py-2 text-label-md text-on-surface shadow-sm transition-colors hover:bg-surface-bright"
          >
            <Icon name="arrow_back" className="text-[18px]" />
            Back to upload
          </Link>
        </div>

        <div className="grid grid-cols-1 items-start gap-space-lg lg:grid-cols-12">
          <aside className="hidden flex-col gap-space-md lg:sticky lg:top-24 lg:col-span-3 lg:flex">
            <div className="rounded-xl bg-surface-container-low/70 p-space-md shadow-md backdrop-blur-md">
              <h2 className="mb-space-sm font-mono text-code-xs uppercase tracking-wider text-on-surface-variant">On this page</h2>
              <nav className="space-y-1">
                {sections.map((section) => (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    className="block rounded-md px-2 py-1.5 text-body-sm text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface"
                  >
                    {section.title}
                  </a>
                ))}
              </nav>
            </div>

            {contact && (
              <div className="rounded-xl bg-surface-container-low/60 p-space-md shadow-sm backdrop-blur-md">
                <h3 className="mb-space-xs flex items-center gap-space-xs text-label-lg text-on-surface">
                  <Icon name="mail" className="text-[18px] text-secondary" />
                  Questions?
                </h3>
                <p className="mb-space-sm text-body-sm text-on-surface-variant">{contact.label}</p>
                <a
                  href={`mailto:${contact.email}`}
                  className="inline-flex items-center gap-1 break-all text-label-md text-secondary hover:underline"
                >
                  {contact.email}
                  <Icon name="open_in_new" className="text-[14px]" />
                </a>
              </div>
            )}
          </aside>

          <article className="rounded-2xl bg-surface-container-low/75 p-space-lg shadow-xl backdrop-blur-md md:p-space-xl lg:col-span-9">
            <div className="mb-space-lg rounded-xl border border-secondary/20 bg-secondary/10 p-space-sm">
              <p className="flex items-start gap-space-xs text-body-sm text-on-surface-variant">
                <Icon name="info" className="mt-0.5 shrink-0 text-[16px] text-secondary" />
                ClipCutter is a local tool. Uploaded files stay on the machine that runs the app, and files are
                deleted automatically after 24 hours.
              </p>
            </div>

            <div className="space-y-space-xl">
              {sections.map((section) => (
                <section key={section.id} id={section.id} className="scroll-mt-24">
                  <h2 className="mb-space-sm flex items-center gap-space-xs text-headline-md text-on-surface">
                    <span className="font-mono text-code-xs text-secondary">{section.number}</span>
                    {section.title}
                  </h2>
                  <div className="space-y-space-sm text-body-md text-on-surface-variant">{section.body}</div>
                </section>
              ))}
            </div>

            {contact && (
              <div className="mt-space-xl rounded-xl bg-surface-container-lowest/70 p-space-md">
                <h2 className="mb-space-xs text-label-lg text-on-surface">Contact</h2>
                <p className="text-body-sm text-on-surface-variant">
                  {contact.label} Email{" "}
                  <a href={`mailto:${contact.email}`} className="break-all text-secondary hover:underline">
                    {contact.email}
                  </a>
                  .
                </p>
              </div>
            )}
          </article>
        </div>
      </div>
    </div>
  );
}
