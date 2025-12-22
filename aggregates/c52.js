const {
  aggregatePripominky,
  resolveStatus,
  applyCheckboxes
} = require('../utils/aggregateHelpers');

module.exports = function handleC52(body) {
  if (!body || typeof body !== 'object') return;

  const fields = [
    { key: 'celkoveReseni', label: 'Celkové řešení' },
    { key: 'fakturacniMereniDodaneEnergie', label: 'Fakturační měření dodané energie' },
    { key: 'podruzneMereniNaOkruzich', label: 'Podružné měření na okruzích' },
    { key: 'mereniNaPrvcichNaSdileniTepla', label: 'Měření na prvcích pro sdílení tepla' },
    { key: 'rozuctovaniNakladu', label: 'Rozúčtování nákladů' },
    { key: 'ukladaniDatOSpotrebeAPraceSNimi', label: 'Ukládání dat o spotřebě a práce s nimi' },
    {
      key: 'autodiagnostikaOdchylekOdBezneSpotrebyUpozorneniProObsluhu',
      label: 'Autodiagnostika odchylek od běžné spotřeby'
    },
    {
      key: 'uzivatelskeRozhraniSchopnostSystemuPoskytnoutInformaciOUzitiEnergieProObsluhuAUzivatele',
      label: 'Uživatelské rozhraní a informování uživatelů'
    },
    { key: 'dalsi3', label: 'Další' },
    {
      key: 'zjisteneRozporySPozadavkyPravnichPredpisu4',
      label: 'Zjištěné rozpory s požadavky právních předpisů'
    },
    {
      key: 'zjisteneRozporySPokynyVyrobce4',
      label: 'Zjištěné rozpory s pokyny výrobce'
    },
    {
      key: 'dalsiZjisteneVazneNedostatky4',
      label: 'Další zjištěné vážné nedostatky'
    }
  ];

  const vaznyFields = [
    'zjisteneRozporySPozadavkyPravnichPredpisu4',
    'zjisteneRozporySPokynyVyrobce4',
    'dalsiZjisteneVazneNedostatky4'
  ];

  const combined = aggregatePripominky(body, fields);

  body.c52_vsechnyPripominky =
    combined || 'bez připomínek';

  const status = resolveStatus({
    combined,
    vaznyFields,
    body
  });

  applyCheckboxes(body, 'c52', status);
};
