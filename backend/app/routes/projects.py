from datetime import datetime, timedelta, timezone
from pathlib import Path
from uuid import uuid4

from flask import Blueprint, current_app, jsonify, request
from werkzeug.utils import secure_filename

from ..extensions import db
from ..models import Project
from ..services.media import InvalidMedia, MediaToolUnavailable, probe_duration_seconds

projects_bp = Blueprint("projects", __name__, url_prefix="/api")

ALLOWED_EXTENSIONS = {".mp4", ".mov", ".mkv"}
TRUTHY_VALUES = {"1", "true", "yes", "on"}


def api_error(message, status):
    return jsonify({"error": message}), status


@projects_bp.post("/projects")
def create_project():
    if request.form.get("permission", "").lower() not in TRUTHY_VALUES:
        return api_error("Confirm that you own or have permission to use this video.", 400)

    video = request.files.get("video")
    if not video or not video.filename:
        return api_error("Choose a video file to upload.", 400)

    original_name = video.filename[:255]
    safe_name = secure_filename(original_name)
    suffix = Path(safe_name).suffix.lower()
    if suffix not in ALLOWED_EXTENSIONS:
        return api_error("Only MP4, MOV, and MKV videos are supported.", 415)

    upload_folder = Path(current_app.config["UPLOAD_FOLDER"])
    stored_name = f"{uuid4().hex}{suffix}"
    destination = upload_folder / stored_name

    try:
        video.save(destination)
    except OSError:
        current_app.logger.exception("Could not save upload")
        return api_error("The upload could not be saved.", 500)

    size_bytes = destination.stat().st_size
    max_bytes = current_app.config["MAX_UPLOAD_MB"] * 1024 * 1024

    if size_bytes == 0:
        destination.unlink(missing_ok=True)
        return api_error("The uploaded file is empty.", 400)
    if size_bytes > max_bytes:
        destination.unlink(missing_ok=True)
        return api_error(
            f"Video exceeds the {current_app.config['MAX_UPLOAD_MB']} MB upload limit.",
            413,
        )

    try:
        duration_seconds = probe_duration_seconds(destination)
    except MediaToolUnavailable:
        destination.unlink(missing_ok=True)
        current_app.logger.exception("ffprobe is unavailable")
        return api_error("Video inspection is unavailable on this server.", 503)
    except InvalidMedia as exc:
        destination.unlink(missing_ok=True)
        return api_error(str(exc), 415)

    max_duration_seconds = current_app.config["MAX_DURATION_MINUTES"] * 60
    if duration_seconds > max_duration_seconds:
        destination.unlink(missing_ok=True)
        return api_error(
            f"Video exceeds the {current_app.config['MAX_DURATION_MINUTES']} minute length limit.",
            400,
        )

    now = datetime.now(timezone.utc)
    project = Project(
        original_name=original_name,
        stored_name=stored_name,
        size_bytes=size_bytes,
        duration_seconds=duration_seconds,
        status="uploaded",
        permission_confirmed=True,
        created_at=now,
        expires_at=now + timedelta(hours=current_app.config["FILE_RETENTION_HOURS"]),
    )

    try:
        db.session.add(project)
        db.session.commit()
    except Exception:
        db.session.rollback()
        destination.unlink(missing_ok=True)
        current_app.logger.exception("Could not save project metadata")
        return api_error("The project could not be saved.", 500)

    return jsonify(project.to_dict()), 201


@projects_bp.get("/projects/<int:project_id>")
def get_project(project_id):
    project = db.session.get(Project, project_id)
    if not project:
        return api_error("Project not found.", 404)
    return jsonify(project.to_dict())
