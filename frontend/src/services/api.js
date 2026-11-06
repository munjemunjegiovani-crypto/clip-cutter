const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/+$/, "");

export class ApiError extends Error {
  constructor(message, status = 0) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function request(path, options = {}) {
  let response;
  try {
    response = await fetch(`${API_URL}${path}`, options);
  } catch {
    throw new ApiError("Cannot reach the ClipCutter API. Is the backend running?");
  }

  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json") ? await response.json().catch(() => null) : null;

  if (!response.ok) {
    throw new ApiError(data?.error || `Request failed with status ${response.status}.`, response.status);
  }

  return data;
}

function jsonOptions(method, body) {
  return {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  };
}

export function mediaUrl(path) {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  return `${API_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export function sourceUrl(projectId) {
  return `${API_URL}/api/projects/${projectId}/source`;
}

export function uploadProject(file) {
  const form = new FormData();
  form.append("video", file);
  form.append("permission", "true");
  return request("/api/projects", { method: "POST", body: form });
}

export function getProjects() {
  return request("/api/projects");
}

export function getProjectClips(projectId) {
  return request(`/api/projects/${projectId}/clips`);
}

export function detectProject(projectId, settings) {
  const payload = {
    motion: settings.motion,
    sound: settings.sound,
    sensitivity: settings.sensitivity,
    minLength: settings.minLength,
    maxClips: settings.maxClips,
    target: settings.target,
  };
  return request(`/api/projects/${projectId}/detect`, jsonOptions("POST", payload));
}

export function setClipKept(projectId, clipId, kept) {
  return request(
    `/api/projects/${projectId}/clips/${clipId}`,
    jsonOptions("PATCH", { kept }),
  );
}

export function reorderClips(projectId, clipIds) {
  return request(
    `/api/projects/${projectId}/clips/order`,
    jsonOptions("PUT", { clip_ids: clipIds }),
  );
}

export function createExport(projectId) {
  return request(`/api/projects/${projectId}/export`, { method: "POST" });
}

export function triggerDownload(path) {
  const link = document.createElement("a");
  link.href = mediaUrl(path);
  link.rel = "noopener";
  document.body.append(link);
  link.click();
  link.remove();
}
