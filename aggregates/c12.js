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
    { key: 'c12_konceptZdroje', label: 'Koncept zdroje' },
    { key: 'c12_dimenzovaniZdroje', label: 'Dimenzování zdroje' },
    { key: 'c12_regulaceZdroje', label: 'Regulace zdroje' },
    { key: 'c12_provozniNastaveniZdroje', label: 'Provozní nastavení zdroje' },
    { key: 'c12_vymenaKomponent', label: 'Výměna komponent' },
    { key: 'c12_provozniDohled', label: 'Provozní dohled' },
    {
      key: 'c12_dostupnostLepsichKomponentAZarizeni',
      label: 'Dostupnost lepších komponent a zařízení'
    },
    { key: 'c12_dalsiPripominky', label: 'Další připomínky' },
    {
      key: 'c12_zjisteneRozporySPozadavkyPravnichPredpisu',
      label: 'Zjištěné rozpory s požadavky právních předpisů'
    },
    {
      key: 'c12_zjisteneRozporySPokynyVyrobce',
      label: 'Zjištěné rozpory s pokyny výrobce'
    },
    {
      key: 'c12_dalsiZjisteneVazneNedostatky',
      label: 'Další zjištěné vážné nedostatky'
    }
  ];

  /* =====================
     VÁŽNÉ NEDOSTATKY
     ===================== */
  const vaznyFields = [
    'c12_zjisteneRozporySPozadavkyPravnichPredpisu',
    'c12_zjisteneRozporySPokynyVyrobce',
    'c12_dalsiZjisteneVazneNedostatky'
  ];

  /* =====================
     DEFAULTY
     ===================== */
  /*setIfEmpty(
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
  );*/

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