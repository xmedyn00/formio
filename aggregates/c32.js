const {
  aggregatePripominky,
  resolveStatus,
  applyCheckboxes
} = require('../utils/aggregateHelpers');

module.exports = function handleC32(body) {
  if (!body || typeof body !== 'object') return;

  const fields = [
    { key: 'c32.pouzitiKoncepcniReseni', label: 'Použití, koncepční řešení' },
    { key: 'c32.dimenzovani', label: 'Dimenzování' },
    { key: 'c32.zapojeni', label: 'Zapojení' },
    { key: 'c32.regulace', label: 'Regulace' },
    { key: 'c32.provozniNastaveni', label: 'Provozní nastavení' },
    { key: 'c32.tepelnaIzolace', label: 'Tepelná izolace' },
    { key: 'c32.stavArmatur', label: 'Stav armatur' },
    { key: 'c32.dalsi', label: 'Další' }
  ];

  const vaznyFields = [
    'c32.tepelnaIzolace',
    'c32.zjisteneRozporySPozadavkyPravnichPredpisu',
    'c32.dalsiZjisteneVazneNedostatky'
  ];

  const combined = aggregatePripominky(body, fields);

  body.c32_vsechnyPripominky =
    combined || 'bez připomínek';

  const status = resolveStatus({
    combined,
    vaznyFields,
    body
  });

  applyCheckboxes(body, 'c32', status);
};
