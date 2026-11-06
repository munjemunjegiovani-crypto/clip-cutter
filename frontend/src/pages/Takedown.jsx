import LegalShell from "../components/LegalShell";

const takedownEmail = import.meta.env.VITE_TAKEDOWN_EMAIL || "takedown@example.com";

const sections = [
  {
    id: "our-position",
    number: "01",
    title: "Our position",
    body: (
      <>
        <p>
          ClipCutter processes videos on the user&apos;s own machine. The project does not host a public library
          of user videos and cannot see files processed locally.
        </p>
        <p>
          Users must confirm that they own or have permission to use a video before continuing. If you believe
          that content shared publicly in connection with this project infringes your rights, tell us where it
          is so we can review it.
        </p>
      </>
    ),
  },
  {
    id: "report",
    number: "02",
    title: "How to report",
    body: (
      <>
        <p>
          Email{" "}
          <a href={`mailto:${takedownEmail}`} className="break-all font-semibold text-secondary hover:underline">
            {takedownEmail}
          </a>{" "}
          with the subject line <span className="font-mono text-code-sm text-on-surface">Takedown request</span>.
        </p>
        <p>Please include:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Your name and contact email.</li>
          <li>A description of the work you believe is infringed.</li>
          <li>The URL or location of the material you want reviewed.</li>
          <li>Why you believe the use is unauthorized.</li>
          <li>A statement that the information is accurate and that you are authorized to act.</li>
        </ul>
        <a
          href={`mailto:${takedownEmail}?subject=Takedown%20request`}
          className="mt-space-sm inline-flex items-center gap-space-xs rounded-xl bg-gradient-to-r from-primary-container to-secondary px-space-md py-2.5 text-label-md text-on-primary-container shadow-md"
        >
          Email a takedown request
          <span aria-hidden="true">→</span>
        </a>
      </>
    ),
  },
  {
    id: "review",
    number: "03",
    title: "What we can do",
    body: (
      <>
        <p>
          We can review material that the project hosts or controls, such as pages or media included in this
          repository. We may remove that material while we investigate.
        </p>
        <p>
          We cannot delete files that exist only on another person&apos;s computer. In that case, contact the
          person hosting the file or the platform where it was shared.
        </p>
      </>
    ),
  },
  {
    id: "good-faith",
    number: "04",
    title: "Good-faith requests",
    body: (
      <>
        <p>
          Please send accurate information and do not use this contact for unrelated complaints. We may ask for
          clarification before acting.
        </p>
        <p>
          This page is a practical reporting route, not legal advice. If your situation is urgent, consult a
          qualified professional.
        </p>
      </>
    ),
  },
];

export default function Takedown() {
  return (
    <LegalShell
      icon="gavel"
      eyebrow="Copyright"
      title="Copyright & Takedown"
      description="How to report material you believe infringes your rights."
      updated="November 2, 2026"
      sections={sections}
      contact={{
        label: "Copyright and takedown requests:",
        email: takedownEmail,
      }}
    />
  );
}
