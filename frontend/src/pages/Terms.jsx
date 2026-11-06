import LegalShell from "../components/LegalShell";

const supportEmail = import.meta.env.VITE_SUPPORT_EMAIL || "support@example.com";

const sections = [
  {
    id: "using-clipcutter",
    number: "01",
    title: "Using ClipCutter",
    body: (
      <>
        <p>
          ClipCutter is a local video tool that looks for motion and sound peaks, cuts candidate clips of at
          least five seconds, and can merge selected clips into one video.
        </p>
        <p>
          It runs on your own machine. You are responsible for the videos you choose, the settings you apply,
          and how you share the output.
        </p>
      </>
    ),
  },
  {
    id: "permission",
    number: "02",
    title: "Your videos and permission",
    body: (
      <>
        <p>
          Only upload videos that you own or have permission to use. The upload page requires you to confirm
          this before a file can continue.
        </p>
        <p>
          You keep ownership of your footage. ClipCutter does not claim rights to your videos or the clips it
          creates.
        </p>
      </>
    ),
  },
  {
    id: "acceptable-use",
    number: "03",
    title: "Acceptable use",
    body: (
      <>
        <p>Do not use ClipCutter to process or share material that:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>You do not have permission to use.</li>
          <li>Violates someone else&apos;s copyright, privacy, or other rights.</li>
          <li>Is unlawful, abusive, or intended to harass another person.</li>
        </ul>
      </>
    ),
  },
  {
    id: "detection",
    number: "04",
    title: "Detection and output",
    body: (
      <>
        <p>
          Detection is based on motion and audio energy. Results vary by footage, lighting, camera movement,
          and sound quality. Review clips before you merge or share them.
        </p>
        <p>
          The app does not claim to understand scenes, identify people, or produce a perfect edit. You are in
          charge of the final selection.
        </p>
      </>
    ),
  },
  {
    id: "storage",
    number: "05",
    title: "Local storage and 24-hour deletion",
    body: (
      <>
        <p>
          Uploaded and processed files are stored on the machine running the app and are scheduled for deletion
          after 24 hours. Job records may remain in the local database until they are removed.
        </p>
        <p>
          Closing the app does not back up your files. Download anything you want to keep before the cleanup
          window ends.
        </p>
      </>
    ),
  },
  {
    id: "cost",
    number: "06",
    title: "Cost",
    body: (
      <p>
        ClipCutter is free to run locally. There are no paid plans, subscriptions, or watermarks. You are
        responsible for your own hardware, storage, and electricity.
      </p>
    ),
  },
  {
    id: "availability",
    number: "07",
    title: "Availability and changes",
    body: (
      <>
        <p>
          The app is provided as-is, without warranties. Features may change as development continues, and
          processing may fail on unsupported or damaged files.
        </p>
        <p>
          To the extent permitted by law, the project is not liable for lost footage, missed clips, or other
          damages arising from use of the app.
        </p>
      </>
    ),
  },
];

export default function Terms() {
  return (
    <LegalShell
      icon="description"
      eyebrow="Legal"
      title="Terms of Service"
      description="Plain-language rules for using ClipCutter on your own machine."
      updated="November 2, 2026"
      sections={sections}
      contact={{
        label: "Questions about these terms?",
        email: supportEmail,
      }}
    />
  );
}
