import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Icon from "../components/Icon";
import previewImage from "../assets/images/results-main.jpg";

const logs = [
  { at: 0, time: "00:00.042", tag: "INIT", text: "Loading source video and reading metadata." },
  { at: 18, time: "00:01.184", tag: "FFMPEG", text: "Extracting audio waveform at 48 kHz." },
  { at: 34, time: "00:02.560", tag: "OPENCV", text: "Sampling frames for motion difference." },
  { at: 52, time: "00:04.902", tag: "SCORE", text: "Combining motion and sound peaks into a single score." },
  { at: 68, time: "00:06.331", tag: "CUT", text: "Candidate 05 · 01:22.140 → 01:31.340 (9.2s)." },
  { at: 84, time: "00:08.015", tag: "CUT", text: "Candidate 06 · 02:45.120 → 02:52.620 (7.5s)." },
  { at: 100, time: "00:09.446", tag: "DONE", text: "7 clips found. Ready for review." },
];

const stages = [
  { label: "Read metadata", at: 6 },
  { label: "Extract audio peaks", at: 24 },
  { label: "Measure motion", at: 48 },
  { label: "Score candidates", at: 72 },
  { label: "Prepare clips", at: 94 },
];

const waveform = [18, 30, 44, 28, 55, 72, 48, 88, 100, 76, 52, 36, 60, 82, 95, 68, 44, 30, 52, 78, 90, 62, 38, 24, 48, 70, 56, 34, 20, 42, 66, 50];

export default function Processing() {
  const [progress, setProgress] = useState(18);
  const navigate = useNavigate();
  const complete = progress >= 100;

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((value) => Math.min(100, value + 2 + Math.round(value / 22)));
    }, 850);
    return () => clearInterval(timer);
  }, []);

  const clipsFound = Math.min(7, Math.floor(progress / 14));
  const motionPeaks = Math.min(24, Math.floor(progress / 4.2));
  const soundPeaks = Math.min(18, Math.floor(progress / 5.6));

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
              FFmpeg is reading audio energy while OpenCV measures motion between frames.
            </p>
          </div>
          <Link
            to="/results"
            className="inline-flex items-center gap-space-xs rounded-xl bg-surface-container-low px-space-md py-2 text-label-md text-on-surface-variant shadow-sm transition-colors hover:text-on-surface"
          >
            Preview results
            <Icon name="arrow_forward" className="text-[18px]" />
          </Link>
        </div>

        <div className="grid grid-cols-1 items-stretch gap-space-md lg:grid-cols-12">
          {/* Monitor */}
          <div className="relative overflow-hidden rounded-2xl bg-surface-container/80 p-space-sm shadow-xl backdrop-blur-xl lg:col-span-7">
            <div className="relative aspect-video overflow-hidden rounded-xl bg-surface-container-lowest">
              <img
                src={previewImage}
                alt="Footage being scanned for action"
                className="h-full w-full object-cover opacity-60"
              />
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
                  <span>00:00:00</span>
                  <span className="text-secondary">{Math.round(progress)}% analyzed</span>
                  <span>00:08:45</span>
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
                <h2 className="text-headline-md text-on-surface">{complete ? "7 clips found" : "Reading action peaks"}</h2>
                <p className="text-body-sm text-on-surface-variant">
                  {complete ? "Review the candidates before merging." : "This can take a minute on longer videos."}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-space-xs">
              {[
                { label: "Motion peaks", value: motionPeaks, color: "text-secondary" },
                { label: "Sound peaks", value: soundPeaks, color: "text-primary" },
                { label: "Clips found", value: clipsFound, color: "text-secondary" },
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
              className={`flex w-full items-center justify-center gap-space-xs rounded-xl py-3.5 text-label-lg font-bold transition-all ${
                complete
                  ? "bg-gradient-to-r from-primary-container via-inverse-primary to-secondary text-on-primary-container shadow-[0_0_24px_rgba(124,58,237,0.45)] hover:shadow-[0_0_32px_rgba(76,215,246,0.55)]"
                  : "bg-surface-container-high text-on-surface-variant"
              }`}
            >
              <Icon name={complete ? "video_library" : "hourglass_top"} className="text-[20px]" />
              {complete ? "Review 7 clips" : "Go to results"}
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
            <span className="font-mono text-code-xs text-on-surface-variant">local · no upload</span>
          </div>
          <div className="max-h-56 space-y-1.5 overflow-y-auto p-space-md font-mono text-code-sm">
            {logs.map((log) => (
              <div
                key={log.tag + log.time}
                className={`flex gap-space-sm ${progress >= log.at ? "text-on-surface" : "opacity-25"}`}
              >
                <span className="shrink-0 text-on-surface-variant">{log.time}</span>
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
