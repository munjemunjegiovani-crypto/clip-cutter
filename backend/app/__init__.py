from pathlib import Path

from flask import Flask, jsonify
from flask_cors import CORS
from werkzeug.exceptions import RequestEntityTooLarge

from .config import Config
from .extensions import db
from .routes.health import health_bp
from .routes.projects import projects_bp


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

    @app.errorhandler(RequestEntityTooLarge)
    def upload_too_large(_error):
        return jsonify({"error": f"Video exceeds the {app.config['MAX_UPLOAD_MB']} MB upload limit."}), 413

    from . import models  # noqa: F401

    with app.app_context():
        db.create_all()

    return app
