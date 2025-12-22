const {
  aggregatePripominky,
  resolveStatus,
  applyCheckboxes
} = require('../utils/aggregateHelpers');

module.exports = function handleC42(body) {
  if (!body || typeof body !== 'object') return;

  const fields = [
    { key: 'pouzitiKoncepcniReseni2', label: 'Použití, koncepční řešení' },
    { key: 'dimenzovani2', label: 'Dimenzování' },
    { key: 'zapojeni2', label: 'Zapojení' },
    { key: 'regulace2', label: 'Regulace' },
    { key: 'provozniNastaveni2', label: 'Provozní nastavení' },
    { key: 'tepelnaIzolace2', label: 'Tepelná izolace' },
    { key: 'stavArmatur2', label: 'Stav armatur' },
    { key: 'dalsi2', label: 'Další' }
  ];

  const vaznyFields = [
    'zjisteneRozporySPozadavkyPravnichPredpisu3',
    'zjisteneRozporySPokynyVyrobce3',
    'dalsiZjisteneVazneNedostatky3'
  ];

  const combined = aggregatePripominky(body, fields);

  body.c42_vsechnyPripominky =
    combined || 'bez připomínek';

  const status = resolveStatus({
    combined,
    vaznyFields,
    body
  });

  applyCheckboxes(body, 'c42', status);
};
