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
const handleB2 = require('./aggregates/b2');
const handleC116 = require('./aggregates/c116');

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
   🚀 DATE
   ======================= */
	if (body.datumPristiKontroly) {
		body.datumPristiKontroly = formatDateCZ(body.datumPristiKontroly);
	}

	if (body.datumZpracovani) {
	  body.datumZpracovani = formatDateCZ(body.datumZpracovani);
	}
	
	if (body.datumZpracovaniPENB) {
	  body.datumZpracovaniPENB = formatDateCZ(body.datumZpracovaniPENB);
	}

	
	
	/* =======================
   🔁 OKRUHY (EDIT GRID)
   ======================= */
	applyOkruhy(body, {
	  sourceKey: 'editGrid', // ключ Form.io
	  targetKey: 'okruh',    // {{okruh.0.*}}
	  max: 4
	});
	
	/* =======================
   🔁 DATA ŠETŘENÍ (TABLE)
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
	handleC32(body);
    handleC42(body);
    handleC52(body);
	handleC41(body);
	handleC411(body);
	handleC116(body);
	
	
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
   🔁 OKRUH BLOCK (REPEAT)
   ======================= */

	const fullText = await getDocumentText(docs, documentId);

	const blockMatch = fullText.match(
	  /\{\{#okruhBlock\}\}([\s\S]*?)\{\{\/okruhBlock\}\}/
	);

	if (blockMatch) {
	  const templateBlock = blockMatch[1];

	  const okruhyCount = Object.keys(body)
	  .filter(
		k =>
		  k.startsWith('okruh.') &&
		  k.endsWith('.cislo') &&
		  body[k]
	  )
	  .length;

	  let generated = '';

	  for (let i = 0; i < okruhyCount; i++) {
		let block = templateBlock;

		block = block.replace(/okruh\.0/g, `okruh.${i}`);
		block = block.replace(
		  /\{\{item\.rowNum\}\}/g,
		  String(i + 1)
		);

		generated += block + '\n\n';
	  }

	  const finalText = fullText.replace(
		/\{\{#okruhBlock\}\}[\s\S]*?\{\{\/okruhBlock\}\}/,
		generated
	  );

	  await overwriteDocument(docs, documentId, finalText);
	}

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


function formatDateCZ(value) {
  if (!value) return '';

  const d = new Date(value);

  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();

  return `${day}.${month}.${year}`;
}

function setIfEmpty(body, key, value) {
  if (body[key] === undefined || body[key] === '') {
    body[key] = value;
  }
}

async function getDocumentText(docs, documentId) {
  const doc = await docs.documents.get({ documentId });
  let text = '';

  doc.data.body.content.forEach(el => {
    if (el.paragraph) {
      el.paragraph.elements.forEach(e => {
        if (e.textRun?.content) {
          text += e.textRun.content;
        }
      });
    }
  });

  return text;
}

async function overwriteDocument(docs, documentId, text) {
  const doc = await docs.documents.get({ documentId });
  const endIndex =
    doc.data.body.content.slice(-1)[0].endIndex - 1;

  await docs.documents.batchUpdate({
    documentId,
    requestBody: {
      requests: [
        {
          deleteContentRange: {
            range: { startIndex: 1, endIndex }
          }
        },
        {
          insertText: {
            location: { index: 1 },
            text
          }
        }
      ]
    }
  });
}
