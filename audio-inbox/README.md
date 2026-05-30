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

## Choosing backends

Transcription (STT) and the LLM "polish" step are configured **independently**,
so you can mix providers (e.g. ElevenLabs for STT + Anthropic for polish, or
Groq for cheap STT + OpenAI for polish). Set these as repository **variables**
(Settings → Secrets and variables → Actions → *Variables*); all are optional and
fall back to sensible defaults.

| Variable | Purpose | Default |
|----------|---------|---------|
| `STT_PROVIDER` | `openai` or `elevenlabs` | `openai` |
| `STT_MODEL` | transcription model | `gpt-4o-transcribe` / `scribe_v1` |
| `STT_BASE_URL` | OpenAI-compatible URL (Groq, Together, local…) | — |
| `POLISH_PROVIDER` | `openai` or `anthropic` | `openai` |
| `POLISH_MODEL` | polish model | `gpt-4o` / `claude-sonnet-4-5` |
| `POLISH_BASE_URL` | OpenAI-compatible URL for polish | — |

**Example — ElevenLabs Scribe + Anthropic Claude:** set variables
`STT_PROVIDER=elevenlabs` and `POLISH_PROVIDER=anthropic`.

**Example — Groq (cheap STT) + OpenAI polish:** set variables
`STT_BASE_URL=https://api.groq.com/openai/v1` and
`STT_MODEL=whisper-large-v3-turbo` (keep `STT_PROVIDER=openai`, since Groq is
OpenAI-compatible), and provide a Groq key via the `STT_API_KEY` secret.

## API keys (secrets)

Set only the keys for the providers you actually use, as repository **secrets**:

| Secret | Used by |
|--------|---------|
| `OPENAI_API_KEY` | OpenAI STT and/or polish |
| `ELEVENLABS_API_KEY` | ElevenLabs STT |
| `ANTHROPIC_API_KEY` | Anthropic polish |
| `STT_API_KEY` | optional explicit key for the STT backend (e.g. Groq) |
| `POLISH_API_KEY` | optional explicit key for the polish backend |

For OpenAI, use a **Platform API key** from
<https://platform.openai.com/api-keys> — your ChatGPT login / OAuth does **not**
work for the API and is billed separately.

## Run it locally instead

```bash
pip install -r scripts/requirements-transcribe.txt   # needs ffmpeg installed

# Default: OpenAI for both
export OPENAI_API_KEY=sk-...
python3 scripts/transcribe_audio.py

# Or mix providers, e.g. ElevenLabs STT + Anthropic polish:
export STT_PROVIDER=elevenlabs   ELEVENLABS_API_KEY=...
export POLISH_PROVIDER=anthropic ANTHROPIC_API_KEY=...
python3 scripts/transcribe_audio.py
```

## Notes

- This is an *optional* path. You can still write articles by hand or via Decap
  CMS exactly as before — nothing about that changed.
- Long recordings are handled automatically (compressed, and split into chunks
  if needed).
- The transcript is shaped to preserve your meaning and voice; it will not
  invent facts. Always review the draft before publishing.
