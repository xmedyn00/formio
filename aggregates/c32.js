const {
  aggregatePripominky,
  resolveStatus,
  applyCheckboxes
} = require('../utils/aggregateHelpers');

module.exports = function handleC32(body) {
  if (!body || typeof body !== 'object') return;

  const fields = [
    { key: 'pouzitiKoncepcniReseni1', label: 'Použití, koncepční řešení' },
    { key: 'dimenzovani1', label: 'Dimenzování' },
    { key: 'zapojeni1', label: 'Zapojení' },
    { key: 'regulace1', label: 'Regulace' },
    { key: 'provozniNastaveni1', label: 'Provozní nastavení' },
    { key: 'tepelnaIzolace1', label: 'Tepelná izolace' },
    { key: 'stavArmatur1', label: 'Stav armatur' },
    { key: 'dalsi1', label: 'Další' }
  ];

  const vaznyFields = [
    'tepelnaIzolace1',
    'zjisteneRozporySPokynyVyrobce2',
    'dalsiZjisteneVazneNedostatky2'
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
