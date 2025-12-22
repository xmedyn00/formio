const express = require('express');
const { google } = require('googleapis');

/* =======================
   📦 IMPORT MODULES
   ======================= */
const handleC32 = require('./aggregates/c32-pripominky');
const handleC42 = require('./aggregates/c42-pripominky');
const handleC52 = require('./aggregates/c52-pripominky');

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
