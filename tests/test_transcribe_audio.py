"""
End-to-end and unit tests for the audio -> draft-article pipeline
(scripts/transcribe_audio.py).

The STT and polish backends are replaced with in-process fakes, so the FULL
flow — discover audio, (optionally) ffmpeg compress, transcribe, polish, write
front-matter, archive audio — runs locally with no network and no API keys.

Run:  python3 -m pytest tests/ -v
  or: ./scripts/test-transcribe.sh
"""

from __future__ import annotations

import os
import shutil
import subprocess
import sys
from pathlib import Path

import pytest

# Make scripts/transcribe_audio.py importable.
SCRIPTS_DIR = Path(__file__).resolve().parent.parent / "scripts"
sys.path.insert(0, str(SCRIPTS_DIR))
import transcribe_audio as ta  # noqa: E402

HAVE_FFMPEG = shutil.which("ffmpeg") is not None

FAKE_TRANSCRIPT = "um so today i want to talk about uh testing pipelines you know"
FAKE_META = {
    "title": 'Testing "Pipelines" Locally',
    "description": "How to test the audio pipeline end to end.",
    "category": "CI",
    "tags": ["testing", "audio"],
    "body": "## Why test\n\nBecause it works.",
}


# --------------------------------------------------------------------------- #
# Fixtures
# --------------------------------------------------------------------------- #
@pytest.fixture
def sandbox(tmp_path, monkeypatch):
    """Redirect the module's paths into a throwaway repo layout."""
    inbox = tmp_path / "audio-inbox"
    processed = inbox / "processed"  # legacy path; should never be created now
    articles = tmp_path / "src" / "content" / "articles"
    inbox.mkdir(parents=True)
    articles.mkdir(parents=True)

    monkeypatch.setattr(ta, "REPO_ROOT", tmp_path)
    monkeypatch.setattr(ta, "INBOX_DIR", inbox)
    monkeypatch.setattr(ta, "ARTICLES_DIR", articles)

    # Clear any real provider config from the environment.
    for key in list(os.environ):
        if key.split("_")[0] in ("STT", "POLISH", "OPENAI", "ELEVENLABS", "ANTHROPIC"):
            monkeypatch.delenv(key, raising=False)

    return ta, tmp_path, inbox, processed, articles


@pytest.fixture
def fake_backends(monkeypatch):
    """Replace the openai STT + polish adapters with offline fakes."""
    monkeypatch.setitem(ta.STT_BACKENDS, "openai", lambda cfg, files: FAKE_TRANSCRIPT)
    monkeypatch.setitem(ta.POLISH_BACKENDS, "openai", lambda cfg, transcript: dict(FAKE_META))


def _make_audio(path: Path) -> None:
    """Create a real 1s tone with ffmpeg, or a stub byte file if ffmpeg is absent."""
    if HAVE_FFMPEG:
        subprocess.run(
            ["ffmpeg", "-y", "-f", "lavfi", "-i", "sine=frequency=440:duration=1",
             "-ac", "1", str(path)],
            check=True, capture_output=True,
        )
    else:
        path.write_bytes(b"\x00" * 1024)


# --------------------------------------------------------------------------- #
# Config resolution
# --------------------------------------------------------------------------- #
def test_config_defaults(sandbox, monkeypatch):
    monkeypatch.setenv("OPENAI_API_KEY", "sk-x")
    stt, pol = ta.load_stt_config(), ta.load_polish_config()
    assert (stt.schema, stt.model, stt.base_url, stt.api_key) == \
        ("openai", "gpt-4o-transcribe", None, "sk-x")
    assert (pol.schema, pol.model, pol.api_key) == ("openai", "gpt-4o", "sk-x")


