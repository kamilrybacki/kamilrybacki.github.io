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

Transcription (STT) and the LLM "polish" step are configured **independently**.
Each backend is defined by an **API schema** (the wire format / adapter to use),
a **base URL**, an **API key** and a **model** — so you can point at *any* vendor
by declaring which schema it speaks. Set the non-secret parts as repository
**variables** (Settings → Secrets and variables → Actions → *Variables*); all are
optional and fall back to sensible defaults.

| Variable | Purpose | Default |
|----------|---------|---------|
| `STT_PROVIDER_API_SCHEMA` | wire format: `openai` or `elevenlabs` | `openai` |
| `STT_PROVIDER_BASE_URL` | endpoint override (e.g. Groq's `/openai/v1`) | schema default |
| `STT_MODEL` | transcription model | `gpt-4o-transcribe` / `scribe_v1` |
| `POLISH_PROVIDER_API_SCHEMA` | wire format: `openai` or `anthropic` | `openai` |
| `POLISH_PROVIDER_BASE_URL` | endpoint override | schema default |
| `POLISH_MODEL` | polish model | `gpt-4o` / `claude-sonnet-4-5` |

> The `openai` schema is the OpenAI wire format — spoken by OpenAI **and** every
> OpenAI-compatible provider (Groq, Together, OpenRouter, vLLM, …). To use one,
> keep `*_API_SCHEMA=openai` and set `*_BASE_URL` to its endpoint.

**Example — ElevenLabs Scribe + Anthropic Claude:** set variables
`STT_PROVIDER_API_SCHEMA=elevenlabs` and `POLISH_PROVIDER_API_SCHEMA=anthropic`.

**Example — Groq (cheap STT) + OpenAI polish:** set variables
`STT_PROVIDER_BASE_URL=https://api.groq.com/openai/v1` and
`STT_MODEL=whisper-large-v3-turbo` (schema stays `openai`), and provide a Groq
key via the `STT_PROVIDER_API_KEY` secret.

## API keys (secrets)

Each backend takes its own key. Set these as repository **secrets**:

| Secret | Purpose |
|--------|---------|
| `STT_PROVIDER_API_KEY` | credential for the STT backend |
| `POLISH_PROVIDER_API_KEY` | credential for the polish backend |

If a `*_PROVIDER_API_KEY` is unset, a **schema-conventional fallback** is used —
so the simplest setup is just one of these:

| Fallback secret | Used when schema is |
|-----------------|---------------------|
| `OPENAI_API_KEY` | `openai` |
| `ELEVENLABS_API_KEY` | `elevenlabs` |
| `ANTHROPIC_API_KEY` | `anthropic` |

For OpenAI, use a **Platform API key** from
<https://platform.openai.com/api-keys> — your ChatGPT login / OAuth does **not**
work for the API and is billed separately.

## Run it locally instead

```bash
pip install -r scripts/requirements-transcribe.txt   # needs ffmpeg installed

# Default: OpenAI for both
export OPENAI_API_KEY=sk-...
python3 scripts/transcribe_audio.py

# Or mix backends, e.g. ElevenLabs STT + Anthropic polish:
export STT_PROVIDER_API_SCHEMA=elevenlabs   STT_PROVIDER_API_KEY=...
export POLISH_PROVIDER_API_SCHEMA=anthropic POLISH_PROVIDER_API_KEY=...
python3 scripts/transcribe_audio.py

# Or an OpenAI-compatible endpoint (Groq) for STT:
export STT_PROVIDER_API_SCHEMA=openai \
       STT_PROVIDER_BASE_URL=https://api.groq.com/openai/v1 \
       STT_MODEL=whisper-large-v3-turbo \
       STT_PROVIDER_API_KEY=gsk-...
python3 scripts/transcribe_audio.py
```

## Testing the flow locally

A test harness exercises the whole pipeline offline (the STT and polish APIs are
mocked, so no network or keys are needed):

```bash
./scripts/test-transcribe.sh           # pytest suite: discover -> transcribe -> polish -> draft .md
./scripts/test-transcribe.sh --build   # also verify the production build hides drafts
```

To do a real end-to-end run against your actual configured providers (makes real
API calls and uses your `STT_*` / `POLISH_*` / `*_API_KEY` env vars):

```bash
./scripts/test-transcribe.sh --live path/to/sample.m4a
```

The tests live in [`tests/`](../tests). The ffmpeg-dependent test self-skips if
ffmpeg isn't installed.

## Notes

- This is an *optional* path. You can still write articles by hand or via Decap
  CMS exactly as before — nothing about that changed.
- Long recordings are handled automatically (compressed, and split into chunks
  if needed).
- The transcript is shaped to preserve your meaning and voice; it will not
  invent facts. Always review the draft before publishing.
