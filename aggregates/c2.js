const applySelectBoxesAnoNe = require('./selectBoxesAnoNe');

module.exports = function handleC2(body) {
  const key = 'c2_pripravaTepleVody';
  const valueKey = 'pripravaTepleVody';

  let checkbox = '☐';

  if (
    body[key] &&
    typeof body[key] === 'object' &&
    body[key][valueKey] === true
  ) {
    checkbox = '☒';
  }

  // 🔹 ОДИН checkbox placeholder
  body.c2_pripravaTepleVody_checkbox = checkbox;
};

