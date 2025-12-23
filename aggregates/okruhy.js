/**
 * Normalizes Form.io EditGrid "editGrid"
 * into flat placeholders okruh.0.*, okruh.1.*, okruh.2.*
 *
 * Max 3 rows
 */

module.exports = function applyOkruhy(body, options = {}) {
  const {
    sourceKey = 'editGrid',
    targetKey = 'okruh',
    max = 3
  } = options;

  const rows = Array.isArray(body[sourceKey])
    ? body[sourceKey].slice(0, max)
    : [];

  rows.forEach((row, index) => {
    body[`${targetKey}.${index}.cislo`] =
      row.textField || '';

    body[`${targetKey}.${index}.oznaceni`] =
      row.oznaceniNaprOtopnaTelesaPodlahoveVytapeniVzduchotechnika || '';

    body[`${targetKey}.${index}.teplonosnaLatka`] =
      row.teplonosnaLatka || '';

    if (
      row.teplotaVPrivodnimPotrubiC1 != null &&
      row.teplotaVeVratnemPotrubiC3 != null
    ) {
      body[`${targetKey}.${index}.vypoctovyTeplotniSpad`] =
        `${row.teplotaVPrivodnimPotrubiC1}/${row.teplotaVeVratnemPotrubiC3}`;
    } else {
      body[`${targetKey}.${index}.vypoctovyTeplotniSpad`] = '';
    }

    body[`${targetKey}.${index}.prenasenyVykon`] =
      row.prenasenyVykonKW != null
        ? String(row.prenasenyVykonKW)
        : '';

    body[`${targetKey}.${index}.typTepelneIzolace`] =
      row.typTepelneIzolace || '';
  });

  // Clean unused placeholders
  for (let i = rows.length; i < max; i++) {
    body[`${targetKey}.${i}.cislo`] = '';
    body[`${targetKey}.${i}.oznaceni`] = '';
    body[`${targetKey}.${i}.teplonosnaLatka`] = '';
    body[`${targetKey}.${i}.vypoctovyTeplotniSpad`] = '';
    body[`${targetKey}.${i}.prenasenyVykon`] = '';
    body[`${targetKey}.${i}.typTepelneIzolace`] = '';
  }
};
