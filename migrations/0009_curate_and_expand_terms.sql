-- Redaktionell kvalitetsgallring efter 0008.
-- En publicerad post ska visa ett verkligt språkglapp: samma vardagliga ord eller
-- uttryck leder enligt en etablerad språkkälla till en annan rimlig läsning än
-- den betydelse, klassificering eller rättsverkan som en offentlig institution
-- faktiskt använder. Ren fackprecision utan materiell skillnad räcker inte.

-- Poster från 0008 som främst visade juridiska rekvisit eller fackdefinitioner,
-- men inte ett tillräckligt tydligt allmänspråk–institutionsglapp, arkiveras.
UPDATE published_terms
SET status = 'archived', updated_at = datetime('now')
WHERE LOWER(TRIM(term)) IN (
  'hävd',
  'konsument',
  'vara',
  'trafikant',
  'bedrägeri',
  'stöld'
);

-- "Sambo" behålls, men den tidigare familjerättsliga posten ersätts med ett
-- tydligare exempel från officiell statistik där etiketten skapas genom en
-- registermodell och därför inte nödvändigtvis motsvarar ett faktiskt parförhållande.
UPDATE published_terms
SET rattsomrade = 'Officiell statistik',
    allmansprak = 'I vanligt språk är en sambo en person som lever tillsammans med sin partner i ett parförhållande utan att vara gift. Ordet beskriver alltså en faktisk relation mellan personerna, inte bara att två vuxna råkar vara folkbokförda på samma adress.',
    sprak_kalla_namn = 'Svenska Akademiens ordböcker: sambo',
    sprak_kalla_url = 'https://svenska.se/?q=sambo',
    institution = 'I SCB:s registerbaserade hushållsstatistik kan personer utan gemensamma barn klassificeras som ett sambopar utifrån registeruppgifter: de ska bland annat vara minst 18 år, vara folkbokförda i samma lägenhet, ha olika kön, ha mindre än 15 års åldersskillnad, inte vara nära släkt och bara ett möjligt sambopar ska kunna bildas i hushållet.',
    institution_kalla_namn = 'SCB: Hushållsstatistik – definition av sambopar',
    institution_kalla_url = 'https://www.statistikdatabasen.scb.se/pxweb/sv/ssd/START__BE__BE0101__BE0101S/HushallT07CKM/',
    skillnad = 'Ordboksordet sambo beskriver ett faktiskt parförhållande. SCB:s statistik kan däremot tilldela sambokategorin genom en registerbaserad modell utan uppgift om personerna själva betraktar sig som ett par. Statistikens ”sambo” är därför inte alltid samma sak som allmänspråkets sambo.',
    notering = 'SCB redovisar kriterierna öppet. Skillnaden är viktig när hushållsstatistik läses som om kategorierna vore direkta uppgifter om människors verkliga relationer.',
    status = 'published',
    updated_at = datetime('now')
WHERE LOWER(TRIM(term)) = 'sambo';

INSERT OR IGNORE INTO published_terms
(term, rattsomrade, allmansprak, sprak_kalla_namn, sprak_kalla_url,
 institution, institution_kalla_namn, institution_kalla_url, skillnad, notering)
