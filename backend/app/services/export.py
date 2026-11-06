import shutil
import subprocess

EXPORT_TIMEOUT_SECONDS = 1800


class ExportError(RuntimeError):
    pass


def _timestamp(value):
    return f"{value:.3f}"


def build_merged_video(source_path, clips, output_path, has_audio):
    ffmpeg = shutil.which("ffmpeg")
    if not ffmpeg:
        raise ExportError("ffmpeg is not installed.")

    filters = []
    for index, clip in enumerate(clips):
        start = _timestamp(clip.start_seconds)
        end = _timestamp(clip.end_seconds)
        filters.append(
            f"[0:v]trim=start={start}:end={end},setpts=PTS-STARTPTS[v{index}]"
        )
        if has_audio:
            filters.append(
                f"[0:a]atrim=start={start}:end={end},asetpts=PTS-STARTPTS[a{index}]"
            )

    inputs = "".join(
        f"[v{index}][a{index}]" if has_audio else f"[v{index}]"
        for index in range(len(clips))
    )
    outputs = "[vout][aout]" if has_audio else "[vout]"
    filters.append(f"{inputs}concat=n={len(clips)}:v=1:a={1 if has_audio else 0}{outputs}")

    command = [
        ffmpeg,
        "-y",
        "-v",
        "error",
        "-i",
        str(source_path),
        "-filter_complex",
        ";".join(filters),
        "-map",
        "[vout]",
    ]
    if has_audio:
        command.extend(["-map", "[aout]", "-c:a", "aac", "-b:a", "128k"])
    command.extend(
        [
            "-c:v",
            "libx264",
            "-preset",
            "veryfast",
            "-crf",
            "22",
            "-pix_fmt",
            "yuv420p",
            "-movflags",
            "+faststart",
            str(output_path),
        ]
    )

    try:
        result = subprocess.run(
            command,
            capture_output=True,
            text=True,
            timeout=EXPORT_TIMEOUT_SECONDS,
            check=False,
        )
    except subprocess.TimeoutExpired as exc:
        output_path.unlink(missing_ok=True)
        raise ExportError("Video export timed out.") from exc

    if result.returncode != 0:
        output_path.unlink(missing_ok=True)
        raise ExportError(result.stderr.strip() or "FFmpeg could not render the merged video.")
