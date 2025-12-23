const express = require('express');
const { google } = require('googleapis');

/* =======================
   📦 IMPORT MODULES
   ======================= */
const handleC32 = require('./aggregates/c32');
const handleC42 = require('./aggregates/c42');
const handleC52 = require('./aggregates/c52');
const applySelectCheckboxeTypBudovy = require('./aggregates/selectCheckBox-typBudovy');
const applySelectBoxesAnoNe = require('./aggregates/selectBoxesAnoNe');
const applyOkruhy = require('./aggregates/okruhy');
const handleC41 = require('./aggregates/c41');
const handleC411 = require('./aggregates/c411');

/* =======================
   🚀 APP INIT
   ======================= */
const app = express();

/* =======================
   🔐 CORS
   ======================= */
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'https://portal.form.io');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }

  next();
});

app.use(express.json());

/* =======================
   🔐 GOOGLE AUTH
   ======================= */
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

oauth2Client.setCredentials({
  refresh_token: process.env.GOOGLE_REFRESH_TOKEN
});

const docs = google.docs({
  version: 'v1',
  auth: oauth2Client
});

const drive = google.drive({
  version: 'v3',
  auth: oauth2Client
});

/* =======================
   📄 GENERATE DOCUMENT
   ======================= */
app.post('/generate-doc', async (req, res) => {
  try {
    const body = req.body || {};
	
	/* =======================
   🔁 OKRUHY (EDIT GRID)
   ======================= */
	applyOkruhy(body, {
	  sourceKey: 'editGrid', // ключ Form.io
	  targetKey: 'okruh',    // {{okruh.0.*}}
	  max: 4
	});

    /* =======================
       ☑ RADIO: ANO / NE
       ======================= */
    const radio = body.automatizacniRidiciSystem;

    body.automatizacniRidiciSystem_checkYes =
      radio === 'ano' ? '☒' : '☐';

    body.automatizacniRidiciSystem_checkNo =
      radio === 'ne' ? '☒' : '☐';

    /* =======================
       🧩 AGGREGATES
       ======================= */
    handleC32(body);
    handleC42(body);
    handleC52(body);
	handleC41(body);
	handleC411(body);
	
	/* =======================
   ☑ SELECT: TYP BUDOVY
   ======================= */
	applySelectCheckboxeTypBudovy(body, {
	  key: 'typBudovy',
	  data: {
		values: [
		  { label: 'Bytový dům', value: 'bytovyDum' },
		  { label: 'Budova pro vzdělávání', value: 'budovaProVzdelavani' },
		  { label: 'Administrativní budova', value: 'administrativniBudova' },
		  { label: 'Budova pro kulturu', value: 'budovaProKulturu' },
		  { label: 'Budova pro obchodní účely', value: 'budovaProObchodniUcely' },
		  { label: 'Budova pro sociální péči', value: 'budovaProSocialniPeci' },
		  { label: 'Budova pro sport', value: 'budovaProSport' },
		  { label: 'Budova pro zdravotnictví', value: 'budovaProZdravotnictvi' },
		  { label: 'Budova pro ubytování a stravování', value: 'budovaProUbytovaniAStravovani' },
		  { label: 'Budova pro výrobu a skladování', value: 'budovaProVyrobuASkladovani' },
		  { label: 'Jiný druh budovy', value: 'jinyDruhBudovy' }
		]
	  }
	});
	
	/* =======================
   ☑ SELECTBOXES: REGULACE VÝKONU ZDROJE
   ======================= */
	const regulaceMap = {
	  kvantitativni: 'kvantitativní',
	  kvalitativni: 'kvalitativní',
	  jina: 'jiná'
	};

	if (
	  body.regulaceVykonuZdroje &&
	  typeof body.regulaceVykonuZdroje === 'object'
	) {
	  const selectedKey = Object.keys(body.regulaceVykonuZdroje)
		.find(key => body.regulaceVykonuZdroje[key] === true);

	  body.regulaceVykonuZdroje =
		regulaceMap[selectedKey] || '';
	} else {
	  body.regulaceVykonuZdroje = '';
	}
	
	/* =======================
   ☑ SELECTBOXES: DOKUMENTACE
   ======================= */
	applySelectBoxesAnoNe(body, {
	  key: 'selectBoxes',
	  values: [
		{ label: 'Projektová dokumentace daného systému', value: 'projektovaDokumentaceDanehoSystemu' },
		{ label: 'Zprávy o údržbě', value: 'zpravyOUdrzbe' },
		{ label: 'Provozní řád kotelny, je-li příslušnými předpisy vyžadován', value: 'provozniRadKotelnyJeLiPrislusnymiPredpisyVyzadovan' },
		{ label: 'Projektová dokumentace kotelny a otopné soustavy', value: 'projektovaDokumentaceKotelnyAOtopneSoustavy' },
		{ label: 'Provozní dokumentace zdroje tepla a ostatní provozní dokumentace', value: 'provozniDokumentaceZdrojeTeplaAOstatniProvozniDokumentace' },
		{ label: 'Provozní předpis výrobce zdroje tepla', value: 'provozniPredpisVyrobceZdrojeTepla' },
		{ label: 'Návod pro provoz, obsluhu, údržbu a užívání tepelné soustavy podle příslušných technických norem', value: 'navodProProvozObsluhuUdrzbuAUzivaniTepelneSoustavyPodlePrislusnychTechnickychNorem' },
		{ label: 'Zpráva z předchozí kontroly podle vyhlášky č. 38/2022 Sb.', value: 'zpravaZPredchoziKontrolyPodleVyhlaskyC382022SbKontroleProvozovanehoSystemuVytapeniAKombinovanehoSystemuVytapeniAVetrani' }
	  ]
	});
	
	applySelectBoxesAnoNe(body, {
	  key: 'selectBoxes1',
	  values: [
		{
		  label: 'Kontrola podle § 17 odst. 1 písm. h) zákona č. 201/2012 Sb. a dokumentace podle § 6 odst. 2',
		  value: 'b2KontrolaOvzdusi'
		},
		{
		  label: 'Dokumentace podle § 6 odst. 2 zákona č. 201/2012 Sb.',
		  value: 'b2DokumentaceOvzdusi'
		},
		{
		  label: 'Revize a čištění spalinové cesty',
		  value: 'b2RevizeSpalinoveCesty'
		},
		{
		  label: 'Kontrola provozuschopnosti (požární bezpečnost)',
		  value: 'b2KontrolaPozarniBezpecnosti'
		},
		{
		  label: 'Kontrola a provozní revize plynových zařízení',
		  value: 'b2RevizePlynoveZarizeni'
		},
		{
		  label: 'Odborná prohlídka nízkotlakých kotelen',
		  value: 'b2OdbornaProhlidkaKotelny'
		},
		{
		  label: 'Kontrola a provozní revize dle ČSN 070703',
		  value: 'b2RevizeKotelnyCsn070703'
		},
		{
		  label: 'Provozní a vnitřní revize tlakových nádob',
		  value: 'b2RevizeTlakoveNadoby'
		},
		{
		  label: 'Kontrola těsnosti chladicího okruhu tepelného čerpadla',
		  value: 'b2KontrolaTesnostiTepelneCerpadlo'
		}
	  ]
	});
	
	applySelectBoxesAnoNe(body, {
	  key: 'selectBoxes2',
	  values: [
		{
		  label: 'Účetní doklady za paliva / energonositele',
		  value: 'ucetniDokladyZaPalivaEnergonositele'
		},
		{
		  label: 'Zdroj tepla je trvale monitorován',
		  value: 'zdrojTeplaJeTrvaleMonitorovan'
		},
		{
		  label: 'Odečty měřidel energonositelů',
		  value: 'odectyMeridelEnergonositelu'
		},
		{
		  label: 'Průkaz energetické náročnosti budovy',
		  value: 'prukazEnergetickeNarocnostiBudovy'
		}
	  ]
	});
	
	applySelectBoxesAnoNe(body, {
  key: 'selectBoxes3',
  values: [
    {
      label: 'Pravidelná údržba',
      value: 'pravidelnaUdrzba'
    },
    {
      label: 'Dokumenty a informace jsou aktuální',
      value: 'dokumentyAInformaceJsouAktualniOdpovidajiSoucasnemuStavu'
    },
    {
      label: 'Zpráva o čištění otopného okruhu',
      value: 'zpravaOCisteniOtopnehoOkruhu'
    },
    {
      label: 'Zpráva o výměně termostatických hlavic a uzavíracích ventilů',
      value: 'zpravaOVymeneTermostatickychHlavicAUzaviracichVentiluAInformaceOTomKdyBylyMeneny'
    },
    {
      label: 'Zpráva (protokol chemického rozboru) o kontrole otopné vody',
      value: 'zpravaProtokolChemickehoRozboruOKontroleOtopneVody'
    },
    {
      label: 'Energetický audit',
      value: 'energetickyAudit'
    }
  ]
});

    /* =======================
       📄 COPY TEMPLATE
       ======================= */
    const copy = await drive.files.copy({
      fileId: process.env.TEMPLATE_ID,
      requestBody: {
        name: body.adresaBudovy
          ? `Firma_${String(body.adresaBudovy)}`
          : 'Firma',
        mimeType: 'application/vnd.google-apps.document'
      }
    });

    const documentId = copy.data.id;

    /* =======================
       ✏ REPLACE PLACEHOLDERS
       ======================= */
    const requests = Object.entries(body).map(([key, value]) => ({
      replaceAllText: {
        containsText: {
          text: `{{${key}}}`,
          matchCase: true
        },
        replaceText: String(value ?? '')
      }
    }));

    if (requests.length > 0) {
      await docs.documents.batchUpdate({
        documentId,
        requestBody: { requests }
      });
    }

    /* =======================
       ✅ RESPONSE
       ======================= */
    res.json({
      url: `https://docs.google.com/document/d/${documentId}/edit`
    });

  } catch (err) {
    console.error('Generate-doc error:', err);
    res.status(500).json({
      error: 'Google Docs generation failed',
      details: err.message
    });
  }
});

/* =======================
   🚀 SERVER START
   ======================= */
const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`✅ Server started on port ${PORT}`);
});
