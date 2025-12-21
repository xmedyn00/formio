const express = require('express');
const { google } = require('googleapis');

const app = express();

/* =======================
   🔐 CORS (ДОЛЖЕН БЫТЬ ЗДЕСЬ)
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

/* ======================= */

app.use(express.json());

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

app.post('/generate-doc', async (req, res) => {
  try {
    const { adresaBudovy, jmenoVlastnika, jmenoZadavatele, adresaZadavatele } = req.body;

    if (!adresaBudovy || !jmenoVlastnika || !jmenoZadavatele || !adresaZadavatele) {
      return res.status(400).json({ error: 'Missing parameters' });
    }

    // 1️⃣ копия шаблона
    const copy = await drive.files.copy({
      fileId: process.env.TEMPLATE_ID,
      requestBody: {
        name: `Firma_${adresaBudovy}`
      }
    });

    const documentId = copy.data.id;

    // 2️⃣ замены
    await docs.documents.batchUpdate({
      documentId,
      requestBody: {
        requests: [
          {
            replaceAllText: {
              containsText: { text: '{{adresaBudovy}}', matchCase: true },
              replaceText: adresaBudovy
            }
          },
          {
            replaceAllText: {
              containsText: { text: '{{jmenoVlastnika}}', matchCase: true },
              replaceText: jmenoVlastnika
            }
          },
          {
            replaceAllText: {
              containsText: { text: '{{jmenoZadavatele}}', matchCase: true },
              replaceText: jmenoZadavatele
            }
          },
          {
            replaceAllText: {
              containsText: { text: '{{adresaZadavatele}}', matchCase: true },
              replaceText: adresaZadavatele
            }
          }
        ]
      }
    });

    res.json({
      url: `https://docs.google.com/document/d/${documentId}/edit`
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Google Docs generation failed' });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
