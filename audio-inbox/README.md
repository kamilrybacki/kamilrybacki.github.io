# Audio inbox

Drop an audio recording of an article here to have it transcribed into a draft
blog post automatically.

## How it works

1. Add an audio file to this folder (`.mp3`, `.m4a`, `.wav`, `.mp4`, `.webm`,
   `.flac`, `.ogg`, …) and push to `main` — either with git, or by dragging the
   file into this folder in the GitHub web UI and committing.
2. The **Transcribe audio to article draft** GitHub Action
   (`.github/workflows/transcribe-audio.yml`) runs:
   - compresses the audio and transcribes it with the OpenAI API,
   - cleans the raw transcript into a structured Markdown article with an LLM,
   - writes `src/content/articles/<slug>.md` with `draft: true`,
   - moves your audio file into [`processed/`](./processed) so it is not
     transcribed again,
   - commits everything back to `main` (tagged `[transcribe]`).
3. Pull `main`, open the new draft article, **add images and edit the prose**,
   then set `draft: false` and push to publish.

Drafts are invisible on the live site until `draft: false` (enforced in
`src/content/articles/articles.11tydata.js`). During `npm run dev` they render
so you can preview them.

## Requirements

A repository secret named **`OPENAI_API_KEY`** must be set
(Settings → Secrets and variables → Actions). Use an OpenAI **Platform API
key** from <https://platform.openai.com/api-keys> — your ChatGPT login / OAuth
does **not** work for the API and is billed separately.

## Run it locally instead

```bash
pip install -r scripts/requirements-transcribe.txt   # needs ffmpeg installed
export OPENAI_API_KEY=sk-...
python3 scripts/transcribe_audio.py
```

## Notes

- This is an *optional* path. You can still write articles by hand or via Decap
  CMS exactly as before — nothing about that changed.
- Long recordings are handled automatically (compressed, and split into chunks
  if needed).
- The transcript is shaped to preserve your meaning and voice; it will not
  invent facts. Always review the draft before publishing.
