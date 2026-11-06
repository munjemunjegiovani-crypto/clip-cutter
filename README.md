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
- Minimum 5-second clips, merging, and download
- Copyright/takedown page with a contact email
- Automatic file deletion after 24 hours

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

Optional frontend settings live in `frontend/.env` (copy `frontend/.env.example`). Set the support and takedown emails before deploying.

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

### API

```text
GET   /api/health                        Check the API, database, and configured limits
POST  /api/projects                      Upload a video with permission=true
GET   /api/projects/:id                  Read uploaded project metadata
POST  /api/projects/:id/detect           Run motion/sound detection
GET   /api/projects/:id/clips            Read saved clip candidates
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

Detection runs synchronously on the local CPU with FFmpeg and OpenCV. It samples video motion, measures audio loudness, scores the combined signal, and stores non-overlapping clips that respect the minimum length, maximum clip count, and target length.

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

Built in stages. The frontend flow is interactive with mock project state: upload, settings, simulated detection, clip review, and export preview. The backend now handles uploads, motion/sound detection, clip keep/reorder controls, FFmpeg merging, MP4 downloads, and automatic 24-hour file cleanup. The frontend is not connected to the API yet; thumbnails and final deployment hardening are added in later stages.
