const {
  aggregatePripominky,
  resolveStatus,
  applyCheckboxes,
  setIfEmpty
} = require('../utils/aggregateHelpers');

module.exports = function handleC32(body) {
  if (!body || typeof body !== 'object') return;

  /* =====================
     ZÁKLADNÍ POLE C32
     ===================== */
  const fields = [
    { key: 'c32_pouzitiKoncepcniReseni', label: 'Použití, koncepční řešení' },
    { key: 'c32_dimenzovani', label: 'Dimenzování' },
    { key: 'c32_zapojeni', label: 'Zapojení' },
    { key: 'c32_regulace', label: 'Regulace' },
    { key: 'c32_provozniNastaveni', label: 'Provozní nastavení' },
    { key: 'c32_tepelnaIzolace', label: 'Tepelná izolace' },
    { key: 'c32_stavArmatur', label: 'Stav armatur' },
    { key: 'c32_dalsi', label: 'Další' }
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
