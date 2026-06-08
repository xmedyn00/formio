/**
 * C.1.16 – Regulace výkonu zdroje (SelectBoxes)
 *
 * ❗ Pravidla:
 * - vždy vypíše VŠECHNY možnosti
 * - vybrané → ☒
 * - nevybrané → ☐
 * - NIKDY nepřepisuje existující klíče
 */

// FIX: use shared helper instead of local duplicate
const { setIfEmpty } = require('../utils/helpers');

module.exports = function handleC116(body) {
  // FIX: guard against non-object (e.g. already-stringified value)
  const source =
    body.regulaceVykonuZdroje &&
    typeof body.regulaceVykonuZdroje === 'object'
      ? body.regulaceVykonuZdroje
      : {};

  const OPTIONS = {
    kvantitativni: 'kvantitativní',
    kvalitativni:  'kvalitativní',
    jina:          'jiná'
  };

  Object.keys(OPTIONS).forEach(key => {
    setIfEmpty(
      body,
      `regulaceVykonuZdroje.${key}`,
      source[key] === true ? '☒' : '☐'
    );
  });
};
