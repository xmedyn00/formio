module.exports = function handleC41(body) {
  if (!body || typeof body !== 'object') return;

  /*
    Form.io selectboxes / checkbox object, например:
    prvkySdileniTeplaProTechnickeFunkce = {
      t1VytapeniProstoru: true,
      t2OhrevVzduchu: false,
      t3PripravaTepleVody: true,
      t4TeploProTechnologii: false
    }
  */

  const src = body.prvkySdileniTeplaProTechnickeFunkce || {};

  applyCheckbox(body, 'c41.t1VytapeniProstoru', src.t1VytapeniProstoru);
  applyCheckbox(body, 'c41.t2OhrevVzduchu', src.t2OhrevVzduchu);
  applyCheckbox(body, 'c41.t3PripravaTepleVody', src.t3PripravaTepleVody);
  applyCheckbox(body, 'c41.t4TeploProTechnologii', src.t4TeploProTechnologii);

  /* ===== Souhrnný popis ===== */
  setIfEmpty(
    body,
    'souhrnnyPopisTechnickychFunkci',
    body.souhrnnyPopisTechnickychFunkci || ''
  );
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