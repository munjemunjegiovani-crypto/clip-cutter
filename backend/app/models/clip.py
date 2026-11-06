from datetime import datetime, timezone

from ..extensions import db


class Clip(db.Model):
    __tablename__ = "clips"

    id = db.Column(db.Integer, primary_key=True)
    project_id = db.Column(
        db.Integer, db.ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True
    )
    order_index = db.Column(db.Integer, nullable=False)
    start_seconds = db.Column(db.Float, nullable=False)
    end_seconds = db.Column(db.Float, nullable=False)
    duration_seconds = db.Column(db.Float, nullable=False)
    score = db.Column(db.Float, nullable=False)
    kept = db.Column(db.Boolean, nullable=False, default=True)
    created_at = db.Column(
        db.DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc)
    )

    def to_dict(self):
        return {
            "id": self.id,
            "order_index": self.order_index,
            "start_seconds": round(self.start_seconds, 2),
            "end_seconds": round(self.end_seconds, 2),
            "duration_seconds": round(self.duration_seconds, 2),
            "score": round(self.score, 1),
            "kept": self.kept,
        }
