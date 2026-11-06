import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Icon from "../components/Icon";

const targets = [
  { value: "all", label: "All clips" },
  { value: "30", label: "30s" },
  { value: "60", label: "60s" },
  { value: "90", label: "90s" },
];

function readSource() {
  try {
    return JSON.parse(sessionStorage.getItem("clipcutter-source")) || null;
  } catch {
    return null;
  }
}

function sensitivityLabel(value) {
  if (value <= 3) return "Careful";
  if (value <= 7) return "Balanced";
  return "Aggressive";
}

function SignalToggle({ icon, title, detail, active, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={active}
      className={`flex w-full flex-col gap-space-sm rounded-xl border p-space-md text-left shadow-sm transition-all ${
        active
          ? "border-secondary/40 bg-secondary/10"
          : "border-outline-variant/30 bg-surface-container-lowest"
      }`}
    >
      <div className="flex w-full items-center justify-between">
        <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${active ? "bg-secondary/20 text-secondary" : "bg-surface-container-high text-on-surface-variant"}`}>
          <Icon name={icon} className="text-[20px]" />
        </span>
        <span
          className={`relative h-5 w-9 rounded-full transition-colors ${active ? "bg-secondary" : "bg-surface-container-highest"}`}
        >
          <span
            className={`absolute top-0.5 h-4 w-4 rounded-full bg-surface-container-lowest shadow transition-all ${
              active ? "left-[18px]" : "left-0.5"
            }`}
          />
        </span>
      </div>
      <div>
        <span className="block text-label-lg text-on-surface">{title}</span>
        <span className="block text-body-sm text-on-surface-variant">{detail}</span>
      </div>
    </button>
  );
}

export default function Settings() {
  const [source] = useState(readSource);
  const [motion, setMotion] = useState(true);
  const [sound, setSound] = useState(true);
  const [sensitivity, setSensitivity] = useState(6);
  const [minLength, setMinLength] = useState(8);
  const [maxClips, setMaxClips] = useState(10);
  const [target, setTarget] = useState("all");
  const navigate = useNavigate();

  function toggleSignal(signal) {
    if (signal === "motion") {
      if (motion && !sound) return;
      setMotion((value) => !value);
      return;
    }
    if (sound && !motion) return;
    setSound((value) => !value);
  }

  const detectionText = motion && sound ? "Motion + sound" : motion ? "Motion only" : "Sound only";
  const sensitivityPercent = ((sensitivity - 1) / 9) * 100;
  const minLengthPercent = ((minLength - 5) / 55) * 100;

  return (
    <div className="relative w-full overflow-hidden px-gutter py-space-lg md:px-gutter-lg lg:py-space-xl">
      <div className="pointer-events-none absolute -right-32 top-0 h-96 w-96 rounded-full bg-secondary/15 blur-[130px]" />
      <div className="pointer-events-none absolute -left-40 bottom-0 h-96 w-96 rounded-full bg-primary-container/20 blur-[140px]" />

      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col gap-space-lg">
        <div className="flex flex-col justify-between gap-space-md md:flex-row md:items-end">
          <div className="flex flex-col gap-space-xs">
            <div className="flex flex-wrap items-center gap-space-xs">
              <span className="rounded-full bg-surface-container-high px-space-xs py-0.5 font-mono text-code-xs uppercase tracking-widest text-secondary">
                Pipeline stage 02
              </span>
              <span className="font-mono text-code-xs text-on-surface-variant">•</span>
              <span className="font-mono text-code-xs text-on-surface-variant">Tune before detection</span>
            </div>
            <h1 className="text-headline-lg tracking-tight text-on-surface">Tune Action Detection</h1>
            <p className="max-w-2xl text-body-md text-on-surface-variant">
              Decide what counts as a highlight, then set the length rules for each clip.
            </p>
          </div>
          <Link
            to="/upload"
            className="inline-flex items-center gap-space-xs rounded-xl bg-surface-container-low px-space-md py-2 text-label-md text-on-surface-variant shadow-sm transition-colors hover:text-on-surface"
          >
            <Icon name="arrow_back" className="text-[18px]" />
            Change video
          </Link>
        </div>

        <div className="grid grid-cols-1 items-start gap-space-lg lg:grid-cols-12">
          <div className="flex flex-col gap-space-md lg:col-span-8">
            {/* Source strip */}
            <div className="flex flex-col gap-space-sm rounded-xl bg-surface-container/70 p-space-md shadow-md backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-center gap-space-sm">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-container-high text-secondary">
                  <Icon name="video_file" className="text-[22px]" />
                </span>
                <div className="flex min-w-0 flex-col">
                  <span className="truncate text-label-lg text-on-surface">
                    {source?.name || "No video selected"}
                  </span>
                  <span className="font-mono text-code-xs text-on-surface-variant">
                    {source ? "Source loaded from this session" : "Choose a video from the upload page"}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-space-xs">
                <span className="rounded bg-surface-container-highest px-space-xs py-1 font-mono text-code-xs text-on-surface-variant">
                  Local processing
                </span>
                <span className="flex items-center gap-1 rounded bg-surface-container-highest px-space-xs py-1 font-mono text-code-xs text-secondary">
                  <span className="h-1.5 w-1.5 rounded-full bg-secondary" />
                  Ready
                </span>
              </div>
            </div>

            {/* Detection */}
            <div className="flex flex-col gap-space-md rounded-xl bg-surface-container-low/80 p-space-md shadow-xl backdrop-blur-md lg:p-space-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="flex items-center gap-space-xs text-headline-md text-on-surface">
                    <Icon name="motion_photos_on" className="text-[22px] text-secondary" />
                    Detection signals
                  </h2>
                  <p className="mt-1 text-body-sm text-on-surface-variant">Use one or both signals. At least one stays on.</p>
                </div>
                <span className="rounded bg-surface-container-high px-space-xs py-1 font-mono text-code-xs text-primary">
                  {detectionText}
                </span>
              </div>

              <div className="grid grid-cols-1 gap-space-sm sm:grid-cols-2">
                <SignalToggle
                  icon="directions_run"
                  title="Motion peaks"
                  detail="OpenCV measures frame-to-frame movement."
                  active={motion}
                  onToggle={() => toggleSignal("motion")}
                />
                <SignalToggle
                  icon="graphic_eq"
                  title="Sound peaks"
                  detail="FFmpeg reads sudden volume changes."
                  active={sound}
                  onToggle={() => toggleSignal("sound")}
                />
              </div>

              <div className="rounded-xl bg-surface-container-lowest/70 p-space-md">
                <div className="mb-space-sm flex items-center justify-between">
                  <div>
                    <span className="flex items-center gap-space-xs text-label-lg text-on-surface">
                      <Icon name="tune" className="text-[18px] text-secondary" />
                      Sensitivity
                    </span>
                    <span className="text-body-sm text-on-surface-variant">Higher values flag more moments.</span>
                  </div>
                  <div className="text-right">
                    <span className="block font-mono text-headline-md text-secondary">{sensitivity}</span>
                    <span className="font-mono text-code-xs uppercase tracking-wider text-on-surface-variant">
                      {sensitivityLabel(sensitivity)}
                    </span>
                  </div>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="1"
                  value={sensitivity}
                  onChange={(event) => setSensitivity(Number(event.target.value))}
                  aria-label="Detection sensitivity"
                  className="range-slider"
                  style={{
                    background: `linear-gradient(to right, rgb(var(--secondary)) ${sensitivityPercent}%, rgb(var(--surface-container-highest)) ${sensitivityPercent}%)`,
                  }}
                />
                <div className="mt-space-xs flex justify-between font-mono text-code-xs text-on-surface-variant">
                  <span>Precise</span>
                  <span>More clips</span>
                </div>
              </div>
            </div>

            {/* Clip rules */}
            <div className="flex flex-col gap-space-md rounded-xl bg-surface-container-low/80 p-space-md shadow-xl backdrop-blur-md lg:p-space-lg">
              <div>
                <h2 className="flex items-center gap-space-xs text-headline-md text-on-surface">
                  <Icon name="content_cut" className="text-[22px] text-primary" />
                  Clip rules
                </h2>
                <p className="mt-1 text-body-sm text-on-surface-variant">
                  Control how long and how many clips make the final cut.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-space-md sm:grid-cols-2">
                <div className="rounded-xl bg-surface-container-lowest/70 p-space-md">
                  <div className="mb-space-sm flex items-center justify-between">
                    <span className="flex items-center gap-space-xs text-label-lg text-on-surface">
                      <Icon name="timer" className="text-[18px] text-secondary" />
                      Minimum clip length
                    </span>
                    <span className="font-mono text-headline-md text-secondary">{minLength}s</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="60"
                    step="1"
                    value={minLength}
                    onChange={(event) => setMinLength(Number(event.target.value))}
                    aria-label="Minimum clip length in seconds"
                    className="range-slider"
                    style={{
                      background: `linear-gradient(to right, rgb(var(--secondary)) ${minLengthPercent}%, rgb(var(--surface-container-highest)) ${minLengthPercent}%)`,
                    }}
                  />
                  <div className="mt-space-xs flex justify-between font-mono text-code-xs text-on-surface-variant">
                    <span>5s minimum</span>
                    <span>60s</span>
                  </div>
                </div>

                <div className="flex flex-col justify-between rounded-xl bg-surface-container-lowest/70 p-space-md">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-space-xs text-label-lg text-on-surface">
                      <Icon name="view_list" className="text-[18px] text-primary" />
                      Max clips
                    </span>
                    <span className="font-mono text-headline-md text-primary">{maxClips}</span>
                  </div>
                  <div className="mt-space-sm flex items-center justify-between gap-space-sm">
                    <button
                      type="button"
                      onClick={() => setMaxClips((value) => Math.max(3, value - 1))}
                      className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-container-high text-on-surface transition-colors hover:bg-surface-bright"
                      aria-label="Decrease max clips"
                    >
                      <Icon name="remove" className="text-[18px]" />
                    </button>
                    <div className="h-1 flex-1 rounded-full bg-surface-container-highest">
                      <div
                        className="h-1 rounded-full bg-gradient-to-r from-primary-container to-secondary"
                        style={{ width: `${((maxClips - 3) / 27) * 100}%` }}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => setMaxClips((value) => Math.min(30, value + 1))}
                      className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-container-high text-on-surface transition-colors hover:bg-surface-bright"
                      aria-label="Increase max clips"
                    >
                      <Icon name="add" className="text-[18px]" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="rounded-xl bg-surface-container-lowest/70 p-space-md">
                <div className="mb-space-sm flex flex-col justify-between gap-1 sm:flex-row sm:items-center">
                  <span className="flex items-center gap-space-xs text-label-lg text-on-surface">
                    <Icon name="straighten" className="text-[18px] text-secondary" />
                    Target merged length
                  </span>
                  <span className="text-body-sm text-on-surface-variant">Trimmed after clip selection</span>
                </div>
                <div className="grid grid-cols-4 gap-1 rounded-lg bg-surface-container-high p-1">
                  {targets.map((item) => (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => setTarget(item.value)}
                      className={`rounded-md py-1.5 font-mono text-code-xs transition-colors ${
                        target === item.value
                          ? "bg-secondary/20 font-bold text-secondary shadow-sm"
                          : "text-on-surface-variant hover:text-on-surface"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Output */}
            <div className="flex flex-col gap-space-sm rounded-xl bg-surface-container-low/70 p-space-md shadow-md sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-space-sm">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-container/25 text-primary">
                  <Icon name="merge" className="text-[20px]" />
                </span>
                <div>
                  <span className="block text-label-lg text-on-surface">Output: one merged video</span>
                  <span className="block font-mono text-code-xs text-on-surface-variant">MP4 · H.264 · ready for CapCut</span>
                </div>
              </div>
              <span className="rounded bg-surface-container-high px-space-xs py-1 font-mono text-code-xs text-secondary">
                Local render
              </span>
            </div>
          </div>

          {/* Summary rail */}
          <aside className="flex flex-col gap-space-md lg:col-span-4 lg:sticky lg:top-24">
            <div className="flex flex-col gap-space-md rounded-xl bg-surface-container-low/80 p-space-lg shadow-xl backdrop-blur-xl">
              <div className="flex items-center justify-between border-b border-outline-variant/20 pb-space-sm">
                <h2 className="text-headline-md text-on-surface">Run summary</h2>
                <span className="flex items-center gap-1 font-mono text-code-xs text-secondary">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-secondary" />
                  Local
                </span>
              </div>

              <div className="space-y-space-sm">
                {[
                  ["Detection", detectionText],
                  ["Sensitivity", `${sensitivity} · ${sensitivityLabel(sensitivity)}`],
                  ["Minimum clip", `${minLength} seconds`],
                  ["Max clips", `${maxClips} clips`],
                  ["Target length", targets.find((item) => item.value === target)?.label],
                  ["Output", "Merged MP4"],
                ].map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between gap-space-sm">
                    <span className="text-body-sm text-on-surface-variant">{label}</span>
                    <span className="text-right font-mono text-code-xs text-on-surface">{value}</span>
                  </div>
                ))}
              </div>

              <div className="rounded-xl border border-secondary/20 bg-secondary/10 p-space-sm">
                <div className="flex items-center gap-space-xs text-label-md text-secondary">
                  <Icon name="shield" className="text-[16px]" />
                  Stays on this device
                </div>
                <p className="mt-1 text-body-sm text-on-surface-variant">
                  FFmpeg and OpenCV run locally. Files are deleted after 24 hours.
                </p>
              </div>

              <button
                type="button"
                onClick={() => navigate("/processing")}
                className="flex w-full items-center justify-center gap-space-xs rounded-xl bg-gradient-to-r from-primary-container via-inverse-primary to-secondary py-3.5 px-space-lg text-label-lg font-bold text-on-primary-container shadow-[0_0_24px_rgba(124,58,237,0.45)] transition-all hover:shadow-[0_0_32px_rgba(76,215,246,0.55)]"
              >
                <Icon name="auto_awesome" className="text-[20px]" />
                Detect action
                <Icon name="arrow_forward" className="text-[18px]" />
              </button>
              <Link to="/upload" className="text-center text-body-sm text-on-surface-variant transition-colors hover:text-on-surface">
                Back to upload
              </Link>
            </div>

            <div className="rounded-xl bg-surface-container-low/60 p-space-md shadow-sm backdrop-blur-md">
              <h3 className="mb-space-xs flex items-center gap-space-xs text-label-lg text-on-surface">
                <Icon name="lightbulb" className="text-[18px] text-primary" />
                Detection tip
              </h3>
              <p className="text-body-sm text-on-surface-variant">
                Start at sensitivity 6. Raise it if quiet moments are missed, lower it if unrelated cuts appear.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
