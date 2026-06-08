const express = require('express');

/* =======================
   🔐 GOOGLE AUTH / API
   ======================= */
const { getDocs, getDrive, callAppsScript } = require('./services/googleAuth');

/* =======================
   📦 AGGREGATES
   ======================= */
const handleC12  = require('./aggregates/c12');
const handleC2   = require('./aggregates/c2');
const handleC22  = require('./aggregates/c22');
const handleC32  = require('./aggregates/c32');
const handleC42  = require('./aggregates/c42');
const handleC52  = require('./aggregates/c52');
const handleC61  = require('./aggregates/c61');
const handleC62  = require('./aggregates/c62');
const handleC41  = require('./aggregates/c41');
const handleC411 = require('./aggregates/c411');
const handleC413 = require('./aggregates/c413');
const handleC116 = require('./aggregates/c116');
const handleB2   = require('./aggregates/b2');
const applySelectCheckboxeTypBudovy = require('./aggregates/selectCheckBox-typBudovy');
const applyOkruhy     = require('./aggregates/okruhy');
const applyZdrojTepla = require('./aggregates/zdrojTepla');

/* =======================
   📦 SERVICES / COLLECTORS
   ======================= */
const insertImagesAtPlaceholder = require('./services/insertImagesAtPlaceholder');
const { collectOkruhy, collectZdrojeTepla } = require('./routes/collectors');
const { formatDateCZ } = require('./utils/helpers');

/* =======================
   🚀 APP INIT
   ======================= */
const app = express();

/* =======================
   🔐 CORS
   ======================= */
const ALLOWED_ORIGINS = [
  'https://portal.form.io',
  'https://pro.formview.io'
];

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

app.use(express.json());

/* =======================
   📄 GENERATE DOCUMENT
   ======================= */
