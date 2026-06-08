const {
  aggregatePripominky,
  resolveStatus,
  applyCheckboxes
} = require('../utils/aggregateHelpers');
const { setIfEmpty } = require('../utils/helpers');

module.exports = function handleC52(body) {
  if (!body || typeof body !== 'object') return;

  const fields = [
    { key: 'c52_celkoveReseni',                             label: 'Celkové řešení' },
    { key: 'c52_fakturacniMereni',                          label: 'Fakturační měření dodané energie' },
    { key: 'c52_podruzneMereniOkruhy',                      label: 'Podružné měření na okruzích' },
    { key: 'c52_mereniSdileniTepla',                        label: 'Měření na prvcích pro sdílení tepla' },
    { key: 'c52_rozuctovaniNakladu',                        label: 'Rozúčtování nákladů' },
    { key: 'c52_dataSpotreba',                              label: 'Ukládání dat o spotřebě a práce s nimi' },
    { key: 'c52_autodiagnostikaOdchylek',                   label: 'Autodiagnostika odchylek od běžné spotřeby' },
    { key: 'c52_uzivatelskeRozhrani',                       label: 'Uživatelské rozhraní a informování uživatelů' },
    { key: 'c52_dalsi',                                     label: 'Další' },
    { key: 'c52_zjisteneRozporySPozadavkyPravnichPredpisu', label: 'Zjištěné rozpory s požadavky právních předpisů' },
    { key: 'c52_zjisteneRozporySPokynyVyrobce',             label: 'Zjištěné rozpory s pokyny výrobce' },
    { key: 'c52_dalsiZjisteneVazneNedostatky',              label: 'Další zjištěné vážné nedostatky' }
  ];

  const vaznyFields = [
    'c52_zjisteneRozporySPozadavkyPravnichPredpisu',
    'c52_zjisteneRozporySPokynyVyrobce',
    'c52_dalsiZjisteneVazneNedostatky'
  ];

  // NOTE: do NOT default fields before aggregation — see c42.js for explanation.

  const combined = aggregatePripominky(body, fields);
  body.c52_vsechnyPripominky = combined || 'bez připomínek';

  const status = resolveStatus({ combined, vaznyFields, body });
  applyCheckboxes(body, 'c52', status);
};
