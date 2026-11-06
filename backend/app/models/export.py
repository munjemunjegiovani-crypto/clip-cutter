from datetime import datetime, timezone

from ..extensions import db


class Export(db.Model):
    __tablename__ = "exports"

    id = db.Column(db.Integer, primary_key=True)
    project_id = db.Column(
        db.Integer, db.ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True
    )
    filename = db.Column(db.String(64), nullable=False, unique=True)
    clip_count = db.Column(db.Integer, nullable=False)
    size_bytes = db.Column(db.BigInteger, nullable=False)
    duration_seconds = db.Column(db.Float, nullable=False)
    status = db.Column(db.String(20), nullable=False, default="ready")
    created_at = db.Column(
        db.DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc)
    )
    expires_at = db.Column(db.DateTime(timezone=True), nullable=False)

    @staticmethod
    def _iso_utc(value):
        if value.tzinfo is None:
            value = value.replace(tzinfo=timezone.utc)
        return value.astimezone(timezone.utc).isoformat().replace("+00:00", "Z")

    def to_dict(self):
        return {
            "id": self.id,
            "project_id": self.project_id,
            "clip_count": self.clip_count,
            "size_bytes": self.size_bytes,
            "duration_seconds": round(self.duration_seconds, 3),
            "status": self.status,
            "created_at": self._iso_utc(self.created_at),
            "expires_at": self._iso_utc(self.expires_at),
        }
