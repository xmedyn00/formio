module.exports = async function insertSingleImageWithCaption({
  documentId,
  placeholder,
  imageFileId,
  caption,
  docs
}) {
  if (!imageFileId) {
    console.warn('⚠ imageFileId not provided');
    return;
  }

  const doc = await docs.documents.get({ documentId });

  let startIndex = null;
  let endIndex = null;

  // 🔍 ищем плейсхолдер
  for (const element of doc.data.body.content) {
    if (!element.paragraph) continue;

    for (const el of element.paragraph.elements || []) {
      const text = el.textRun?.content;
      if (!text) continue;

      const pos = text.indexOf(placeholder);
      if (pos !== -1) {
        startIndex = el.startIndex + pos;
        endIndex = startIndex + placeholder.length;
        break;
      }
    }

    if (startIndex !== null) break;
  }

  if (startIndex === null) {
    console.warn(`⚠ Placeholder ${placeholder} not found`);
    return;
  }

  const requests = [
    // 🗑 удалить {{placeholder}}
    {
      deleteContentRange: {
        range: { startIndex, endIndex }
      }
    },

    // 🖼 вставить изображение
    {
      insertInlineImage: {
        location: { index: startIndex },
        uri: `https://drive.google.com/uc?id=${imageFileId}`,
        objectSize: {
          width: { magnitude: 591, unit: 'PT' },
          height: { magnitude: 400, unit: 'PT' }
        }
      }
    },

    // ↩ перенос строки
    {
      insertText: {
        location: { index: startIndex + 1 },
        text: '\n'
      }
    }
  ];

  // 🧾 подпись (если есть)
  if (caption) {
    requests.push({
      insertText: {
        location: { index: startIndex + 2 },
        text: caption + '\n'
      }
    });
  }

  await docs.documents.batchUpdate({
    documentId,
    requestBody: { requests }
  });
};