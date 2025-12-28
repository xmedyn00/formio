module.exports = function handleC41(body) {
  if (!body || typeof body !== 'object') return;


  const src = body.prvkySdileniTeplaProTechnickeFunkce || {};

  applyCheckbox(body, 'c41_t1VytapeniProstoru', src.t1VytapeniProstoru);
  applyCheckbox(body, 'c41_t3PripravaTepleVody', src.t3PripravaTepleVody);
};

/* =====================
   HELPERS (lokální)
   ===================== */

function applyCheckbox(body, key, value) {
  body[key] = value ? '☒' : '☐';
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