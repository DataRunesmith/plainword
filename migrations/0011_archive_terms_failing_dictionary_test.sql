-- Nollbaserad redaktionell omprövning av alla tillägg efter de fem pilotposterna.
-- Plainword ska inte jämföra myndighetsbruk mot antagen vardagsintuition.
-- Baslinjen är den dokumenterade ordboksbetydelsen. Om myndighetens användning
-- redan ryms i ordbokens betydelse, eller skillnaden främst består av mätmetod,
-- registermodell eller vanlig fackprecision, ska posten inte vara publicerad.

UPDATE published_terms
SET status = 'archived', updated_at = datetime('now')
WHERE LOWER(TRIM(term)) IN (
  'handling',
  'personuppgift',
  'sysselsatt',
  'barn',
  'sambo',
  'ö',
  'hemlöshet',
  'parkering',
  'fastighet',
  'tomt'
);
