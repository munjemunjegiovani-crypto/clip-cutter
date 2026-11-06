import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  ApiError,
  createExport,
  detectProject,
  getProjectClips,
  reorderClips,
  setClipKept,
  triggerDownload,
  uploadProject,
} from "../services/api";

const STORAGE_KEY = "clipcutter-session-v2";

const DEFAULT_SETTINGS = {
  motion: true,
  sound: true,
  sensitivity: 6,
  minLength: 8,
  maxClips: 10,
  target: "all",
};

function sourceFromProject(project) {
  return {
    name: project.original_name,
    size: project.size_bytes,
    duration: project.duration_seconds,
  };
}

function loadSession() {
  try {
    const saved = JSON.parse(sessionStorage.getItem(STORAGE_KEY));
    if (!saved) {
      return { project: null, settings: DEFAULT_SETTINGS, clips: [], status: "idle", exportInfo: null };
    }
    const project = saved.project ?? null;
    return {
      project,
      settings: { ...DEFAULT_SETTINGS, ...saved.settings },
      clips: Array.isArray(saved.clips) ? saved.clips : [],
      status: project ? saved.status ?? project.status : "idle",
      exportInfo: saved.exportInfo ?? null,
    };
  } catch {
    return { project: null, settings: DEFAULT_SETTINGS, clips: [], status: "idle", exportInfo: null };
  }
}

const ProjectContext = createContext(null);

