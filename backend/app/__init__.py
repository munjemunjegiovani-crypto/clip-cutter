import os
import threading
import time
from pathlib import Path

from flask import Flask, jsonify, request
from flask_cors import CORS
from werkzeug.exceptions import RequestEntityTooLarge

from .config import Config
from .extensions import db
from .routes.clips import clips_bp
from .routes.health import health_bp
from .routes.projects import projects_bp
from .services.retention import cleanup_expired

_cleanup_lock = threading.Lock()
_cleanup_worker_started = False


def _run_cleanup(app):
    interval = max(60, int(app.config.get("CLEANUP_INTERVAL_SECONDS", 600)))
    while True:
        time.sleep(interval)
        if not _cleanup_lock.acquire(blocking=False):
            continue
        try:
            with app.app_context():
                app.extensions["last_cleanup"] = time.monotonic()
                result = cleanup_expired()
                if result["projects_deleted"] or result["exports_deleted"]:
                    app.logger.info(
                        "Retention cleanup removed %s projects, %s exports, and %s files.",
                        result["projects_deleted"],
                        result["exports_deleted"],
                        result["files_deleted"],
                    )
        except Exception:
            app.logger.exception("Retention cleanup failed")
        finally:
            _cleanup_lock.release()


def _start_cleanup_worker(app):
    global _cleanup_worker_started
    if _cleanup_worker_started:
        return
    if app.debug and os.environ.get("WERKZEUG_RUN_MAIN") != "true":
        return

    _cleanup_worker_started = True
    threading.Thread(target=_run_cleanup, args=(app,), name="cleanup-worker", daemon=True).start()


def create_app(config_class=Config, test_config=None):
    app = Flask(__name__)
    app.config.from_object(config_class)
    if test_config:
        app.config.update(test_config)

    Path(app.instance_path).mkdir(parents=True, exist_ok=True)
    for folder in (app.config["UPLOAD_FOLDER"], app.config["OUTPUT_FOLDER"]):
        Path(folder).mkdir(parents=True, exist_ok=True)

    db.init_app(app)
    CORS(app, resources={r"/api/*": {"origins": app.config["CORS_ORIGINS"]}})
    app.register_blueprint(health_bp)
    app.register_blueprint(projects_bp)
    app.register_blueprint(clips_bp)

    @app.errorhandler(RequestEntityTooLarge)
    def upload_too_large(_error):
        return jsonify({"error": f"Video exceeds the {app.config['MAX_UPLOAD_MB']} MB upload limit."}), 413

    @app.before_request
    def cleanup_expired_files():
        if not request.path.startswith("/api/"):
            return None

        interval = max(0, int(app.config.get("CLEANUP_INTERVAL_SECONDS", 600)))
        now = time.monotonic()
        if now - app.extensions.get("last_cleanup", 0.0) < interval:
            return None
        if not _cleanup_lock.acquire(blocking=False):
            return None

        try:
            app.extensions["last_cleanup"] = now
            result = cleanup_expired()
            if result["projects_deleted"] or result["exports_deleted"]:
                app.logger.info(
                    "Retention cleanup removed %s projects, %s exports, and %s files.",
                    result["projects_deleted"],
                    result["exports_deleted"],
                    result["files_deleted"],
                )
        except Exception:
            app.logger.exception("Retention cleanup failed")
        finally:
            _cleanup_lock.release()

        return None

    @app.cli.command("cleanup-files")
    def cleanup_files_command():
        result = cleanup_expired()
        print(
            "Deleted "
            f"{result['projects_deleted']} projects, "
            f"{result['exports_deleted']} exports, "
            f"and {result['files_deleted']} files."
        )

    from . import models  # noqa: F401

    with app.app_context():
        db.create_all()

    if app.config.get("START_CLEANUP_WORKER", True):
        _start_cleanup_worker(app)

    return app
