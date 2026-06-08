/**
 * C.1.16 – Regulace výkonu zdroje (SelectBoxes)
 *
 * ❗ Pravidla:
 * - vždy vypíše VŠECHNY možnosti
 * - vybrané → ☒
 * - nevybrané → ☐
 * - NIKDY nepřepisuje existující klíče
 */

module.exports = function handleC116(body) {
  const source = body.regulaceVykonuZdroje || {};

  const OPTIONS = {
    kvantitativni: 'kvantitativní',
    kvalitativni: 'kvalitativní',
    jina: 'jiná'
  };

  Object.keys(OPTIONS).forEach(key => {
    setIfEmpty(
      body,
      `regulaceVykonuZdroje.${key}`,
      source[key] === true ? '☒' : '☐'
    );
  });
};

/* =====================
   HELPERS
   ===================== */

function setIfEmpty(body, key, value) {
  if (body[key] === undefined || body[key] === '') {
    body[key] = value;
  }
}