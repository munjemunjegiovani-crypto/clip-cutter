# ClipCutter Agent Rules

These rules apply to every stage of this project.

## Build Protocol
- Build in the stages defined by the project owner. After each stage: run it, explain how to test it, show the file tree (excluding ignored folders), make a git commit, then STOP and wait for "continue".
- Never start the next stage on your own.
- Keep the project small. Only create files that are needed. No sample data dumps, duplicate files, or unused components.
- Add short comments and keep code readable.

## Design
- `design/` is the read-only Stitch export. Never edit files inside it.
- Match the design exactly: layout, colors, fonts, spacing, floating cards, animated gradients, and both dark and light mode with a toggle.
- If images cannot be viewed, use the exported HTML/CSS as the source of truth.
- Keep website copy honest. Do not claim trained AI models, statistics, or integrations that do not exist. Describe the product as: motion and sound detection, minimum clip length, merge, download, edit in CapCut.

## Git and Secrets
- Create `.gitignore` first, before installing anything.
- Never commit dependency folders, videos, databases, or secrets.
- Never run `git add .` before checking `git status`. Stage files explicitly.
- Never invent secrets. Put every secret or setting in `.env` and list it in `.env.example`.

## Commands
- Ask before running any command outside this folder or using `sudo`.

## Required Features
- Upload checkbox: "I own or have permission to use this video"; upload stays disabled until ticked.
- Copyright/takedown page with a contact email.
- Auto-delete uploaded/processed files after 24 hours.
- Upload size and length limits.
