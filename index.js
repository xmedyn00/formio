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
    // 👉 все поля необязательные
    const {
      adresaBudovy = '',
      jmenoVlastnika = '',
      jmenoZadavatele = '',
      adresaZadavatele = '',
      ic = '',
      zastupceZadavatele = '',
      datumZpracovani = '',
      datumPristiKontroly = '',
      datumProvedeniVetsiZmenyNaBudove = '',
      vytapenaPlocha = '',
      evidencniCisloEnex = ''
    } = req.body || {};

    // 1️⃣ копия шаблона + конвертация в Google Docs
    const copy = await drive.files.copy({
      fileId: process.env.TEMPLATE_ID,
      requestBody: {
        name: adresaBudovy ? `Firma_${adresaBudovy}` : 'Firma',
        mimeType: 'application/vnd.google-apps.document'
      }
    });

    const documentId = copy.data.id;

    // 2️⃣ все placeholders → всегда заменяются (даже на пусто)
    const replacements = [
      ['{{adresaBudovy}}', adresaBudovy],
      ['{{jmenoVlastnika}}', jmenoVlastnika],
      ['{{jmenoZadavatele}}', jmenoZadavatele],
      ['{{adresaZadavatele}}', adresaZadavatele],
      ['{{ic}}', ic],
      ['{{zastupceZadavatele}}', zastupceZadavatele],
      ['{{datumZpracovani}}', datumZpracovani],
      ['{{datumPristiKontroly}}', datumPristiKontroly],
      ['{{datumProvedeniVetsiZmenyNaBudove}}', datumProvedeniVetsiZmenyNaBudove],
      ['{{vytapenaPlocha}}', vytapenaPlocha],
      ['{{evidencniCisloEnex}}', evidencniCisloEnex]
    ];

    await docs.documents.batchUpdate({
      documentId,
      requestBody: {
        requests: replacements.map(([placeholder, value]) => ({
          replaceAllText: {
            containsText: {
              text: placeholder,
              matchCase: true
            },
            replaceText: value || ''
          }
        }))
      }
    });

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

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
