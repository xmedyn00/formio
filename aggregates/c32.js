const {
  aggregatePripominky,
  resolveStatus,
  applyCheckboxes
} = require('../utils/aggregateHelpers');

module.exports = function handleC32(body) {
  if (!body || typeof body !== 'object') return;

  /* =====================
     ZÁKLADNÍ POLE C32
     ===================== */
  const fields = [
    { key: 'c32_pouzitiKoncepcniReseni', },
    { key: 'c32_dimenzovani', },
    { key: 'c32_zapojeni', },
    { key: 'c32_regulace', },
    { key: 'c32_provozniNastaveni', },
    { key: 'c32_tepelnaIzolace', },
    { key: 'c32_stavArmatur', },
    { key: 'c32_dalsi' }
    { key: 'c32_zjisteneRozporySPozadavkyPravnichPredpisu' }
    { key: 'c32_zjisteneRozporySPokynyVyrobce' }
    { key: 'c32_dalsiZjisteneVazneNedostatky' }
  ];

  /* =====================
     VÁŽNÉ NEDOSTATKY
     ===================== */
  const vaznyFields = [
    'c32_zjisteneRozporySPozadavkyPravnichPredpisu',
    'c32_zjisteneRozporySPokynyVyrobce',
    'c32_dalsiZjisteneVazneNedostatky'
  ];

  /* =====================
     DEFAULTNÍ HODNOTY
     ===================== */
  setIfEmpty(
    body,
    'c32_zjisteneRozporySPozadavkyPravnichPredpisu',
    'bez připomínek'
  );

  setIfEmpty(
    body,
    'c32_zjisteneRozporySPokynyVyrobce',
    'bez připomínek'
  );

  setIfEmpty(
    body,
    'c32_dalsiZjisteneVazneNedostatky',
    'bez připomínek'
  );

  /* =====================
     AGREGACE PŘIPOMÍNEK
     ===================== */
  const combined = aggregatePripominky(body, fields);

  body.c32_vsechnyPripominky =
    combined || 'bez připomínek';

  /* =====================
     VYHODNOCENÍ STAVU
     ===================== */
  const status = resolveStatus({
    combined,
    vaznyFields,
    body
  });

  /* =====================
     CHECKBOXY (ANO / NE)
     ===================== */
  applyCheckboxes(body, 'c32', status);
};

function setIfEmpty(body, key, value) {
  if (
    body[key] === undefined ||
    body[key] === null ||
    body[key] === ''
  ) {
    body[key] = value;
  }
}
