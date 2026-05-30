#!/usr/bin/env python3
"""
Turn spoken audio into a draft blog article.

For every audio file dropped into `audio-inbox/` this script:

  1. Compresses the audio to a small mono speech-friendly MP3 with ffmpeg and,
     if it is still over the upload size limit, splits it into time-based chunks.
  2. Transcribes it with a configurable Speech-to-Text (STT) backend.
  3. Sends the raw transcript through a configurable LLM "polish" backend that
     cleans it up and shapes it into a structured blog article (headings,
     paragraphs, fixed grammar, filler removed) and proposes front-matter.
  4. Writes `src/content/articles/<slug>.md` using the exact front-matter shape
     the site already uses, with `draft: true` so nothing publishes until you
     review it and add images.
  5. Moves the processed audio into `audio-inbox/processed/` so it is not
     transcribed again.

This is purely additive: writing articles by hand (or via Decap CMS) is
completely unaffected. Audio is just another way to produce the same Markdown.

------------------------------------------------------------------------------
Backend configuration
------------------------------------------------------------------------------
The STT backend and the polish-LLM backend are configured INDEPENDENTLY. Each is
defined by three things plus a model, so you can point at ANY vendor without
code changes by declaring which API schema (wire format) it speaks:

  *_API_SCHEMA   which adapter/wire-format to use (decides how requests are made)
  *_BASE_URL     the API endpoint (optional; the schema's default is used if unset)
  *_API_KEY      the credential for that endpoint
  *_MODEL        the model name to request

Speech-to-Text (transcription):
  STT_PROVIDER_API_SCHEMA   openai | elevenlabs        (default: openai)
  STT_PROVIDER_BASE_URL     endpoint override (e.g. https://api.groq.com/openai/v1)
  STT_PROVIDER_API_KEY      credential for the STT endpoint
  STT_MODEL                 schema default if unset
                              openai     -> gpt-4o-transcribe
                              elevenlabs -> scribe_v1

LLM polish (transcript -> article):
  POLISH_PROVIDER_API_SCHEMA  openai | anthropic       (default: openai)
  POLISH_PROVIDER_BASE_URL    endpoint override
  POLISH_PROVIDER_API_KEY     credential for the polish endpoint
  POLISH_MODEL                schema default if unset
                                openai    -> gpt-4o
                                anthropic -> claude-sonnet-4-5

"openai" schema = the OpenAI wire format, which is spoken by OpenAI itself and by
every OpenAI-compatible provider (Groq, Together, OpenRouter, vLLM, …) — just set
the matching *_BASE_URL. "elevenlabs" / "anthropic" use those vendors' native
APIs.

Key fallback (convenience): if *_PROVIDER_API_KEY is unset, the schema's
conventional env var is used — OPENAI_API_KEY / ELEVENLABS_API_KEY /
ANTHROPIC_API_KEY — so the simplest setup is just `export OPENAI_API_KEY=...`.

Misc:
  ARTICLE_DATE     ISO date for the article (default: today, UTC).

Exit codes:
  0  one or more articles were generated, OR there was nothing to do.
  1  an audio file was found but processing failed / misconfiguration.
"""

from __future__ import annotations

import datetime as dt
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile
from dataclasses import dataclass
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
INBOX_DIR = REPO_ROOT / "audio-inbox"
PROCESSED_DIR = INBOX_DIR / "processed"
ARTICLES_DIR = REPO_ROOT / "src" / "content" / "articles"

# Extensions the transcription endpoints accept as input.
AUDIO_EXTENSIONS = {
    ".mp3", ".m4a", ".wav", ".mp4", ".mpeg", ".mpga", ".webm", ".flac", ".ogg",
}

# Keep each upload comfortably under the smallest provider limit (OpenAI: 25 MB).
MAX_UPLOAD_BYTES = 24 * 1024 * 1024
# When a compressed file is still too large, split into chunks this long.
CHUNK_SECONDS = 20 * 60

# Per-schema defaults.
DEFAULT_STT_MODEL = {"openai": "gpt-4o-transcribe", "elevenlabs": "scribe_v1"}
DEFAULT_POLISH_MODEL = {"openai": "gpt-4o", "anthropic": "claude-sonnet-4-5"}
# Conventional credential env var per schema (fallback when *_PROVIDER_API_KEY unset).
DEFAULT_KEY_ENV = {
    "openai": "OPENAI_API_KEY",
    "elevenlabs": "ELEVENLABS_API_KEY",
    "anthropic": "ANTHROPIC_API_KEY",
}

