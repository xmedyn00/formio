const express = require('express');
const { google } = require('googleapis');
const fetch = (...args) =>
  import('node-fetch').then(({ default: fetch }) => fetch(...args));

/* =======================
   📦 IMPORT MODULES
   ======================= */
const handleC12 = require('./aggregates/c12');
const handleC2 = require('./aggregates/c2');
const handleC22 = require('./aggregates/c22');
const handleC32 = require('./aggregates/c32');
const handleC42 = require('./aggregates/c42');
const handleC52 = require('./aggregates/c52');
const handleC61 = require('./aggregates/c61');
const handleC62 = require('./aggregates/c62');
const applySelectCheckboxeTypBudovy = require('./aggregates/selectCheckBox-typBudovy');
const applySelectBoxesAnoNe = require('./aggregates/selectBoxesAnoNe');
const applyOkruhy = require('./aggregates/okruhy');
const applyZdrojTepla = require('./aggregates/zdrojTepla');
const handleC41 = require('./aggregates/c41');
const handleC411 = require('./aggregates/c411');
const handleC413 = require('./aggregates/c413');
const handleB2 = require('./aggregates/b2');
const handleC116 = require('./aggregates/c116');
const insertSingleImageWithCaption = require('./services/insertSingleImageWithCaption');
const insertImagesAtPlaceholder = require('./services/insertImagesAtPlaceholder');

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

const docs = google.docs({ version: 'v1', auth: oauth2Client });
const drive = google.drive({ version: 'v3', auth: oauth2Client });

/* =======================
   📄 GENERATE DOCUMENT
   ======================= */
