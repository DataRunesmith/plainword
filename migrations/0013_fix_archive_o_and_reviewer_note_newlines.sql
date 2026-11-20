-- SQLite's LOWER() only folds ASCII, so migration 0011 never matched 'Ö'.
UPDATE published_terms
SET status = 'archived', updated_at = datetime('now')
WHERE term = 'Ö' AND status = 'published';

-- Migration 0006 stored a literal backslash-n instead of a line break.
UPDATE submissions
SET reviewer_note = REPLACE(reviewer_note, char(92) || 'n', char(10))
WHERE reviewer_note LIKE '%' || char(92) || 'n%';