def test_config_mixed_schemas(sandbox, monkeypatch):
    monkeypatch.setenv("STT_PROVIDER_API_SCHEMA", "elevenlabs")
    monkeypatch.setenv("STT_PROVIDER_API_KEY", "el")
    monkeypatch.setenv("POLISH_PROVIDER_API_SCHEMA", "anthropic")
    monkeypatch.setenv("POLISH_PROVIDER_API_KEY", "an")
    stt, pol = ta.load_stt_config(), ta.load_polish_config()
    assert (stt.schema, stt.model, stt.api_key) == ("elevenlabs", "scribe_v1", "el")
    assert (pol.schema, pol.model, pol.api_key) == ("anthropic", "claude-sonnet-4-5", "an")


def test_config_base_url_and_explicit_key_wins(sandbox, monkeypatch):
    monkeypatch.setenv("STT_PROVIDER_BASE_URL", "https://api.groq.com/openai/v1")
    monkeypatch.setenv("STT_MODEL", "whisper-large-v3-turbo")
    monkeypatch.setenv("STT_PROVIDER_API_KEY", "explicit")
    monkeypatch.setenv("OPENAI_API_KEY", "fallback")
    stt = ta.load_stt_config()
    assert stt.base_url == "https://api.groq.com/openai/v1"
    assert stt.model == "whisper-large-v3-turbo"
    assert stt.api_key == "explicit"


def test_config_key_fallback_by_schema(sandbox, monkeypatch):
    monkeypatch.setenv("STT_PROVIDER_API_SCHEMA", "elevenlabs")
    monkeypatch.setenv("ELEVENLABS_API_KEY", "el-fallback")
    assert ta.load_stt_config().api_key == "el-fallback"


def test_config_blank_values_use_defaults(sandbox, monkeypatch):
    # GitHub Actions injects undefined vars/secrets as "".
    for k in ("STT_PROVIDER_API_SCHEMA", "STT_MODEL", "STT_PROVIDER_BASE_URL",
              "STT_PROVIDER_API_KEY"):
        monkeypatch.setenv(k, "")
    monkeypatch.setenv("OPENAI_API_KEY", "sk-x")
    stt = ta.load_stt_config()
    assert (stt.schema, stt.model, stt.base_url, stt.api_key) == \
        ("openai", "gpt-4o-transcribe", None, "sk-x")


def test_config_invalid_schema_raises(sandbox, monkeypatch):
    monkeypatch.setenv("STT_PROVIDER_API_SCHEMA", "grpc")
    with pytest.raises(ValueError, match="unknown STT_PROVIDER_API_SCHEMA"):
        ta.load_stt_config()


# --------------------------------------------------------------------------- #
# Article assembly helpers
# --------------------------------------------------------------------------- #
def test_slugify():
    assert ta.slugify("Hello, World! 2026") == "hello-world-2026"
    assert ta.slugify("***") == "untitled"


def test_build_markdown_shape():
    md = ta.build_markdown(FAKE_META, "2026-05-30")
    assert md.startswith("---\nlayout: article.njk\n")
    assert 'title: "Testing \\"Pipelines\\" Locally"' in md
    assert "date: 2026-05-30" in md
    assert 'category: "CI"' in md
    assert 'tags:\n  - "testing"\n  - "audio"\n' in md
    assert "draft: true" in md
    assert md.rstrip().endswith("Because it works.")


def test_build_markdown_empty_tags():
    md = ta.build_markdown({**FAKE_META, "tags": []}, "2026-05-30")
    assert "tags: []" in md


def test_build_markdown_rejects_frontmatter_injection():
    """A newline-bearing category/tag must not inject extra YAML keys."""
    meta = {
        **FAKE_META,
        "category": "CI\npermalink: /pwn/\ndraft: false",
        "tags": ["safe", "x\nlayout: injected.njk"],
    }
    md = ta.build_markdown(meta, "2026-05-30")
    front = md.split("---", 2)[1]
    # No injected key may appear as its own front-matter line; newlines in the
    # untrusted scalars are collapsed and the whole value is quoted on one line.
    front_keys = {
        line.split(":", 1)[0].strip()
        for line in front.splitlines()
        if line and not line.startswith(" ") and ":" in line
    }
    assert "permalink" not in front_keys
    assert "category: \"CI permalink: /pwn/ draft: false\"" in md
    assert '  - "x layout: injected.njk"' in md
    # Exactly one draft line, and it is the real gate.
    assert md.count("\ndraft: true\n") == 1
    assert "\ndraft: false\n" not in md
    assert "\nlayout: injected.njk\n" not in md