POLISH_SYSTEM_PROMPT = """\
You are an editor for a personal software-engineering blog. You receive a raw,
machine-generated transcript of the author speaking the contents of an article.
Transcripts are messy: no punctuation, run-on sentences, filler words ("um",
"you know", "like"), false starts and repetitions.

Turn the transcript into a polished blog article written in GitHub-flavoured
Markdown. Rules:
  - Preserve the author's meaning, voice and technical claims. Do NOT invent
    facts, code, citations or details that were not spoken.
  - Remove filler words, false starts and verbal tics. Fix grammar and
    punctuation. Merge fragments into coherent sentences and paragraphs.
  - Add structure: short paragraphs and `##` / `###` headings where the content
    naturally shifts topic. Do not add a top-level `#` H1 (the title lives in
    front-matter).
  - Use Markdown for any lists, code (```fenced``` blocks) or emphasis the
    speaker clearly intended. Keep code verbatim when dictated.
  - Do NOT add front-matter, image tags or a concluding "thanks for reading"
    unless the author actually said it.

Then propose metadata for the article.

Respond with a single JSON object, no prose around it, with these keys:
  "title":       string  - a concise, specific article title (no surrounding quotes).
  "description": string  - one-sentence summary for the page meta description.
  "category":    string  - a single short category, e.g. "Python", "Rust", "CI", "Web".
  "tags":        string[] - 0-5 lowercase topical tags (may be empty).
  "body":        string  - the full article body in Markdown (no front-matter).
"""


def log(msg: str) -> None:
    print(msg, flush=True)


# --------------------------------------------------------------------------- #
# Configuration
# --------------------------------------------------------------------------- #
@dataclass
class BackendConfig:
    schema: str          # which adapter/wire-format to use
    model: str
    api_key: str | None
    base_url: str | None


def _env(name: str, default: str | None = None) -> str | None:
    """Return a stripped env var, treating blank/whitespace as unset.

    GitHub Actions interpolates undefined vars/secrets as empty strings, so we
    cannot rely on os.environ.get's default — blank must mean "not provided".
    """
    value = os.environ.get(name)
    value = value.strip() if value else ""
    return value or default


def _load_config(prefix: str, model_defaults: dict[str, str]) -> BackendConfig:
    """Load a backend from {PREFIX}_PROVIDER_API_SCHEMA/_BASE_URL/_API_KEY + {PREFIX}_MODEL."""
    schema = _env(f"{prefix}_PROVIDER_API_SCHEMA", "openai").lower()
    if schema not in model_defaults:
        raise ValueError(
            f"unknown {prefix}_PROVIDER_API_SCHEMA '{schema}' "
            f"(supported: {', '.join(model_defaults)})"
        )
    api_key = _env(f"{prefix}_PROVIDER_API_KEY") or _env(DEFAULT_KEY_ENV.get(schema, ""))
    return BackendConfig(
        schema=schema,
        model=_env(f"{prefix}_MODEL") or model_defaults[schema],
        api_key=api_key,
        base_url=_env(f"{prefix}_PROVIDER_BASE_URL"),
    )


def load_stt_config() -> BackendConfig:
    return _load_config("STT", DEFAULT_STT_MODEL)


def load_polish_config() -> BackendConfig:
    return _load_config("POLISH", DEFAULT_POLISH_MODEL)


# --------------------------------------------------------------------------- #
# Audio preparation (ffmpeg)
# --------------------------------------------------------------------------- #
def _run(cmd: list[str]) -> None:
    subprocess.run(cmd, check=True, capture_output=True)


def compress_audio(src: Path, workdir: Path) -> Path:
    """Re-encode to mono 16 kHz 64 kbps MP3 — plenty for speech, much smaller."""
    out = workdir / "compressed.mp3"
    _run([
        "ffmpeg", "-y", "-i", str(src),
        "-ac", "1", "-ar", "16000", "-b:a", "64k",
        str(out),
    ])
    return out


def split_audio(src: Path, workdir: Path) -> list[Path]:
    """Split an MP3 into fixed-length chunks; return them in order."""
    pattern = str(workdir / "chunk_%03d.mp3")
    _run([
        "ffmpeg", "-y", "-i", str(src),
        "-f", "segment", "-segment_time", str(CHUNK_SECONDS),
        "-c", "copy", pattern,
    ])
    return sorted(workdir.glob("chunk_*.mp3"))


def prepare_chunks(src: Path, workdir: Path) -> list[Path]:
    """Return one or more upload-ready audio files for `src`."""
    compressed = compress_audio(src, workdir)
    if compressed.stat().st_size <= MAX_UPLOAD_BYTES:
        return [compressed]
    log(f"  compressed file is large; splitting into {CHUNK_SECONDS // 60}-min chunks")
    return split_audio(compressed, workdir)


# --------------------------------------------------------------------------- #
# STT backends (keyed by API schema)
# --------------------------------------------------------------------------- #
def _join_parts(parts: list[str]) -> str:
    return "\n".join(p.strip() for p in parts if p and p.strip())


