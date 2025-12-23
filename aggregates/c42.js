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
  
  setIfEmpty(
    body,
    'С42_pouzitiKoncepcniReseni',
    body.С42_pouzitiKoncepcniReseni || 'bez připomínek'
  );
  setIfEmpty(
    body,
    'С42_dimenzovani',
    body.С42_dimenzovani || 'bez připomínek'
  );
  setIfEmpty(
    body,
    'С42_zapojeni',
    body.С42_zapojeni || 'bez připomínek'
  );
  setIfEmpty(
    body,
    'c42_regulace',
    body.c42_regulace || 'bez připomínek'
  );
  setIfEmpty(
    body,
    'С42_provozniNastaveni',
    body.С42_provozniNastaveni || 'bez připomínek'
  );
  setIfEmpty(
    body,
    'С42_tepelnaIzolace',
    body.С42_tepelnaIzolace || 'bez připomínek'
  );
  setIfEmpty(
    body,
    'С42_stavArmatur',
    body.С42_stavArmatur || 'bez připomínek'
  );
  setIfEmpty(
    body,
    'С42_zjisteneRozporySPozadavkyPravnichPredpisu',
    body.С42_zjisteneRozporySPozadavkyPravnichPredpisu || 'bez připomínek'
  );
  setIfEmpty(
    body,
    'С42_zjisteneRozporySPokynyVyrobce',
    body.С42_zjisteneRozporySPokynyVyrobce || 'bez připomínek'
  );
  setIfEmpty(
    body,
    'С42_dalsiZjisteneVazneNedostatky',
    body.С42_dalsiZjisteneVazneNedostatky || 'bez připomínek'
  );

  applyCheckboxes(body, 'c42', status);
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