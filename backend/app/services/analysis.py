import math
import shutil
import subprocess

import cv2
import numpy as np


class AnalysisError(RuntimeError):
    pass


MOTION_SAMPLE_FPS = 2
AUDIO_SAMPLE_RATE = 8000
SMOOTHING_WINDOW = 3


def _smooth(values):
    if len(values) < SMOOTHING_WINDOW:
        return values.astype(np.float32)
    padded = np.pad(values, (SMOOTHING_WINDOW // 2, SMOOTHING_WINDOW // 2), mode="edge")
    kernel = np.ones(SMOOTHING_WINDOW, dtype=np.float32) / SMOOTHING_WINDOW
    return np.convolve(padded, kernel, mode="valid").astype(np.float32)


def _normalize(values):
    peak = float(np.percentile(values, 95)) if len(values) else 0.0
    if peak <= 0:
        peak = float(values.max()) if len(values) else 0.0
    if peak <= 0:
        return np.zeros_like(values, dtype=np.float32)
    return np.clip(values / peak, 0.0, 1.0).astype(np.float32)


def _motion_curve(path, duration):
    capture = cv2.VideoCapture(str(path))
    if not capture.isOpened():
        raise AnalysisError("OpenCV could not open the video.")

    fps = capture.get(cv2.CAP_PROP_FPS)
    if not math.isfinite(fps) or fps <= 0:
        fps = 30.0
    step = max(1, round(fps / MOTION_SAMPLE_FPS))
    total_seconds = max(1, math.ceil(duration))
    totals = np.zeros(total_seconds, dtype=np.float64)
    counts = np.zeros(total_seconds, dtype=np.int64)
    previous = None
    frame_index = 0

    try:
        while True:
            if not capture.grab():
                break
            if frame_index % step == 0:
                ok, frame = capture.retrieve()
                if not ok:
                    break
                gray = cv2.cvtColor(cv2.resize(frame, (160, 90)), cv2.COLOR_BGR2GRAY)
                if previous is not None:
                    second = min(total_seconds - 1, int(frame_index / fps))
                    totals[second] += float(cv2.absdiff(gray, previous).mean())
                    counts[second] += 1
                previous = gray
            frame_index += 1
    finally:
        capture.release()

    counts[counts == 0] = 1
    return _smooth((totals / counts).astype(np.float32))


def _audio_curve(path, duration):
    total_seconds = max(1, math.ceil(duration))
    ffmpeg = shutil.which("ffmpeg")
    if not ffmpeg:
        raise AnalysisError("ffmpeg is not installed.")

    command = [
        ffmpeg,
        "-v",
        "error",
        "-i",
        str(path),
        "-vn",
        "-ac",
        "1",
        "-ar",
        str(AUDIO_SAMPLE_RATE),
        "-f",
        "s16le",
        "-",
    ]

    try:
        result = subprocess.run(command, capture_output=True, timeout=180, check=False)
    except subprocess.TimeoutExpired as exc:
        raise AnalysisError("Audio decoding timed out.") from exc

    if result.returncode != 0 or not result.stdout:
        return np.zeros(total_seconds, dtype=np.float32)

    samples = np.frombuffer(result.stdout, dtype=np.int16).astype(np.float32) / 32768.0
    needed = total_seconds * AUDIO_SAMPLE_RATE
    if samples.size < needed:
        samples = np.pad(samples, (0, needed - samples.size))
    else:
        samples = samples[:needed]

    frames = samples.reshape(total_seconds, AUDIO_SAMPLE_RATE)
    rms = np.sqrt(np.mean(frames * frames, axis=1))
    return _smooth(rms.astype(np.float32))


def _candidate_peaks(scores, threshold):
    groups = []
    start = None

    for index, value in enumerate(scores):
        if value >= threshold and start is None:
            start = index
        elif value < threshold and start is not None:
            groups.append((start, index - 1))
            start = None
    if start is not None:
        groups.append((start, len(scores) - 1))

    peaks = []
    for start, end in groups:
        local = scores[start : end + 1]
        peak_index = start + int(np.argmax(local))
        peaks.append((peak_index, float(scores[peak_index])))

    return sorted(peaks, key=lambda item: item[1], reverse=True)


def detect_clips(path, duration_seconds, settings):
    motion_curve = (
        _normalize(_motion_curve(path, duration_seconds)) if settings["motion"] else None
    )
    sound_curve = (
        _normalize(_audio_curve(path, duration_seconds)) if settings["sound"] else None
    )

    if motion_curve is not None and sound_curve is not None:
        has_motion = bool(np.any(motion_curve > 0))
        has_sound = bool(np.any(sound_curve > 0))
        if has_motion and has_sound:
            scores = (motion_curve * 0.55) + (sound_curve * 0.45)
        else:
            scores = motion_curve if has_motion else sound_curve
    else:
        scores = motion_curve if motion_curve is not None else sound_curve

    if scores is None:
        return []

    threshold = max(0.2, 0.95 - (settings["sensitivity"] - 1) * 0.07)
    peaks = _candidate_peaks(scores, threshold)
    clip_length = min(float(settings["min_length"]), duration_seconds)
    target = settings["target_seconds"]
    selected = []
    total_duration = 0.0

    for peak_second, score in peaks:
        if len(selected) >= settings["max_clips"]:
            break

        max_start = max(0.0, duration_seconds - clip_length)
        start = min(max(0.0, peak_second + 0.5 - (clip_length / 2)), max_start)
        end = min(duration_seconds, start + clip_length)

        if end - start <= 0:
            continue
        if any(start < clip["end_seconds"] and end > clip["start_seconds"] for clip in selected):
            continue
        if target is not None and selected and total_duration + (end - start) > target:
            continue

        selected.append(
            {
                "start_seconds": round(start, 2),
                "end_seconds": round(end, 2),
                "duration_seconds": round(end - start, 2),
                "score": round(min(score, 1.0) * 100, 1),
            }
        )
        total_duration += end - start

    selected.sort(key=lambda clip: clip["start_seconds"])
    return selected
