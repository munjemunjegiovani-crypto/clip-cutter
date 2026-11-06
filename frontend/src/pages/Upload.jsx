import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "../components/Icon";
import { useProject } from "../context/ProjectContext";
import sourceImage from "../assets/images/upload-source.jpg";

const MAX_SIZE_MB = 500;
const ACCEPTED = ["mp4", "mov", "mkv"];
const audioBars = [
  20, 35, 25, 50, 30, 65, 45, 80, 95, 100, 75, 60, 35, 40, 55, 70, 85, 92, 65, 45, 30, 40, 50, 75, 40, 20,
];

function formatSize(bytes) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function Upload() {
  const { source, startNewProject, clearSource } = useProject();
  const [permission, setPermission] = useState(false);
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  const file = source;
  const canContinue = Boolean(file && permission);

  function selectFile(nextFile) {
    if (!nextFile) return;
    const extension = nextFile.name.split(".").pop().toLowerCase();
    if (!ACCEPTED.includes(extension)) {
      setError("Only MP4, MOV, and MKV files are accepted.");
      return;
    }
    if (nextFile.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`That file is too large. The limit is ${MAX_SIZE_MB} MB.`);
      return;
    }
    setError("");
    setPermission(false);
    startNewProject({
      name: nextFile.name,
      size: nextFile.size,
      type: nextFile.type,
      lastModified: nextFile.lastModified,
    });
  }

  function handleDrop(event) {
    event.preventDefault();
    setDragging(false);
    selectFile(event.dataTransfer.files?.[0]);
  }

  function handleSubmit() {
    if (!canContinue) return;
    navigate("/settings");
  }

  function removeFile() {
    clearSource();
    setPermission(false);
    setError("");
  }

  return (
    <div className="relative w-full overflow-hidden px-gutter py-space-lg md:px-gutter-lg lg:py-space-xl">
      <div className="pointer-events-none absolute -left-40 -top-40 h-96 w-96 rounded-full bg-primary-container/20 blur-[120px]" />
      <div className="pointer-events-none absolute -right-40 top-1/3 h-96 w-96 rounded-full bg-secondary/15 blur-[130px]" />

      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col gap-space-lg">
        <div className="flex flex-col justify-between gap-space-md md:flex-row md:items-end">
          <div className="flex flex-col gap-space-xs">
            <div className="flex flex-wrap items-center gap-space-xs">
              <span className="rounded-full bg-surface-container-high px-space-xs py-0.5 font-mono text-code-xs uppercase tracking-widest text-secondary">
                Pipeline stage 01
              </span>
              <span className="font-mono text-code-xs text-on-surface-variant">•</span>
              <span className="flex items-center gap-1 font-mono text-code-xs text-on-surface-variant">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-secondary" />
                Ready on this device
              </span>
            </div>
            <h1 className="text-headline-lg tracking-tight text-on-surface">Ingest Media &amp; Confirm Rights</h1>
            <p className="max-w-2xl text-body-md text-on-surface-variant">
              Choose a video from your laptop. Nothing is uploaded to a cloud service.
            </p>
          </div>
          <div className="flex items-center gap-space-xs rounded-xl bg-surface-container-low px-space-md py-space-xs shadow-sm">
            <Icon name="computer" className="text-[18px] text-secondary" />
            <span className="font-mono text-code-xs text-on-surface">Processing: local only</span>
          </div>
        </div>

        <div className="grid grid-cols-1 items-start gap-space-lg lg:grid-cols-12">
          {/* Source and permission */}
          <div className="flex flex-col gap-space-md lg:col-span-7">
            <div className="group relative overflow-hidden rounded-2xl bg-surface-container/70 p-space-md shadow-xl backdrop-blur-xl lg:p-space-lg">
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-primary-container/30 via-secondary/20 to-primary-container/30 opacity-40 blur-sm" />
              <div className="relative flex flex-col gap-space-md rounded-xl bg-surface-container-lowest/90 p-space-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-space-xs">
                    <Icon name="movie_edit" className="text-[20px] text-secondary" />
                    <span className="text-label-lg text-on-surface">Source monitor</span>
                  </div>
                  <span className="rounded-full bg-surface-container-high px-space-xs py-0.5 font-mono text-code-xs uppercase tracking-wider text-primary">
                    {file ? "Selected locally" : "Waiting for a file"}
                  </span>
                </div>

                <div className="group/player relative aspect-video overflow-hidden rounded-lg bg-surface-container-high">
                  <img
                    src={sourceImage}
                    alt="Video preview placeholder"
                    className="h-full w-full object-cover opacity-60"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest via-transparent to-surface-container-lowest/40 opacity-80" />
                  <div className="absolute left-space-sm top-space-sm flex items-center gap-space-xs rounded-full bg-surface-container-lowest/80 px-space-sm py-1 shadow-md backdrop-blur-md">
                    <span className="h-2 w-2 rounded-full bg-secondary" />
                    <span className="font-mono text-code-xs uppercase text-on-surface">
                      {file ? "Ready to review" : "No file loaded"}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    onDragOver={(event) => {
                      event.preventDefault();
                      setDragging(true);
                    }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={handleDrop}
                    className={`absolute inset-0 flex flex-col items-center justify-center gap-2 transition-colors ${
                      dragging ? "bg-primary-container/30" : "bg-surface-dim/30 hover:bg-surface-dim/45"
                    }`}
                  >
                    <span className="flex h-14 w-14 items-center justify-center rounded-full bg-surface-dim/80 text-secondary shadow-xl backdrop-blur-md">
                      <Icon name="upload_file" className="text-[28px]" />
                    </span>
                    <span className="text-label-lg text-on-surface">Choose or drop a video</span>
                    <span className="font-mono text-code-xs text-on-surface-variant">MP4 · MOV · MKV</span>
                  </button>
                  <input
                    ref={inputRef}
                    type="file"
                    accept=".mp4,.mov,.mkv,video/mp4,video/quicktime,video/x-matroska"
                    className="hidden"
                    onChange={(event) => {
                      selectFile(event.target.files?.[0]);
                      event.target.value = "";
                    }}
                  />
                </div>

                {file ? (
                  <div className="flex flex-col gap-space-sm rounded-xl bg-surface-container-low p-space-md shadow-sm sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex min-w-0 items-center gap-space-sm">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-container-high text-secondary">
                        <Icon name="video_file" className="text-[22px]" />
                      </div>
                      <div className="flex min-w-0 flex-col">
                        <span className="truncate text-label-lg text-on-surface">{file.name}</span>
                        <span className="font-mono text-code-xs text-on-surface-variant">
                          {formatSize(file.size)} · Selected from this device
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-space-xs self-end sm:self-center">
                      <span className="rounded bg-surface-container-highest px-space-xs py-1 font-mono text-code-xs text-secondary">
                        {file.name.split(".").pop().toUpperCase()}
                      </span>
                      <button
                        type="button"
                        onClick={() => inputRef.current?.click()}
                        className="rounded-md p-1 text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface"
                        title="Replace file"
                      >
                        <Icon name="sync" className="text-[18px]" />
                      </button>
                      <button
                        type="button"
                        onClick={removeFile}
                        className="rounded-md p-1 text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-error"
                        title="Remove file"
                      >
                        <Icon name="delete" className="text-[18px]" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-space-sm rounded-xl bg-surface-container-low p-space-md shadow-sm">
                    <button
                      type="button"
                      onClick={() => inputRef.current?.click()}
                      className="flex items-center justify-center gap-space-xs rounded-lg bg-surface-container-high px-3 py-2 text-label-md text-on-surface transition-colors hover:bg-surface-bright"
                    >
                      <Icon name="folder_open" className="text-[18px] text-secondary" />
                      Browse files
                    </button>
                    <div className="grid grid-cols-1 gap-space-xs sm:grid-cols-2">
                      <span className="flex items-center gap-space-xs rounded-lg bg-surface-container-lowest px-space-sm py-1.5 font-mono text-code-xs text-on-surface-variant">
                        <Icon name="verified" className="text-[16px] text-secondary" />
                        MP4, MOV, MKV
                      </span>
                      <span className="flex items-center gap-space-xs rounded-lg bg-surface-container-lowest px-space-sm py-1.5 font-mono text-code-xs text-on-surface-variant">
                        <Icon name="sd_card_alert" className="text-[16px] text-primary" />
                        Max {MAX_SIZE_MB} MB
                      </span>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="flex items-center gap-space-xs rounded-lg bg-error-container/40 px-space-sm py-2 text-body-sm text-error">
                    <Icon name="error" className="text-[18px]" />
                    {error}
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-space-md rounded-2xl bg-surface-container-low/70 p-space-md shadow-md backdrop-blur-md lg:p-space-lg">
              <div className="flex items-start gap-space-sm">
                <label className="relative flex cursor-pointer select-none items-center pt-0.5">
                  <input
                    type="checkbox"
                    className="peer sr-only"
                    checked={permission}
                    onChange={(event) => setPermission(event.target.checked)}
                  />
                  <span className="flex h-5 w-5 items-center justify-center rounded bg-surface-container-highest shadow-sm transition-all peer-checked:bg-primary-container">
                    <Icon
                      name="check"
                      className="scale-0 text-[16px] font-bold text-on-primary-container transition-transform peer-checked:scale-100"
                    />
                  </span>
                </label>
                <div className="flex flex-col gap-0.5">
                  <label className="cursor-pointer text-label-lg text-on-surface" onClick={() => setPermission((value) => !value)}>
                    I own or have permission to use this video.
                  </label>
                  <p className={`text-body-sm ${permission ? "text-on-surface-variant" : "text-error"}`}>
                    Required. The upload button stays disabled until this is ticked.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-space-sm rounded-xl bg-surface-container-lowest/60 p-space-sm text-on-surface-variant">
                <Icon name="timer_off" className="shrink-0 text-[20px] text-secondary" />
                <p className="text-body-sm">
                  Uploaded and processed files are stored locally and deleted automatically after 24 hours.
                </p>
              </div>
            </div>

            <div className="relative flex flex-col gap-space-sm overflow-hidden rounded-2xl bg-surface-container-low/50 p-space-md">
              <div className="flex items-center justify-between">
                <span className="font-mono text-code-xs uppercase tracking-wider text-on-surface">Audio energy preview</span>
                <span className="font-mono text-code-xs text-secondary">Peaks highlighted</span>
              </div>
              <div className="flex h-14 w-full items-end justify-between gap-[2px] rounded-lg bg-surface-container-lowest/90 px-space-sm py-2">
                {audioBars.map((height, index) => (
                  <span
                    key={index}
                    className={`w-1 rounded-t ${
                      height > 88 ? "bg-error shadow-[0_0_6px_rgba(255,180,171,0.8)]" : "bg-secondary/60"
                    }`}
                    style={{ height: `${height}%` }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Next steps */}
          <div className="flex flex-col gap-space-md lg:col-span-5">
            <div className="flex flex-col gap-space-md rounded-xl bg-surface-container-low p-space-lg shadow-xl">
              <div className="flex items-center justify-between pb-space-xs">
                <div className="flex flex-col">
                  <span className="font-mono text-code-xs uppercase tracking-wider text-secondary">Before you continue</span>
                  <h2 className="text-headline-md text-on-surface">Upload checklist</h2>
                </div>
                <Icon name="fact_check" className="text-[24px] text-primary" />
              </div>

              <ul className="space-y-space-sm">
                {[
                  { icon: "movie", label: "Format", value: "MP4, MOV, or MKV" },
                  { icon: "data_usage", label: "Maximum size", value: `${MAX_SIZE_MB} MB` },
                  { icon: "schedule", label: "Maximum length", value: "30 minutes" },
                ].map((item) => (
                  <li key={item.label} className="flex items-center justify-between rounded-xl bg-surface-container-lowest/70 px-space-sm py-2.5">
                    <span className="flex items-center gap-space-xs text-body-sm text-on-surface-variant">
                      <Icon name={item.icon} className="text-[18px] text-secondary" />
                      {item.label}
                    </span>
                    <span className="font-mono text-code-xs text-on-surface">{item.value}</span>
                  </li>
                ))}
              </ul>

              <div className="rounded-xl border border-secondary/20 bg-secondary/10 p-space-sm">
                <div className="flex items-center gap-space-xs text-label-md text-secondary">
                  <Icon name="lock" className="text-[18px]" />
                  24-hour auto-delete
                </div>
                <p className="mt-1 text-body-sm text-on-surface-variant">
                  Source files and outputs are removed automatically after 24 hours.
                </p>
              </div>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={!canContinue}
                className="relative flex w-full items-center justify-center gap-space-xs overflow-hidden rounded-xl bg-gradient-to-r from-primary-container via-inverse-primary to-secondary py-3.5 px-space-lg text-label-lg font-bold text-on-primary-container shadow-[0_0_24px_rgba(124,58,237,0.45)] transition-all hover:shadow-[0_0_32px_rgba(76,215,246,0.6)] disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
              >
                <Icon name="upload" className="text-[20px]" />
                <span>Upload video</span>
                <Icon name="arrow_forward" className="text-[18px]" />
              </button>
              <p className="text-center font-mono text-code-xs text-on-surface-variant">
                {file && permission ? "Ready to continue" : "Select a file and tick the permission box"}
              </p>
            </div>

            <div className="rounded-2xl bg-surface-container-low/70 p-space-lg shadow-md backdrop-blur-md">
              <h3 className="mb-space-sm flex items-center gap-space-xs text-label-lg text-on-surface">
                <Icon name="lightbulb" className="text-[18px] text-primary" />
                What happens next
              </h3>
              <ol className="space-y-2 text-body-sm text-on-surface-variant">
                <li className="flex gap-2">
                  <span className="font-mono text-code-xs text-secondary">01</span>
                  Choose detection sensitivity and clip length.
                </li>
                <li className="flex gap-2">
                  <span className="font-mono text-code-xs text-secondary">02</span>
                  Review the clips that ClipCutter found.
                </li>
                <li className="flex gap-2">
                  <span className="font-mono text-code-xs text-secondary">03</span>
                  Merge them and download one video for CapCut.
                </li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
