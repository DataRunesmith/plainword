-- Lägger till avsändar-IP för enkel rate-limiting av /api/submit.
ALTER TABLE submissions ADD COLUMN submitter_ip TEXT;

CREATE INDEX IF NOT EXISTS idx_submissions_ip_created ON submissions(submitter_ip, created_at);
