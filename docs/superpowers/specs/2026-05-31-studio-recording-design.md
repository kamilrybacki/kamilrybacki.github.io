# Design — In-browser recording + staged transcription (studio)

Date: 2026-05-31
Status: Approved
Repo: kamilrybacki/kamilrybacki.github.io (studio page only)

## Goal

Let the author **record audio notes in the browser** in the studio, alongside file
upload. Both feed a **pending "to transcribe" queue** that is transcribed on demand
(not instantly), so takes can be re-recorded/removed before spending API calls.

## Decisions (approved)

1. Drop/browse now **stages** clips into the pending queue instead of transcribing
   immediately; transcription happens on a **"Transcribe all"** action.
2. Un-transcribed pending clips are **session-only** (lost on reload). Transcribed
   notes still persist in `localStorage`.
3. Mic recording uses `getUserMedia` + `MediaRecorder`; stop → clip added to the queue.

## Behavior

- **Pending queue** (new, in-memory): raw clips `{id, name, blob, mime, url}`. Rendered
  with name, inline `<audio controls>` playback, and a **remove** button.
- **Record:** `Record` button → `navigator.mediaDevices.getUserMedia({audio:true})` →
  `MediaRecorder` (default mime). Live elapsed timer. `Stop` → assemble the Blob →
  push to the queue, auto-named `Recording <mm:ss>` (duration). Release the mic track.
- **Upload:** drop/browse → push File(s) to the queue (no longer instant-transcribe).
- **Transcribe all (N):** for each pending clip, `POST {STT}/transcribe`
  (`Authorization: Bearer <token>`, multipart `audio` = the blob/file with a filename
  whose extension matches the mime). On success, append `{id, name, transcript}` to the
  existing **notes** list (persisted) and remove the clip from the queue; on failure,
  keep the clip with an inline error. Disabled while empty or while transcribing.
- **Synthesize / Save draft:** unchanged.

## Mime → extension

`extForMime(mime)` maps the recorder/file mime to an extension the service accepts
(`AUDIO_EXTENSIONS`): `audio/webm`→`webm`, `audio/ogg`→`ogg`, `audio/mp4`→`mp4`,
`audio/mpeg`→`mp3`, `audio/wav`→`wav`; fallback `webm`. Used to name the uploaded blob
so the service's suffix check passes. (Safari `MediaRecorder` yields `audio/mp4`.)

## Components

- `public/studio/studio.js` — add: recorder state + `startRec`/`stopRec`, pending-queue
  state + render + `removePending`, `transcribeAll`; change drop/file handlers to enqueue
  instead of calling the old immediate path. Keep auth/synthesize/commit as-is.
- `public/studio/studio-lib.js` — add pure `extForMime(mime)` (unit-tested) and
  `formatDuration(seconds)` (unit-tested).
- `public/studio/index.html` — add `Record`/`Stop` buttons + a `#pending` list +
  `Transcribe all` button, above the existing Notes section.
- Service / Decap: untouched.

## Error handling

- `getUserMedia` denied/unavailable → inline message; file upload unaffected.
- Per-clip transcribe failure isolated; clip stays queued with error; others proceed.
- MediaRecorder unsupported → hide Record, keep upload.

## Testing

- Unit (node): `extForMime` (known mimes + fallback), `formatDuration` (0, 53s, 75s→1:15).
- Manual checklist: grant mic, record→stop→playback, remove a clip, add a file, mix
  file+recording, Transcribe all → notes populate + queue clears, reload (notes persist,
  queue empty), synthesize, save draft.

## Out of scope

- Waveform/level meter, pause/resume recording, trimming, persisting blobs across reload.
