-- Flyttar de fem redaktionella pilotposterna från public/index.html till den
-- normaliserade publiceringsmodellen. INSERT OR IGNORE gör migrationen säker
-- om en term redan har publicerats manuellt före deploy.

INSERT OR IGNORE INTO published_terms
(term, rattsomrade, allmansprak, sprak_kalla_namn, sprak_kalla_url,
 institution, institution_kalla_namn, institution_kalla_url, skillnad, notering)
VALUES
(
 'Skälig misstanke',
 'Straffprocess',
 'Ordet skälig används allmänspråkligt om något som är rimligt eller befogat. Läser man uttrycket utan juridisk specialkunskap blir det därför ungefär en misstanke som har rimliga eller godtagbara skäl bakom sig.',
 'Svenska Akademiens ordböcker: skälig',
 'https://svenska.se/?q=sk%C3%A4lig',
 'I rättsväsendet är skälig misstanke namnet på en bestämd misstankegrad. Åklagarmyndigheten beskriver den som lägre än sannolika skäl; i vissa situationer är graden kopplad till möjligheten att använda tvångsmedel och i undantagsfall häktning.',
 'Åklagarmyndigheten: Skälig misstanke',
 'https://www.aklagare.se/ordlista/s/skalig-misstanke/',
 'Allmänspråkets ”skälig” anger att något framstår som rimligt eller befogat. I straffprocessen fungerar hela uttrycket dessutom som en namngiven nivå i en juridisk skala. Tröskeln går alltså inte att läsa ut enbart ur adjektivet skälig.',
 'Rättsliga källor beskriver nivån relativt andra misstankegrader; någon enkel procentsats finns inte.'
),
(
 'Sannolika skäl',
 'Straffprocess',
 'Sannolik används om något som efter vad man kan bedöma framstår som troligt eller kan antas vara sant. Tillsammans med skäl låter uttrycket därför som skäl som gör något troligt.',
 'Svenska Akademiens ordbok: sannolik',
 'https://svenska.se/saob/?id=S_01063-0042.8n4M',
 'Åklagarmyndigheten använder sannolika skäl som den högre av de två centrala misstankegraderna vid anhållande och häktning. Att graden är uppnådd är i regel ett villkor för häktning.',
 'Åklagarmyndigheten: Sannolika skäl',
 'https://www.aklagare.se/ordlista/s/sannolika-skal/',
 'I vanligt språk beskriver sannolik hur troligt något verkar. I straffprocessen är ”sannolika skäl” en teknisk tröskel som dessutom definieras genom sin plats över ”skälig misstanke”. Den institutionella betydelsen innehåller alltså en skala som orden i sig inte anger.',
 'Även här är det fråga om en rättslig bedömning, inte en uttrycklig numerisk sannolikhet.'
),
(
 'Bortom rimligt tvivel',
 'Bevisrätt',
 'Uttrycket är sammansatt av vanliga ord. Rimlig används om något som är befogat eller förnuftigt att godta, och tvivel om osäkerhet eller tvekan. Bokstavligt pekar frasen därför mot att inget befogat tvivel ska återstå.',
 'Svenska Akademiens ordböcker: rimlig',
 'https://svenska.se/?q=rimlig',
 'I brottmål används uttrycket som det stränga beviskravet för en fällande dom. Offentliga rättskällor beskriver tillämpningen som att rimliga alternativa förklaringar ska vara uteslutna; kravet är högt men beskrivs inte som absolut hundraprocentig visshet.',
 'Sveriges riksdag, SOU 2012:12 om beviskravet',
 'https://www.riksdagen.se/sv/dokument-och-lagar/dokument/statens-offentliga-utredningar/penningtvatt-kriminalisering-forverkande-och_h0b312/html/',
 'Här ligger skillnaden mindre i ordens lexikala betydelse än i att rättssystemet har gjort frasen till en särskild bevisstandard. Vad som räknas som ett ”rimligt” kvarvarande tvivel avgörs genom rättslig bevisvärdering, inte genom en ordboksdefinition.',
 'Den här posten är därför ett exempel på hur ett vardagligt uttryck kan få en institutionellt kalibrerad funktion utan att själva orden byts ut.'
),
(
 'Särskilda skäl',
 'Lagstiftning',
 'Särskild markerar i vanligt språk något avskilt, speciellt eller utpekat i förhållande till det allmänna. ”Särskilda skäl” kan därför läsas som skäl som skiljer sig från de vanliga.',
 'Svenska Akademiens ordböcker: särskild',
 'https://svenska.se/?q=s%C3%A4rskild',
 'I lagtext används ”särskilda skäl” ofta som en kvalificerad undantagströskel. Riksdagens lagutskott har samtidigt uttryckligen konstaterat att uttryckets innebörd kan variera med rättsområdet och det aktuella regelverket.',
 'Riksdagen, LU 1979/80:15 om särskilda och synnerliga skäl',
 'https://www.riksdagen.se/sv/dokument-och-lagar/dokument/betankande/med-anledning-av-motion-om-andring-av_g301lu15/html/',
 'Ordboksordet särskild beskriver en egenskap. I lagstiftning används frasen som en rättslig tröskel, men tröskelns konkreta höjd går inte att bestämma från orden ensamma. Förarbeten och sammanhanget behövs.',
 'Detta är ett tydligt exempel på varför källan till den institutionella användningen måste visas per regelområde.'
),
(
 'Synnerliga skäl',
 'Lagstiftning',
 'Synnerlig används förstärkande om något särskilt starkt, märkbart eller ovanligt. I vanligt språk signalerar ”synnerliga skäl” därför mycket starka eller exceptionella skäl, men inte en exakt rättslig gräns.',
 'Svenska Akademiens ordböcker: synnerlig',
 'https://svenska.se/?q=synnerlig',
 'I lagstiftning används ”synnerliga skäl” typiskt för en strängare undantagströskel än ”särskilda skäl”. Riksdagens lagutskott har beskrivit uttrycket som vanligt vid mer restriktiv tillämpning och samtidigt betonat att innebörden varierar mellan rättsliga sammanhang.',
 'Riksdagen, LU 1979/80:15 om särskilda och synnerliga skäl',
 'https://www.riksdagen.se/sv/dokument-och-lagar/dokument/betankande/med-anledning-av-motion-om-andring-av_g301lu15/html/',
 'Allmänspråket förmedlar förstärkning, men juridiken använder frasen som en graderad tröskel vars verkliga innehåll bestäms av den aktuella bestämmelsen, förarbeten och praxis. Samma två ord kan därför få olika praktisk räckvidd i olika lagar.',
 'Att synnerliga skäl ofta är strängare än särskilda skäl är en användningsregel, inte en fullständig definition för varje lagrum.'
);