app.post('/generate-doc', async (req, res) => {
  try {
    const body = req.body || {};

    /* =======================
       📅 DATES
       ======================= */
    if (body.datumPristiKontroly)
      body.datumPristiKontroly = formatDateCZ(body.datumPristiKontroly);
    if (body.datumZpracovani)
      body.datumZpracovani = formatDateCZ(body.datumZpracovani);
    if (body.datumZpracovaniPENB)
      body.datumZpracovaniPENB = formatDateCZ(body.datumZpracovaniPENB);

    /* =======================
       🔁 OKRUHY (FORM.IO GRID)
       ======================= */
    applyOkruhy(body, {
      sourceKey: 'editGrid',
      targetKey: 'okruh',
      max: 50
    });
	
	/* =======================
       🔁 ZdrojTepla (FORM.IO GRID)
       ======================= */
    applyZdrojTepla(body, {
	  sourceKey: 'zdrojeTepla',
	  targetKey: 'zdrojeTepla',
	  max: 50
	});
	
	/*🔁 DATA ŠETŘENÍ (TABLE)
   ======================= */
	if (Array.isArray(body.dataSetreni)) {
	  body.DATA_SETRENI = body.dataSetreni
		.map((item, index) => {
		  if (!item?.datum) return '';
		  return `${index + 1}. ${formatDateCZ(item.datum)}`;
		})
		.filter(Boolean)
		.join('\n');
	} else {
	  body.DATA_SETRENI = '';
	}
	
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
    handleB2(body);
    handleC12(body);
    handleC2(body);
    handleC22(body);
    handleC32(body);
    handleC42(body);
    handleC52(body);
    handleC41(body);
    handleC411(body);
    Object.assign(body, handleC413(body));
    handleC116(body);
    handleC61(body);
    handleC62(body);
	
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
       📄 COPY TEMPLATE
       ======================= */
    const templateId =
	  body.rozsahZpravy === 'plny'
		? process.env.TEMPLATE_FULL_ID
		: process.env.TEMPLATE_ID; // zjednodusenyBezVlastnihoZdrojeTepla

	const copy = await drive.files.copy({
	  fileId: templateId,
	  requestBody: {
		name: body.adresaBudovy
		  ? `Firma_${String(body.adresaBudovy)}`
		  : 'Firma',
		mimeType: 'application/vnd.google-apps.document'
	  }
	});

    const documentId = copy.data.id;
	/* =======================
   🖼 INSERT IMAGE (FORM.IO → GOOGLE DRIVE)
   ======================= */
   const IMAGE_PLACEHOLDERS = {
	  fotografieBudovy: '{{fotografieBudovy}}',
	  fotografieVstupuTeplaDoBudovy: '{{fotografieVstupuTeplaDoBudovy}}',
	  fotografieZdrojeTepla: '{{fotografieZdrojeTepla}}',
	  fotografieRozvodu: '{{fotografieRozvodu}}',
	  fotografiePrvkuSdileniTepla: '{{fotografiePrvkuSdileniTepla}}'
	};
	
	
	/* =======================
   🖼 INSERT ALL IMAGE GROUPS
   ======================= */
	for (const [formKey, placeholder] of Object.entries(IMAGE_PLACEHOLDERS)) {
	  const files = body?.[formKey];

	  if (!Array.isArray(files) || files.length === 0) continue;

	  const imageFileIds = files
		.map(f => f?.id)
		.filter(Boolean);

	  if (imageFileIds.length === 0) continue;

	  await insertImagesAtPlaceholder({
		documentId,
		placeholder,
		imageFileIds,
		docs
	  });
	}
    /* =======================
       ✏ REPLACE PLACEHOLDERS
       ======================= */
	const SKIP_KEYS = [
	  'fotografieBudovy',
	  'fotografieVstupuTeplaDoBudovy',
	  'fotografieZdrojeTepla',
	  'fotografieRozvodu',
	  'fotografiePrvkuSdileniTepla',
	  'prilohy'
	];
    const requests = Object.entries(body).filter(([key]) => !SKIP_KEYS.includes(key)).map(([key, value]) => ({
      replaceAllText: {
        containsText: {
          text: `{{${key}}}`,
          matchCase: true
        },
        replaceText: String(value ?? '')
      }
    }));

    if (requests.length) {
      await docs.documents.batchUpdate({
        documentId,
        requestBody: { requests }
      });
    }


    /* =======================
       🔁 OKRUH BLOCKS (APPS SCRIPT)
       ======================= */
    const okruhy = collectOkruhy(body);
    if (okruhy.length > 0) {
      await runGenerateOkruhy(documentId, okruhy, body.rozsahZpravy);
    }
	
	/* =======================
       🔁 ZDROJETEPLA BLOCKS (APPS SCRIPT)
       ======================= */
	const zdrojeTepla = collectZdrojeTepla(body);
	if (zdrojeTepla.length > 0) {
	  await runGenerateZdrojeTepla(documentId, zdrojeTepla);
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

/* =======================
   🧰 HELPERS
   ======================= */

function formatDateCZ(value) {
  if (!value) return '';
  const d = new Date(value);
  return `${String(d.getUTCDate()).padStart(2, '0')}.${String(
    d.getUTCMonth() + 1
  ).padStart(2, '0')}.${d.getFullYear()}`;
}

function collectOkruhy(body) {
  const okruhy = [];

  const regulaceKeys = [
    'bezRegulaceKonstantniOtacky',
    'rucneNastaveneKonstantniOtacky',
    'regulacePodleProporcionalnihoTlaku',
    'regulacePodleKonstantnihoTlaku',
    'automatickaRegulaceRizenaElektronikouCerpadla',
    'jine'
  ];

  const anoNeKeys = [
    'jsouOsazenyVyvazovaciArmaturyNaRozvodechTepelneEnergie',
    'lzeOveritSpravnostDimenzeANastaveni',
    'jeProvedenoHydraulickeNastaveniVyvazovacichArmatur',
    'vsechnyPristupneCastiRozvoduTepelneEnergieTepelneIzolovany',
    'dochaziKeZtrateTeplonosneLatky',
    'vyhovujiciStavTepelneIzolace',
    'kontrolaKvalityTeplonosneLatky'
  ];
  
	
  for (let i = 0; i < 100; i++) {
    const cislo = body[`okruh.${i}.cislo`];
    if (!cislo) break;

    // 🔹 SELECT z Form.io → STRING
    const selectedRegulace =
      body[`okruh.${i}.zpusobRegulace`] || '';

    const okruh = {
      cislo,
      vypoctovyTepelnyVykon:
        body[`okruh.${i}.vypoctovyTepelnyVykon`] || '',
      vypoctovyTeplotniSpad:
        body[`okruh.${i}.vypoctovyTeplotniSpad`] || '',
      provozovanyTeplotniSpad:
        body[`okruh.${i}.provozovanyTeplotniSpad`] || '',
      oznaceniCerpadla:
        body[`okruh.${i}.oznaceniCerpadla`] || '',
      jmenovityPrikon:
        body[`okruh.${i}.jmenovityPrikon`] || '',
      poznamkyKRozvodumTepelneEnergie:
        body[`okruh.${i}.poznamkyKRozvodumTepelneEnergie`] || '',
      typHydraulickehoVyvazeniOtopneSoustavy:
        body[`okruh.${i}.typHydraulickehoVyvazeniOtopneSoustavy`] || ''
    };

    /* =====================
       REGULACE ČERPADLA
       (SELECT → ☒ / ☐)
       ===================== */
    regulaceKeys.forEach(key => {
      okruh[key] = selectedRegulace === key ? '☒' : '☐';
    });

    /* =====================
       ANO / NE → ☒ / ☐
       ===================== */
    anoNeKeys.forEach(key => {
      okruh[key] = {
        yes: body[`okruh.${i}.${key}.yes`] || '☐',
        no:  body[`okruh.${i}.${key}.no`]  || '☐'
      };
    });

    okruhy.push(okruh);
  }

  return okruhy;
}

async function runGenerateOkruhy(documentId, okruhy, rozsahZpravy) {
  const scriptId =
	  rozsahZpravy === 'plny'
		? process.env.APPS_SCRIPT_FULL_ID
		: process.env.APPS_SCRIPT_ID; // zjednodusenyBezVlastnihoZdrojeTepla
  const { token } = await oauth2Client.getAccessToken();

  const res = await fetch(
    `https://script.googleapis.com/v1/scripts/${scriptId}:run`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        function: 'generateOkruhy',
        parameters: [documentId, okruhy]
      })
    }
  );

  const json = await res.json();
  if (json.error) {
    throw new Error(
      'Apps Script error: ' + JSON.stringify(json.error)
    );
  }
}


function collectZdrojeTepla(body) {
  const zdroje = [];

  for (let i = 0; i < 100; i++) {
    const cislo = body[`zdrojeTepla.${i}.cislo`];
    if (!cislo) break;

    const zdroj = {
		
	/*C111*/
      cislo,
      oznaceni: body[`zdrojeTepla.${i}.oznaceni`] || '',
      palivoJine: body[`zdrojeTepla.${i}.palivoJine`] || '', 
      vyrobceTypModel: body[`zdrojeTepla.${i}.vyrobceTypModel`] || '',
	  zakladniCharakteristikaKotle: body[`zdrojeTepla.${i}.zakladniCharakteristikaKotle`] || '',
      rokVyrobyVyrobniCislo: body[`zdrojeTepla.${i}.rokVyrobyVyrobniCislo`] || '',
      minKW: body[`zdrojeTepla.${i}.minKW`] || '',
      maxKW: body[`zdrojeTepla.${i}.maxKW`] || '',
      celkovaZtrata: body[`zdrojeTepla.${i}.celkovaZtrata`] || '',
      namerenaKoncentraceCoVeSpalinachMgM3: body[`zdrojeTepla.${i}.namerenaKoncentraceCoVeSpalinachMgM3`] || '',
      vyslednaUcinnost: body[`zdrojeTepla.${i}.vyslednaUcinnost`] || '',
      regulaceVykonu: body[`zdrojeTepla.${i}.regulaceVykonu`] || '',
      zdrojTeplaUrcenProDalsi: body[`zdrojeTepla.${i}.zdrojTeplaUrcenProDalsi`] || '',
      poznamkyKeZdrojiTepla: body[`zdrojeTepla.${i}.poznamkyKeZdrojiTepla`] || '',
	  
	  
	  /*Priloha 6 */
	
    teplotaSpalinNaVystupuZKotleC: body[`zdrojeTepla.${i}.teplotaSpalinNaVystupuZKotleC`] || '',
	teplotaVzduchuNaVstupuDoKotleC: body[`zdrojeTepla.${i}.teplotaVzduchuNaVstupuDoKotleC`] || '',
	koeficientADinO2: body[`zdrojeTepla.${i}.koeficientADinO2`] || '',
	koeficientBDinO2: body[`zdrojeTepla.${i}.koeficientBDinO2`] || '',
	koeficientADinCo2: body[`zdrojeTepla.${i}.koeficientADinCo2`] || '',
	koeficientBDinCo2: body[`zdrojeTepla.${i}.koeficientBDinCo2`] || '',
	koncentraceO2VeSpalinach: body[`zdrojeTepla.${i}.koncentraceO2VeSpalinach`] || '',
	koncentraceCo2VeSpalinach: body[`zdrojeTepla.${i}.koncentraceCo2VeSpalinach`] || '',
	kominovaZtrataDinO2: body[`zdrojeTepla.${i}.kominovaZtrataDinO2`] || '',
	kominovaZtrataDinCo2: body[`zdrojeTepla.${i}.kominovaZtrataDinCo2`] || '',
	ucinnostStanovenaAnalyzatoremSpalin: body[`zdrojeTepla.${i}.ucinnostStanovenaAnalyzatoremSpalin`] || '',
	minimalniPozadovanaUcinnost: body[`zdrojeTepla.${i}.minimalniPozadovanaUcinnost`] || '',
	splneniPozadavkuNaUcinnost:
	  body[`zdrojeTepla.${i}.splneniPozadavkuNaUcinnost`] === 'ano'
		? 'Ano'
		: body[`zdrojeTepla.${i}.splneniPozadavkuNaUcinnost`] === 'ne'
		  ? 'Ne'
		  : '',
	referencniKoncentraceCoVeSpalinachMgM3: body[`zdrojeTepla.${i}.referencniKoncentraceCoVeSpalinachMgM3`] || '',
	//splneniPozadavkuVyhlaskyC382022Sb nize
    };

    /* =====================
       ANO / NE → ☒ / ☐
       ===================== 
    zdroj.splneniPozadavkuNaUcinnost = {
      yes:
        body[`zdrojeTepla.${i}.splneniPozadavkuNaUcinnost.yes`] || 'Ano',
      no:
        body[`zdrojeTepla.${i}.splneniPozadavkuNaUcinnost.no`] || 'Ne'
    };*/

    zdroj.splneniPozadavkuVyhlaskyC382022Sb = {
      yes:
        body[`zdrojeTepla.${i}.splneniPozadavkuVyhlaskyC382022Sb.yes`] || 'Ano',
      no:
        body[`zdrojeTepla.${i}.splneniPozadavkuVyhlaskyC382022Sb.no`] || 'Ne'
    };
	
	/* =====================
       PALIVO → ☒ / ☐
       ===================== */
    const paliva = [
      'zemniPlyn',
      'lehkyTopnyOlej',
      'uhli',
      'lpg',
      'drevoPelety',
      'jine'
    ];

    zdroj.palivo = {};

    paliva.forEach(p => {
      zdroj.palivo[p] =
        body[`zdrojeTepla.${i}.palivo.${p}`] === '☒' ? '☒' : '☐';
    });
	
	/* =====================
       ZDROJ TEPLA JE URČEN PRO → ☒ / ☐
       ===================== */
    const urceniKeys = [
      'vytapeniProstoruOtopnouSoustavouNeboPrimymSdilenimTepla',
      'pripravaTepleVody',
      'ohrevVzduchuVeVzduchotechnickemZarizeni',
      'teploProTechnologii',
      'dalsi'
    ];

    zdroj.urceni = {};

    urceniKeys.forEach(key => {
      zdroj.urceni[key] =
        body[`zdrojeTepla.${i}.urceni.${key}`] === '☒' ? '☒' : '☐';
    });
	
	/* =====================
       TYP KOTLE (RADIO) → ☒ / ☐
       ===================== */
    const typyKotle = [
      'standardni',
      'kondenzacni',
      'nizkoteplotni'
    ];

    zdroj.typKotle = {};

    const selectedTypKotle =
      body[`zdrojeTepla.${i}.typKotle`] || '';

    typyKotle.forEach(t => {
      zdroj.typKotle[t] =
        //selectedTypKotle === t ? '☒' : '☐';
		body[`zdrojeTepla.${i}.typKotle.${t}`] === '☒' ? '☒' : '☐';
    });

    zdroje.push(zdroj);
  }

  return zdroje;
}

async function runGenerateZdrojeTepla(documentId, zdrojeTepla) {
  const scriptId = process.env.APPS_SCRIPT_ZDROJE_TEPLA_ID;
  const { token } = await oauth2Client.getAccessToken();

  const res = await fetch(
    `https://script.googleapis.com/v1/scripts/${scriptId}:run`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        function: 'generateZdrojeTepla',
        parameters: [documentId, zdrojeTepla]
      })
    }
  );

  const json = await res.json();
  if (json.error) {
    throw new Error(
      'Apps Script error: ' + JSON.stringify(json.error)
    );
  }
}
