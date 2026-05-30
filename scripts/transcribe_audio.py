#!/usr/bin/env python3
"""
Turn spoken audio into a draft blog article.

For every audio file dropped into `audio-inbox/` this script:

  1. Compresses the audio to a small mono speech-friendly MP3 with ffmpeg and,
     if it is still over the API size limit, splits it into time-based chunks.
  2. Transcribes it with the OpenAI audio transcription API.
  3. Sends the raw transcript through an OpenAI chat model that cleans it up and
     shapes it into a structured blog article (headings, paragraphs, fixed
     grammar, filler removed) and proposes front-matter metadata.
  4. Writes `src/content/articles/<slug>.md` using the exact front-matter shape
     the site already uses, with `draft: true` so nothing publishes until you
     review it and add images.
  5. Moves the processed audio into `audio-inbox/processed/` so it is not
     transcribed again.

This is purely additive: writing articles by hand (or via Decap CMS) is
completely unaffected. Audio is just another way to produce the same Markdown.

Environment:
  OPENAI_API_KEY            (required) OpenAI Platform API key.
  OPENAI_TRANSCRIBE_MODEL   transcription model (default: gpt-4o-transcribe).
  OPENAI_POLISH_MODEL       chat model for cleanup    (default: gpt-4o).
  ARTICLE_DATE              ISO date for the article  (default: today, UTC).

Exit codes:
  0  one or more articles were generated, OR there was nothing to do.
  1  an audio file was found but processing failed.
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
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
INBOX_DIR = REPO_ROOT / "audio-inbox"
PROCESSED_DIR = INBOX_DIR / "processed"
ARTICLES_DIR = REPO_ROOT / "src" / "content" / "articles"

# Extensions OpenAI's transcription endpoint accepts as input.
AUDIO_EXTENSIONS = {
    ".mp3", ".m4a", ".wav", ".mp4", ".mpeg", ".mpga", ".webm", ".flac", ".ogg",
}

# Keep each upload comfortably under the 25 MB API limit.
MAX_UPLOAD_BYTES = 24 * 1024 * 1024
# When a compressed file is still too large, split into chunks this long.
CHUNK_SECONDS = 20 * 60

TRANSCRIBE_MODEL = os.environ.get("OPENAI_TRANSCRIBE_MODEL", "gpt-4o-transcribe")
POLISH_MODEL = os.environ.get("OPENAI_POLISH_MODEL", "gpt-4o")

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
# OpenAI calls
# --------------------------------------------------------------------------- #
def transcribe(client, audio_files: list[Path]) -> str:
    """Transcribe each chunk and join the text in order."""
    parts: list[str] = []
    for i, chunk in enumerate(audio_files, 1):
        log(f"  transcribing chunk {i}/{len(audio_files)} ({chunk.name})")
        with chunk.open("rb") as fh:
            result = client.audio.transcriptions.create(
                model=TRANSCRIBE_MODEL,
                file=fh,
                response_format="text",
            )
        # SDK returns a str for response_format="text".
        parts.append(result if isinstance(result, str) else getattr(result, "text", ""))
    return "\n".join(p.strip() for p in parts if p and p.strip())


def polish(client, transcript: str) -> dict:
    """Turn a raw transcript into structured article JSON."""
    log(f"  polishing transcript ({len(transcript)} chars) with {POLISH_MODEL}")
    response = client.chat.completions.create(
        model=POLISH_MODEL,
        response_format={"type": "json_object"},
        messages=[
            {"role": "system", "content": POLISH_SYSTEM_PROMPT},
            {"role": "user", "content": transcript},
        ],
    )
    data = json.loads(response.choices[0].message.content)
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
    files = [
        p for p in sorted(INBOX_DIR.iterdir())
        if p.is_file() and p.suffix.lower() in AUDIO_EXTENSIONS
    ]
    return files


def process_file(client, audio: Path, date: str) -> Path:
    log(f"Processing {audio.name}")
    with tempfile.TemporaryDirectory() as tmp:
        workdir = Path(tmp)
        chunks = prepare_chunks(audio, workdir)
        transcript = transcribe(client, chunks)
    if not transcript.strip():
        raise ValueError("transcription produced no text")

    meta = polish(client, transcript)
    markdown = build_markdown(meta, date)

    slug = slugify(meta["title"])
    out_path = unique_article_path(slug)
    out_path.write_text(markdown, encoding="utf-8")
    log(f"  wrote {out_path.relative_to(REPO_ROOT)}")

    PROCESSED_DIR.mkdir(parents=True, exist_ok=True)
    dest = PROCESSED_DIR / audio.name
    if dest.exists():
        dest = PROCESSED_DIR / f"{audio.stem}-{out_path.stem}{audio.suffix}"
    shutil.move(str(audio), str(dest))
    log(f"  archived audio to {dest.relative_to(REPO_ROOT)}")
    return out_path


def main() -> int:
    audio_files = discover_audio()
    if not audio_files:
        log("No audio files in audio-inbox/. Nothing to do.")
        return 0

    if shutil.which("ffmpeg") is None:
        log("ERROR: ffmpeg is required but was not found on PATH.")
        return 1
    if not os.environ.get("OPENAI_API_KEY"):
        log("ERROR: OPENAI_API_KEY is not set.")
        return 1

    try:
        from openai import OpenAI
    except ImportError:
        log("ERROR: the 'openai' package is not installed "
            "(pip install -r scripts/requirements-transcribe.txt).")
        return 1

    client = OpenAI()
    date = os.environ.get("ARTICLE_DATE") or dt.datetime.now(dt.timezone.utc).strftime("%Y-%m-%d")

    generated: list[Path] = []
    for audio in audio_files:
        try:
            generated.append(process_file(client, audio, date))
        except Exception as exc:  # noqa: BLE001 - surface a clear CI failure
            log(f"ERROR processing {audio.name}: {exc}")
            return 1

    log(f"\nDone. Generated {len(generated)} draft article(s):")
    for path in generated:
        log(f"  - {path.relative_to(REPO_ROOT)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
