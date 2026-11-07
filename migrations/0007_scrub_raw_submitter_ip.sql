-- Raw submitter IPs were only needed for rate limiting. New writes store
-- a keyed HMAC identity instead, so remove historical raw values.
UPDATE submissions
SET submitter_ip = NULL
WHERE submitter_ip IS NOT NULL
  AND submitter_ip NOT LIKE 'hmac-sha256:%';
