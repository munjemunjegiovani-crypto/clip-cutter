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

## Status

Built in stages. Frontend routes and UI are in place; backend processing commands are added when that stage starts.
