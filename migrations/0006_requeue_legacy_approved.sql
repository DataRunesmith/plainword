-- Äldre approved-submissions saknar den strukturerade publiceringsdata som krävs
-- av published_terms. Flytta tillbaka dem till kön i stället för att visa dem
-- via ett parallellt legacy-flöde.
UPDATE submissions
SET status = 'pending',
    reviewed_at = NULL,
    reviewer_note = CASE
      WHEN reviewer_note IS NULL OR TRIM(reviewer_note) = ''
        THEN 'Återförd till granskning vid migrering till published_terms.'
      ELSE reviewer_note || '\nÅterförd till granskning vid migrering till published_terms.'
    END
WHERE status = 'approved'
  AND NOT EXISTS (
    SELECT 1 FROM published_terms p WHERE p.submission_id = submissions.id
  );
