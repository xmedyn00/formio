function aggregatePripominky(body, fields) {
  return fields
    .map(({ key, label }) => {
      const value = body[key];
      if (!value || !String(value).trim()) return null;
      return `${label}:\n${String(value).trim()}`;
    })
    .filter(Boolean)
    .join('\n\n');
}

function resolveStatus({ combined, vaznyFields, body }) {
  const hasVazny = vaznyFields.some(
    key => body[key] && String(body[key]).trim()
  );

  const hasPripominky =
    Boolean(combined && combined !== 'bez připomínek');

  if (hasVazny) return 'vaznyNedostatek';
  if (hasPripominky) return 'pripominky';
  return 'bezPripominek';
}

function applyCheckboxes(body, prefix, status) {
  body[`${prefix}_bezPripominek`] =
    status === 'bezPripominek' ? '☒' : '☐';

  body[`${prefix}_pripominky`] =
    status === 'pripominky' ? '☒' : '☐';

  body[`${prefix}_vaznyNedostatek`] =
    status === 'vaznyNedostatek' ? '☒' : '☐';
}

function setIfEmpty(body, key, value) {
  if (
    body[key] === undefined ||
    body[key] === null ||
    body[key] === ''
  ) {
    body[key] = value;
  }
}

module.exports = {
  aggregatePripominky,
  resolveStatus,
  applyCheckboxes
};