app.post('/generate-doc', async (req, res) => {
  try {
    const body = req.body || {};
    const docs  = getDocs();
    const drive = getDrive();

    // ── Dates ──────────────────────────────────────────────────────────────
    if (body.datumPristiKontroly)  body.datumPristiKontroly  = formatDateCZ(body.datumPristiKontroly);
    if (body.datumZpracovani)      body.datumZpracovani      = formatDateCZ(body.datumZpracovani);
    if (body.datumZpracovaniPENB)  body.datumZpracovaniPENB  = formatDateCZ(body.datumZpracovaniPENB);

    // ── EditGrids ───────────────────────────────────────────────────────────
    applyOkruhy(body,     { sourceKey: 'editGrid',    targetKey: 'okruh',       max: 50 });
    applyZdrojTepla(body, { sourceKey: 'zdrojeTepla', targetKey: 'zdrojeTepla', max: 50 });

    // ── Data šetření ────────────────────────────────────────────────────────
    body.DATA_SETRENI = Array.isArray(body.dataSetreni)
      ? body.dataSetreni
          .map((item, i) => item?.datum ? `${i + 1}. ${formatDateCZ(item.datum)}` : '')
          .filter(Boolean)
          .join('\n')
      : '';

    // ── Radios ──────────────────────────────────────────────────────────────
    const radio = body.automatizacniRidiciSystem;
    body.automatizacniRidiciSystem_checkYes = radio === 'ano' ? '☒' : '☐';
    body.automatizacniRidiciSystem_checkNo  = radio === 'ne'  ? '☒' : '☐';

    // ── Aggregates ──────────────────────────────────────────────────────────
    // FIX: run handleC116 BEFORE converting regulaceVykonuZdroje to a string.
    // Previously the object was stringified first, leaving handleC116 with a
    // string input so it silently produced no checkbox output.
    handleB2(body);
    handleC12(body);
    handleC2(body);
    handleC22(body);
    handleC32(body);
    handleC42(body);
    handleC52(body);
    handleC41(body);
    handleC411(body);

    // FIX: handleC413 now writes directly to body — no Object.assign needed.
    handleC413(body);

    // FIX: handleC116 must run before the regulaceVykonuZdroje string conversion below.
    handleC116(body);

    handleC61(body);
    handleC62(body);

    // ── Regulace výkonu zdroje (SelectBoxes → display string) ───────────────
    // FIX: this conversion now happens AFTER handleC116 has read the object.
    const regulaceMap = { kvantitativni: 'kvantitativní', kvalitativni: 'kvalitativní', jina: 'jiná' };
    if (body.regulaceVykonuZdroje && typeof body.regulaceVykonuZdroje === 'object') {
      const selectedKey = Object.keys(body.regulaceVykonuZdroje)
        .find(k => body.regulaceVykonuZdroje[k] === true);
      body.regulaceVykonuZdroje = regulaceMap[selectedKey] || '';
    } else {
      body.regulaceVykonuZdroje = '';
    }

    applySelectCheckboxeTypBudovy(body, {
      key: 'typBudovy',
      data: {
        values: [
          { label: 'Bytový dům',                               value: 'bytovyDum' },
          { label: 'Budova pro vzdělávání',                    value: 'budovaProVzdelavani' },
          { label: 'Administrativní budova',                   value: 'administrativniBudova' },
          { label: 'Budova pro kulturu',                       value: 'budovaProKulturu' },
          { label: 'Budova pro obchodní účely',                value: 'budovaProObchodniUcely' },
          { label: 'Budova pro sociální péči',                 value: 'budovaProSocialniPeci' },
          { label: 'Budova pro sport',                         value: 'budovaProSport' },
          { label: 'Budova pro zdravotnictví',                 value: 'budovaProZdravotnictvi' },
          { label: 'Budova pro ubytování a stravování',        value: 'budovaProUbytovaniAStravovani' },
          { label: 'Budova pro výrobu a skladování',           value: 'budovaProVyrobuASkladovani' },
          { label: 'Jiný druh budovy',                         value: 'jinyDruhBudovy' }
        ]
      }
    });

    // ── Copy template ───────────────────────────────────────────────────────
    const templateId = body.rozsahZpravy === 'plny'
      ? process.env.TEMPLATE_FULL_ID
      : process.env.TEMPLATE_ID;

    const copy = await drive.files.copy({
      fileId: templateId,
      requestBody: {
        name: body.adresaBudovy ? `Firma_${String(body.adresaBudovy)}` : 'Firma',
        mimeType: 'application/vnd.google-apps.document'
      }
    });
    const documentId = copy.data.id;
    const docUrl = `https://docs.google.com/document/d/${documentId}/edit`;

    // ── Insert images ───────────────────────────────────────────────────────
    // FIX: IMAGE_PLACEHOLDERS is now the single source of truth.
    // SKIP_KEYS is derived from it — no more hardcoded duplicate list.
    const IMAGE_PLACEHOLDERS = {
      owner_podpisOsobyUrcene:              '{{owner_podpisOsobyUrcene}}',
      owner_podpisEnergetickehoSpecialisty: '{{owner_podpisEnergetickehoSpecialisty}}',
      fotografieBudovy:                     '{{fotografieBudovy}}',
      fotografieVstupuTeplaDoBudovy:        '{{fotografieVstupuTeplaDoBudovy}}',
      fotografieZdrojeTepla:                '{{fotografieZdrojeTepla}}',
      fotografieRozvodu:                    '{{fotografieRozvodu}}',
      fotografiePrvkuSdileniTepla:          '{{fotografiePrvkuSdileniTepla}}'
    };

    for (const [formKey, placeholder] of Object.entries(IMAGE_PLACEHOLDERS)) {
      const files = body?.[formKey];
      if (!Array.isArray(files) || files.length === 0) continue;
      const imageFileIds = files.map(f => f?.id).filter(Boolean);
      if (imageFileIds.length === 0) continue;
      await insertImagesAtPlaceholder({ documentId, placeholder, imageFileIds, docs });
    }

    // ── Replace text placeholders ───────────────────────────────────────────
    // FIX: SKIP_KEYS derived from IMAGE_PLACEHOLDERS — stays in sync automatically.
    const SKIP_KEYS = new Set([
      ...Object.keys(IMAGE_PLACEHOLDERS),
      'prilohy'
    ]);

    const requests = Object.entries(body)
      .filter(([key]) => !SKIP_KEYS.has(key))
      .map(([key, value]) => ({
        replaceAllText: {
          containsText: { text: `{{${key}}}`, matchCase: true },
          replaceText: String(value ?? '')
        }
      }));

    if (requests.length) {
      await docs.documents.batchUpdate({ documentId, requestBody: { requests } });
    }

    // ── Apps Script: okruhy ─────────────────────────────────────────────────
    // FIX: Apps Script calls are now wrapped individually in try/catch.
    // If a script fails, the error is logged and reported in the response,
    // but the document URL is still returned — no more orphaned docs.
    const scriptWarnings = [];

    const okruhy = collectOkruhy(body);
    if (okruhy.length > 0) {
      const scriptId = body.rozsahZpravy === 'plny'
        ? process.env.APPS_SCRIPT_FULL_ID
        : process.env.APPS_SCRIPT_ID;
      try {
        await callAppsScript(scriptId, 'generateOkruhy', [documentId, okruhy]);
      } catch (err) {
        console.error('Apps Script generateOkruhy error:', err);
        scriptWarnings.push(`generateOkruhy: ${err.message}`);
      }
    }

    // ── Apps Script: zdrojeTepla ────────────────────────────────────────────
    const zdrojeTepla = collectZdrojeTepla(body);
    if (zdrojeTepla.length > 0) {
      try {
        await callAppsScript(
          process.env.APPS_SCRIPT_ZDROJE_TEPLA_ID,
          'generateZdrojeTepla',
          [documentId, zdrojeTepla]
        );
      } catch (err) {
        console.error('Apps Script generateZdrojeTepla error:', err);
        scriptWarnings.push(`generateZdrojeTepla: ${err.message}`);
      }
    }

    // ── Apps Script: cleanup ────────────────────────────────────────────────
    try {
      await callAppsScript(process.env.APPS_SCRIPT_ID, 'removeUnusedPlaceholders', [documentId]);
    } catch (err) {
      console.error('Apps Script removeUnusedPlaceholders error:', err);
      scriptWarnings.push(`removeUnusedPlaceholders: ${err.message}`);
    }

    // ── Respond ─────────────────────────────────────────────────────────────
    const response = { url: docUrl };
    if (scriptWarnings.length > 0) {
      response.warnings = scriptWarnings;
    }
    res.json(response);

  } catch (err) {
    console.error('Generate-doc error:', err);
    res.status(500).json({ error: 'Google Docs generation failed', details: err.message });
  }
});

/* =======================
   🚀 SERVER START
   ======================= */
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`✅ Server started on port ${PORT}`));
