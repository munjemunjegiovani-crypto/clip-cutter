import json
import shutil
import subprocess
from pathlib import Path


class InvalidMedia(ValueError):
    pass


class MediaToolUnavailable(RuntimeError):
    pass


def probe_duration_seconds(path):
    ffprobe = shutil.which("ffprobe")
    if not ffprobe:
        raise MediaToolUnavailable("ffprobe is not installed.")

    command = [
        ffprobe,
        "-v",
        "error",
        "-select_streams",
        "v:0",
        "-show_entries",
        "format=duration:stream=codec_type",
        "-of",
        "json",
        str(Path(path)),
    ]

    try:
        result = subprocess.run(command, capture_output=True, text=True, timeout=30, check=False)
    except subprocess.TimeoutExpired as exc:
        raise InvalidMedia("Reading the video metadata timed out.") from exc

    if result.returncode != 0:
        raise InvalidMedia("The file is not a readable video.")

    try:
        metadata = json.loads(result.stdout)
        duration = float(metadata["format"]["duration"])
        has_video = any(stream.get("codec_type") == "video" for stream in metadata.get("streams", []))
    except (KeyError, TypeError, ValueError, json.JSONDecodeError) as exc:
        raise InvalidMedia("The file has no readable video track.") from exc

    if not has_video or duration <= 0:
        raise InvalidMedia("The file has no readable video track.")

    return duration


def has_audio_stream(path):
    ffprobe = shutil.which("ffprobe")
    if not ffprobe:
        raise MediaToolUnavailable("ffprobe is not installed.")

    command = [
        ffprobe,
        "-v",
        "error",
        "-select_streams",
        "a:0",
        "-show_entries",
        "stream=codec_type",
        "-of",
        "json",
        str(Path(path)),
    ]

    try:
        result = subprocess.run(command, capture_output=True, text=True, timeout=30, check=False)
    except subprocess.TimeoutExpired as exc:
        raise InvalidMedia("Reading the audio metadata timed out.") from exc

    if result.returncode != 0:
        raise InvalidMedia("The file audio could not be read.")

    try:
        metadata = json.loads(result.stdout)
    except json.JSONDecodeError as exc:
        raise InvalidMedia("The file audio could not be read.") from exc

    return any(stream.get("codec_type") == "audio" for stream in metadata.get("streams", []))
