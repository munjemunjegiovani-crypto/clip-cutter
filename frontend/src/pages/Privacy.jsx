import { Link } from "react-router-dom";
import LegalShell from "../components/LegalShell";

const supportEmail = import.meta.env.VITE_SUPPORT_EMAIL || "support@example.com";

const sections = [
  {
    id: "short-version",
    number: "01",
    title: "The short version",
    body: (
      <p>
        ClipCutter processes video on your own machine. It does not upload footage to a cloud service, does not
        use analytics, and does not train models on your files.
      </p>
    ),
  },
  {
    id: "files",
    number: "02",
    title: "Files you upload",
    body: (
      <>
        <p>
          The source video you select is copied into the app&apos;s local uploads folder. Processed clips and
          merged outputs are written to a local outputs folder.
        </p>
        <p>
          Uploaded and processed files are deleted automatically after 24 hours. Until then, they remain on
          your disk and can be removed by deleting the folders or stopping and cleaning the local app data.
        </p>
      </>
    ),
  },
  {
    id: "job-records",
    number: "03",
    title: "Local job records",
    body: (
      <>
        <p>
          The app may store basic job details in a local SQLite database, such as the file name, date, duration,
          clip count, and status.
        </p>
        <p>
          These records stay on your machine. They are not sent anywhere, and you can clear them by deleting the
          local database file.
        </p>
      </>
    ),
  },
  {
    id: "browser-storage",
    number: "04",
    title: "Browser storage",
    body: (
      <>
        <p>
          The theme toggle saves your dark or light preference in your browser&apos;s local storage. The upload
          page uses session storage to carry the selected file name to the settings page.
        </p>
        <p>Neither is used for tracking or advertising.</p>
      </>
    ),
  },
  {
    id: "no-tracking",
    number: "05",
    title: "No analytics, ads, or tracking",
    body: (
      <p>
        There are no analytics scripts, advertising pixels, or third-party trackers. The app does not build a
        profile of you or sell data.
      </p>
    ),
  },
  {
    id: "no-training",
    number: "06",
    title: "No cloud AI or model training",
    body: (
      <p>
        Detection uses local computer vision and audio analysis. Footage is not sent to an AI provider and is
        not used to train a model.
      </p>
    ),
  },
  {
    id: "choices",
    number: "07",
    title: "Your choices",
    body: (
      <>
        <ul className="list-disc space-y-1 pl-5">
          <li>Delete the uploads, outputs, and database folders at any time.</li>
          <li>Clear browser storage to reset the theme and upload session data.</li>
          <li>
            Use the <Link to="/takedown" className="text-secondary hover:underline">copyright page</Link> to
            report a rights issue.
          </li>
        </ul>
        <p>Because the app is local, there is no server-side account to delete.</p>
      </>
    ),
  },
  {
    id: "security",
    number: "08",
    title: "Security",
    body: (
      <p>
        Local processing limits exposure, but it does not protect against a compromised computer or shared
        account. Use device security and clean up files when you are finished.
      </p>
    ),
  },
];

export default function Privacy() {
  return (
    <LegalShell
      icon="privacy_tip"
      eyebrow="Privacy"
      title="Privacy & Data Deletion"
      description="Where your files live, what is stored, and how to remove it."
      updated="November 2, 2026"
      sections={sections}
      contact={{
        label: "Privacy questions?",
        email: supportEmail,
      }}
    />
  );
}
