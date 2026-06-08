const {
  aggregatePripominky,
  resolveStatus,
  applyCheckboxes
} = require('../utils/aggregateHelpers');

// FIX: use shared helper instead of local duplicate
const { setIfEmpty } = require('../utils/helpers');

module.exports = function handleC32(body) {
  if (!body || typeof body !== 'object') return;

  /* =====================
     ZÁKLADNÍ POLE C32
     ===================== */
  const fields = [
    { key: 'c32_pouzitiKoncepcniReseni',                    label: 'Použití, koncepční řešení' },
    { key: 'c32_dimenzovani',                               label: 'Dimenzování' },
    { key: 'c32_zapojeni',                                  label: 'Zapojení' },
    { key: 'c32_regulace',                                  label: 'Regulace' },
    { key: 'c32_provozniNastaveni',                         label: 'Provozní nastavení' },
    { key: 'c32_tepelnaIzolace',                            label: 'Tepelná izolace' },
    { key: 'c32_stavArmatur',                               label: 'Stav armatur' },
    { key: 'c32_dalsi',                                     label: 'Další' },
    { key: 'c32_zjisteneRozporySPozadavkyPravnichPredpisu', label: 'Rozpory s pozadavky pravnich predpisu' },
    { key: 'c32_zjisteneRozporySPokynyVyrobce',             label: 'Rozpory s pokyny vyrobce' },
    { key: 'c32_dalsiZjisteneVazneNedostatky',              label: 'Další vazne nedostatky' }
  ];

  /* =====================
     VÁŽNÉ NEDOSTATKY
     ===================== */
  const vaznyFields = [
    'c32_zjisteneRozporySPozadavkyPravnichPredpisu',
    'c32_zjisteneRozporySPokynyVyrobce',
    'c32_dalsiZjisteneVazneNedostatky'
  ];

  // NOTE: do NOT default fields before aggregation — see c12.js for explanation.

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
