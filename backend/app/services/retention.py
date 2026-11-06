from datetime import datetime, timedelta, timezone
from pathlib import Path

from flask import current_app

from ..extensions import db
from ..models import Clip, Export, Project


def _utcnow():
    return datetime.now(timezone.utc).replace(tzinfo=None)


def _remove_file(folder, filename):
    path = Path(folder) / Path(filename).name
    try:
        if path.exists():
            path.unlink()
            return 1
    except OSError:
        current_app.logger.warning("Could not delete expired file: %s", path, exc_info=True)
    return 0


def _remove_orphans():
    retention = current_app.config["FILE_RETENTION_HOURS"]
    cutoff = _utcnow() - timedelta(hours=retention)
    folders = (
        (current_app.config["UPLOAD_FOLDER"], {project.stored_name for project in Project.query.all()}),
        (current_app.config["OUTPUT_FOLDER"], {export.filename for export in Export.query.all()}),
        (
            current_app.config["THUMBNAIL_FOLDER"],
            {clip.thumbnail_name for clip in Clip.query.all() if clip.thumbnail_name},
        ),
    )

    removed = 0
    for folder, referenced in folders:
        for path in Path(folder).iterdir():
            if not path.is_file() or path.name in referenced:
                continue
            try:
                modified = datetime.fromtimestamp(path.stat().st_mtime, timezone.utc).replace(tzinfo=None)
                if modified <= cutoff:
                    path.unlink()
                    removed += 1
            except OSError:
                current_app.logger.warning("Could not delete orphaned file: %s", path, exc_info=True)
    return removed


def cleanup_expired():
    now = _utcnow()
    deleted_projects = 0
    deleted_exports = 0
    files_to_remove = []

    # Expired projects take their clips and exports with them.
    expired_projects = Project.query.filter(Project.expires_at <= now).all()
    for project in expired_projects:
        files_to_remove.append((current_app.config["UPLOAD_FOLDER"], project.stored_name))

        exports = Export.query.filter_by(project_id=project.id).all()
        for export in exports:
            files_to_remove.append((current_app.config["OUTPUT_FOLDER"], export.filename))
            db.session.delete(export)
            deleted_exports += 1

        clips = Clip.query.filter_by(project_id=project.id).all()
        for clip in clips:
            if clip.thumbnail_name:
                files_to_remove.append((current_app.config["THUMBNAIL_FOLDER"], clip.thumbnail_name))
            db.session.delete(clip)

        db.session.delete(project)
        deleted_projects += 1

    expired_exports = Export.query.filter(Export.expires_at <= now).all()
    for export in expired_exports:
        files_to_remove.append((current_app.config["OUTPUT_FOLDER"], export.filename))
        db.session.delete(export)
        deleted_exports += 1

    # Commit rows first so a database failure cannot leave rows with missing files.
    if deleted_projects or deleted_exports:
        try:
            db.session.commit()
        except Exception:
            db.session.rollback()
            raise

    files_deleted = 0
    for folder, filename in files_to_remove:
        files_deleted += _remove_file(folder, filename)

    # Remove old files whose rows are already gone, such as after a failed unlink.
    files_deleted += _remove_orphans()

    return {
        "projects_deleted": deleted_projects,
        "exports_deleted": deleted_exports,
        "files_deleted": files_deleted,
    }
