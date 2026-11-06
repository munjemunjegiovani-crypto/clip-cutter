import { Link } from "react-router-dom";
import Icon from "../components/Icon";

const history = [
  {
    id: "JOB-104",
    name: "Motocross_Run_01.mp4",
    date: "2026-11-02",
    duration: "08:45",
    clips: 7,
    status: "Completed",
    size: "248 MB",
  },
  {
    id: "JOB-103",
    name: "Skate_Session_Trim.mov",
    date: "2026-11-01",
    duration: "06:12",
    clips: 5,
    status: "Completed",
    size: "186 MB",
  },
  {
    id: "JOB-102",
    name: "Game_Clutch.mp4",
    date: "2026-10-31",
    duration: "12:24",
    clips: 9,
    status: "Completed",
    size: "322 MB",
  },
];

const stats = [
  { label: "Videos processed", value: "3", icon: "movie" },
  { label: "Clips generated", value: "21", icon: "video_library" },
  { label: "Merged downloads", value: "3", icon: "download" },
  { label: "Retention", value: "24h", icon: "timer_off" },
];

export default function Dashboard() {
  return (
    <div className="relative w-full overflow-hidden px-gutter py-space-lg md:px-gutter-lg lg:py-space-xl">
      <div className="pointer-events-none absolute -right-32 top-0 h-96 w-96 rounded-full bg-primary-container/20 blur-[130px]" />
      <div className="pointer-events-none absolute -left-40 bottom-0 h-96 w-96 rounded-full bg-secondary/15 blur-[140px]" />

      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col gap-space-lg">
        <div className="flex flex-col justify-between gap-space-md md:flex-row md:items-end">
          <div className="flex flex-col gap-space-xs">
            <div className="flex flex-wrap items-center gap-space-xs">
              <span className="rounded-full bg-surface-container-high px-space-xs py-0.5 font-mono text-code-xs uppercase tracking-widest text-secondary">
                Local dashboard
              </span>
              <span className="font-mono text-code-xs text-on-surface-variant">•</span>
              <span className="font-mono text-code-xs text-on-surface-variant">Sample history only</span>
            </div>
            <h1 className="text-headline-lg tracking-tight text-on-surface">History &amp; Workflow</h1>
            <p className="max-w-2xl text-body-md text-on-surface-variant">
              Local job history with motion+sound detection, minimum 5-second clips, and merged downloads.
            </p>
          </div>
          <Link
            to="/upload"
            className="inline-flex items-center gap-space-xs rounded-xl bg-gradient-to-r from-primary-container to-secondary px-space-lg py-2.5 text-label-lg text-on-primary-container shadow-xl transition-all hover:-translate-y-0.5"
          >
            <Icon name="upload_file" className="text-[18px]" />
            Start new project
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-space-xs sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="flex items-center gap-space-sm rounded-xl bg-surface-container-low/80 p-space-md shadow-md">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-container-high text-secondary">
                <Icon name={stat.icon} className="text-[20px]" />
              </span>
              <div>
                <span className="block font-mono text-headline-md text-on-surface">{stat.value}</span>
                <span className="block font-mono text-code-xs uppercase tracking-wider text-on-surface-variant">
                  {stat.label}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 items-start gap-space-md xl:grid-cols-12">
          <div className="flex flex-col gap-space-md xl:col-span-8">
            <div className="overflow-hidden rounded-xl bg-surface-container-low/80 shadow-xl backdrop-blur-md">
              <div className="flex items-center justify-between border-b border-outline-variant/20 px-space-md py-space-sm">
                <h2 className="flex items-center gap-space-xs text-label-lg text-on-surface">
                  <Icon name="history" className="text-[18px] text-secondary" />
                  Recent jobs (local)
                </h2>
                <span className="font-mono text-code-xs text-on-surface-variant">Auto-delete after 24h</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-surface-container-lowest/60">
                      <th className="px-space-md py-2 font-mono text-code-xs uppercase tracking-wider text-on-surface-variant">
                        Job ID
                      </th>
                      <th className="px-space-md py-2 font-mono text-code-xs uppercase tracking-wider text-on-surface-variant">
                        File
                      </th>
                      <th className="px-space-md py-2 font-mono text-code-xs uppercase tracking-wider text-on-surface-variant">
                        Date
                      </th>
                      <th className="px-space-md py-2 font-mono text-code-xs uppercase tracking-wider text-on-surface-variant">
                        Length
                      </th>
                      <th className="px-space-md py-2 font-mono text-code-xs uppercase tracking-wider text-on-surface-variant">
                        Clips
                      </th>
                      <th className="px-space-md py-2 font-mono text-code-xs uppercase tracking-wider text-on-surface-variant">
                        Size
                      </th>
                      <th className="px-space-md py-2 font-mono text-code-xs uppercase tracking-wider text-on-surface-variant">
                        Status
                      </th>
                      <th className="px-space-md py-2" />
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((job) => (
                      <tr key={job.id} className="border-t border-outline-variant/15 transition-colors hover:bg-surface-container">
                        <td className="px-space-md py-3 font-mono text-code-xs text-secondary">{job.id}</td>
                        <td className="px-space-md py-3 text-body-sm text-on-surface">{job.name}</td>
                        <td className="px-space-md py-3 font-mono text-code-xs text-on-surface-variant">
                          {job.date}
                        </td>
                        <td className="px-space-md py-3 font-mono text-code-xs text-on-surface-variant">
                          {job.duration}
                        </td>
                        <td className="px-space-md py-3 font-mono text-code-xs text-on-surface-variant">
                          {job.clips}
                        </td>
                        <td className="px-space-md py-3 font-mono text-code-xs text-on-surface-variant">
                          {job.size}
                        </td>
                        <td className="px-space-md py-3">
                          <span className="flex w-fit items-center gap-1 rounded bg-secondary/10 px-2 py-0.5 font-mono text-[9px] text-secondary">
                            <span className="h-1.5 w-1.5 rounded-full bg-secondary" />
                            {job.status}
                          </span>
                        </td>
                        <td className="px-space-md py-3 text-right">
                          <Link
                            to="/results"
                            className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 font-mono text-code-xs text-on-surface-variant transition-colors hover:text-on-surface"
                          >
                            View
                            <Icon name="chevron_right" className="text-[14px]" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="px-space-md py-2 text-center font-mono text-code-xs text-on-surface-variant">
                This is sample data shown in the UI. Real jobs appear once processing runs.
              </div>
            </div>
          </div>

          <aside className="flex flex-col gap-space-md xl:col-span-4 xl:sticky xl:top-24">
            <div className="flex flex-col gap-space-md rounded-xl bg-surface-container-low/80 p-space-md shadow-xl backdrop-blur-md">
              <h2 className="flex items-center gap-space-xs text-label-lg text-on-surface">
                <Icon name="account_tree" className="text-[18px] text-secondary" />
                Workflow
              </h2>
              <ol className="space-y-space-sm">
                {[
                  { step: "01", title: "Upload", desc: "MP4/MOV/MKV with permission", to: "/upload" },
                  { step: "02", title: "Settings", desc: "Motion + sound, min 5s", to: "/settings" },
                  { step: "03", title: "Process", desc: "Local detection", to: "/processing" },
                  { step: "04", title: "Results", desc: "Review, merge, download for CapCut", to: "/results" },
                ].map((item) => (
                  <li key={item.step} className="flex items-center gap-space-sm">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-container-high font-mono text-code-xs text-secondary">
                      {item.step}
                    </span>
                    <div className="min-w-0 flex-1">
                      <Link to={item.to} className="block text-label-lg text-on-surface hover:underline">
                        {item.title}
                      </Link>
                      <span className="block text-body-sm text-on-surface-variant">{item.desc}</span>
                    </div>
                    <Icon name="chevron_right" className="text-[16px] text-on-surface-variant" />
                  </li>
                ))}
              </ol>
            </div>

            <div className="rounded-xl bg-surface-container-low/70 p-space-md shadow-md">
              <h3 className="mb-space-xs flex items-center gap-space-xs text-label-lg text-on-surface">
                <Icon name="privacy_tip" className="text-[18px] text-primary" />
                Privacy notes
              </h3>
              <ul className="space-y-1 text-body-sm text-on-surface-variant">
                <li>• Local processing only.</li>
                <li>• Auto-delete uploaded/processed files after 24 hours.</li>
                <li>• No accounts required.</li>
                <li>• See the privacy page for details.</li>
              </ul>
              <Link to="/privacy" className="mt-space-sm inline-flex items-center gap-1 text-label-md text-secondary hover:underline">
                Open privacy page
                <Icon name="arrow_forward" className="text-[14px]" />
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
