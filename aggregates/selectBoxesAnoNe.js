/**
 * ☑ SELECTBOXES → ANO / NE CHECKBOXES
 *
 * body.selectBoxes = {
 *   key: boolean
 * }
 */
module.exports = function applySelectBoxesAnoNe(
  body,
  config
) {
  const { key, values } = config;

  if (!body[key] || typeof body[key] !== 'object') {
    return;
  }

  const data = body[key];

  values.forEach(item => {
    const checked = Boolean(data[item.value]);

    // ✅ ANO
    body[`${key}_${item.value}_ano`] = checked ? '☒' : '☐';

    // ❌ NE
    body[`${key}_${item.value}_ne`] = checked ? '☐' : '☒';
  });
};