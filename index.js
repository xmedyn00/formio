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
