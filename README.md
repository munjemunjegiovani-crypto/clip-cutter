# ClipCutter

ClipCutter turns long videos into short highlight clips by detecting motion and loud-sound moments with FFmpeg and OpenCV. Clips are at least 5 seconds, can be merged into one video, and are ready to edit in CapCut.

Runs 100% locally and free: no paid APIs and no cloud services.

## Stack

- Frontend: React, Vite, Tailwind CSS (deployable to Netlify)
- Backend: Python 3, Flask, FFmpeg, OpenCV, SQLAlchemy
- Database: SQLite locally, any `DATABASE_URL` (e.g. Neon Postgres) when deployed

## Project Structure

```
clip-cutter/
  design/         Stitch export (read only)
  frontend/       React app
  backend/        Flask API, uploads, outputs
  AGENTS.md       Build rules
```

## Features

- MP4, MOV, MKV uploads with an ownership/permission checkbox
- Upload size and length limits
- Motion and sound detection with adjustable sensitivity
- Source video previews before upload and during detection
- Minimum 5-second clips, merging, and download
- Local dashboard with recent jobs and processing stats
- Copyright/takedown page with a contact email
- Automatic file deletion after 24 hours
- Production build and deployment configuration

## Development

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Vite prints the local URL (usually `http://localhost:5173`). To check the production build:

```bash
npm run build
npm run preview
```

Optional frontend settings live in `frontend/.env` (copy `frontend/.env.example`). Set `VITE_API_URL` if the API is not at `http://localhost:5000`, and set the support and takedown emails before deploying. The app stores the active project and clips in `sessionStorage` so a refresh can resume the flow.

### Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
python run.py
```

The API runs at `http://127.0.0.1:5000`. Check it with:

```bash
curl http://127.0.0.1:5000/api/health
```

Configure the backend in `backend/.env` (copy `backend/.env.example`). Add every frontend origin that should call the API to `CORS_ORIGINS`.

### Tests

Backend regression tests use a temporary database and media folders, so they do not touch local uploads or projects. They cover upload guards, source streaming, detection, export/download, dashboard stats, and retention cleanup:

```bash
cd backend
source venv/bin/activate
python -m unittest discover -s tests -v
```

The GitHub Actions workflow in `.github/workflows/ci.yml` runs the frontend build and backend tests on every push and pull request.

### Deployment

The root `netlify.toml` builds the frontend from `frontend/`, rewrites SPA routes to `index.html`, sets browser security headers, and caches hashed assets. On Netlify, set these build-time environment variables:

```text
VITE_API_URL=https://your-api-host
VITE_SUPPORT_EMAIL=your-support-address
VITE_TAKEDOWN_EMAIL=your-takedown-address
```

For the backend, deploy the `backend/` folder with FFmpeg installed, then run Gunicorn:

```bash
gunicorn --bind 0.0.0.0:$PORT --workers 1 --threads 4 --timeout 1900 \
  --access-logfile - --error-logfile - wsgi:app
```

The included `backend/Procfile` uses the same command. Keep one worker because the cleanup worker and local media files are process-local. Use a persistent disk for `uploads/`, `outputs/`, and `thumbnails/`; do not use an ephemeral or serverless filesystem. Set `CORS_ORIGINS` to the deployed frontend origin and set `FLASK_DEBUG=0`. Use a PostgreSQL `DATABASE_URL` for persistent job metadata; the video files still need a persistent disk.

The API has no user accounts. Run it on a trusted network, or put your own authentication or access control in front of it before exposing it publicly. Project and export URLs use numeric IDs.

Check `GET /api/health` after deployment. It returns `200` when the database, `ffmpeg`, and `ffprobe` are ready, and `503` otherwise.

### API

```text
GET   /api/health                        Check the API, database, tools, and limits
GET   /api/projects                      List recent local jobs and stats
POST  /api/projects                      Upload a video with permission=true
GET   /api/projects/:id                  Read uploaded project metadata
GET   /api/projects/:id/source           Stream the source video (Range supported)
POST  /api/projects/:id/detect           Run motion/sound detection
GET   /api/projects/:id/clips            Read saved clip candidates
GET   /api/clips/:id/thumbnail           Read a clip thumbnail
PATCH /api/projects/:id/clips/:clip_id   Keep or remove a clip
PUT   /api/projects/:id/clips/order      Reorder clips
POST  /api/projects/:id/export           Merge kept clips into one MP4
GET   /api/exports/:id/download          Download the merged MP4
```

Upload example:

```bash
curl -F "video=@clip.mp4" -F "permission=true" http://127.0.0.1:5000/api/projects
```

Detection example:

```bash
curl -X POST http://127.0.0.1:5000/api/projects/1/detect \
  -H "Content-Type: application/json" \
  -d '{"motion":true,"sound":true,"sensitivity":6,"minLength":8,"maxClips":10,"target":"all"}'
```

Detection runs synchronously on the local CPU with FFmpeg and OpenCV. It samples video motion, measures audio loudness, scores the combined signal, and stores non-overlapping clips that respect the minimum length, maximum clip count, and target length. Each clip also gets a JPEG thumbnail from its midpoint.

Export example:

```bash
curl -X POST http://127.0.0.1:5000/api/projects/1/export
curl -L -o highlights.mp4 http://127.0.0.1:5000/api/exports/1/download
```

Exports merge the kept clips in their saved order. The MP4 is re-encoded to H.264/AAC for broad browser and CapCut compatibility.

### File retention

Uploaded projects and their merged exports expire 24 hours after upload. A background worker removes expired database rows and files every 10 minutes, and API requests also trigger a throttled cleanup. Change the schedule with `FILE_RETENTION_HOURS` and `CLEANUP_INTERVAL_SECONDS`, or disable the worker with `START_CLEANUP_WORKER=0`.

Run cleanup manually:

```bash
cd backend
source venv/bin/activate
flask --app run cleanup-files
```

## Status

Built in stages. The frontend upload, detection, clip review, keep/reorder, source preview, merge/download, and local dashboard flow is connected to the Flask API. The backend handles uploads, motion/sound detection, clip thumbnails, FFmpeg merging, MP4 downloads, recent-job stats, and automatic 24-hour file cleanup. Production build and deployment configuration is in place. Final UI QA covers real source previews, accurate export specs, honest timing copy, and accessible controls.
