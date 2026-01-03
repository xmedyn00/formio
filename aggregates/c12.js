const {
  aggregatePripominky,
  resolveStatus,
  applyCheckboxes
} = require('../utils/aggregateHelpers');

module.exports = function handleC12(body) {
  if (!body || typeof body !== 'object') return;

  /* =====================
     POLE PRO AGREGACI
     ===================== */
  const fields = [
    { key: 'konceptZdroje', label: 'Koncept zdroje' },
    { key: 'dimenzovaniZdroje', label: 'Dimenzování zdroje' },
    { key: 'regulaceZdroje', label: 'Regulace zdroje' },
    { key: 'provozniNastaveniZdroje', label: 'Provozní nastavení zdroje' },
    { key: 'vymenaKomponent', label: 'Výměna komponent' },
    { key: 'provozniDohled', label: 'Provozní dohled' },
    {
      key: 'dostupnostLepsichKomponentAZarizeni',
      label: 'Dostupnost lepších komponent a zařízení'
    },
    { key: 'dalsiPripominky', label: 'Další připomínky' },
    {
      key: 'zjisteneRozporySPozadavkyPravnichPredpisu',
      label: 'Zjištěné rozpory s požadavky právních předpisů'
    },
    {
      key: 'zjisteneRozporySPokynyVyrobce',
      label: 'Zjištěné rozpory s pokyny výrobce'
    },
    {
      key: 'dalsiZjisteneVazneNedostatky',
      label: 'Další zjištěné vážné nedostatky'
    }
  ];

  /* =====================
     VÁŽNÉ NEDOSTATKY
     ===================== */
  const vaznyFields = [
    'zjisteneRozporySPozadavkyPravnichPredpisu',
    'zjisteneRozporySPokynyVyrobce',
    'dalsiZjisteneVazneNedostatky'
  ];

  /* =====================
     DEFAULTY
     ===================== */
  setIfEmpty(
    body,
    'zjisteneRozporySPozadavkyPravnichPredpisu',
    'bez připomínek'
  );
  setIfEmpty(
    body,
    'zjisteneRozporySPokynyVyrobce',
    'bez připomínek'
  );
  setIfEmpty(
    body,
    'dalsiZjisteneVazneNedostatky',
    'bez připomínek'
  );

  /* =====================
     AGREGACE
     ===================== */
  const combined = aggregatePripominky(body, fields);

  body.c12_vsechnyPripominky =
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
     CHECKBOXY
     ===================== */
  applyCheckboxes(body, 'c12', status);
};

/* =====================
   HELPER
   ===================== */
function setIfEmpty(body, key, value) {
  if (
    body[key] === undefined ||
    body[key] === null ||
    body[key] === ''
  ) {
    body[key] = value;
  }
}