def _stt_openai(cfg: BackendConfig, audio_files: list[Path]) -> str:
    try:
        from openai import OpenAI
    except ImportError:
        raise RuntimeError(
            "the 'openai' package is required for the openai STT schema "
            "(pip install -r scripts/requirements-transcribe.txt)"
        )
    client = OpenAI(api_key=cfg.api_key, base_url=cfg.base_url)
    parts: list[str] = []
    for i, chunk in enumerate(audio_files, 1):
        log(f"  [openai:{cfg.model}] transcribing chunk {i}/{len(audio_files)} ({chunk.name})")
        with chunk.open("rb") as fh:
            result = client.audio.transcriptions.create(
                model=cfg.model, file=fh, response_format="text",
            )
        parts.append(result if isinstance(result, str) else getattr(result, "text", ""))
    return _join_parts(parts)


def _stt_elevenlabs(cfg: BackendConfig, audio_files: list[Path]) -> str:
    try:
        import requests
    except ImportError:
        raise RuntimeError(
            "the 'requests' package is required for the elevenlabs STT schema "
            "(pip install -r scripts/requirements-transcribe.txt)"
        )
    url = (cfg.base_url or "https://api.elevenlabs.io/v1").rstrip("/") + "/speech-to-text"
    headers = {"xi-api-key": cfg.api_key or ""}
    parts: list[str] = []
    for i, chunk in enumerate(audio_files, 1):
        log(f"  [elevenlabs:{cfg.model}] transcribing chunk {i}/{len(audio_files)} ({chunk.name})")
        with chunk.open("rb") as fh:
            resp = requests.post(
                url,
                headers=headers,
                data={"model_id": cfg.model},
                files={"file": (chunk.name, fh, "audio/mpeg")},
                timeout=600,
            )
        if resp.status_code >= 400:
            raise RuntimeError(f"ElevenLabs STT failed ({resp.status_code}): {resp.text[:500]}")
        parts.append(resp.json().get("text", ""))
    return _join_parts(parts)


STT_BACKENDS = {"openai": _stt_openai, "elevenlabs": _stt_elevenlabs}


def transcribe(cfg: BackendConfig, audio_files: list[Path]) -> str:
    return STT_BACKENDS[cfg.schema](cfg, audio_files)


# --------------------------------------------------------------------------- #
# Polish backends (keyed by API schema)
# --------------------------------------------------------------------------- #
def _extract_json(text: str) -> dict:
    """Parse a JSON object, tolerating code fences / surrounding prose."""
    text = text.strip()
    if text.startswith("```"):
        text = re.sub(r"^```[a-zA-Z]*\n?|\n?```$", "", text).strip()
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        start, end = text.find("{"), text.rfind("}")
        if start != -1 and end != -1 and end > start:
            return json.loads(text[start:end + 1])
        raise


def _polish_openai(cfg: BackendConfig, transcript: str) -> dict:
    try:
        from openai import OpenAI
    except ImportError:
        raise RuntimeError(
            "the 'openai' package is required for the openai polish schema "
            "(pip install -r scripts/requirements-transcribe.txt)"
        )
    client = OpenAI(api_key=cfg.api_key, base_url=cfg.base_url)
    messages = [
        {"role": "system", "content": POLISH_SYSTEM_PROMPT},
        {"role": "user", "content": transcript},
    ]
    try:
        response = client.chat.completions.create(
            model=cfg.model, messages=messages,
            response_format={"type": "json_object"},
        )
    except Exception:
        # Some OpenAI-compatible endpoints don't support response_format.
        response = client.chat.completions.create(model=cfg.model, messages=messages)
    return _extract_json(response.choices[0].message.content)


def _polish_anthropic(cfg: BackendConfig, transcript: str) -> dict:
    try:
        import anthropic
    except ImportError:
        raise RuntimeError(
            "the 'anthropic' package is required for the anthropic polish schema "
            "(pip install -r scripts/requirements-transcribe.txt)"
        )
    client = anthropic.Anthropic(api_key=cfg.api_key, base_url=cfg.base_url)
    message = client.messages.create(
        model=cfg.model,
        max_tokens=8192,
        system=POLISH_SYSTEM_PROMPT + "\n\nReturn ONLY the JSON object.",
        messages=[{"role": "user", "content": transcript}],
    )
    text = "".join(block.text for block in message.content if block.type == "text")
    return _extract_json(text)


POLISH_BACKENDS = {"openai": _polish_openai, "anthropic": _polish_anthropic}


def polish(cfg: BackendConfig, transcript: str) -> dict:
    log(f"  polishing transcript ({len(transcript)} chars) with {cfg.schema}:{cfg.model}")
    data = POLISH_BACKENDS[cfg.schema](cfg, transcript)
    if not data.get("body") or not data.get("title"):
        raise ValueError("model response missing required 'title'/'body' fields")
    return data