export function ProjectProvider({ children }) {
  const [initial] = useState(loadSession);
  const [project, setProject] = useState(initial.project);
  const [source, setSource] = useState(initial.project ? sourceFromProject(initial.project) : null);
  const [pendingFile, setPendingFile] = useState(null);
  const [settings, setSettings] = useState(initial.settings);
  const [clips, setClips] = useState(initial.clips);
  const [status, setStatus] = useState(initial.status);
  const [exportInfo, setExportInfo] = useState(initial.exportInfo);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    try {
      sessionStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ project, settings, clips, status, exportInfo }),
      );
    } catch {
      return;
    }
  }, [project, settings, clips, status, exportInfo]);

  useEffect(() => {
    if (!initial.project?.id) return undefined;

    let cancelled = false;
    async function syncProject() {
      try {
        const data = await getProjectClips(initial.project.id);
        if (cancelled) return;
        setProject(data.project);
        setSource(sourceFromProject(data.project));
        setClips(data.clips);
        setStatus(data.project.status);
      } catch (syncError) {
        if (cancelled) return;
        if (syncError.status === 404) {
          setProject(null);
          setSource(null);
          setClips([]);
          setStatus("idle");
          setExportInfo(null);
        } else {
          setError(syncError.message);
        }
      }
    }

    syncProject();
    return () => {
      cancelled = true;
    };
  }, [initial.project?.id]);

  useEffect(() => {
    if (status !== "processing" || !project?.id) return undefined;

    const timer = window.setInterval(async () => {
      try {
        const data = await getProjectClips(project.id);
        if (data.project.status === "complete") {
          setProject(data.project);
          setClips(data.clips);
          setStatus("complete");
          setError("");
        } else if (data.project.status === "failed") {
          setStatus("failed");
          setError("Detection failed. Check the video and try again.");
        }
      } catch (pollError) {
        if (pollError.status === 404) {
          setStatus("failed");
          setError("This project is no longer available.");
        }
      }
    }, 2500);

    return () => window.clearInterval(timer);
  }, [status, project?.id]);

  const chooseFile = useCallback((file) => {
    setPendingFile(file);
    setSource({ name: file.name, size: file.size, type: file.type });
    setProject(null);
    setClips([]);
    setStatus("idle");
    setExportInfo(null);
    setError("");
  }, []);

  const clearSource = useCallback(() => {
    setPendingFile(null);
    setSource(null);
    setProject(null);
    setClips([]);
    setStatus("idle");
    setExportInfo(null);
    setError("");
  }, []);

  const openProject = useCallback(async (projectId) => {
    setError("");
    const data = await getProjectClips(projectId);
    setPendingFile(null);
    setProject(data.project);
    setSource(sourceFromProject(data.project));
    setClips(data.clips);
    setStatus(data.project.status);
    setExportInfo(null);
    return data;
  }, []);

  const uploadSelectedFile = useCallback(async () => {
    if (!pendingFile) {
      throw new ApiError("Choose a video file before uploading.");
    }

    setStatus("uploading");
    setError("");
    try {
      const uploaded = await uploadProject(pendingFile);
      setProject(uploaded);
      setSource(sourceFromProject(uploaded));
      setPendingFile(null);
      setClips([]);
      setExportInfo(null);
      setStatus("uploaded");
      return uploaded;
    } catch (uploadError) {
      setStatus("idle");
      setError(uploadError.message);
      throw uploadError;
    }
  }, [pendingFile]);

  const updateSettings = useCallback((patch) => {
    setSettings((current) => ({ ...current, ...patch }));
  }, []);

  const startDetection = useCallback(async () => {
    if (!project || status === "processing" || status === "uploading") return null;

    setStatus("processing");
    setError("");
    setExportInfo(null);
    try {
      const data = await detectProject(project.id, settings);
      setProject(data.project);
      setClips(data.clips);
      setStatus("complete");
      return data;
    } catch (detectError) {
      setStatus("failed");
      setError(detectError.message);
      return null;
    }
  }, [project, settings, status]);

  const toggleKept = useCallback(
    async (id) => {
      const current = clips.find((clip) => clip.id === id);
      if (!current || !project) return;

      const kept = !current.kept;
      setClips((items) => items.map((clip) => (clip.id === id ? { ...clip, kept } : clip)));
      try {
        const data = await setClipKept(project.id, id, kept);
        setClips((items) => items.map((clip) => (clip.id === id ? data.clip : clip)));
      } catch (toggleError) {
        setClips((items) =>
          items.map((clip) => (clip.id === id ? { ...clip, kept: current.kept } : clip)),
        );
        setError(toggleError.message);
      }
    },
    [clips, project],
  );

  const moveClip = useCallback(
    async (index, direction) => {
      if (!project) return;
      const target = index + direction;
      if (target < 0 || target >= clips.length) return;

      const previous = clips;
      const next = [...clips];
      [next[index], next[target]] = [next[target], next[index]];
      setClips(next);
      try {
        const data = await reorderClips(project.id, next.map((clip) => clip.id));
        setClips(data.clips);
      } catch (reorderError) {
        setClips(previous);
        setError(reorderError.message);
      }
    },
    [clips, project],
  );

  const exportMerged = useCallback(async () => {
    if (!project) throw new ApiError("Upload a video before exporting.");

    setExporting(true);
    setError("");
    try {
      const data = await createExport(project.id);
      setExportInfo(data.export);
      triggerDownload(data.export.download_url);
      return data.export;
    } catch (exportError) {
      setError(exportError.message);
      throw exportError;
    } finally {
      setExporting(false);
    }
  }, [project]);

  const value = useMemo(
    () => ({
      project,
      source,
      pendingFile,
      settings,
      clips,
      status,
      exportInfo,
      exporting,
      error,
      chooseFile,
      clearSource,
      openProject,
      uploadSelectedFile,
      updateSettings,
      startDetection,
      toggleKept,
      moveClip,
      exportMerged,
    }),
    [
      project,
      source,
      pendingFile,
      settings,
      clips,
      status,
      exportInfo,
      exporting,
      error,
      chooseFile,
      clearSource,
      openProject,
      uploadSelectedFile,
      updateSettings,
      startDetection,
      toggleKept,
      moveClip,
      exportMerged,
    ],
  );

  return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>;
}

export function useProject() {
  const context = useContext(ProjectContext);
  if (!context) throw new Error("useProject must be used inside ProjectProvider");
  return context;
}
