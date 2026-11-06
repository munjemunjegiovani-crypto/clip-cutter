import os
from pathlib import Path

from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")


def _env_int(name, default):
    try:
        return int(os.getenv(name, default))
    except (TypeError, ValueError):
        return int(default)


def _env_origins(name, default):
    value = os.getenv(name, default)
    return [origin.strip().rstrip("/") for origin in value.split(",") if origin.strip()]


def _database_url():
    value = os.getenv("DATABASE_URL", "sqlite:///clipcutter.db")
    if value.startswith("postgres://"):
        return value.replace("postgres://", "postgresql://", 1)
    return value


def _env_bool(name, default):
    value = os.getenv(name, str(default)).lower()
    return value in {"1", "true", "yes", "on"}


class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "")
    DEBUG = os.getenv("FLASK_DEBUG", "0").lower() in {"1", "true", "yes"} or os.getenv(
        "FLASK_ENV", ""
    ).lower() == "development"

    SQLALCHEMY_DATABASE_URI = _database_url()
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ENGINE_OPTIONS = {"pool_pre_ping": True, "pool_recycle": 300}
    SEND_FILE_MAX_AGE_DEFAULT = 0

    CORS_ORIGINS = _env_origins(
        "CORS_ORIGINS",
        "http://localhost:5173,http://127.0.0.1:5173,http://localhost:5174,http://127.0.0.1:5174",
    )

    MAX_UPLOAD_MB = _env_int("MAX_UPLOAD_MB", 500)
    MAX_CONTENT_LENGTH = (MAX_UPLOAD_MB + 1) * 1024 * 1024
    MAX_DURATION_MINUTES = _env_int("MAX_DURATION_MINUTES", 30)
    FILE_RETENTION_HOURS = _env_int("FILE_RETENTION_HOURS", 24)
    CLEANUP_INTERVAL_SECONDS = _env_int("CLEANUP_INTERVAL_SECONDS", 600)
    START_CLEANUP_WORKER = _env_bool("START_CLEANUP_WORKER", True)
    TAKEDOWN_EMAIL = os.getenv("TAKEDOWN_EMAIL", "")

    UPLOAD_FOLDER = str(BASE_DIR / "uploads")
    OUTPUT_FOLDER = str(BASE_DIR / "outputs")
    THUMBNAIL_FOLDER = str(BASE_DIR / "thumbnails")
