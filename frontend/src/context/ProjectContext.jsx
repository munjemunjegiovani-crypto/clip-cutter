import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import clip1 from "../assets/images/clip-1.jpg";
import clip2 from "../assets/images/clip-2.jpg";
import clip3 from "../assets/images/clip-3.jpg";
import clip4 from "../assets/images/clip-4.jpg";
import clip5 from "../assets/images/clip-5.jpg";
import clip6 from "../assets/images/clip-6.jpg";
import clip7 from "../assets/images/clip-7.jpg";

const STORAGE_KEY = "clipcutter-project-v1";

export const DEFAULT_SETTINGS = {
  motion: true,
  sound: true,
  sensitivity: 6,
  minLength: 8,
  maxClips: 10,
  target: "all",
};

const clipPool = [
  { title: "Kickflip Down Stairs", duration: 8.1, timecode: "00:14.200", score: 92, image: clip1 },
  { title: "Drop-In Send", duration: 9.2, timecode: "01:22.140", score: 88, image: clip2 },
  { title: "Wall Ride Grind", duration: 7.5, timecode: "02:45.120", score: 85, image: clip3 },
  { title: "Big Air Transfer", duration: 11.4, timecode: "03:12.600", score: 81, image: clip4 },
  { title: "Bowl Carve Line", duration: 6.8, timecode: "04:08.300", score: 78, image: clip5 },
  { title: "Last Trick Attempt", duration: 8.9, timecode: "05:31.900", score: 74, image: clip6 },
  { title: "Crowd Reaction", duration: 6.2, timecode: "06:47.250", score: 70, image: clip7 },
];

function buildClips(settings) {
  const limit = Math.max(1, Math.min(settings.maxClips, clipPool.length));
  const targetLength = settings.target === "all" ? Infinity : Number(settings.target);
  let total = 0;

  return clipPool.slice(0, limit).map((clip, index) => {
    const duration = Math.max(settings.minLength, clip.duration);
    const kept = targetLength === Infinity || total + duration <= targetLength || index === 0;
    if (kept) total += duration;
    return {
      id: `clip-${index + 1}`,
      title: clip.title,
      duration: Number(duration.toFixed(1)),
      timecode: clip.timecode,
      score: clip.score,
      image: clip.image,
      kept,
    };
  });
}

export const DEMO_CLIPS = buildClips({ ...DEFAULT_SETTINGS, minLength: 5 });

function loadProject() {
  try {
    const saved = JSON.parse(sessionStorage.getItem(STORAGE_KEY));
    if (!saved) {
      return { source: null, settings: DEFAULT_SETTINGS, clips: DEMO_CLIPS, status: "demo" };
    }
    return {
      source: saved.source ?? null,
      settings: { ...DEFAULT_SETTINGS, ...saved.settings },
      clips: Array.isArray(saved.clips) ? saved.clips : DEMO_CLIPS,
      status: saved.status ?? "idle",
    };
  } catch {
    return { source: null, settings: DEFAULT_SETTINGS, clips: DEMO_CLIPS, status: "demo" };
  }
}

const ProjectContext = createContext(null);

export function ProjectProvider({ children }) {
  const [initial] = useState(loadProject);
  const [source, setSource] = useState(initial.source);
  const [settings, setSettings] = useState(initial.settings);
  const [clips, setClips] = useState(initial.clips);
  const [status, setStatus] = useState(initial.status);

  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ source, settings, clips, status }));
    } catch {
      return;
    }
  }, [source, settings, clips, status]);

  const startNewProject = useCallback((fileMeta) => {
    setSource(fileMeta);
    setClips([]);
    setStatus("idle");
  }, []);

  const clearSource = useCallback(() => {
    setSource(null);
    setClips([]);
    setStatus("idle");
  }, []);

  const updateSettings = useCallback((patch) => {
    setSettings((current) => ({ ...current, ...patch }));
  }, []);

  const startDetection = useCallback(() => {
    setClips(buildClips(settings));
    setStatus("processing");
  }, [settings]);

  const completeProcessing = useCallback(() => {
    setStatus("complete");
  }, []);

  const toggleKept = useCallback((id) => {
    setClips((current) => current.map((clip) => (clip.id === id ? { ...clip, kept: !clip.kept } : clip)));
  }, []);

  const moveClip = useCallback((index, direction) => {
    setClips((current) => {
      const target = index + direction;
      if (target < 0 || target >= current.length) return current;
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({
      source,
      settings,
      clips,
      status,
      startNewProject,
      clearSource,
      updateSettings,
      startDetection,
      completeProcessing,
      toggleKept,
      moveClip,
    }),
    [
      source,
      settings,
      clips,
      status,
      startNewProject,
      clearSource,
      updateSettings,
      startDetection,
      completeProcessing,
      toggleKept,
      moveClip,
    ],
  );

  return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>;
}

export function useProject() {
  const context = useContext(ProjectContext);
  if (!context) throw new Error("useProject must be used inside ProjectProvider");
  return context;
}
