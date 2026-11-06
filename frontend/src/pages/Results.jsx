import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Icon from "../components/Icon";
import { useProject } from "../context/ProjectContext";
import { mediaUrl, sourceUrl } from "../services/api";

const segmentStyles = [
  "bg-primary-container/85 text-on-primary-container",
  "bg-secondary-container/85 text-on-secondary-container",
  "bg-tertiary-container/85 text-on-tertiary-container",
  "bg-primary-container/60 text-on-primary-container",
  "bg-secondary-container/60 text-on-secondary-container",
  "bg-primary-container/40 text-on-primary-container",
  "bg-secondary/50 text-on-secondary",
];

function formatDuration(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.round(seconds % 60);
  return `${mins}:${String(secs).padStart(2, "0")}`;
}

function formatTimecode(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = (seconds % 60).toFixed(1).padStart(4, "0");
  return `${mins}:${secs}`;
}

function formatSize(bytes = 0) {
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function Results() {
  const {
    project,
    clips: projectClips,
    settings,
    status,
    toggleKept,
    moveClip,
    exportMerged,
    exporting,
    exportInfo,
  } = useProject();
  const clips = useMemo(
    () =>
      projectClips.map((clip, index) => ({
        ...clip,
        title: `Action clip ${String(index + 1).padStart(2, "0")}`,
        duration: clip.duration_seconds,
        start: clip.start_seconds,
        end: clip.end_seconds,
        timecode: `${formatTimecode(clip.start_seconds)} – ${formatTimecode(clip.end_seconds)}`,
        image: clip.thumbnail_url ? mediaUrl(clip.thumbnail_url) : "",
      })),
    [projectClips],
  );
  const [selectedId, setSelectedId] = useState(clips[0]?.id ?? null);
  const [notice, setNotice] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [clipTime, setClipTime] = useState(0);
  const videoRef = useRef(null);

  useEffect(() => {
    if (clips.length && !clips.some((clip) => clip.id === selectedId)) {
      setSelectedId(clips[0].id);
    }
  }, [clips, selectedId]);

  const selected = clips.find((clip) => clip.id === selectedId) ?? clips[0] ?? null;
  const kept = clips.filter((clip) => clip.kept);
  const totalDuration = kept.reduce((sum, clip) => sum + clip.duration, 0);
  const allDuration = clips.reduce((sum, clip) => sum + clip.duration, 0) || 1;

  const selectedIndex = selected ? clips.findIndex((clip) => clip.id === selected.id) : -1;
  const beforeSelected = selected
    ? clips.slice(0, selectedIndex).reduce((sum, clip) => sum + clip.duration, 0)
    : 0;
  const playhead = selected ? ((beforeSelected + selected.duration / 2) / allDuration) * 100 : 0;
  const elapsed = selected ? Math.min(selected.duration, Math.max(0, clipTime - selected.start)) : 0;
  const progress = selected?.duration ? (elapsed / selected.duration) * 100 : 0;
  const videoSource = project ? sourceUrl(project.id) : "";

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !selected) return;
    video.pause();
    video.currentTime = selected.start;
    setClipTime(selected.start);
    setPlaying(false);
  }, [selected?.id, selected?.start]);

  function togglePlayback() {
    const video = videoRef.current;
    if (!video || !selected) return;
    if (video.paused) {
      if (video.currentTime < selected.start || video.currentTime >= selected.end) {
        video.currentTime = selected.start;
      }
      video.play().catch(() => setPlaying(false));
    } else {
      video.pause();
    }
  }

  function handleTimeUpdate() {
    const video = videoRef.current;
    if (!video || !selected) return;
    setClipTime(video.currentTime);
    if (video.currentTime >= selected.end) {
      video.pause();
      video.currentTime = selected.end;
    }
  }

  function toggleMute() {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setMuted(video.muted);
  }

  function toggleFullscreen() {
    videoRef.current?.requestFullscreen?.();
  }

  async function handleMerge() {
    if (!kept.length || exporting) return;
    setNotice(null);
    try {
      const exported = await exportMerged();
      setNotice({
        type: "success",
        text: `Merged ${exported.clip_count} ${exported.clip_count === 1 ? "clip" : "clips"} (${formatDuration(exported.duration_seconds)}, ${formatSize(exported.size_bytes)}). Download started.`,
      });
    } catch (mergeError) {
      setNotice({ type: "error", text: mergeError.message });
    }
  }

  if (!selected) {
    return (
      <div className="relative flex min-h-[70vh] w-full flex-col items-center justify-center px-gutter py-space-2xl text-center">
        <span className="mb-space-md flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-container-low text-secondary shadow-xl">
          <Icon name="video_library" className="text-[32px]" />
        </span>
        <h1 className="text-headline-lg text-on-surface">{status === "processing" ? "Detection still running" : "No clips yet"}</h1>
        <p className="mt-space-sm max-w-md text-body-md text-on-surface-variant">
          {status === "processing"
            ? "The scan is still running. Open the processing view to follow progress."
            : "Upload a video and run detection to fill the results studio."}
        </p>
        <div className="mt-space-lg flex flex-col gap-space-sm sm:flex-row">
          <Link
            to={status === "processing" ? "/processing" : "/upload"}
            className="inline-flex items-center justify-center gap-space-xs rounded-xl bg-gradient-to-r from-primary-container to-secondary px-space-lg py-3 text-label-lg text-on-primary-container shadow-xl"
          >
            <Icon name={status === "processing" ? "radar" : "upload_file"} className="text-[18px]" />
            {status === "processing" ? "View processing" : "Upload video"}
          </Link>
          <Link
            to="/settings"
            className="inline-flex items-center justify-center gap-space-xs rounded-xl bg-surface-container-high px-space-lg py-3 text-label-lg text-on-surface shadow-md"
          >
            <Icon name="tune" className="text-[18px] text-secondary" />
            Open settings
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full overflow-hidden px-gutter py-space-lg md:px-gutter-lg lg:py-space-xl">
      <div className="pointer-events-none absolute -left-40 top-0 h-96 w-96 rounded-full bg-primary-container/20 blur-[130px]" />
      <div className="pointer-events-none absolute -right-40 top-1/3 h-96 w-96 rounded-full bg-secondary/15 blur-[130px]" />

      <div className="relative z-10 mx-auto flex w-full max-w-[1440px] flex-col gap-space-lg">
        <div className="flex flex-col justify-between gap-space-md md:flex-row md:items-end">
          <div className="flex flex-col gap-space-xs">
            <div className="flex flex-wrap items-center gap-space-xs">
              <span className="rounded-full bg-surface-container-high px-space-xs py-0.5 font-mono text-code-xs uppercase tracking-widest text-secondary">
                Results studio
              </span>
              <span className="font-mono text-code-xs text-on-surface-variant">•</span>
              <span className="flex items-center gap-1 font-mono text-code-xs text-on-surface-variant">
                <span className="h-1.5 w-1.5 rounded-full bg-secondary" />{clips.length} {clips.length === 1 ? "clip" : "clips"} detected
              </span>
            </div>
            <h1 className="text-headline-lg tracking-tight text-on-surface">Your Clips. Ready to Review.</h1>
            <p className="max-w-2xl text-body-md text-on-surface-variant">
              Keep the moments you want, reorder them, then merge one video for CapCut.
            </p>
          </div>
          <div className="flex items-center gap-space-sm">
            <Link
              to="/settings"
              className="inline-flex items-center gap-space-xs rounded-xl bg-surface-container-low px-space-md py-2 text-label-md text-on-surface-variant shadow-sm transition-colors hover:text-on-surface"
            >
              <Icon name="tune" className="text-[18px]" />
              Re-run settings
            </Link>
            <Link
              to="/upload"
              className="inline-flex items-center gap-space-xs rounded-xl bg-surface-container-high px-space-md py-2 text-label-md text-on-surface shadow-sm transition-colors hover:bg-surface-bright"
            >
              <Icon name="add" className="text-[18px]" />
              New video
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 items-start gap-space-md xl:grid-cols-12">
          {/* Clip list */}
          <aside className="flex flex-col gap-space-sm rounded-xl bg-surface-container-low/80 p-space-md shadow-xl backdrop-blur-md xl:col-span-3">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-space-xs text-label-lg text-on-surface">
                <Icon name="video_library" className="text-[18px] text-secondary" />
                Detected clips
              </h2>
              <span className="rounded bg-surface-container-high px-space-xs py-1 font-mono text-code-xs text-on-surface-variant">
                {kept.length}/{clips.length} kept
              </span>
            </div>

            <div className="no-scrollbar flex max-h-[560px] flex-col gap-space-xs overflow-y-auto pr-0.5">
              {clips.map((clip, index) => {
                const isSelected = clip.id === selected.id;
                return (
                  <div
                    key={clip.id}
                    className={`rounded-lg border transition-all ${
                      isSelected
                        ? "border-secondary/50 bg-surface-container-high shadow-md"
                        : "border-transparent bg-surface-container-lowest/60 hover:bg-surface-container"
                    } ${clip.kept ? "" : "opacity-50"}`}
                  >
                    <button type="button" onClick={() => setSelectedId(clip.id)} className="flex w-full items-center gap-space-sm p-space-sm text-left">
                      <span className="relative h-12 w-[74px] shrink-0 overflow-hidden rounded-md bg-surface-container-high">
                        {clip.image ? (
                          <img src={clip.image} alt="" className="h-full w-full object-cover" loading="lazy" />
                        ) : (
                          <span className="flex h-full w-full items-center justify-center text-on-surface-variant">
                            <Icon name="movie" className="text-[18px]" />
                          </span>
                        )}
                        <span className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest/70 to-transparent" />
                        <span className="absolute bottom-1 right-1 rounded bg-surface-container-lowest/80 px-1 font-mono text-[9px] text-on-surface">
                          {clip.duration.toFixed(1)}s
                        </span>
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-1">
                          <span className="font-mono text-[9px] text-secondary">{String(index + 1).padStart(2, "0")}</span>
                          <span className="truncate text-label-md text-on-surface">{clip.title}</span>
                        </span>
                        <span className="mt-0.5 flex items-center gap-1.5 font-mono text-[9px] text-on-surface-variant">
                          <span>{clip.timecode}</span>
                          <span>·</span>
                          <span className={clip.score >= 85 ? "text-secondary" : "text-primary"}>{clip.score} score</span>
                        </span>
                      </span>
                    </button>

                    {isSelected && (
                      <div className="flex items-center justify-between border-t border-outline-variant/20 px-space-sm py-1.5">
                        <button
                          type="button"
                          onClick={() => toggleKept(clip.id)}
                          className={`flex items-center gap-1 rounded px-1.5 py-0.5 font-mono text-[9px] transition-colors ${
                            clip.kept ? "text-secondary hover:bg-secondary/10" : "text-on-surface-variant hover:bg-surface-container-high"
                          }`}
                        >
                          <Icon name={clip.kept ? "visibility" : "visibility_off"} className="text-[14px]" />
                          {clip.kept ? "Kept" : "Removed"}
                        </button>
                        <div className="flex items-center gap-0.5">
                          <button
                            type="button"
                            onClick={() => moveClip(index, -1)}
                            disabled={index === 0}
                            className="rounded p-0.5 text-on-surface-variant transition-colors hover:bg-surface-container-highest hover:text-on-surface disabled:opacity-30"
                            title="Move up"
                            aria-label={`Move ${clip.title} up`}
                          >
                            <Icon name="arrow_upward" className="text-[14px]" />
                          </button>
                          <button
                            type="button"
                            onClick={() => moveClip(index, 1)}
                            disabled={index === clips.length - 1}
                            className="rounded p-0.5 text-on-surface-variant transition-colors hover:bg-surface-container-highest hover:text-on-surface disabled:opacity-30"
                            title="Move down"
                            aria-label={`Move ${clip.title} down`}
                          >
                            <Icon name="arrow_downward" className="text-[14px]" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </aside>

          {/* Player */}
          <div className="flex flex-col gap-space-md xl:col-span-6">
            <div className="overflow-hidden rounded-2xl bg-surface-container-low/80 p-space-sm shadow-xl backdrop-blur-md">
              <div className="group relative aspect-video overflow-hidden rounded-xl bg-surface-container-lowest">
                <video
                  ref={videoRef}
                  src={videoSource}
                  poster={selected.image}
                  className="h-full w-full object-cover"
                  playsInline
                  preload="metadata"
                  onClick={togglePlayback}
                  onTimeUpdate={handleTimeUpdate}
                  onPlay={() => setPlaying(true)}
                  onPause={() => setPlaying(false)}
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-surface-container-lowest/60 via-transparent to-surface-container-lowest/25" />

                <div className="absolute left-space-sm top-space-sm flex items-center gap-space-xs">
                  <span className="rounded bg-error-container/80 px-space-xs py-1 font-mono text-code-xs text-on-error-container">
                    CLIP {String(selectedIndex + 1).padStart(2, "0")}
                  </span>
                  <span className="rounded bg-surface-container-lowest/70 px-space-xs py-1 font-mono text-code-xs text-on-surface backdrop-blur-md">
                    {selected.timecode}
                  </span>
                </div>
                <div className="absolute right-space-sm top-space-sm flex items-center gap-1 rounded bg-surface-container-lowest/70 px-space-xs py-1 font-mono text-code-xs text-secondary backdrop-blur-md">
                  <Icon name="bolt" className="text-[14px]" />
                  Score {selected.score}
                </div>

                <button
                  type="button"
                  onClick={togglePlayback}
                  className={`absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-primary-container/85 text-on-primary-container shadow-[0_0_32px_rgba(124,58,237,0.6)] backdrop-blur-xl transition-all hover:scale-105 ${
                    playing ? "opacity-0 group-hover:opacity-80" : "opacity-100"
                  }`}
                  title={playing ? "Pause clip preview" : "Play clip preview"}
                  aria-label={playing ? "Pause clip preview" : "Play clip preview"}
                >
                  <Icon name={playing ? "pause" : "play_arrow"} className="text-[36px]" />
                </button>

                <div className="absolute inset-x-space-sm bottom-space-sm rounded-lg bg-surface-container-lowest/75 p-space-sm backdrop-blur-md">
                  <div className="relative mb-1.5 h-1 w-full rounded-full bg-outline-variant/40">
                    <div className="absolute left-0 top-0 h-1 rounded-full bg-secondary transition-[width]" style={{ width: `${progress}%` }} />
                    <span className="absolute top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full bg-secondary shadow-[0_0_8px_#4cd7f6]" style={{ left: `${progress}%` }} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-space-sm">
                      <button type="button" onClick={togglePlayback} className="text-on-surface" aria-label={playing ? "Pause clip" : "Play clip"}>
                        <Icon name={playing ? "pause" : "play_arrow"} className="text-[18px]" />
                      </button>
                      <button type="button" onClick={toggleMute} className="text-on-surface-variant hover:text-on-surface" aria-label={muted ? "Unmute video" : "Mute video"}>
                        <Icon name={muted ? "volume_off" : "volume_up"} className="text-[18px]" />
                      </button>
                      <span className="font-mono text-code-xs text-on-surface">
                        {formatTimecode(elapsed)} <span className="text-on-surface-variant">/ {selected.duration.toFixed(1)}s</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-space-sm">
                      <button type="button" onClick={toggleFullscreen} className="text-on-surface-variant hover:text-on-surface" aria-label="Open fullscreen video">
                        <Icon name="fullscreen" className="text-[18px]" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col justify-between gap-space-sm rounded-xl bg-surface-container-low/80 p-space-md shadow-md sm:flex-row sm:items-center">
              <div>
                <span className="font-mono text-code-xs uppercase tracking-wider text-secondary">
                  Clip {String(selectedIndex + 1).padStart(2, "0")}
                </span>
                <h2 className="text-headline-md text-on-surface">{selected.title}</h2>
                <p className="text-body-sm text-on-surface-variant">
                  {selected.duration.toFixed(1)}s clip · {selected.score} detection score · minimum length satisfied
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-space-xs">
                {settings.motion && (
                  <span className="flex items-center gap-1 rounded bg-secondary/10 px-space-xs py-1 font-mono text-code-xs text-secondary">
                    <Icon name="motion_photos_on" className="text-[14px]" />
                    Motion
                  </span>
                )}
                {settings.sound && (
                  <span className="flex items-center gap-1 rounded bg-primary-container/20 px-space-xs py-1 font-mono text-code-xs text-primary">
                    <Icon name="graphic_eq" className="text-[14px]" />
                    Sound
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => toggleKept(selected.id)}
                  className={`flex items-center gap-1 rounded px-space-xs py-1 font-mono text-code-xs transition-colors ${
                    selected.kept
                      ? "bg-secondary/10 text-secondary hover:bg-secondary/20"
                      : "bg-surface-container-high text-on-surface-variant hover:text-on-surface"
                  }`}
                >
                  <Icon name={selected.kept ? "visibility" : "visibility_off"} className="text-[14px]" />
                  {selected.kept ? "Keep clip" : "Restore clip"}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-space-xs">
              {[
                { label: "Detection score", value: selected.score, icon: "bolt" },
                { label: "Candidate length", value: `${selected.duration.toFixed(1)}s`, icon: "timer" },
                { label: "Status", value: selected.kept ? "Kept" : "Removed", icon: "check_circle" },
              ].map((stat) => (
                <div key={stat.label} className="rounded-lg bg-surface-container-low/60 p-space-sm text-center">
                  <Icon name={stat.icon} className="mb-0.5 text-[16px] text-secondary" />
                  <span className="block font-mono text-label-lg text-on-surface">{stat.value}</span>
                  <span className="block font-mono text-[9px] uppercase tracking-wider text-on-surface-variant">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Export */}
          <aside className="flex flex-col gap-space-md xl:col-span-3 xl:sticky xl:top-24">
            <div className="flex flex-col gap-space-md rounded-xl bg-surface-container-low/85 p-space-md shadow-xl backdrop-blur-xl">
              <div className="flex items-center justify-between border-b border-outline-variant/20 pb-space-sm">
                <h2 className="text-headline-md text-on-surface">Export video</h2>
                <Icon name="ios_share" className="text-[20px] text-secondary" />
              </div>

              <div className="flex flex-col gap-space-xs rounded-lg bg-surface-container-lowest/70 p-space-sm">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-code-xs uppercase tracking-wider text-on-surface-variant">Merged output</span>
                  <span className="rounded bg-secondary/10 px-space-xs py-0.5 font-mono text-[9px] text-secondary">
                    {kept.length} clips
                  </span>
                </div>
                <div className="flex h-12 w-full items-center gap-0.5 overflow-hidden rounded bg-surface-container-high p-1">
                  {clips.map((clip, index) => (
                    <span
                      key={clip.id}
                      className={`h-full rounded-sm ${
                        clip.kept ? segmentStyles[index % segmentStyles.length].split(" ")[0] : "bg-outline-variant/30"
                      }`}
                      style={{ width: `${(clip.duration / allDuration) * 100}%` }}
                    />
                  ))}
                </div>
                <div className="flex items-center justify-between font-mono text-code-xs">
                  <span className="text-on-surface">{formatDuration(totalDuration)} total</span>
                  <span className="text-on-surface-variant">MP4</span>
                </div>
              </div>

              <div className="space-y-space-xs">
                {[
                  ["Format", "MP4 · H.264"],
                  ["Video", "CRF 22"],
                  ["Audio", "AAC · 128 kbps"],
                  ["Clip count", `${kept.length} of ${clips.length}`],
                ].map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between text-body-sm">
                    <span className="text-on-surface-variant">{label}</span>
                    <span className="font-mono text-code-xs text-on-surface">{value}</span>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={handleMerge}
                disabled={!kept.length || exporting}
                className="flex w-full items-center justify-center gap-space-xs rounded-xl bg-gradient-to-r from-primary-container via-inverse-primary to-secondary py-3 text-label-lg font-bold text-on-primary-container shadow-[0_0_24px_rgba(124,58,237,0.45)] transition-all hover:shadow-[0_0_32px_rgba(76,215,246,0.55)] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Icon name={exporting ? "progress_activity" : "merge"} className={`text-[18px] ${exporting ? "animate-spin" : ""}`} />
                {exporting ? "Preparing merge..." : "Merge & download"}
              </button>

              {notice && (
                <div
                  role={notice.type === "error" ? "alert" : "status"}
                  className={`flex items-start gap-space-xs rounded-lg border p-space-sm text-body-sm text-on-surface-variant ${
                    notice.type === "error" ? "border-error/25 bg-error-container/25" : "border-secondary/25 bg-secondary/10"
                  }`}
                >
                  <Icon name={notice.type === "error" ? "error" : "info"} className={`mt-0.5 shrink-0 text-[16px] ${notice.type === "error" ? "text-error" : "text-secondary"}`} />
                  <span>{notice.text}</span>
                  <button type="button" onClick={() => setNotice(null)} className="ml-auto shrink-0 text-on-surface-variant hover:text-on-surface" aria-label="Dismiss message">
                    <Icon name="close" className="text-[14px]" />
                  </button>
                </div>
              )}

              {exportInfo && !notice && (
                <p className="rounded-lg bg-surface-container-lowest/70 p-space-sm font-mono text-[9px] text-on-surface-variant">
                  Last export: {exportInfo.clip_count} {exportInfo.clip_count === 1 ? "clip" : "clips"} · {formatSize(exportInfo.size_bytes)} · expires in 24h
                </p>
              )}

              <p className="text-center font-mono text-[9px] text-on-surface-variant">
                {kept.length ? `${formatDuration(totalDuration)} selected · stays on this device` : "Keep at least one clip to export"}
              </p>
            </div>

            <div className="rounded-xl bg-surface-container-low/60 p-space-md shadow-sm backdrop-blur-md">
              <h3 className="mb-space-xs flex items-center gap-space-xs text-label-lg text-on-surface">
                <Icon name="movie_edit" className="text-[18px] text-primary" />
                Edit in CapCut
              </h3>
              <p className="text-body-sm text-on-surface-variant">
                Download the merged video, then import it into CapCut for captions, music, and final edits.
              </p>
            </div>

            <div className="rounded-xl bg-surface-container-low/60 p-space-md shadow-sm backdrop-blur-md">
              <h3 className="mb-space-xs flex items-center gap-space-xs text-label-lg text-on-surface">
                <Icon name="timer_off" className="text-[18px] text-secondary" />
                24-hour cleanup
              </h3>
              <p className="text-body-sm text-on-surface-variant">
                Original uploads and rendered outputs are deleted automatically after 24 hours.
              </p>
            </div>
          </aside>
        </div>

        {/* Timeline */}
        <div className="rounded-xl bg-surface-container-low/80 p-space-md shadow-xl backdrop-blur-md md:p-space-lg">
          <div className="mb-space-md flex flex-col justify-between gap-space-sm sm:flex-row sm:items-center">
            <div>
              <h2 className="flex items-center gap-space-xs text-headline-md text-on-surface">
                <Icon name="view_timeline" className="text-[22px] text-secondary" />
                Merge timeline
              </h2>
              <p className="text-body-sm text-on-surface-variant">Click a segment to preview it. Removed clips appear faded.</p>
            </div>
            <div className="flex items-center gap-space-md font-mono text-code-xs text-on-surface-variant">
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-sm bg-secondary-container" /> Kept
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-sm bg-outline-variant/40" /> Removed
              </span>
              <span className="text-on-surface">{formatDuration(totalDuration)}</span>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-lg bg-surface-container-lowest/80 p-space-sm">
            <div className="mb-1 flex justify-between font-mono text-[9px] text-on-surface-variant">
              <span>00:00</span>
              <span>{formatDuration(allDuration / 3)}</span>
              <span>{formatDuration((allDuration * 2) / 3)}</span>
              <span>{formatDuration(allDuration)}</span>
            </div>
            <div className="relative flex h-20 w-full gap-0.5">
              {clips.map((clip, index) => (
                <button
                  key={clip.id}
                  type="button"
                  onClick={() => setSelectedId(clip.id)}
                  style={{ width: `${(clip.duration / allDuration) * 100}%` }}
                  className={`relative flex flex-col justify-between overflow-hidden rounded-sm p-1 text-left transition-all ${
                    clip.kept ? segmentStyles[index % segmentStyles.length] : "bg-outline-variant/25 text-on-surface-variant"
                  } ${selected.id === clip.id ? "ring-2 ring-secondary ring-offset-1 ring-offset-surface-container-lowest" : "opacity-90 hover:opacity-100"}`}
                >
                  <span className="font-mono text-[8px] font-bold leading-none">C{String(index + 1).padStart(2, "0")}</span>
                  <span className="truncate font-mono text-[8px] leading-none opacity-80">{clip.duration.toFixed(1)}s</span>
                  {!clip.kept && (
                    <span className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_5px,rgb(var(--outline-variant)/0.25)_5px,rgb(var(--outline-variant)/0.25)_10px)]" />
                  )}
                </button>
              ))}
              <div
                className="pointer-events-none absolute top-0 z-10 flex h-full w-0.5 flex-col items-center bg-secondary shadow-[0_0_10px_#4cd7f6]"
                style={{ left: `${playhead}%` }}
              >
                <span className="-mt-1 h-2.5 w-2.5 rounded-full bg-secondary shadow" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
