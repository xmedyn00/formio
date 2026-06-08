function setIfEmpty(body, key, value) {
  if (body[key] === undefined || body[key] === null || body[key] === '') {
    body[key] = value;
  }
} 

function toStr(v) {
  return v != null ? String(v) : '';
}

function formatDateCZ(value) {
  if (!value) return '';
  const d = new Date(value);
  return `${String(d.getUTCDate()).padStart(2, '0')}.${String(
    d.getUTCMonth() + 1
  ).padStart(2, '0')}.${d.getFullYear()}`;
}

module.exports = { setIfEmpty, toStr, formatDateCZ };