VALUES
(
 'Delgiven',
 'Förvaltning och domstol',
 'Att delge någon något betyder i vanligt språk att meddela eller överlämna information så att mottagaren får del av den. Ordet för tanken till att informationen faktiskt har nått personen.',
 'Svenska Akademiens ordböcker: delge',
 'https://svenska.se/?q=delge',
 'Vid förenklad delgivning behöver mottagaren inte bekräfta att handlingen har tagits emot. Sveriges Domstolar anger att mottagaren normalt är delgiven två veckor efter att den första handlingen skickades.',
 'Sveriges Domstolar: Förenklad delgivning',
 'https://www.domstol.se/amnen/kallad-till-domstol/forenklad-delgivning/',
 'Allmänspråkets delgiven pekar mot att någon faktiskt har fått informationen. I det juridiska systemet kan personen i stället anses delgiven vid en bestämd tidpunkt genom en lagreglerad presumtion, utan kvitto på faktisk läsning eller mottagandebekräftelse.',
 'Skillnaden kan få direkt betydelse eftersom tidsfrister för exempelvis svar eller överklagande kan börja räknas från delgivningstidpunkten.'
),
(
 'Allmän handling',
 'Offentlighetsrätt',
 'Allmän betyder i vanligt språk bland annat något som gäller, tillhör eller är tillgängligt för alla. Uttrycket ”allmän handling” kan därför naturligt läsas som en handling som allmänheten får ta del av.',
 'Svenska Akademiens ordböcker: allmän',
 'https://svenska.se/?q=allm%C3%A4n',
 'I offentlighetsrätten betyder allmän handling att handlingen uppfyller grundlagens krav på bland annat förvaring hos myndighet och att den är inkommen eller upprättad. En allmän handling kan samtidigt innehålla sekretessbelagda uppgifter och därför helt eller delvis vara hemlig.',
 'Regeringen: Offentlighetsprincipen – kortfattat om lagstiftningen',
 'https://www.regeringen.se/regeringens-politik/grundlagar-och-integritet/offentlighetsprincipen---kortfattat-om-lagstiftningen/',
 'I vanligt språk ligger ”allmän” nära offentlig eller tillgänglig för alla. I myndighetsspråket är ”allmän handling” först en rättslig klassificering; frågan om handlingen faktiskt är offentlig prövas därefter mot sekretessreglerna.',
 'Det är därför fullt möjligt att en handling samtidigt är allmän och inte får lämnas ut i sin helhet.'
),
(
 'Känsliga personuppgifter',
 'Dataskydd',
 'Känslig används allmänspråkligt om något som är ömtåligt, privat eller kräver varsam behandling. Uppgifter som personnummer, lön eller uppgifter om brott kan därför utan juridisk specialkunskap uppfattas som självklart känsliga personuppgifter.',
 'Svenska Akademiens ordböcker: känslig',
 'https://svenska.se/?q=k%C3%A4nslig',
 'I dataskyddsförordningen är ”känsliga personuppgifter” en särskild juridisk kategori med bestämda typer av uppgifter. IMY anger uttryckligen att personnummer och samordningsnummer inte räknas som känsliga personuppgifter enligt GDPR, även om de är extra skyddsvärda. Även andra integritetskänsliga uppgifter kan ligga utanför den juridiska kategorin.',
 'IMY: Känsliga personuppgifter',
 'https://www.imy.se/verksamhet/dataskydd/det-har-galler-enligt-gdpr/introduktion-till-gdpr/personuppgifter/kansliga-personuppgifter/',
 'Allmänspråkets känslig beskriver hur privat eller skyddsvärd en uppgift är. GDPR:s ”känsliga personuppgifter” är däremot ett avgränsat termbegrepp. En uppgift kan alltså vara mycket känslig i vanlig svenska utan att juridiskt tillhöra kategorin känsliga personuppgifter.',
 'Skillnaden är praktiskt viktig när myndigheter och organisationer beskriver vilka dataskyddsregler som gäller för olika uppgifter.'
),
(
 'Arbetslös',
 'Officiell statistik',
 'Arbetslös betyder i vanligt språk att en person saknar arbete. Ordet säger i sig inte att personen måste ha sökt arbete under en viss period eller kunna börja inom ett bestämt antal dagar.',
 'Svenska Akademiens ordböcker: arbetslös',
 'https://svenska.se/?q=arbetsl%C3%B6s',
 'I SCB:s Arbetskraftsundersökningar räknas som arbetslös den som varit utan arbete under referensveckan och antingen sökt arbete under de senaste fyra veckorna eller väntar på ett arbete som börjar inom tre månader. Personen ska också kunna börja arbeta direkt eller inom två veckor.',
 'SCB: Vem är arbetslös i Arbetskraftsundersökningarna?',
 'https://www.scb.se/hitta-statistik/artiklar/2026/vem-ar-arbetslos-i-arbetskraftsundersokningarna/',
 'En person kan sakna arbete i vanlig mening men ändå inte räknas som arbetslös i den officiella statistiken, exempelvis om personen inte aktivt söker arbete och därför placeras utanför arbetskraften. Omvänt kan en heltidsstuderande räknas som arbetslös om kriterierna är uppfyllda.',
 'SCB använder en internationellt harmoniserad statistisk definition. Skillnaden är central när arbetslöshetstal tolkas som om de beskrev alla människor som saknar jobb.'
),
(
 'Sysselsatt',
 'Officiell statistik',
 'Sysselsatt betyder i vanligt språk att någon är verksam eller upptagen med arbete eller annan aktivitet. I arbetsmarknadssammanhang låter ordet normalt som att personen faktiskt har en meningsfull omfattning av arbete.',
 'Svenska Akademiens ordböcker: sysselsatt',
 'https://svenska.se/?q=sysselsatt',
 'I SCB:s Arbetskraftsundersökningar kan en person klassificeras som sysselsatt om personen har arbetat minst en timme under referensveckan. Även vissa personer som tillfälligt varit frånvarande från sitt arbete räknas som sysselsatta.',
 'SCB: Arbetskraftsundersökningarna – vad innebär sysselsatt?',
 'https://www.scb.se/hitta-statistik/statistik-efter-amne/arbetsmarknad/utbud-av-arbetskraft/arbetskraftsundersokningarna-aku/pong/publikationer/arbetskraftsundersokningarna-aku-20241---tema-aldres-deltagande-pa-arbetsmarknaden-20012023/',
 'I vanligt språk signalerar sysselsatt ett faktiskt arbetsengagemang. I arbetsmarknadsstatistiken är det en mätkategori där så lite som en timmes arbete under en vecka kan vara tillräckligt.',
 'Skillnaden gör att ”antal sysselsatta” inte bör läsas som ett mått på hur många som arbetar heltid eller ens i någon större omfattning.'
),
(
 'Barn',
 'Officiell statistik',
 'Barn betyder i vanligt språk främst en människa som ännu inte är vuxen. Ordet används också om någons son eller dotter, men i samhällsstatistik läses ”barn” lätt som en ålderskategori.',
 'Svenska Akademiens ordböcker: barn',
 'https://svenska.se/?q=barn',
 'I SCB:s registerbaserade hushållsstatistik definieras en person som barn oavsett ålder när personen ingår i ett hushåll med minst en förälder och själv saknar barn eller partner i samma hushåll.',
 'SCB: Hushåll i Sverige',
 'https://www.scb.se/hitta-statistik/sverige-i-siffror/manniskorna-i-sverige/hushall-i-sverige',
 'Allmänspråkets barn fungerar ofta som åldersbegrepp. I den här statistiken är barn i stället en hushållsställning. En vuxen person kan därför redovisas som barn.',
 'SCB anger uttryckligen ”oavsett ålder”. Det är en viktig läsanvisning när statistik om hushåll ”med barn” eller hushållsställning används.'
),
(
 'Hushåll',
 'Officiell statistik',
 'Ett hushåll är i vanligt språk de personer som faktiskt bor och lever tillsammans i ett hem, ofta med en gemensam vardag eller hushållning.',
 'Svenska Akademiens ordböcker: hushåll',
 'https://svenska.se/?q=hush%C3%A5ll',
 'I SCB:s registerbaserade hushållsstatistik består ett hushåll av de personer som är folkbokförda i samma bostad. Klassificeringen utgår alltså från registeruppgifter om folkbokföring, inte från en direkt observation av vilka som faktiskt bor tillsammans.',
 'SCB: Hushållens boende 2025',
 'https://www.scb.se/hitta-statistik/statistik-efter-amne/boende-bebyggelse-och-mark/bostader-och-boende/hushallens-boende/pong/statistiknyhet/hushallens-boende-2025/',
 'Allmänspråket beskriver ett faktiskt boende- och levnadsförhållande. SCB:s hushåll är en registerbaserad statistisk enhet. Om folkbokföringen och det faktiska boendet skiljer sig åt kan därför statistikens hushåll och vardagsspråkets hushåll också skilja sig.',
 'Detta är inte ett fel i statistiken utan en metodskillnad som behöver vara synlig när resultaten tolkas.'
),
(
 'Hemlöshet',
 'Socialtjänst och statistik',
 'Hemlöshet betyder i vanligt språk att sakna hem eller stadigvarande bostad. Den spontana bilden är ofta en person som helt saknar en egen plats att bo på.',
 'Svenska Akademiens ordböcker: hemlös',
 'https://svenska.se/?q=heml%C3%B6s',
 'Socialstyrelsens kartläggning använder fyra hemlöshetssituationer. Där ingår bland annat personer som bor i långsiktiga boendelösningar ordnade av socialtjänsten, exempelvis träningslägenhet, försökslägenhet eller socialt kontrakt med särskilda villkor.',
 'Socialstyrelsen: Hemlösheten fortsatt kvar på hög nivå',
 'https://www.socialstyrelsen.se/om-socialstyrelsen/pressrum/press/hemlosheten-fortsatt-kvar-pa-hog-niva/',
 'Allmänspråket kan ge bilden av att hemlös betyder utan bostad. Socialstyrelsens kartläggningsbegrepp omfattar även människor som faktiskt bor i en lägenhet men saknar en självständig och trygg position på den ordinarie bostadsmarknaden.',
 'Den bredare definitionen fyller ett socialpolitiskt syfte, men den behöver vara känd när antalet ”personer i hemlöshet” tolkas.'
),
(
 'Grundläggande behov',
 'Socialförsäkring',
 'Grundläggande behov låter i vanligt språk som de mest elementära saker en människa behöver för att klara vardagen och leva. Uttrycket har ingen naturlig vardaglig lista med ett bestämt antal godkända behov.',
 'Svenska Akademiens ordböcker: grundläggande och behov',
 'https://svenska.se/?q=grundl%C3%A4ggande%20behov',
 'Vid assistansersättning använder Försäkringskassan ”grundläggande behov” som en avgränsad rättslig kategori. Myndigheten räknar bland annat andning, personlig hygien, måltider, av- och påklädning, kommunikation och vissa särskilt angivna stödbehov, och ställer dessutom detaljerade villkor för vad inom dessa områden som räknas.',
 'Försäkringskassan: Så beräknas grundläggande behov',
 'https://www.forsakringskassan.se/privatperson/vuxen-med-funktionsnedsattning/assistansersattning/sa-beraknas-grundlaggande-behov',
 'I allmänspråket beskriver uttrycket en bred idé om nödvändiga mänskliga behov. I assistanssystemet fungerar samma ord som namn på en uttömmande eller starkt avgränsad juridisk prövningskategori där allt som känns grundläggande i vardagen inte automatiskt räknas.',
 'Skillnaden kan få direkt betydelse för om och i vilken omfattning assistansersättning beviljas.'
),
(
 'Arbetsskada',
 'Socialförsäkring',
 'Arbetsskada läses naturligt som en skada som uppkommer medan man arbetar eller på arbetsplatsen.',
 'Svenska Akademiens ordböcker: arbetsskada',
 'https://svenska.se/?q=arbetsskada',
 'Försäkringskassan anger att arbetsskada även kan vara en skada som inträffar på väg till eller från jobbet. Begreppet omfattar dessutom vissa sjukdomar som orsakats av arbetet eller av smitta i särskilda arbeten.',
 'Försäkringskassan: Skador i arbetet',
 'https://www.forsakringskassan.se/arbetsgivare/sjukdom-och-skada/skador-i-arbetet',
 'Ordet pekar i vanligt språk mot en skada i själva arbetssituationen. Socialförsäkringens arbetsskadebegrepp kan sträcka sig utanför arbetsplatsen och den arbetade tiden, exempelvis till färdolycksfall.',
 'Det är en materiell utvidgning som påverkar vilka händelser som ska anmälas och kan prövas som arbetsskador.'
),
(
 'Vårdskada',
 'Hälso- och sjukvård',
 'Vårdskada kan i vanligt språk förstås som en skada som en patient får i samband med vård, oavsett varför den uppstod eller om den gick att undvika.',
 'Svenska Akademiens ordböcker: vård och skada',
 'https://svenska.se/?q=v%C3%A5rd%20skada',
 'I patientsäkerhetsarbetet krävs mer än att en skada har inträffat i vården. Socialstyrelsen anger att det för att räknas som vårdskada måste vara fråga om lidande, kroppslig eller psykisk skada, sjukdom eller dödsfall som hade kunnat undvikas om adekvata åtgärder hade vidtagits.',
 'Socialstyrelsen: Utreda en händelse – vårdskada',
 'https://patientsakerhet.socialstyrelsen.se/arbeta-sakert/forebyggande-arbete/utreda-en-handelse/',
 'I vardaglig läsning kan varje skada som uppstår under vård kallas vårdskada. I patientsäkerhetslagens terminologi är undvikbarheten en central del av begreppet.',
 'En komplikation eller skada kan därför vara verklig utan att klassificeras som vårdskada i den särskilda juridiska betydelsen.'
),
(
 'Gående',
 'Trafikrätt',
 'Gående betyder i vanligt språk en person som går till fots.',
 'Svenska Akademiens ordböcker: gående',
 'https://svenska.se/?q=g%C3%A5ende',
 'Transportstyrelsen anger att trafikreglerna för gående också gäller bland annat den som åker rullskidor, rullskridskor eller spark, leder cykel eller motorcykel, skjuter barnvagn eller rullstol samt i vissa fall själv för rullstol eller annat hjälpmedelsfordon i gångfart.',
 'Transportstyrelsen: Gående',
 'https://www.transportstyrelsen.se/sv/vagtrafik/trafikregler-och-vagmarken/trafikregler/gaende-rullstolsburen-rullskridskor/gaende/',
 'Allmänspråket beskriver sättet att förflytta sig: att gå. Trafikreglernas kategori ”gående” omfattar däremot flera personer som inte går alls.',
 'Skillnaden är praktisk eftersom samma trafikregler kan gälla personer på andra färd- eller hjälpmedel än vad ordet gående antyder.'
),
(
 'Cykel',
 'Trafikrätt',
 'En cykel är i vanligt språk ett fordon som man typiskt färdas på med hjul och pedaler. En elsparkcykel benämns just som sparkcykel och uppfattas inte språkligt som samma slags fordon.',
 'Svenska Akademiens ordböcker: cykel',
 'https://svenska.se/?q=cykel',
 'Transportstyrelsen anger att en elsparkcykel som uppfyller vissa tekniska krav klassas som cykel i trafiken. För den vanliga typen gäller bland annat högst 20 km/tim och högst 250 watts kontinuerlig märkeffekt.',
 'Transportstyrelsen: Elsparkcykel',
 'https://www.transportstyrelsen.se/elsparkcykel',
 'I allmänspråket är cykel och elsparkcykel olika fordonsord. I trafikreglerna kan en elsparkcykel juridiskt vara en cykel, vilket innebär att cykelreglerna blir tillämpliga.',
 'Det juridiska klassificeringsordet avgör vilka trafikregler som gäller och är därför mer än en språklig kuriositet.'
),
(
 'Miljöfarlig verksamhet',
 'Miljörätt',
 'Miljöfarlig verksamhet låter i vanligt språk som en verksamhet som är farlig för miljön, alltså något med en tydlig eller allvarlig miljörisk.',
 'Svenska Akademiens ordböcker: miljöfarlig',
 'https://svenska.se/?q=milj%C3%B6farlig',
 'Miljöbalkens begrepp är betydligt bredare. Det omfattar bland annat användning av mark, byggnader eller anläggningar som kan medföra utsläpp, förorening, buller, skakningar, ljus eller annan störning. Naturvårdsverket beskriver exempelvis väg-, spår-, flygplats- och hamnverksamhet som miljöfarlig verksamhet i bullersammanhang.',
 'Sveriges riksdag: Miljöbalk (1998:808), 9 kap. 1 §',
 'https://www.riksdagen.se/sv/dokument-och-lagar/dokument/svensk-forfattningssamling/miljobalk-1998808_sfs-1998-808/',
 'Vardagsspråkets ”miljöfarlig” signalerar fara. I miljöbalken fungerar uttrycket som en bred regleringskategori och kan omfatta helt normala verksamheter därför att de orsakar eller kan orsaka vissa typer av störningar.',
 'Den rättsliga etiketten betyder alltså inte i sig att verksamheten har bedömts som farlig i vardaglig mening.'
),
(
 'Olägenhet för människors hälsa',
 'Miljö och hälsoskydd',
 'Olägenhet betyder i vanligt språk ett besvär, en nackdel eller något obehagligt. Uttrycket ”olägenhet för människors hälsa” kan därför läsas som vilket hälsorelaterat besvär som helst.',
 'Svenska Akademiens ordböcker: olägenhet',
 'https://svenska.se/?q=ol%C3%A4genhet',
 'I miljöbalkens hälsoskydd är uttrycket en särskild tröskel. Folkhälsomyndigheten beskriver att störningen ska bedömas medicinskt eller hygieniskt, ha viss varaktighet eller vara återkommande och att ringa eller helt tillfälliga störningar inte omfattas.',
 'Folkhälsomyndigheten: Bedömning av olägenhet för människors hälsa',
 'https://www.folkhalsomyndigheten.se/publikationer-och-material/publikationsarkiv/v/vagledning-for-bedomning-av-olagenheter-for-manniskors-halsa-till-foljd-av-langvarig-exponering-for-lagfrekventa-magnetfalt/?pub=136972',
 'Ordboksordet olägenhet är brett. Myndighetsbegreppet är smalare och innehåller en medicinsk eller hygienisk bedömning samt en tröskel för varaktighet och omfattning.',
 'Att någon upplever ett verkligt besvär betyder därför inte automatiskt att en ”olägenhet för människors hälsa” föreligger i miljöbalkens mening.'
),
(
 'Offentlig plats',
 'Ordningsrätt',
 'En offentlig plats är i vanligt språk en plats som är öppen eller tillgänglig för allmänheten. Orden beskriver främst hur människor faktiskt kan komma åt platsen.',
 'Svenska Akademiens ordböcker: offentlig',
 'https://svenska.se/?q=offentlig',
 'Ordningslagen definierar offentlig plats genom särskilda kategorier: bland annat allmänna vägar, vissa gator, torg och parker, hamnområden samt andra mark- och inomhusutrymmen som stadigvarande används för allmän trafik. Kommuner kan dessutom låta vissa andra områden jämställas med offentlig plats.',
 'Sveriges riksdag: Ordningslag (1993:1617), 1 kap. 2 §',
 'https://www.riksdagen.se/sv/dokument-och-lagar/dokument/svensk-forfattningssamling/ordningslag-19931617_sfs-1993-1617/',
 'Allmänspråket utgår från faktisk öppenhet för allmänheten. Ordningslagens ”offentlig plats” är en lagteknisk kategori som beror på platsens rättsliga och planmässiga status och kan dessutom utvidgas genom lokala föreskrifter.',
 'Begreppet spelar roll eftersom bland annat tillståndskrav och ordningsföreskrifter knyts till om en plats är offentlig i lagens mening.'
),
(
 'Tomt',
 'Plan- och byggrätt',
 'Tomt betyder i vanligt språk ett avgränsat markområde för ett hus eller annan bebyggelse och uppfattas ofta som den markbit som hör till en fastighet.',
 'Svenska Akademiens ordböcker: tomt',
 'https://svenska.se/?q=tomt',
 'Boverket betonar att tomt i plan- och bygglagen inte är samma sak som fastighet. En PBL-tomt kan vara en del av en fastighet, omfatta flera fastigheter eller vara en av flera tomter inom samma fastighet. Avgränsningen bestäms av markens funktion kring byggnaden, inte av fastighetsgränsen.',
 'Boverket: Vad är en tomt?',
 'https://www.boverket.se/sv/PBL-kunskapsbanken/lov--byggande/anmalningsplikt/vad-ar-en-tomt/',
 'I vanligt språk sammanfaller tomten lätt med den fastighetsrättsliga markbiten. I PBL är tomt ett funktionellt område runt bebyggelse och behöver inte följa fastighetsindelningen alls.',
 'Boverket skriver uttryckligen att tomt inte är samma sak som fastighet. Skillnaden kan påverka hur bygg- och lovregler ska förstås.'
),
(
 'Flykting',
 'Migration',
 'Flykting används i vanligt språk brett om en person som har flytt från krig, förföljelse, katastrof eller annan allvarlig fara.',
 'Svenska Akademiens ordböcker: flykting',
 'https://svenska.se/?q=flykting',
 'Migrationsverket använder flykting som en bestämd skyddsstatus. Myndigheten beskriver en flykting som en person som har ansökt om asyl och fått uppehållstillstånd på grund av välgrundad fruktan för förföljelse på vissa angivna grunder.',
 'Migrationsverket: Flykting',
 'https://www.migrationsverket.se/ordforklaringar/flykting.html',
 'Allmänspråkets flykting kan omfatta människor som flyr många slags faror. I migrationsrätten är flykting en snävare rättslig kategori. En person kan alltså ha flytt sitt land och behöva skydd utan att just klassificeras som flykting enligt den juridiska definitionen.',
 'Andra skyddsgrunder och statuskategorier kan vara aktuella. Posten beskriver därför ordskillnaden, inte vem som har rätt att stanna i ett enskilt fall.'
),
(
 'Tätort',
 'Officiell statistik',
 'Tätort betyder i vanligt språk en tätbebyggd ort, ofta något som uppfattas som en stad, ett samhälle eller en tydligt namngiven bebyggelse.',
 'Svenska Akademiens ordböcker: tätort',
 'https://svenska.se/?q=t%C3%A4tort',
 'I SCB:s statistik är en tätort en statistiskt avgränsad sammanhängande bebyggelse med minst 200 invånare. Avgränsningen är oberoende av kommun- och andra administrativa gränser och kan därför skära genom sådana gränser.',
 'SCB: Tätorter i Sverige',
 'https://www.scb.se/hitta-statistik/sverige-i-siffror/miljo/tatorter-i-sverige/',
 'Vardagsspråkets tätort är ett geografiskt vardagsbegrepp. SCB:s tätort är ett mätobjekt som skapas genom en bestämd statistisk metod och befolkningströskel.',
 'SCB varnar själv för att statistisk tätort inte ska blandas ihop med administrativa indelningar.'
),
(
 'Ö',
 'Officiell statistik',
 'En ö är i vanligt språk ett naturligt landområde som är omgivet av vatten. Ordet för tanken till en geografisk landmassa, inte till konstruktioner eller små artificiella ytor.',
 'Svenska Akademiens ordböcker: ö',
 'https://svenska.se/?q=%C3%B6',
 'SCB:s officiella statistik räknar även öar omgärdade av konstgjorda vattenarealer och konstgjorda öar, exempelvis pirar, öar i dammar och slott helt omgärdade av vallgrav. SCB skriver uttryckligen att definitionen är ett modellantagande och att den kan skilja sig från användarnas förväntningar på vad en ö är.',
 'SCB:s ordlista: statistisk ö',
 'https://www.scb.se/dokumentation/ordlista/',
 'Ordboksordet ö beskriver en geografisk landmassa omgiven av vatten. I SCB:s statistik är ”ö” resultatet av en geografisk modell som också tar med vissa konstgjorda objekt och vattenytor.',
 'Det är ett ovanligt tydligt exempel eftersom SCB självt uppmärksammar att myndighetens definition kan avvika från användarnas förväntningar.'
);