const {
  aggregatePripominky,
  resolveStatus,
  applyCheckboxes
} = require('../utils/aggregateHelpers');

module.exports = function handleC22(body) {
  if (!body || typeof body !== 'object') return;

  /* =====================
     POLE PRO AGREGACI
     ===================== */
  const fields = [
    {
      key: 'c22_pouzitiKoncepcniReseni',
      label: 'Použití, koncepční řešení'
    },
    { key: 'c22_dimenzovani', label: 'Dimenzování' },
    { key: 'c22_zapojeni', label: 'Zapojení' },
    { key: 'c22_regulace', label: 'Regulace' },
    { key: 'c22_provozniNastaveni', label: 'Provozní nastavení' },
    { key: 'c22_tepelnaIzolace', label: 'Tepelná izolace' },
    { key: 'c22_stavArmatur', label: 'Stav armatur' },
    { key: 'c22_dalsi', label: 'Další' },
    {
      key: 'c22_zjisteneRozporySPozadavkyPravnichPredpisu',
      label: 'Zjištěné rozpory s požadavky právních předpisů'
    },
    {
      key: 'c22_zjisteneRozporySPokynyVyrobce',
      label: 'Zjištěné rozpory s pokyny výrobce'
    },
    {
      key: 'c22_dalsiVazneNedostatky',
      label: 'Další zjištěné vážné nedostatky'
    }
  ];

  /* =====================
     VÁŽNÉ NEDOSTATKY
     ===================== */
  const vaznyFields = [
    'c22_zjisteneRozporySPozadavkyPravnichPredpisu',
    'c22_zjisteneRozporySPokynyVyrobce',
    'c22_dalsiVazneNedostatky'
  ];

  /* =====================
     DEFAULTY
     ===================== */
  /*setIfEmpty(
    body,
    'c22_zjisteneRozporySPozadavkyPravnichPredpisu',
    'bez připomínek'
  );
  setIfEmpty(
    body,
    'c22_zjisteneRozporySPokynyVyrobce',
    'bez připomínek'
  );
  setIfEmpty(
    body,
    'c22_dalsiVazneNedostatky',
    'bez připomínek'
  );*/

  /* =====================
     AGREGACE
     ===================== */
  const combined = aggregatePripominky(body, fields);

  body.c22_vsechnyPripominky =
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
  applyCheckboxes(body, 'c22', status);
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