const {
  aggregatePripominky,
  resolveStatus,
  applyCheckboxes
} = require('../utils/aggregateHelpers');
const { setIfEmpty } = require('../utils/helpers');

module.exports = function handleC42(body) {
  if (!body || typeof body !== 'object') return;

  const fields = [
    { key: 'c42_pouzitiKoncepcniReseni', label: 'Použití, koncepční řešení' },
    { key: 'c42_dimenzovani',            label: 'Dimenzování' },
    { key: 'c42_zapojeni',               label: 'Zapojení' },
    { key: 'c42_regulace',               label: 'Regulace' },
    { key: 'c42_provozniNastaveni',      label: 'Provozní nastavení' },
    { key: 'c42_tepelnaIzolace',         label: 'Tepelná izolace' },
    { key: 'c42_stavArmatur',            label: 'Stav armatur' },
    { key: 'c42_dalsi',                  label: 'Další' }
  ];

  const vaznyFields = [
    'c42_zjisteneRozporySPozadavkyPravnichPredpisu',
    'c42_zjisteneRozporySPokynyVyrobce',
    'c42_dalsiZjisteneVazneNedostatky'
  ];

  // NOTE: do NOT default fields before aggregation.
  // aggregatePripominky filters out empty values, so defaulting them to a
  // non-empty string (even 'bez připomínek') makes every field appear in
  // combined, causing status to resolve as 'pripominky' when the user left
  // everything blank. The correct default is applied after aggregation via
  // `combined || 'bez připomínek'` below.

  const combined = aggregatePripominky(body, fields);
  body.c42_vsechnyPripominky = combined || 'bez připomínek';

  const status = resolveStatus({ combined, vaznyFields, body });
  applyCheckboxes(body, 'c42', status);
};
