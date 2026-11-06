from pathlib import Path

from flask import Blueprint, current_app, jsonify, request

from ..extensions import db
from ..models import Clip, Project
from ..services.analysis import AnalysisError, detect_clips

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
