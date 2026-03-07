# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server at http://localhost:5173
npm run build    # Production build
npm run lint     # ESLint check
npm run preview  # Preview production build
```

No test suite is configured.

## Architecture

**Stack:** React 18 + Vite, React Router DOM v7, Recoil (state), Axios, OpenSheetMusicDisplay (OSMD), osmd-audio-player

**Layout system:**
- `Sidebar` is `position: fixed` on the left (80px collapsed / 300px open). It uses a CSS sibling selector (`.sidebar.opened ~ .header`) to push the header right.
- Content pages hardcode `padding-left: 100px` to clear the sidebar — they do NOT respond dynamically to sidebar state.
- `App.jsx` renders `<Sidebar />` and `<Header />` as siblings outside `<Routes>`, so they persist across all pages.

**Auth flow:**
- JWT token stored in `localStorage` as `"Token"`.
- `src/axiosInstance.js` auto-attaches the token as `Authorization: Bearer <token>` on every request.
- `src/authState.js` exports a Recoil atom `isLoggedInState` (boolean). `Header.jsx` initializes it from localStorage on mount.
- Login and Signup pages use **plain `axios`** (not `axiosInstance`) with relative paths (`/api/auth/...`) — requires a proxy or the backend to serve on the same origin.

**Backend base URL:** `http://13.211.147.73:8000` (set in `axiosInstance.js`)

**Sheet generation flow:**
1. `FileUpload` → `POST /create_sheets` (FormData) → receives `jobId`
2. `ConvertingPage` → polls `GET /create_sheets/{jobId}` every 3s until `status === 'completed'`
3. `SheetCompletePage` → shows result; View button calls `GET /create_sheets/{jobId}/view` for a presigned `view_url`
4. `SheetViewerPage` → reads `localStorage.getItem('currentSheetSid')` (set by MySheetsPage) to fetch MusicXML via `GET /create_sheets/mysheets/{sid}/view`

**Known inconsistency:** `SheetCompletePage` saves `currentSheetViewUrl` to localStorage, but `SheetViewerPage` reads `currentSheetSid` — the viewer path from SheetCompletePage is broken.

**Key enum mappings** (FileUpload → backend):
- purpose: `accompaniment=1, performance=2`
- style: `rock=1, ballad=2, original=3`
- difficulty: `easy=1, normal=2`
