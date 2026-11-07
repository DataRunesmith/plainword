-- Normaliserad publiceringsmodell. Submissions är granskningskö; published_terms är publik källa.
CREATE TABLE IF NOT EXISTS published_terms (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  submission_id INTEGER UNIQUE,
  term TEXT NOT NULL,
  rattsomrade TEXT NOT NULL DEFAULT 'Annat',
  allmansprak TEXT NOT NULL,
  sprak_kalla_namn TEXT NOT NULL,
  sprak_kalla_url TEXT NOT NULL,
  institution TEXT NOT NULL,
  institution_kalla_namn TEXT NOT NULL,
  institution_kalla_url TEXT NOT NULL,
  skillnad TEXT NOT NULL,
  notering TEXT,
  status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('published', 'archived')),
  published_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (submission_id) REFERENCES submissions(id) ON DELETE SET NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_published_terms_normalized_term
  ON published_terms(LOWER(TRIM(term)));

CREATE INDEX IF NOT EXISTS idx_published_terms_status_term
  ON published_terms(status, LOWER(term));
