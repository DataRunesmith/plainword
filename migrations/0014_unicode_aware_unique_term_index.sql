-- SQLite's LOWER() only folds ASCII, so 'Ärende' and 'ärende' were not duplicates.
-- Fold the Swedish capitals explicitly in the unique index.
DROP INDEX IF EXISTS idx_published_terms_normalized_term;
CREATE UNIQUE INDEX idx_published_terms_normalized_term
  ON published_terms(
    LOWER(REPLACE(REPLACE(REPLACE(TRIM(term), 'Å', 'å'), 'Ä', 'ä'), 'Ö', 'ö'))
  );
