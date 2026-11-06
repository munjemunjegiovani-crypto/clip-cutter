import shutil
import subprocess
from pathlib import Path

THUMBNAIL_TIMEOUT_SECONDS = 60


class ThumbnailError(RuntimeError):
    pass


def generate_clip_thumbnail(source_path, seconds, output_path):
    ffmpeg = shutil.which("ffmpeg")
    if not ffmpeg:
        raise ThumbnailError("ffmpeg is not installed.")

    command = [
        ffmpeg,
        "-y",
        "-v",
        "error",
        "-ss",
        f"{max(0.0, seconds):.3f}",
        "-i",
        str(source_path),
        "-frames:v",
        "1",
        "-vf",
        "scale=640:-2",
        "-q:v",
        "3",
        "-an",
        "-sn",
        str(output_path),
    ]

    try:
        result = subprocess.run(
            command,
            capture_output=True,
            text=True,
            timeout=THUMBNAIL_TIMEOUT_SECONDS,
            check=False,
        )
    except subprocess.TimeoutExpired as exc:
        output_path.unlink(missing_ok=True)
        raise ThumbnailError("Thumbnail generation timed out.") from exc

    if result.returncode != 0 or not output_path.exists() or output_path.stat().st_size == 0:
        output_path.unlink(missing_ok=True)
        raise ThumbnailError(result.stderr.strip() or "FFmpeg could not generate a thumbnail.")
