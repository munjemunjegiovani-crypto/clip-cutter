import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Icon from "../components/Icon";
import { useProject } from "../context/ProjectContext";
import { sourceUrl } from "../services/api";
import previewImage from "../assets/images/results-main.jpg";

const waveform = [18, 30, 44, 28, 55, 72, 48, 88, 100, 76, 52, 36, 60, 82, 95, 68, 44, 30, 52, 78, 90, 62, 38, 24, 48, 70, 56, 34, 20, 42, 66, 50];

function formatClock(seconds = 0) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.round(seconds % 60);
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

export default function Processing() {
  const { project, source, clips, settings, status, error } = useProject();
  const [progress, setProgress] = useState(status === "complete" ? 100 : 8);
  const navigate = useNavigate();
  const complete = status === "complete";
  const totalClips = clips.length;
  const keptClips = clips.filter((clip) => clip.kept).length;
  const videoSource = project ? sourceUrl(project.id) : "";
  const detection = settings.motion && settings.sound ? "motion and sound" : settings.motion ? "motion" : "sound";
  const stages = [
    { label: "Read metadata", at: 6 },
    ...(settings.sound ? [{ label: "Extract audio peaks", at: 24 }] : []),
    ...(settings.motion ? [{ label: "Measure motion", at: 48 }] : []),
    { label: "Score candidates", at: 72 },
    { label: "Prepare clips", at: 94 },
  ];

  useEffect(() => {
    if (complete) {
      setProgress(100);
      return undefined;
    }
    if (status !== "processing") return undefined;

    const timer = window.setInterval(() => {
      setProgress((value) => Math.min(96, value + Math.max(1, Math.round((96 - value) / 12))));
    }, 900);
    return () => window.clearInterval(timer);
  }, [complete, status]);

  const logs = [
    { at: 0, tag: "INIT", text: `Reading ${source?.name || "the source video"} on the local API.` },
    ...(settings.sound ? [{ at: 16, tag: "FFMPEG", text: "Extracting the audio waveform for peak detection." }] : []),
    ...(settings.motion ? [{ at: 32, tag: "OPENCV", text: "Sampling frames and measuring motion difference." }] : []),
    { at: 50, tag: "SCORE", text: `Combining ${detection} peaks into candidate scores.` },
    { at: 68, tag: "SCORE", text: "Ranking candidates against the detection threshold." },
    { at: 84, tag: "CUT", text: `Enforcing the ${settings.minLength}s minimum clip length.` },
    { at: 100, tag: "DONE", text: complete ? `${totalClips} ${totalClips === 1 ? "clip" : "clips"} returned. Ready for review.` : "Waiting for the detection API." },
  ];

  if (status === "failed") {
    return (
      <div className="relative flex min-h-[70vh] w-full flex-col items-center justify-center px-gutter py-space-2xl text-center">
        <span className="mb-space-md flex h-16 w-16 items-center justify-center rounded-2xl bg-error-container/40 text-error shadow-xl">
          <Icon name="error" className="text-[32px]" />
        </span>
        <h1 className="text-headline-lg text-on-surface">Detection did not finish</h1>
        <p className="mt-space-sm max-w-md text-body-md text-on-surface-variant">
          {error || "Check the source video and your settings, then try again."}
        </p>
        <div className="mt-space-lg flex flex-col gap-space-sm sm:flex-row">
          <Link to="/settings" className="inline-flex items-center justify-center gap-space-xs rounded-xl bg-gradient-to-r from-primary-container to-secondary px-space-lg py-3 text-label-lg text-on-primary-container shadow-xl">
            <Icon name="tune" className="text-[18px]" />
            Back to settings
          </Link>
          <Link to="/upload" className="inline-flex items-center justify-center gap-space-xs rounded-xl bg-surface-container-high px-space-lg py-3 text-label-lg text-on-surface shadow-md">
            <Icon name="upload_file" className="text-[18px] text-secondary" />
            Choose another video
          </Link>
        </div>
      </div>
    );
  }

  if (status !== "processing" && status !== "complete") {
    return (
      <div className="relative flex min-h-[70vh] w-full flex-col items-center justify-center px-gutter py-space-2xl text-center">
        <span className="mb-space-md flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-container-low text-secondary shadow-xl">
          <Icon name="radar" className="text-[32px]" />
        </span>
        <h1 className="text-headline-lg text-on-surface">{project ? "Ready for detection" : "No scan running"}</h1>
        <p className="mt-space-sm max-w-md text-body-md text-on-surface-variant">
          {project ? "Open settings to choose your detection rules and start the scan." : "Upload a video and choose settings before running detection."}
        </p>
        <div className="mt-space-lg flex flex-col gap-space-sm sm:flex-row">
          <Link to={project ? "/settings" : "/upload"} className="inline-flex items-center justify-center gap-space-xs rounded-xl bg-gradient-to-r from-primary-container to-secondary px-space-lg py-3 text-label-lg text-on-primary-container shadow-xl">
            <Icon name={project ? "tune" : "upload_file"} className="text-[18px]" />
            {project ? "Open settings" : "Upload video"}
          </Link>
          {project && (
            <Link to="/results" className="inline-flex items-center justify-center gap-space-xs rounded-xl bg-surface-container-high px-space-lg py-3 text-label-lg text-on-surface shadow-md">
              <Icon name="video_library" className="text-[18px] text-secondary" />
              View saved clips
            </Link>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full overflow-hidden px-gutter py-space-lg md:px-gutter-lg lg:py-space-xl">
      <div className="pointer-events-none absolute left-1/2 top-0 h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-primary-container/20 blur-[140px]" />
      <div className="pointer-events-none absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-secondary/15 blur-[120px]" />

      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-space-lg">
        <div className="flex flex-col justify-between gap-space-md md:flex-row md:items-end">
          <div className="flex flex-col gap-space-xs">
            <div className="flex flex-wrap items-center gap-space-xs">
              <span className="rounded-full bg-surface-container-high px-space-xs py-0.5 font-mono text-code-xs uppercase tracking-widest text-secondary">
                Pipeline stage 03
              </span>
              <span className="font-mono text-code-xs text-on-surface-variant">•</span>
              <span className="flex items-center gap-1 font-mono text-code-xs text-on-surface-variant">
                <span className={`h-1.5 w-1.5 rounded-full ${complete ? "bg-secondary" : "animate-pulse bg-error"}`} />
                {complete ? "Detection complete" : "Processing on this device"}
              </span>
            </div>
            <h1 className="text-headline-lg tracking-tight text-on-surface">
              {complete ? "Highlight Scan Complete" : "Scanning for Action Moments"}
            </h1>
            <p className="max-w-2xl text-body-md text-on-surface-variant">
              {settings.motion && settings.sound
                ? "FFmpeg is reading audio energy while OpenCV measures motion between frames."
                : settings.motion
                  ? "OpenCV is measuring motion between frames."
                  : "FFmpeg is reading audio energy from the video."}
            </p>
          </div>
          <Link
            to={complete ? "/results" : "/settings"}
            className="inline-flex items-center gap-space-xs rounded-xl bg-surface-container-low px-space-md py-2 text-label-md text-on-surface-variant shadow-sm transition-colors hover:text-on-surface"
          >
            {complete ? "Preview results" : "Back to settings"}
            <Icon name="arrow_forward" className="text-[18px]" />
          </Link>
        </div>

        <div className="grid grid-cols-1 items-stretch gap-space-md lg:grid-cols-12">
          {/* Monitor */}
          <div className="relative overflow-hidden rounded-2xl bg-surface-container/80 p-space-sm shadow-xl backdrop-blur-xl lg:col-span-7">
            <div className="relative aspect-video overflow-hidden rounded-xl bg-surface-container-lowest">
              {videoSource ? (
                <video
                  src={videoSource}
                  poster={previewImage}
                  className="h-full w-full object-cover opacity-60"
                  muted
                  playsInline
                  preload="metadata"
                  aria-hidden="true"
                  onLoadedMetadata={(event) => {
                    event.currentTarget.currentTime = 0.1;
                  }}
                />
              ) : (
                <img
                  src={previewImage}
                  alt=""
                  className="h-full w-full object-cover opacity-60"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest via-surface-container-lowest/20 to-surface-container-lowest/60" />
              <div
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage:
                    "linear-gradient(rgb(var(--secondary) / 0.35) 1px, transparent 1px), linear-gradient(90deg, rgb(var(--secondary) / 0.35) 1px, transparent 1px)",
                  backgroundSize: "42px 42px",
                }}
              />
              <div className="absolute inset-x-0 top-0 h-24 animate-scan bg-gradient-to-b from-transparent to-secondary/15" />
              <div className="absolute inset-x-6 top-1/2 h-px bg-gradient-to-r from-transparent via-secondary to-transparent shadow-[0_0_12px_#4cd7f6]" />

              <div className="absolute left-space-sm top-space-sm flex items-center gap-space-xs rounded-full bg-surface-container-lowest/80 px-space-sm py-1 shadow-md backdrop-blur-md">
                <span className={`h-2 w-2 rounded-full ${complete ? "bg-secondary" : "animate-pulse bg-error"}`} />
                <span className="font-mono text-code-xs uppercase tracking-wider text-on-surface">
                  {complete ? "Scan finished" : "Analyzing frames"}
                </span>
              </div>
              <div className="absolute right-space-sm top-space-sm rounded-full bg-surface-container-lowest/80 px-space-sm py-1 font-mono text-code-xs text-on-surface-variant backdrop-blur-md">
                OpenCV · FFmpeg
              </div>

              <div className="absolute inset-x-space-sm bottom-space-sm flex flex-col gap-space-xs">
                <div className="flex items-end justify-between gap-[2px] rounded-lg bg-surface-container-lowest/70 p-space-sm backdrop-blur-md">
                  {waveform.map((height, index) => (
                    <span
                      key={index}
                      className={`w-1 rounded-t transition-all duration-500 ${
                        (index / waveform.length) * 100 <= progress ? "bg-secondary" : "bg-outline-variant/40"
                      }`}
                      style={{ height: `${Math.max(6, height * 0.42)}px` }}
                    />
                  ))}
                </div>
                <div className="flex items-center justify-between font-mono text-code-xs text-on-surface-variant">
                  <span>{formatClock((source?.duration || 0) * (progress / 100))}</span>
                  <span className="text-secondary">{Math.round(progress)}% analyzed</span>
                  <span>{formatClock(source?.duration || 0)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Live status */}
          <div className="flex flex-col gap-space-md rounded-2xl bg-surface-container-low/80 p-space-md shadow-xl backdrop-blur-xl lg:col-span-5 lg:p-space-lg">
            <div className="flex items-center gap-space-md">
              <div className="relative flex h-20 w-20 shrink-0 items-center justify-center">
                <div
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: `conic-gradient(rgb(var(--secondary)) ${progress * 3.6}deg, rgb(var(--surface-container-highest)) 0deg)`,
                  }}
                />
                <div className="absolute inset-[6px] rounded-full bg-surface-container-low" />
                <div className="absolute inset-0 animate-spin rounded-full border border-dashed border-secondary/30 [animation-duration:16s]" />
                <div className="relative flex flex-col items-center">
                  <span className="font-mono text-headline-md text-on-surface">{Math.round(progress)}%</span>
                  <span className="font-mono text-code-xs uppercase text-on-surface-variant">scan</span>
                </div>
              </div>
              <div className="min-w-0">
                <span className="font-mono text-code-xs uppercase tracking-wider text-secondary">
                  {complete ? "Complete" : "Live status"}
                </span>
                <h2 className="text-headline-md text-on-surface">{complete ? `${totalClips} ${totalClips === 1 ? "clip" : "clips"} found` : "Reading action peaks"}</h2>
                <p className="text-body-sm text-on-surface-variant">
                  {complete ? "Review the candidates before merging." : "This can take a minute on longer videos."}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-space-xs">
              {[
                { label: "Progress", value: `${Math.round(progress)}%`, color: "text-secondary" },
                { label: "Clips found", value: complete ? totalClips : "—", color: "text-primary" },
                { label: "Kept", value: complete ? keptClips : "—", color: "text-secondary" },
              ].map((stat) => (
                <div key={stat.label} className="rounded-lg bg-surface-container-lowest/70 p-space-sm text-center">
                  <span className={`block font-mono text-headline-md ${stat.color}`}>{stat.value}</span>
                  <span className="block font-mono text-code-xs text-on-surface-variant">{stat.label}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-1 flex-col gap-space-sm">
              {stages.map((stage) => {
                const done = progress >= stage.at;
                return (
                  <div key={stage.label} className="flex items-center gap-space-sm">
                    <span
                      className={`flex h-5 w-5 items-center justify-center rounded-full ${
                        done ? "bg-secondary/20 text-secondary" : "bg-surface-container-high text-on-surface-variant"
                      }`}
                    >
                      <Icon name={done ? "check" : "more_horiz"} className="text-[14px]" />
                    </span>
                    <span className={`flex-1 text-body-sm ${done ? "text-on-surface" : "text-on-surface-variant"}`}>
                      {stage.label}
                    </span>
                    {done ? (
                      <span className="font-mono text-code-xs text-secondary">done</span>
                    ) : (
                      <span className="font-mono text-code-xs text-on-surface-variant">queued</span>
                    )}
                  </div>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => navigate("/results")}
              disabled={!complete}
              className={`flex w-full items-center justify-center gap-space-xs rounded-xl py-3.5 text-label-lg font-bold transition-all ${
                complete
                  ? "bg-gradient-to-r from-primary-container via-inverse-primary to-secondary text-on-primary-container shadow-[0_0_24px_rgba(124,58,237,0.45)] hover:shadow-[0_0_32px_rgba(76,215,246,0.55)]"
                  : "cursor-wait bg-surface-container-high text-on-surface-variant"
              }`}
            >
              <Icon name={complete ? "video_library" : "hourglass_top"} className="text-[20px]" />
              {complete ? `Review ${totalClips} ${totalClips === 1 ? "clip" : "clips"}` : "Scanning..."}
              <Icon name="arrow_forward" className="text-[18px]" />
            </button>
          </div>
        </div>

        {/* Terminal log */}
        <div className="overflow-hidden rounded-2xl bg-surface-container-lowest/90 shadow-xl">
          <div className="flex items-center justify-between border-b border-outline-variant/20 bg-surface-container-low/80 px-space-md py-space-sm">
            <div className="flex items-center gap-space-sm">
              <div className="flex gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-error/70" />
                <span className="h-2.5 w-2.5 rounded-full bg-primary/70" />
                <span className="h-2.5 w-2.5 rounded-full bg-secondary/70" />
              </div>
              <span className="font-mono text-code-xs uppercase tracking-wider text-on-surface-variant">Detection log</span>
            </div>
            <span className="font-mono text-code-xs text-on-surface-variant">local API · no cloud</span>
          </div>
          <div className="max-h-56 space-y-1.5 overflow-y-auto p-space-md font-mono text-code-sm">
            {logs.map((log, index) => (
              <div
                key={log.tag + index}
                className={`flex gap-space-sm ${progress >= log.at ? "text-on-surface" : "opacity-25"}`}
              >
                <span className="shrink-0 text-on-surface-variant">{String(index + 1).padStart(2, "0")}</span>
                <span
                  className={`shrink-0 ${
                    log.tag === "DONE"
                      ? "text-secondary"
                      : log.tag === "CUT"
                        ? "text-primary"
                        : "text-tertiary"
                  }`}
                >
                  [{log.tag}]
                </span>
                <span className="text-on-surface-variant">{log.text}</span>
              </div>
            ))}
            <div className="flex items-center gap-1 text-on-surface-variant">
              <span className="text-secondary">$</span>
              <span className="h-3 w-1.5 animate-pulse bg-secondary" />
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-space-sm sm:flex-row">
          <Link
            to="/settings"
            className="inline-flex items-center gap-space-xs rounded-lg px-space-sm py-2 text-body-sm text-on-surface-variant transition-colors hover:text-on-surface"
          >
            <Icon name="arrow_back" className="text-[18px]" />
            Back to settings
          </Link>
          <p className="font-mono text-code-xs text-on-surface-variant">
            Detection runs locally · files auto-delete after 24 hours
          </p>
        </div>
      </div>
    </div>
  );
}
