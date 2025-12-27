const {
  aggregatePripominky,
  resolveStatus,
  applyCheckboxes
} = require('../utils/aggregateHelpers');

module.exports = function handleC42(body) {
  if (!body || typeof body !== 'object') return;

  const fields = [
    { key: 'c42_pouzitiKoncepcniReseni', label: 'Použití, koncepční řešení' },
    { key: 'c42_dimenzovani', label: 'Dimenzování' },
    { key: 'c42_zapojeni', label: 'Zapojení' },
    { key: 'c42_regulace', label: 'Regulace' },
    { key: 'c42_provozniNastaveni', label: 'Provozní nastavení' },
    { key: 'c42_tepelnaIzolace', label: 'Tepelná izolace' },
    { key: 'c42_stavArmatur', label: 'Stav armatur' },
    { key: 'c42_dalsi', label: 'Další' }
  ];

  const vaznyFields = [
    'c42_zjisteneRozporySPozadavkyPravnichPredpisu',
    'c42_zjisteneRozporySPokynyVyrobce',
    'c42_dalsiZjisteneVazneNedostatky'
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