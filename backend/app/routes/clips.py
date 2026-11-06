from datetime import datetime, timedelta, timezone
from pathlib import Path
from uuid import uuid4

from flask import Blueprint, current_app, jsonify, request, send_file, url_for
from werkzeug.utils import secure_filename

from ..extensions import db
from ..models import Clip, Export, Project
from ..services.analysis import AnalysisError, detect_clips
from ..services.export import ExportError, build_merged_video
from ..services.media import (
    InvalidMedia,
    MediaToolUnavailable,
    has_audio_stream,
    probe_duration_seconds,
)

clips_bp = Blueprint("clips", __name__, url_prefix="/api")

TRUE_VALUES = {"1", "true", "yes", "on"}


def api_error(message, status):
    return jsonify({"error": message}), status


def _as_bool(value, default):
    if value is None:
        return default
    if isinstance(value, bool):
        return value
    return str(value).lower() in TRUE_VALUES


def _read_settings(payload):
    motion = _as_bool(payload.get("motion"), True)
    sound = _as_bool(payload.get("sound"), True)
    if not motion and not sound:
        raise ValueError("Enable motion or sound detection.")

    try:
        sensitivity = int(payload.get("sensitivity", 6))
        min_length = int(payload.get("minLength", 8))
        max_clips = int(payload.get("maxClips", 10))
        target_value = payload.get("target", "all")
        target_seconds = None if target_value in (None, "all") else int(target_value)
    except (TypeError, ValueError) as exc:
        raise ValueError("Detection settings must be valid numbers.") from exc

    if not 1 <= sensitivity <= 10:
        raise ValueError("Sensitivity must be between 1 and 10.")
    if not 5 <= min_length <= 60:
        raise ValueError("Minimum clip length must be between 5 and 60 seconds.")
    if not 3 <= max_clips <= 30:
        raise ValueError("Max clips must be between 3 and 30.")
    if target_seconds is not None and target_seconds < 5:
        raise ValueError("Target length must be at least 5 seconds.")

    return {
        "motion": motion,
        "sound": sound,
        "sensitivity": sensitivity,
        "min_length": min_length,
        "max_clips": max_clips,
        "target_seconds": target_seconds,
    }


@clips_bp.post("/projects/<int:project_id>/detect")
def detect(project_id):
    project = db.session.get(Project, project_id)
    if not project:
        return api_error("Project not found.", 404)
    if project.status == "processing":
        return api_error("Detection is already running for this project.", 409)

    try:
        settings = _read_settings(request.get_json(silent=True) or {})
    except ValueError as exc:
        return api_error(str(exc), 400)

    video_path = Path(current_app.config["UPLOAD_FOLDER"]) / project.stored_name
    if not video_path.exists():
        return api_error("The source video is no longer available.", 410)

    project.status = "processing"
    db.session.commit()

    try:
        candidates = detect_clips(video_path, project.duration_seconds, settings)
    except AnalysisError as exc:
        project.status = "failed"
        db.session.commit()
        current_app.logger.exception("Video analysis failed")
        return api_error(str(exc), 500)

    try:
        Clip.query.filter_by(project_id=project.id).delete(synchronize_session=False)
        for index, candidate in enumerate(candidates):
            db.session.add(
                Clip(
                    project_id=project.id,
                    order_index=index,
                    start_seconds=candidate["start_seconds"],
                    end_seconds=candidate["end_seconds"],
                    duration_seconds=candidate["duration_seconds"],
                    score=candidate["score"],
                    kept=True,
                )
            )
        project.status = "complete"
        db.session.commit()
    except Exception:
        db.session.rollback()
        project.status = "failed"
        db.session.commit()
        current_app.logger.exception("Could not save detection results")
        return api_error("Detection results could not be saved.", 500)

    clips = Clip.query.filter_by(project_id=project.id).order_by(Clip.order_index).all()
    return jsonify({"project": project.to_dict(), "clips": [clip.to_dict() for clip in clips]})


@clips_bp.get("/projects/<int:project_id>/clips")
def list_clips(project_id):
    project = db.session.get(Project, project_id)
    if not project:
        return api_error("Project not found.", 404)

    clips = Clip.query.filter_by(project_id=project.id).order_by(Clip.order_index).all()
    return jsonify({"project": project.to_dict(), "clips": [clip.to_dict() for clip in clips]})


