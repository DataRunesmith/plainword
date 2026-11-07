-- Granskningskö för community-inskickade termförslag.
CREATE TABLE IF NOT EXISTS submissions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  term TEXT NOT NULL,
  foreslagen_juridisk_definition TEXT,
  foreslagen_vardagsbetydelse TEXT,
  foreslagen_exempel TEXT,
  inskickare_namn TEXT,
  inskickare_kommentar TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  reviewed_at TEXT,
  reviewer_note TEXT
);

CREATE INDEX IF NOT EXISTS idx_submissions_status ON submissions(status);
