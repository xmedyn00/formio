const express = require('express');
const { google } = require('googleapis');

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
   🔐 Google Auth
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
   📄 Generate document
   ======================= */
app.post('/generate-doc', async (req, res) => {
  try {
    const body = req.body || {};

    /* =======================
       ✅ RADIO: ANO / NE
       ======================= */
    const radio = body.automatizacniRidiciSystem;

    body.automatizacniRidiciSystem_checkYes =
      radio === 'ano' ? '☒' : '☐';

    body.automatizacniRidiciSystem_checkNo =
      radio === 'ne' ? '☒' : '☐';

    /* =======================
       🧩 AGGREGATE PRIPOMINKY
       ======================= */
    const pripominkyFields = [
      { key: 'pouzitiKoncepcniReseni1', label: 'Použití, koncepční řešení' },
      { key: 'dimenzovani1', label: 'Dimenzování' },
      { key: 'zapojeni1', label: 'Zapojení' },
      { key: 'regulace1', label: 'Regulace' },
      { key: 'provozniNastaveni1', label: 'Provozní nastavení' },
      { key: 'tepelnaIzolace1', label: 'Tepelná izolace' },
      { key: 'stavArmatur1', label: 'Stav armatur' },
      { key: 'dalsi1', label: 'Další' }
    ];

    const pripominkyCombined = pripominkyFields
      .map(({ key, label }) => {
        const value = body[key];
        if (!value || !String(value).trim()) return null;

        return `${label}:\n${String(value).trim()}`;
      })
      .filter(Boolean)
      .join('\n\n');

    // 👉 финальное поле для шаблона
    body.c32_vsechnyPripominky =
      pripominkyCombined || 'bez připomínek';
/* =======================
   ☑ C32 – CELKOVÉ HODNOCENÍ
   ======================= */

const hasAnyPripominky =
  Boolean(pripominkyCombined && pripominkyCombined !== 'bez připomínek');

const hasVaznyNedostatek =
  pripominkyCombined &&
  /(vážný|závažn)/i.test(pripominkyCombined);

let c32Status = 'bezPripominek';

if (hasVaznyNedostatek) {
  c32Status = 'vaznyNedostatek';
} else if (hasAnyPripominky) {
  c32Status = 'pripominky';
}

body.c32_bezPripominek =
  c32Status === 'bezPripominek' ? '☒' : '☐';

body.c32_pripominky =
  c32Status === 'pripominky' ? '☒' : '☐';

body.c32_vaznyNedostatek =
  c32Status === 'vaznyNedostatek' ? '☒' : '☐';    
/* =======================
       📄 Copy template
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
       ✏ Replace placeholders
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
   🚀 Server start
   ======================= */
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