@clips_bp.patch("/projects/<int:project_id>/clips/<int:clip_id>")
def update_clip(project_id, clip_id):
    project = db.session.get(Project, project_id)
    if not project:
        return api_error("Project not found.", 404)

    payload = request.get_json(silent=True) or {}
    if not isinstance(payload.get("kept"), bool):
        return api_error("Provide a boolean kept value.", 400)

    clip = Clip.query.filter_by(id=clip_id, project_id=project_id).first()
    if not clip:
        return api_error("Clip not found.", 404)

    clip.kept = payload["kept"]
    db.session.commit()
    return jsonify({"clip": clip.to_dict()})


@clips_bp.put("/projects/<int:project_id>/clips/order")
def reorder_clips(project_id):
    project = db.session.get(Project, project_id)
    if not project:
        return api_error("Project not found.", 404)

    payload = request.get_json(silent=True) or {}
    clip_ids = payload.get("clip_ids")
    if not isinstance(clip_ids, list) or not all(
        isinstance(value, int) and not isinstance(value, bool) for value in clip_ids
    ):
        return api_error("Provide an ordered list of clip IDs.", 400)

    clips = Clip.query.filter_by(project_id=project_id).all()
    if sorted(clip_ids) != sorted(clip.id for clip in clips):
        return api_error("Clip IDs must match the project clips exactly.", 400)

    clips_by_id = {clip.id: clip for clip in clips}
    for index, clip_id in enumerate(clip_ids):
        clips_by_id[clip_id].order_index = index

    db.session.commit()
    ordered = Clip.query.filter_by(project_id=project_id).order_by(Clip.order_index).all()
    return jsonify({"clips": [clip.to_dict() for clip in ordered]})


@clips_bp.post("/projects/<int:project_id>/export")
def export_project(project_id):
    project = db.session.get(Project, project_id)
    if not project:
        return api_error("Project not found.", 404)
    if project.status != "complete":
        return api_error("Run detection before exporting this project.", 409)

    clips = (
        Clip.query.filter_by(project_id=project.id, kept=True)
        .order_by(Clip.order_index)
        .all()
    )
    if not clips:
        return api_error("Keep at least one clip before exporting.", 400)

    source_path = Path(current_app.config["UPLOAD_FOLDER"]) / project.stored_name
    if not source_path.exists():
        return api_error("The source video is no longer available.", 410)

    try:
        audio_available = has_audio_stream(source_path)
    except MediaToolUnavailable:
        current_app.logger.exception("ffprobe is unavailable")
        return api_error("Video inspection is unavailable on this server.", 503)
    except InvalidMedia as exc:
        return api_error(str(exc), 500)

    output_name = f"{uuid4().hex}.mp4"
    output_path = Path(current_app.config["OUTPUT_FOLDER"]) / output_name

    try:
        build_merged_video(source_path, clips, output_path, audio_available)
        duration_seconds = probe_duration_seconds(output_path)
        size_bytes = output_path.stat().st_size
    except (ExportError, OSError):
        current_app.logger.exception("Video export failed")
        return api_error("The merged video could not be rendered.", 500)
    except (InvalidMedia, OSError):
        output_path.unlink(missing_ok=True)
        current_app.logger.exception("Exported video could not be read")
        return api_error("The merged video could not be verified.", 500)

    now = datetime.now(timezone.utc)
    export = Export(
        project_id=project.id,
        filename=output_name,
        clip_count=len(clips),
        size_bytes=size_bytes,
        duration_seconds=duration_seconds,
        status="ready",
        created_at=now,
        expires_at=now + timedelta(hours=current_app.config["FILE_RETENTION_HOURS"]),
    )

    try:
        db.session.add(export)
        db.session.commit()
    except Exception:
        db.session.rollback()
        output_path.unlink(missing_ok=True)
        current_app.logger.exception("Could not save export metadata")
        return api_error("The export could not be saved.", 500)

    data = export.to_dict()
    data["download_url"] = url_for("clips.download_export", export_id=export.id)
    return jsonify({"export": data}), 201


@clips_bp.get("/exports/<int:export_id>/download")
def download_export(export_id):
    export = db.session.get(Export, export_id)
    if not export:
        return api_error("Export not found.", 404)

    output_path = Path(current_app.config["OUTPUT_FOLDER"]) / export.filename
    if not output_path.exists():
        return api_error("The exported video is no longer available.", 410)

    project = db.session.get(Project, export.project_id)
    stem = secure_filename(Path(project.original_name).stem) if project else "clipcutter"
    download_name = f"{stem or 'clipcutter'}-highlights.mp4"
    return send_file(
        output_path,
        mimetype="video/mp4",
        as_attachment=True,
        download_name=download_name,
    )
