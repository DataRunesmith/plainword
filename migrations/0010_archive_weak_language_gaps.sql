-- Hårdare redaktionell gallring.
-- Dessa poster är sakligt relevanta fackdefinitioner men visar inte ett tillräckligt
-- starkt, överraskande eller samhälleligt betydelsefullt språkglapp för Plainwords
-- publika katalog. De arkiveras i stället för att raderas så att historiken bevaras.

UPDATE published_terms
SET status = 'archived', updated_at = datetime('now')
WHERE LOWER(TRIM(term)) IN (
  'gående',
  'hushåll',
  'vårdskada',
  'arbetsskada',
  'miljöfarlig verksamhet',
  'olägenhet för människors hälsa',
  'offentlig plats',
  'tätort'
);
