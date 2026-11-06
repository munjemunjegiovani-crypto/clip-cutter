import io
import shutil
import subprocess
import tempfile
import unittest
from datetime import datetime, timedelta, timezone
from pathlib import Path

from app import create_app
from app.extensions import db
from app.models import Clip, Export, Project
from app.services.retention import cleanup_expired


class ApiTestCase(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.temp_dir = tempfile.TemporaryDirectory()
        cls.root = Path(cls.temp_dir.name)
        cls.video_path = cls.root / "sample.mp4"
        cls.has_media_tools = bool(shutil.which("ffmpeg") and shutil.which("ffprobe"))

        if cls.has_media_tools:
            subprocess.run(
                [
                    "ffmpeg",
                    "-y",
                    "-loglevel",
                    "error",
                    "-f",
                    "lavfi",
                    "-i",
                    "testsrc2=size=160x120:rate=12",
                    "-f",
                    "lavfi",
                    "-i",
                    "sine=frequency=440",
                    "-t",
                    "2",
                    "-c:v",
                    "libx264",
                    "-preset",
                    "veryfast",
                    "-pix_fmt",
                    "yuv420p",
                    "-c:a",
                    "aac",
                    "-shortest",
                    str(cls.video_path),
                ],
                check=True,
            )

        cls.app = create_app(
            test_config={
                "TESTING": True,
                "SQLALCHEMY_DATABASE_URI": f"sqlite:///{cls.root / 'test.db'}",
                "UPLOAD_FOLDER": str(cls.root / "uploads"),
                "OUTPUT_FOLDER": str(cls.root / "outputs"),
                "THUMBNAIL_FOLDER": str(cls.root / "thumbnails"),
                "MAX_UPLOAD_MB": 1,
                "MAX_CONTENT_LENGTH": 2 * 1024 * 1024,
                "MAX_DURATION_MINUTES": 30,
                "FILE_RETENTION_HOURS": 24,
                "CLEANUP_INTERVAL_SECONDS": 600,
                "START_CLEANUP_WORKER": False,
                "CORS_ORIGINS": ["http://localhost:5174"],
            }
        )

    @classmethod
    def tearDownClass(cls):
        cls.temp_dir.cleanup()

    def setUp(self):
        with self.app.app_context():
            db.drop_all()
            db.create_all()
        for folder in ("UPLOAD_FOLDER", "OUTPUT_FOLDER", "THUMBNAIL_FOLDER"):
            for path in Path(self.app.config[folder]).iterdir():
                if path.is_file():
                    path.unlink()
        self.client = self.app.test_client()

    def upload(self, filename="sample.mp4", permission="true", payload=None):
        if payload is None:
            payload = self.video_path.read_bytes()
        return self.client.post(
            "/api/projects",
            data={"permission": permission, "video": (io.BytesIO(payload), filename)},
            content_type="multipart/form-data",
        )

    def test_health_reports_database_limits_and_security_headers(self):
        response = self.client.get("/api/health")
        body = response.get_json()

        self.assertIn(response.status_code, (200, 503))
        self.assertEqual(body["database"], "ok")
        self.assertEqual(body["limits"]["max_upload_mb"], 1)
        self.assertEqual(response.headers["Cache-Control"], "no-store")
        self.assertEqual(response.headers["X-Content-Type-Options"], "nosniff")
        self.assertEqual(response.headers["X-Frame-Options"], "DENY")

    def test_upload_guards_reject_invalid_requests(self):
        cases = [
            (self.upload(permission="false"), 400, "permission"),
            (self.upload(filename="sample.avi"), 415, "MP4"),
            (self.upload(payload=b""), 400, "empty"),
            (self.upload(payload=b"0" * (1400 * 1024)), 413, "limit"),
        ]

        for response, status, message in cases:
            self.assertEqual(response.status_code, status)
            self.assertIn(message.lower(), response.get_json()["error"].lower())

        with self.app.app_context():
            self.assertEqual(Project.query.count(), 0)

    @unittest.skipUnless(shutil.which("ffmpeg"), "ffmpeg is required for upload tests")
    def test_upload_streams_source_and_handles_missing_files(self):
        response = self.upload()
        self.assertEqual(response.status_code, 201)
        project = response.get_json()
        self.assertEqual(project["original_name"], "sample.mp4")

        source = self.client.get(
            f"/api/projects/{project['id']}/source",
            headers={"Range": "bytes=0-15"},
        )
        self.assertEqual(source.status_code, 206)
        self.assertIn("bytes 0-15/", source.headers["Content-Range"])
        source.close()

        with self.app.app_context():
            stored = db.session.get(Project, project["id"]).stored_name
        (Path(self.app.config["UPLOAD_FOLDER"]) / stored).unlink()

        missing = self.client.get(f"/api/projects/{project['id']}/source")
        self.assertEqual(missing.status_code, 410)
        self.assertIn("no longer available", missing.get_json()["error"])
        self.assertEqual(self.client.get("/api/projects/9999").status_code, 404)

    @unittest.skipUnless(shutil.which("ffmpeg"), "ffmpeg is required for upload tests")
    def test_recent_projects_include_stats_and_counts(self):
        response = self.upload()
        self.assertEqual(response.status_code, 201)
        project_id = response.get_json()["id"]

        now = datetime.now(timezone.utc)
        with self.app.app_context():
            project = db.session.get(Project, project_id)
            project.status = "complete"
            db.session.add_all(
                [
                    Clip(
                        project_id=project_id,
                        order_index=0,
                        start_seconds=0,
                        end_seconds=2,
                        duration_seconds=2,
                        score=90,
                        kept=True,
                    ),
                    Clip(
                        project_id=project_id,
                        order_index=1,
                        start_seconds=2,
                        end_seconds=4,
                        duration_seconds=2,
                        score=80,
                        kept=False,
                    ),
                    Export(
                        project_id=project_id,
                        filename="test-export.mp4",
                        clip_count=1,
                        size_bytes=1024,
                        duration_seconds=2,
                        created_at=now,
                        expires_at=now + timedelta(hours=24),
                    ),
                ]
            )
            db.session.commit()

        data = self.client.get("/api/projects").get_json()
        self.assertEqual(data["stats"]["videos_processed"], 1)
        self.assertEqual(data["stats"]["clips_generated"], 2)
        self.assertEqual(data["stats"]["merged_downloads"], 1)
        self.assertEqual(data["projects"][0]["clip_count"], 2)
        self.assertEqual(data["projects"][0]["kept_clip_count"], 1)
        self.assertEqual(data["projects"][0]["export_count"], 1)

    def test_retention_removes_expired_rows_and_files_only(self):
        now = datetime.now(timezone.utc)
        with self.app.app_context():
            uploads = Path(self.app.config["UPLOAD_FOLDER"])
            outputs = Path(self.app.config["OUTPUT_FOLDER"])
            thumbnails = Path(self.app.config["THUMBNAIL_FOLDER"])
            for folder in (uploads, outputs, thumbnails):
                folder.mkdir(parents=True, exist_ok=True)

            expired = Project(
                original_name="expired.mp4",
                stored_name="expired.mp4",
                size_bytes=10,
                duration_seconds=10,
                status="complete",
                created_at=now - timedelta(hours=25),
                expires_at=now - timedelta(hours=1),
            )
            active = Project(
                original_name="active.mp4",
                stored_name="active.mp4",
                size_bytes=10,
                duration_seconds=10,
                status="complete",
                created_at=now,
                expires_at=now + timedelta(hours=24),
            )
            db.session.add_all([expired, active])
            db.session.flush()
            db.session.add_all(
                [
                    Clip(
                        project_id=expired.id,
                        order_index=0,
                        start_seconds=0,
                        end_seconds=10,
                        duration_seconds=10,
                        score=90,
                        kept=True,
                        thumbnail_name="expired.jpg",
                    ),
                    Export(
                        project_id=expired.id,
                        filename="expired.mp4",
                        clip_count=1,
                        size_bytes=10,
                        duration_seconds=10,
                        created_at=now - timedelta(hours=25),
                        expires_at=now - timedelta(hours=1),
                    ),
                ]
            )
            db.session.commit()
            expired_id = expired.id
            active_id = active.id

            (uploads / "expired.mp4").write_bytes(b"expired")
            (uploads / "active.mp4").write_bytes(b"active")
            (outputs / "expired.mp4").write_bytes(b"export")
            (thumbnails / "expired.jpg").write_bytes(b"thumb")

            result = cleanup_expired()

            self.assertEqual(result["projects_deleted"], 1)
            self.assertEqual(result["exports_deleted"], 1)
            self.assertEqual(result["files_deleted"], 3)
            self.assertIsNone(db.session.get(Project, expired_id))
            self.assertIsNotNone(db.session.get(Project, active_id))
            self.assertFalse((uploads / "expired.mp4").exists())
            self.assertFalse((outputs / "expired.mp4").exists())
            self.assertFalse((thumbnails / "expired.jpg").exists())
            self.assertTrue((uploads / "active.mp4").exists())


if __name__ == "__main__":
    unittest.main()
