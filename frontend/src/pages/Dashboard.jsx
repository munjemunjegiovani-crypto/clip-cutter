import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Icon from "../components/Icon";
import { useProject } from "../context/ProjectContext";
import { getProjects } from "../services/api";

const statusStyles = {
  uploaded: { label: "Uploaded", dot: "bg-primary", badge: "bg-primary-container/25 text-primary" },
  processing: {
    label: "Processing",
    dot: "animate-pulse bg-tertiary",
    badge: "bg-tertiary-container/25 text-tertiary",
  },
  complete: { label: "Ready", dot: "bg-secondary", badge: "bg-secondary/10 text-secondary" },
  failed: { label: "Failed", dot: "bg-error", badge: "bg-error-container/40 text-error" },
};

function formatDuration(seconds = 0) {
  const total = Math.round(seconds);
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const secs = total % 60;
  return hours
    ? `${hours}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`
    : `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

function formatSize(bytes = 0) {
  if (bytes >= 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleDateString("en-CA");
}

function jobAction(job) {
  if (job.status === "processing") return "Track";
  if (job.status === "complete" && job.clip_count > 0) return "View";
  return "Settings";
}

export default function Dashboard() {
  const { source, clips, settings, status, openProject } = useProject();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [openingId, setOpeningId] = useState(null);

  useEffect(() => {
    let active = true;
    getProjects()
      .then((data) => {
        if (!active) return;
        setJobs(Array.isArray(data.projects) ? data.projects : []);
        setStats(data.stats ?? null);
      })
      .catch((error) => {
        if (active) setLoadError(error.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  async function handleOpen(job) {
    if (openingId !== null) return;
    setOpeningId(job.id);
    setLoadError("");
    try {
      await openProject(job.id);
      if (job.status === "processing") navigate("/processing");
      else if (job.status === "complete" && job.clip_count > 0) navigate("/results");
      else navigate("/settings");
    } catch (error) {
      setLoadError(error.message);
    } finally {
      setOpeningId(null);
    }
  }

  const statCards = [
    { label: "Videos processed", value: stats ? String(stats.videos_processed) : "—", icon: "movie" },
    { label: "Clips generated", value: stats ? String(stats.clips_generated) : "—", icon: "video_library" },
    { label: "Merged downloads", value: stats ? String(stats.merged_downloads) : "—", icon: "download" },
    { label: "Retention", value: stats ? `${stats.retention_hours}h` : "—", icon: "timer_off" },
  ];
  const kept = clips.filter((clip) => clip.kept).length;
  const detection = settings.motion && settings.sound ? "Motion + sound" : settings.motion ? "Motion only" : "Sound only";
  const statusLabel = !source
    ? "Idle"
    : { uploaded: "Uploaded", processing: "Processing", complete: "Ready", failed: "Failed" }[status] ?? status;
  const activeTarget = !source
    ? "/upload"
    : status === "processing"
      ? "/processing"
      : status === "complete" && clips.length
        ? "/results"
        : "/settings";
  const activeLabel = !source
    ? "Upload video"
    : status === "processing"
      ? "View processing"
      : status === "complete" && clips.length
        ? "Open results"
        : "Open settings";

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
              <span className="font-mono text-code-xs text-on-surface-variant">Local jobs · last 24h</span>
            </div>
            <h1 className="text-headline-lg tracking-tight text-on-surface">History &amp; Workflow</h1>
            <p className="max-w-2xl text-body-md text-on-surface-variant">
              Recent local projects with motion+sound detection, minimum 5-second clips, and merged downloads.
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

        {loadError && (
          <div className="flex items-center gap-space-xs rounded-xl bg-error-container/40 px-space-md py-2.5 text-body-sm text-error shadow-md">
            <Icon name="error" className="text-[18px]" />
            {loadError}
          </div>
        )}

        <div className="grid grid-cols-1 gap-space-xs sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map((stat) => (
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

        <div className="flex flex-col gap-space-sm rounded-xl bg-surface-container-low/70 p-space-md shadow-md backdrop-blur-md sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-space-sm">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary/10 text-secondary">
              <Icon name={source ? "video_file" : "video_library"} className="text-[20px]" />
            </span>
            <div className="min-w-0">
              <span className="block truncate text-label-lg text-on-surface">
                {source ? source.name : "No active session"}
              </span>
              <span className="block font-mono text-code-xs text-on-surface-variant">
                {source
                  ? `${clips.length} ${clips.length === 1 ? "clip" : "clips"} · ${kept} kept · ${detection} · min ${settings.minLength}s`
                  : "Upload a video to start a local project."}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-space-xs self-end sm:self-center">
            <span className="rounded bg-surface-container-high px-space-xs py-1 font-mono text-code-xs capitalize text-on-surface-variant">
              {statusLabel}
            </span>
            <Link
              to={activeTarget}
              className="inline-flex items-center gap-1 rounded-lg bg-surface-container-high px-space-sm py-1.5 text-label-md text-on-surface transition-colors hover:bg-surface-bright"
            >
              {activeLabel}
              <Icon name="arrow_forward" className="text-[16px]" />
            </Link>
          </div>
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
                    {loading ? (
                      <tr>
                        <td colSpan={8} className="px-space-md py-8 text-center text-body-sm text-on-surface-variant">
                          Loading local jobs…
                        </td>
                      </tr>
                    ) : jobs.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="px-space-md py-8 text-center text-body-sm text-on-surface-variant">
                          No local jobs yet.{" "}
                          <Link to="/upload" className="text-secondary hover:underline">
                            Upload a video
                          </Link>{" "}
                          to start.
                        </td>
                      </tr>
                    ) : (
                      jobs.map((job) => {
                        const jobStatus = statusStyles[job.status] ?? statusStyles.uploaded;
                        return (
                          <tr key={job.id} className="border-t border-outline-variant/15 transition-colors hover:bg-surface-container">
                            <td className="px-space-md py-3 font-mono text-code-xs text-secondary">
                              JOB-{String(job.id).padStart(3, "0")}
                            </td>
                            <td className="px-space-md py-3 text-body-sm text-on-surface">{job.original_name}</td>
                            <td className="px-space-md py-3 font-mono text-code-xs text-on-surface-variant">
                              {formatDate(job.created_at)}
                            </td>
                            <td className="px-space-md py-3 font-mono text-code-xs text-on-surface-variant">
                              {formatDuration(job.duration_seconds)}
                            </td>
                            <td className="px-space-md py-3 font-mono text-code-xs text-on-surface-variant">
                              {job.clip_count}
                            </td>
                            <td className="px-space-md py-3 font-mono text-code-xs text-on-surface-variant">
                              {formatSize(job.size_bytes)}
                            </td>
                            <td className="px-space-md py-3">
                              <span className={`flex w-fit items-center gap-1 rounded px-2 py-0.5 font-mono text-[9px] ${jobStatus.badge}`}>
                                <span className={`h-1.5 w-1.5 rounded-full ${jobStatus.dot}`} />
                                {jobStatus.label}
                              </span>
                            </td>
                            <td className="px-space-md py-3 text-right">
                              <button
                                type="button"
                                onClick={() => handleOpen(job)}
                                disabled={openingId !== null}
                                className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 font-mono text-code-xs text-on-surface-variant transition-colors hover:text-on-surface disabled:cursor-wait disabled:opacity-60"
                              >
                                {openingId === job.id ? "Opening…" : jobAction(job)}
                                <Icon name="chevron_right" className="text-[14px]" />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
              <div className="px-space-md py-2 text-center font-mono text-code-xs text-on-surface-variant">
                Jobs stay on this device. Files delete automatically after 24 hours.
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
