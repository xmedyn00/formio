module.exports = async function insertImagesAtPlaceholder({
  documentId,
  placeholder,
  imageFileIds,
  docs
}) {
  if (!documentId || !docs || !placeholder) {
    console.warn('⛔ insertImagesAtPlaceholder skipped: missing documentId / docs / placeholder');
    return;
  }

  if (!Array.isArray(imageFileIds) || imageFileIds.length === 0) {
    console.warn('⛔ insertImagesAtPlaceholder skipped: imageFileIds empty or not array');
    return;
  }

  const validImageIds = imageFileIds.filter(
    id => typeof id === 'string' && id.trim().length > 0
  );

  if (validImageIds.length === 0) {
    console.log(`ℹ insertImagesAtPlaceholder skipped: no images for ${placeholder}`);
    return;
  }

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

  const requests = [
    {
      deleteContentRange: {
        range: { startIndex, endIndex }
      }
    }
  ];

  let cursor = startIndex;

  const isFotografieBudovy = placeholder === '{{fotografieBudovy}}';

  for (const fileId of validImageIds) {
    const insertImageRequest = {
      insertInlineImage: {
        location: { index: cursor },
        uri: `https://drive.google.com/uc?id=${fileId}`
      }
    };

    // ✅ Масштаб ТОЛЬКО для fotografieBudovy
    if (isFotografieBudovy) {
      insertImageRequest.insertInlineImage.objectSize = {
        height: { magnitude: 310, unit: 'PT' }
      };
    }

    requests.push(insertImageRequest);

    // перенос строки после изображения
    requests.push({
      insertText: {
        location: { index: cursor + 1 },
        text: '\n'
      }
    });

    cursor += 2;
  }

  await docs.documents.batchUpdate({
    documentId,
    requestBody: { requests }
  });
};
