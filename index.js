const express = require('express');
const { google } = require('googleapis');

const app = express();
app.use(express.json());

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// 👇 refresh token используется автоматически
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

app.post('/generate-doc', async (req, res) => {
  try {
    const { companyName, ico } = req.body;

    if (!companyName || !ico) {
      return res.status(400).json({ error: 'Missing parameters' });
    }

    // 1️⃣ Копия шаблона
    const copy = await drive.files.copy({
      fileId: process.env.TEMPLATE_ID,
      requestBody: {
        name: `Firma_${companyName}`
      }
    });

    const documentId = copy.data.id;

    // 2️⃣ Замена параметров
    await docs.documents.batchUpdate({
      documentId,
      requestBody: {
        requests: [
          {
            replaceAllText: {
              containsText: {
                text: '{{companyName}}',
                matchCase: true
              },
              replaceText: companyName
            }
          },
          {
            replaceAllText: {
              containsText: {
                text: '{{ico}}',
                matchCase: true
              },
              replaceText: ico
            }
          }
        ]
      }
    });

    // 3️⃣ Ответ
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