def test_coerce_tags_handles_non_list():
    # A bare string must become ONE tag, not one tag per character.
    assert ta._coerce_tags("python") == ["python"]
    assert ta._coerce_tags(None) == []
    assert ta._coerce_tags(["a", " b ", "", "  "]) == ["a", "b"]


def test_extract_json_tolerates_fences_and_prose():
    assert ta._extract_json('```json\n{"a": 1}\n```') == {"a": 1}
    assert ta._extract_json('Sure!\n{"a": 2}\nDone.') == {"a": 2}


def test_unique_article_path_avoids_collision(sandbox):
    _, _, _, _, articles = sandbox
    (articles / "dup.md").write_text("x")
    assert ta.unique_article_path("dup").name == "dup-2.md"


# --------------------------------------------------------------------------- #
# Full pipeline (E2E with fake backends)
# --------------------------------------------------------------------------- #
def test_process_file_offline(sandbox, fake_backends, monkeypatch):
    _, _, inbox, processed, articles = sandbox
    # Skip ffmpeg so this runs anywhere; backends are faked anyway.
    monkeypatch.setattr(ta, "prepare_chunks", lambda src, workdir: [src])

    audio = inbox / "episode.m4a"
    audio.write_bytes(b"\x00" * 16)

    stt = ta.BackendConfig("openai", "m", "k", None)
    out = ta.process_file(audio, stt, stt, "2026-05-30")

    assert out == articles / "testing-pipelines-locally.md"
    body = out.read_text()
    assert "draft: true" in body and "## Why test" in body
    assert not audio.exists()              # source audio deleted after transcription
    assert not processed.exists()          # never archived back into the repo


def test_main_full_run(sandbox, fake_backends, monkeypatch):
    _, _, inbox, processed, articles = sandbox
    monkeypatch.setattr(ta, "prepare_chunks", lambda src, workdir: [src])
    monkeypatch.setattr(ta.shutil, "which", lambda name: "/usr/bin/ffmpeg")
    monkeypatch.setenv("OPENAI_API_KEY", "sk-x")

    (inbox / "talk.mp3").write_bytes(b"\x00" * 16)
    assert ta.main() == 0
    assert (articles / "testing-pipelines-locally.md").exists()
    assert not (inbox / "talk.mp3").exists()   # source deleted, not archived


def test_main_no_audio_is_noop(sandbox):
    assert ta.main() == 0


def test_main_missing_key_fails(sandbox, monkeypatch):
    _, _, inbox, _, _ = sandbox
    monkeypatch.setattr(ta.shutil, "which", lambda name: "/usr/bin/ffmpeg")
    (inbox / "talk.mp3").write_bytes(b"\x00" * 16)
    assert ta.main() == 1  # no OPENAI_API_KEY / STT_PROVIDER_API_KEY


@pytest.mark.skipif(not HAVE_FFMPEG, reason="ffmpeg not installed")
def test_pipeline_with_real_ffmpeg(sandbox, fake_backends):
    """Exercise the real ffmpeg compression path with faked transcription."""
    _, _, inbox, processed, articles = sandbox
    audio = inbox / "real.wav"
    _make_audio(audio)

    stt = ta.BackendConfig("openai", "m", "k", None)
    out = ta.process_file(audio, stt, stt, "2026-05-30")

    assert out.exists()
    assert not audio.exists()   # source deleted after transcription
