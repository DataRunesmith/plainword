-- Utökar den redaktionella katalogen med källbelagda exempel från flera
-- rättsområden. INSERT OR IGNORE gör migrationen säker att köra flera gånger
-- och respekterar det unika indexet på normaliserad term.

INSERT OR IGNORE INTO published_terms
(term, rattsomrade, allmansprak, sprak_kalla_namn, sprak_kalla_url,
 institution, institution_kalla_namn, institution_kalla_url, skillnad, notering)
VALUES
(
 'Fastighet',
 'Fastighetsrätt',
 'I vanligt språk används fastighet ofta om ett avgränsat markområde med hus och andra byggnader. I bostadssammanhang kan ordet därför lätt uppfattas som själva huset eller hela den bebyggda egendomen.',
 'Svenska Akademiens ordböcker: fastighet',
 'https://svenska.se/?q=fastighet',
 'Jordabalken börjar med den rättsliga utgångspunkten att fast egendom är jord och att jorden är indelad i fastigheter. Byggnader och andra anläggningar kan sedan höra till fastigheten som fastighetstillbehör.',
 'Sveriges riksdag: Jordabalk (1970:994), 1–2 kap.',
 'https://www.riksdagen.se/sv/dokument-och-lagar/dokument/svensk-forfattningssamling/jordabalk-1970994_sfs-1970-994/',
 'Vardagsspråket låter ofta huset stå i centrum. Jordabalkens system utgår i stället från jorden och den rättsligt avgränsade fastigheten; huset behandlas som något som kan höra till fastigheten.',
 'Skillnaden märks bland annat när man behöver avgöra vad som juridiskt följer med en fastighet och vad som är lös egendom.'
),
(
 'Hävd',
 'Fastighetsrätt',
 'I allmänspråk kan hävd syfta på tradition, gammal sed eller på att någon håller fast vid och gör ett anspråk gällande. Ordet anger då inte i sig någon bestämd tidsfrist eller särskild form av äganderättsförvärv.',
 'Svenska Akademiens ordböcker: hävd',
 'https://svenska.se/?q=h%C3%A4vd',
 'I 16 kap. jordabalken är hävd en särskild grund för rätt till fast egendom. Den som har fått lagfart på egendom som kommit ur den rätte ägarens hand och därefter innehaft den med äganderättsanspråk i tjugo år utan talan om bättre rätt kan få rätt till egendomen framför den andre.',
 'Sveriges riksdag: Jordabalk (1970:994), 16 kap. 1 §',
 'https://www.riksdagen.se/sv/dokument-och-lagar/dokument/svensk-forfattningssamling/jordabalk-1970994_sfs-1970-994/',
 'Den juridiska hävden är inte bara att länge påstå eller använda något. Bestämmelsen knyter rättsverkan till bestämda förutsättningar, bland annat lagfart, innehav med äganderättsanspråk och en tjugoårsperiod.',
 'Detta är ett tydligt exempel på ett vardagligt ord som i ett visst rättsområde fungerar som namn på en exakt rättsregel.'
),
(
 'Sambo',
 'Familjerätt',
 'I vanligt språk är en sambo normalt den partner man bor tillsammans med utan att vara gift. Ordet används ofta utan att man uttryckligen prövar hur stadigvarande boendet är eller hur hushållet är organiserat.',
 'Svenska Akademiens ordböcker: sambo',
 'https://svenska.se/?q=sambo',
 'Sambolagen avser två personer som stadigvarande bor tillsammans i ett parförhållande och har gemensamt hushåll. Lagen anger dessutom att den bara gäller samboförhållanden där ingen av samborna är gift.',
 'Sveriges riksdag: Sambolag (2003:376), 1 §',
 'https://www.riksdagen.se/sv/dokument-och-lagar/dokument/svensk-forfattningssamling/sambolag-2003376_sfs-2003-376/',
 'I vardagligt tal kan det räcka att två partners beskriver sig som sambor. I lagen är sambo en rättslig kategori med flera uttryckliga rekvisit, vilket gör att boende tillsammans inte automatiskt betyder att sambolagen gäller.',
 'Den rättsliga definitionen är viktig eftersom sambolagens regler om bostad och bohag bara träffar relationer som omfattas av lagen.'
),
(
 'Konsument',
 'Konsumenträtt',
 'Allmänspråkligt är en konsument någon som köper, använder eller förbrukar varor och tjänster. Fokus ligger ofta på rollen som slutkund eller användare.',
 'Svenska Akademiens ordböcker: konsument',
 'https://svenska.se/?q=konsument',
 'Konsumentköplagen definierar konsument som en fysisk person som handlar huvudsakligen för ändamål som faller utanför näringsverksamhet.',
 'Sveriges riksdag: Konsumentköplag (2022:260), 1 kap. 2 §',
 'https://www.riksdagen.se/sv/dokument-och-lagar/dokument/svensk-forfattningssamling/konsumentkoplag-2022260_sfs-2022-260/',
 'Den juridiska kategorin beror inte bara på att någon köper eller använder något. Köparen måste vara en fysisk person och syftet med handlandet ska huvudsakligen ligga utanför näringsverksamhet.',
 'En juridisk person kan alltså vara kund men är inte konsument enligt denna definition.'
),
(
 'Vara',
 'Konsumenträtt',
 'I vanligt språk kan vara användas brett om något som säljs på en marknad, alltså en produkt eller handelsartikel. Gränsen mot tjänster behöver inte vara tydlig i vardagligt tal.',
 'Svenska Akademiens ordböcker: vara',
 'https://svenska.se/?q=vara',
 'Konsumentköplagen definierar vara som en lös sak, med eller utan digitala delar. Lagen skiljer därmed den juridiska varan från exempelvis rena tjänster och annan egendom som inte är en lös sak.',
 'Sveriges riksdag: Konsumentköplag (2022:260), 1 kap. 2 §',
 'https://www.riksdagen.se/sv/dokument-och-lagar/dokument/svensk-forfattningssamling/konsumentkoplag-2022260_sfs-2022-260/',
 'Vardagsspråkets marknadsprodukt är bredare och mer funktionell. I konsumentköplagen är vara en avgränsad rättslig kategori: lös sak, även när den har digitala delar.',
 'Vilken kategori något hamnar i styr vilka konsumenträttsliga regler som blir tillämpliga.'
),
(
 'Parkering',
 'Trafikrätt',
 'I vanligt språk betyder parkering typiskt att man lämnar ett fordon stående på en plats under en tid. Många förknippar därför parkering med att föraren har avslutat färden och kanske lämnat fordonet.',
 'Svenska Akademiens ordböcker: parkering',
 'https://svenska.se/?q=parkering',
 'Förordningen om vägtrafikdefinitioner räknar som parkering en uppställning av ett fordon med eller utan förare, så länge stillaståendet inte beror på trafikförhållanden, fara, på- eller avstigning eller på- eller avlastning av gods.',
 'Sveriges riksdag: Förordning (2001:651) om vägtrafikdefinitioner',
 'https://www.riksdagen.se/sv/dokument-och-lagar/dokument/svensk-forfattningssamling/forordning-2001651-om-vagtrafikdefinitioner_sfs-2001-651/',
 'Juridiskt avgörs parkering alltså inte av om föraren sitter kvar. Definitionen bygger på varför fordonet står stilla och räknar uttryckligen bort vissa typer av stillastående.',
 'Detta är ett praktiskt exempel där vardagsintuitionen kan ge fel svar på en trafikregel.'
),
(
 'Väg',
 'Trafikrätt',
 'I vanligt språk är en väg främst en anlagd sträcka eller led som människor och fordon färdas på mellan platser. Ordet för tanken till en gata eller landsväg.',
 'Svenska Akademiens ordböcker: väg',
 'https://svenska.se/?q=v%C3%A4g',
 'I vägtrafikdefinitionerna omfattar väg inte bara väg och gata utan även torg och andra leder eller platser som allmänt används för motorfordonstrafik, leder anordnade för cykeltrafik samt gång- eller ridbanor invid sådana vägar.',
 'Sveriges riksdag: Förordning (2001:651) om vägtrafikdefinitioner',
 'https://www.riksdagen.se/sv/dokument-och-lagar/dokument/svensk-forfattningssamling/forordning-2001651-om-vagtrafikdefinitioner_sfs-2001-651/',
 'Den juridiska termen väg är en funktionsdefinition och kan omfatta platser som inte ser ut som en vanlig körväg. Ett torg eller en intilliggande gång- eller ridbana kan alltså ingå i begreppet.',
 'Definitionen används i trafikförfattningar och är därför viktig för att avgöra var olika regler gäller.'
),
(
 'Trafikant',
 'Trafikrätt',
 'Allmänspråkligt är en trafikant någon som deltar i trafiken, exempelvis som förare, cyklist eller gående. Ordet förknippas lätt med att personen faktiskt förflyttar sig i ett trafikflöde.',
 'Svenska Akademiens ordböcker: trafikant',
 'https://svenska.se/?q=trafikant',
 'Förordningen om vägtrafikdefinitioner räknar som trafikant den som färdas eller annars uppehåller sig på en väg eller i ett fordon på en väg eller i terräng samt den som färdas i terräng.',
 'Sveriges riksdag: Förordning (2001:651) om vägtrafikdefinitioner',
 'https://www.riksdagen.se/sv/dokument-och-lagar/dokument/svensk-forfattningssamling/forordning-2001651-om-vagtrafikdefinitioner_sfs-2001-651/',
 'Den rättsliga definitionen är bredare än idén om en person som aktivt rör sig i trafik. Även den som bara uppehåller sig på en väg eller i ett fordon kan omfattas.',
 'Här bestäms ordets räckvidd av den uttryckliga definitionen, inte av den vardagliga bilden av en trafikdeltagare.'
),
(
 'Handling',
 'Offentlighetsrätt',
 'Handling har flera allmänspråkliga betydelser. Det kan vara något någon gör, men också ett skriftligt dokument eller underlag. I vardagligt tal tänker många på papper, filer eller dokument som går att läsa direkt.',
 'Svenska Akademiens ordböcker: handling',
 'https://svenska.se/?q=handling',
 'Tryckfrihetsförordningen definierar handling som en framställning i skrift eller bild samt en upptagning som endast med tekniska hjälpmedel kan läsas, avlyssnas eller uppfattas på annat sätt.',
 'Sveriges riksdag: Tryckfrihetsförordning (1949:105), 2 kap. 3 §',
 'https://www.riksdagen.se/sv/dokument-och-lagar/dokument/svensk-forfattningssamling/tryckfrihetsforordning-1949105_sfs-1949-105/',
 'I offentlighetsrätten är handling ett teknikneutralt rättsbegrepp. Det kan omfatta mer än ett traditionellt dokument, exempelvis digitalt lagrade upptagningar som måste göras begripliga med tekniska hjälpmedel.',
 'För att något dessutom ska vara en allmän handling krävs ytterligare förutsättningar, bland annat om förvaring och om handlingen är inkommen eller upprättad.'
),
(
 'Personuppgift',
 'Dataskydd',
 'I vanligt språk uppfattas personuppgift ofta som en tydlig uppgift om en person, till exempel namn, adress eller personnummer. Ordet kan därför låta snävare än all information som indirekt går att koppla till någon.',
 'Svenska Akademiens ordböcker: personuppgift',
 'https://svenska.se/?q=personuppgift',
 'Dataskyddsförordningen definierar personuppgifter som varje upplysning som avser en identifierad eller identifierbar fysisk person. Identifiering kan ske direkt eller indirekt, bland annat genom identifikationsnummer, lokaliseringsuppgifter, onlineidentifierare eller andra kännetecken.',
 'Integritetsskyddsmyndigheten: Dataskyddsförordningen, artikel 4.1',
 'https://www.imy.se/verksamhet/dataskydd/det-har-galler-enligt-gdpr/introduktion-till-gdpr/dataskyddsforordningen-i-fulltext/',
 'Den rättsliga definitionen är betydligt bredare än en lista över klassiska identitetsuppgifter. Avgörande är om informationen avser en identifierad eller identifierbar fysisk person, även indirekt.',
 'En uppgift behöver alltså inte ensam innehålla ett namn eller personnummer för att kunna vara en personuppgift.'
),
(
 'Uppsåt',
 'Straffrätt',
 'Allmänspråkligt betyder uppsåt ungefär avsikt eller syfte: att någon menar att åstadkomma något. Det låter därför lätt som ett krav på att resultatet uttryckligen var personens mål.',
 'Svenska Akademiens ordböcker: uppsåt',
 'https://svenska.se/?q=upps%C3%A5t',
 'Åklagarmyndigheten beskriver uppsåt som det centrala subjektiva kravet i straffrätten och förklarar att det inte bara handlar om ett uttalat syfte; bedömningen tar sikte på gärningspersonens insikt och inställning till den brottsliga handlingen.',
 'Åklagarmyndigheten: Uppsåt',
 'https://www.aklagare.se/ordlista/u/uppsat/',
 'Vardagsspråkets avsikt för tanken till ett medvetet mål. Straffrättens uppsåtsbegrepp är en juridisk bedömning av kunskap och inställning och kan därför inte reduceras till frågan om personen önskade resultatet.',
 'De närmare uppsåtsformerna har utvecklats i rättspraxis; posten återger därför principen och inte en fullständig rättsdogmatisk indelning.'
),
(
 'Bedrägeri',
 'Straffrätt',
 'I vanligt språk används bedrägeri brett om lurendrejeri, bluff eller ohederligt vilseledande. En person kan därför kalla en lögn eller en bluff för bedrägeri även när ingen ekonomisk rättsföljd har uppstått.',
 'Svenska Akademiens ordböcker: bedrägeri',
 'https://svenska.se/?q=bedr%C3%A4geri',
 'Brottsbalkens huvudregel om bedrägeri kräver att ett vilseledande förmår någon till handling eller underlåtenhet som innebär vinning för gärningspersonen och skada för den vilseledde eller någon i dennes ställe. Det finns också en särskild regel för otillåten påverkan på automatisk informationsbehandling.',
 'Regeringskansliets rättsdatabaser: Brottsbalk (1962:700), 9 kap. 1 §',
 'https://rkrattsbaser.gov.se/sfst?bet=1962%3A700',
 'Vardagsspråket fokuserar på att någon blivit lurad. Straffbestämmelsen ställer därutöver upp bestämda krav på orsakssamband och ekonomisk effekt; varje lögn eller bluff är därför inte automatiskt bedrägeri i brottsbalkens mening.',
 'Den exakta straffrättsliga bedömningen beror på samtliga rekvisit och omständigheterna i det enskilda fallet.'
),
(
 'Stöld',
 'Straffrätt',
 'I allmänspråk är stöld att ta något som tillhör någon annan utan lov. Ordet används ofta direkt när en sak har försvunnit genom någon annans obehöriga tagande.',
 'Svenska Akademiens ordböcker: stöld',
 'https://svenska.se/?q=st%C3%B6ld',
 'Brottsbalken kräver för stöld att någon olovligen tar vad annan tillhör med uppsåt att tillägna sig det och att tillgreppet innebär skada.',
 'Regeringskansliets rättsdatabaser: Brottsbalk (1962:700), 8 kap. 1 §',
 'https://rkrattsbaser.gov.se/sfst?bet=1962%3A700',
 'Det vardagliga ordet beskriver främst själva tagandet. Den juridiska stöldbestämmelsen innehåller flera separata rekvisit: olovligt tagande, annans egendom, tillägnelseuppsåt och skada.',
 'Att något tagits utan lov räcker alltså inte ensamt för att alla förutsättningar för just stöld ska vara uppfyllda.'
);