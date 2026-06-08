/**
 * ☑ SELECTBOXES → ANO / NE CHECKBOXES
 *
 * body[key] = { [valueKey]: boolean }
 *
 * Generates for each item:
 *   body[`${key}_${value}_ano`]   = '☒' | '☐'
 *   body[`${key}_${value}_ne`]    = '☐' | '☒'
 *   body[`${key}_${value}_anone`] = 'ANO' | 'NE'
 *
 * Optional per-item:
 *   onYesText + targetKey  → sets body[targetKey] when the box IS checked
 *   onNoText  + targetKey  → sets body[targetKey] when the box is NOT checked
 */
module.exports = function applySelectBoxesAnoNe(body, config) {
  const { key, values } = config;

  if (!body[key] || typeof body[key] !== 'object') return;

  const data = body[key];

  values.forEach(item => {
    const checked = Boolean(data[item.value]);

    body[`${key}_${item.value}_ano`]   = checked ? '☒' : '☐';
    body[`${key}_${item.value}_ne`]    = checked ? '☐' : '☒';
    body[`${key}_${item.value}_anone`] = checked ? 'ANO' : 'NE';

    if (item.targetKey) {
      if (item.onYesText && checked) {
        body[item.targetKey] = item.onYesText;
      }
      if (item.onNoText && !checked) {
        body[item.targetKey] = item.onNoText;
      }
    }
  });
};