# --------------------------------------------------------------------------- #
# Article assembly
# --------------------------------------------------------------------------- #
def slugify(text: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")
    return slug or "untitled"


def unique_article_path(slug: str) -> Path:
    candidate = ARTICLES_DIR / f"{slug}.md"
    n = 2
    while candidate.exists():
        candidate = ARTICLES_DIR / f"{slug}-{n}.md"
        n += 1
    return candidate


def yaml_quote(value: str) -> str:
    """Double-quote a scalar, escaping embedded double quotes."""
    return '"' + value.replace("\\", "\\\\").replace('"', '\\"') + '"'


def build_markdown(meta: dict, date: str) -> str:
    title = str(meta["title"]).strip().strip('"')
    description = str(meta.get("description", "")).strip()
    category = str(meta.get("category", "")).strip() or "Uncategorized"
    tags = [str(t).strip() for t in (meta.get("tags") or []) if str(t).strip()]
    body = str(meta["body"]).strip()

    if tags:
        tags_block = "tags:\n" + "".join(f"  - {t}\n" for t in tags)
    else:
        tags_block = "tags: []\n"

    front_matter = (
        "---\n"
        "layout: article.njk\n"
        f"title: {yaml_quote(title)}\n"
        f"date: {date}\n"
        f"category: {category}\n"
        f"description: {yaml_quote(description)}\n"
        f"{tags_block}"
        "draft: true\n"
        "---\n\n"
    )
    return front_matter + body + "\n"


# --------------------------------------------------------------------------- #
# Orchestration
# --------------------------------------------------------------------------- #
def discover_audio() -> list[Path]:
    if not INBOX_DIR.exists():
        return []
    return [
        p for p in sorted(INBOX_DIR.iterdir())
        if p.is_file() and p.suffix.lower() in AUDIO_EXTENSIONS
    ]


def process_file(audio: Path, stt_cfg: BackendConfig, polish_cfg: BackendConfig, date: str) -> Path:
    log(f"Processing {audio.name}")
    with tempfile.TemporaryDirectory() as tmp:
        workdir = Path(tmp)
        chunks = prepare_chunks(audio, workdir)
        transcript = transcribe(stt_cfg, chunks)
    if not transcript.strip():
        raise ValueError("transcription produced no text")

    meta = polish(polish_cfg, transcript)
    markdown = build_markdown(meta, date)

    out_path = unique_article_path(slugify(meta["title"]))
    out_path.write_text(markdown, encoding="utf-8")
    log(f"  wrote {out_path.relative_to(REPO_ROOT)}")

    PROCESSED_DIR.mkdir(parents=True, exist_ok=True)
    dest = PROCESSED_DIR / audio.name
    if dest.exists():
        dest = PROCESSED_DIR / f"{audio.stem}-{out_path.stem}{audio.suffix}"
    shutil.move(str(audio), str(dest))
    log(f"  archived audio to {dest.relative_to(REPO_ROOT)}")
    return out_path


def _describe(cfg: BackendConfig) -> str:
    return f"{cfg.schema}:{cfg.model}" + (f" @ {cfg.base_url}" if cfg.base_url else "")


def main() -> int:
    audio_files = discover_audio()
    if not audio_files:
        log("No audio files in audio-inbox/. Nothing to do.")
        return 0

    if shutil.which("ffmpeg") is None:
        log("ERROR: ffmpeg is required but was not found on PATH.")
        return 1

    try:
        stt_cfg = load_stt_config()
        polish_cfg = load_polish_config()
    except ValueError as exc:
        log(f"ERROR: {exc}")
        return 1

    if not stt_cfg.api_key:
        log(f"ERROR: no API key for STT schema '{stt_cfg.schema}' "
            f"(set STT_PROVIDER_API_KEY or {DEFAULT_KEY_ENV[stt_cfg.schema]}).")
        return 1
    if not polish_cfg.api_key:
        log(f"ERROR: no API key for polish schema '{polish_cfg.schema}' "
            f"(set POLISH_PROVIDER_API_KEY or {DEFAULT_KEY_ENV[polish_cfg.schema]}).")
        return 1

    log(f"STT:    {_describe(stt_cfg)}")
    log(f"Polish: {_describe(polish_cfg)}")

    date = os.environ.get("ARTICLE_DATE") or dt.datetime.now(dt.timezone.utc).strftime("%Y-%m-%d")

    generated: list[Path] = []
    for audio in audio_files:
        try:
            generated.append(process_file(audio, stt_cfg, polish_cfg, date))
        except Exception as exc:  # noqa: BLE001 - surface a clear CI failure
            log(f"ERROR processing {audio.name}: {exc}")
            return 1

    log(f"\nDone. Generated {len(generated)} draft article(s):")
    for path in generated:
        log(f"  - {path.relative_to(REPO_ROOT)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
