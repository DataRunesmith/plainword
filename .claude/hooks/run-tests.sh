#!/usr/bin/env bash
# Runs the full test suite after edits to code or tests.
f=$(jq -r '.tool_input.file_path // empty')
case "$f" in
  */src/*|*/tools/*|*/test/*|*/public/*) ;;
  *) exit 0 ;;
esac
cd "$CLAUDE_PROJECT_DIR" || exit 0
out=$(npm test 2>&1) || { echo "$out" | tail -40 >&2; exit 2; }
exit 0
