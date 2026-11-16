---
name: pin-actions
description: Check that every GitHub Actions `uses:` reference is pinned to a full 40-character commit SHA.
---

1. List all `uses:` lines in `.github/workflows/*.yml`.
2. Report every reference that is not `@<40 hex characters>` (local `./` actions excepted).
3. Never hand-edit `.github/workflows/actions.lock`; it is machine-generated.
4. Workflows are changed only by Renovate or Dependabot. Report findings instead of editing.
