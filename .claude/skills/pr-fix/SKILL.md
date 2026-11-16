---
name: pr-fix
description: Fix review findings or failing CI on a pull request following the working rules in CLAUDE.md.
disable-model-invocation: true
---

Fix the findings or failing checks on the given pull request.

1. Read every open review thread and the failing CI logs.
2. Find the root cause and the whole class of problem it belongs to.
3. Read the entire affected file, not only the flagged lines.
4. Add a test for every case found. Each new test must fail without the fix.
5. Review the full diff, run the full test suite (`npm test`), then push once.
6. Enable auto-merge on the pull request.
7. Never dismiss a code scanning alert or resolve a security finding to get green. Never merge manually.
