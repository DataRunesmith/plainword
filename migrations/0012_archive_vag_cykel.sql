-- Redaktionell relevansgallring.
-- "Väg" och "Cykel" visar tekniska klassificeringar men är för perifera och
-- för nära definitionskuriosa för Plainwords publika katalog.

UPDATE published_terms
SET status = 'archived', updated_at = datetime('now')
WHERE LOWER(TRIM(term)) IN (
  'väg',
  'cykel'
);
