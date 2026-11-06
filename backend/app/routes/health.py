from flask import Blueprint, current_app, jsonify
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError

from ..extensions import db

health_bp = Blueprint("health", __name__, url_prefix="/api")


@health_bp.get("/health")
def health():
    try:
        db.session.execute(text("SELECT 1"))
    except SQLAlchemyError:
        current_app.logger.exception("Database health check failed")
        return jsonify({"status": "error", "database": "unavailable"}), 503

    return jsonify(
        {
            "status": "ok",
            "database": "ok",
            "limits": {
                "max_upload_mb": current_app.config["MAX_UPLOAD_MB"],
                "max_duration_minutes": current_app.config["MAX_DURATION_MINUTES"],
                "retention_hours": current_app.config["FILE_RETENTION_HOURS"],
            },
        }
    )
