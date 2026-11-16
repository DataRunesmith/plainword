#!/usr/bin/env bash
# Blocks edits to machine-generated files.
f=$(jq -r '.tool_input.file_path // empty')
case "$f" in
  */.github/workflows/actions.lock|*/bun.lock)
    echo "Blocked: $f is machine-generated. Regenerate it with its tool instead of editing it." >&2
    exit 2 ;;
esac
exit 0
