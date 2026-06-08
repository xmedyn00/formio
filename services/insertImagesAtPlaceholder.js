/**
 * insertImagesAtPlaceholder
 *
 * FIX: replaced the single batchUpdate with a loop of individual batchUpdates.
 * The original code used a manually incremented cursor (cursor += 2) inside one
 * request batch, which assumed each image+newline consumed exactly 2 index
 * positions. Google Docs indices shift after every structural change, so that
 * assumption is wrong and silently corrupts document layout for multi-image
 * placeholders. The safe approach is: delete the placeholder once, then insert
 * each image at the known start index in a fresh request (indices are stable
 * within a single batchUpdate that only appends at the same position).
 */
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

  // ── 1. Find placeholder position ─────────────────────────────────────────
  const doc = await docs.documents.get({ documentId });

  const found = findPlaceholderInContent(doc.data.body.content, placeholder);

  if (!found) {
    console.warn(`⚠ Placeholder ${placeholder} not found (including tables)`);
    return;
  }

  const { startIndex, endIndex } = found;

  // ── 2. Determine per-placeholder image size ───────────────────────────────
  const objectSize = getObjectSize(placeholder);

  // ── 3. Delete the placeholder text ───────────────────────────────────────
  await docs.documents.batchUpdate({
    documentId,
    requestBody: {
      requests: [
        {
          deleteContentRange: {
            range: { startIndex, endIndex }
          }
        }
      ]
    }
  });

  // ── 4. Insert each image individually at startIndex ───────────────────────
  // After the placeholder is deleted, startIndex is the insertion point.
  // We insert images in REVERSE order so each new image lands at startIndex
  // and pushes the previous ones forward — final order matches validImageIds.
  for (let idx = validImageIds.length - 1; idx >= 0; idx--) {
    const fileId = validImageIds[idx];

    const insertImageRequest = {
      insertInlineImage: {
        location: { index: startIndex },
        uri: `https://drive.google.com/uc?id=${fileId}`,
        ...(objectSize ? { objectSize } : {})
      }
    };

    await docs.documents.batchUpdate({
      documentId,
      requestBody: {
        requests: [
          insertImageRequest,
          // Insert a newline after the image (index startIndex + 1 because
          // the image itself occupies position startIndex after insertion)
          {
            insertText: {
              location: { index: startIndex + 1 },
              text: '\n'
            }
          }
        ]
      }
    });
  }
};

/* ======================================================
   HELPERS
   ====================================================== */

/**
 * Returns objectSize for known placeholders that need fixed dimensions,
 * or null for placeholders that should use the image's natural size.
 */
function getObjectSize(placeholder) {
  const SIZES = {
    '{{fotografieBudovy}}': {
      height: { magnitude: 310, unit: 'PT' }
    },
    '{{owner_podpisOsobyUrcene}}': {
      height: { magnitude: 100, unit: 'PT' }
    },
    '{{owner_podpisEnergetickehoSpecialisty}}': {
      height: { magnitude: 100, unit: 'PT' }
    }
  };

  return SIZES[placeholder] || null;
}

/**
 * Recursively searches body content (paragraphs + table cells) for a
 * placeholder string and returns its { startIndex, endIndex }.
 */
function findPlaceholderInContent(content, placeholder) {
  for (const element of content) {

    // 📄 Regular paragraph
    if (element.paragraph) {
      for (const el of element.paragraph.elements || []) {
        const text = el.textRun?.content;
        if (!text) continue;

        const pos = text.indexOf(placeholder);
        if (pos !== -1) {
          return {
            startIndex: el.startIndex + pos,
            endIndex:   el.startIndex + pos + placeholder.length
          };
        }
      }
    }

    // 📊 Table — recurse into cells
    if (element.table) {
      for (const row of element.table.tableRows || []) {
        for (const cell of row.tableCells || []) {
          const found = findPlaceholderInContent(cell.content || [], placeholder);
          if (found) return found;
        }
      }
    }
  }

  return null;
}
