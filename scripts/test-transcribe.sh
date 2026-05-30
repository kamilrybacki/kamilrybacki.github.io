#!/usr/bin/env bash
#
# Local test harness for the audio -> draft-article pipeline.
#
# Usage:
#   ./scripts/test-transcribe.sh                # offline pytest suite (mocked APIs)
#   ./scripts/test-transcribe.sh --build        # also verify the Eleventy build hides drafts
#   ./scripts/test-transcribe.sh --live FILE     # REAL end-to-end against your configured
#                                                # providers (uses your STT_*/POLISH_*/*_API_KEY
#                                                # env vars and makes real API calls)
#
# The offline suite needs no network and no API keys. ffmpeg is optional: the
# ffmpeg-specific test self-skips if it's not installed.
set -euo pipefail
cd "$(dirname "$0")/.."

pip_install() {
  python3 -m pip install -q -r scripts/requirements-transcribe.txt -r scripts/requirements-dev.txt
}

run_pytest() {
  echo "==> Running offline pipeline tests (mocked STT + polish)"
  pip_install
  python3 -m pytest tests/ -v
}

# Build the site and assert a draft article is excluded from production output
# while a published article is present. Restores the temp draft on exit.
verify_build_hides_drafts() {
  echo "==> Verifying production build hides draft articles"
  command -v npm >/dev/null || { echo "npm not found; skipping build check"; return 0; }
  [ -d node_modules ] || npm ci

  local draft="src/content/articles/__e2e_draft_check__.md"
  cleanup_draft() { rm -f "$draft"; }
  trap cleanup_draft EXIT

  cat > "$draft" <<'EOF'
---
layout: article.njk
title: "E2E Draft Check"
date: 2026-01-01
category: Test
description: "temporary draft used by test-transcribe.sh"
tags: []
draft: true
---

This must never appear in the production build.
EOF

  npm run build >/dev/null
  if find _site -iname "*e2e-draft-check*" | grep -q .; then
    echo "FAIL: draft article leaked into production build (_site)"; exit 1
  fi
  if ! find _site -iname "*containerized*" | grep -q .; then
    echo "FAIL: expected published article missing from _site"; exit 1
  fi
  cleanup_draft; trap - EXIT
  echo "OK: drafts hidden, published articles built"
}

# Real end-to-end run against the configured providers.
run_live() {
  local file="$1"
  [ -f "$file" ] || { echo "live audio file not found: $file"; exit 1; }
  echo "==> LIVE run: transcribing $file with your configured backends"
  pip_install
  mkdir -p audio-inbox
  cp "$file" "audio-inbox/$(basename "$file")"
  python3 scripts/transcribe_audio.py
  echo "==> Generated draft(s):"
  ls -1 src/content/articles/*.md
  echo "(Review the new draft, then remove the test audio from audio-inbox/processed/ if unwanted.)"
}

case "${1:-}" in
  --live)
    [ $# -ge 2 ] || { echo "usage: $0 --live <audio-file>"; exit 1; }
    run_live "$2"
    ;;
  --build)
    run_pytest
    verify_build_hides_drafts
    ;;
  "")
    run_pytest
    ;;
  *)
    echo "usage: $0 [--build | --live <audio-file>]"; exit 1
    ;;
esac
