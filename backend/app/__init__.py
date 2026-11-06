from pathlib import Path

from flask import Flask
from flask_cors import CORS

from .config import Config
from .extensions import db
from .routes.health import health_bp


def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    Path(app.instance_path).mkdir(parents=True, exist_ok=True)
    for folder in (app.config["UPLOAD_FOLDER"], app.config["OUTPUT_FOLDER"]):
        Path(folder).mkdir(parents=True, exist_ok=True)

    db.init_app(app)
    CORS(app, resources={r"/api/*": {"origins": app.config["CORS_ORIGINS"]}})
    app.register_blueprint(health_bp)

    return app
