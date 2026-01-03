

module.exports = async function insertSingleImageWithCaption({
  documentId,
  placeholder,
  imageFileId,
  docs
}) {
	console.log('Searching for placeholder:', placeholder);
  if (!imageFileId) return;

  const doc = await docs.documents.get({ documentId });

  let startIndex = null;
  let endIndex = null;

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

  await docs.documents.batchUpdate({
    documentId,
    requestBody: {
      requests: [
        {
          deleteContentRange: {
            range: { startIndex, endIndex }
          }
        },
        {
          insertInlineImage: {
            location: { index: startIndex },
            uri: `https://drive.google.com/uc?id=${imageFileId}`,
            objectSize: {
              width: { magnitude: 481, unit: 'PT' },
              height: { magnitude: 481, unit: 'PT' }
            }
          }
        }
      ]
    }
  });
};
