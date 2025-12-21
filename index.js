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

    // 1️⃣ копия шаблона + Google Docs
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

    // 2️⃣ АВТОМАТИЧЕСКИЕ ЗАМЕНЫ
    const requests = Object.entries(body).map(([key, value]) => ({
      replaceAllText: {
        containsText: {
          text: `{{${key}}}`,
          matchCase: true
        },
        replaceText: String(value ?? '')
      }
    }));

    // 3️⃣ выполняем batchUpdate ТОЛЬКО если есть данные
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
