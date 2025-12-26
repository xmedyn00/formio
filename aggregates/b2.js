// B2.js
const applySelectBoxesAnoNe = require('./selectBoxesAnoNe');

module.exports = function handleB2(body) {
  if (!body || typeof body !== 'object') return;

  // === selectBoxes ===
  applySelectBoxesAnoNe(body, {
    key: 'selectBoxes',
    values: [
      { label: 'Projektová dokumentace daného systému', value: 'projektovaDokumentaceDanehoSystemu' },
      { label: 'Zprávy o údržbě', value: 'zpravyOUdrzbe' },
      { label: 'Provozní řád kotelny, je-li příslušnými předpisy vyžadován', value: 'provozniRadKotelnyJeLiPrislusnymiPredpisyVyzadovan' },
      { label: 'Projektová dokumentace kotelny a otopné soustavy', value: 'projektovaDokumentaceKotelnyAOtopneSoustavy' },
      { label: 'Provozní dokumentace zdroje tepla a ostatní provozní dokumentace', value: 'provozniDokumentaceZdrojeTeplaAOstatniProvozniDokumentace' },
      { label: 'Provozní předpis výrobce zdroje tepla', value: 'provozniPredpisVyrobceZdrojeTepla' },
      {
        label: 'Návod pro provoz, obsluhu, údržbu a užívání tepelné soustavy podle příslušných technických norem',
        value: 'navodProProvozObsluhuUdrzbuAUzivaniTepelneSoustavyPodlePrislusnychTechnickychNorem'
      },
      {
        label: 'Zpráva z předchozí kontroly podle vyhlášky č. 38/2022 Sb.',
        value: 'zpravaZPredchoziKontrolyPodleVyhlaskyC382022SbKontroleProvozovanehoSystemuVytapeniAKombinovanehoSystemuVytapeniAVetrani'
      }
    ]
  });

  // === selectBoxes1 ===
  applySelectBoxesAnoNe(body, {
    key: 'selectBoxes1',
    values: [
      { label: 'Kontrola podle § 17 odst. 1 písm. h) zákona č. 201/2012 Sb. a dokumentace podle § 6 odst. 2', value: 'b2KontrolaOvzdusi' },
      { label: 'Dokumentace podle § 6 odst. 2 zákona č. 201/2012 Sb.', value: 'b2DokumentaceOvzdusi' },
      { label: 'Revize a čištění spalinové cesty', value: 'b2RevizeSpalinoveCesty' },
      { label: 'Kontrola provozuschopnosti (požární bezpečnost)', value: 'b2KontrolaPozarniBezpecnosti' },
      { label: 'Kontrola a provozní revize plynových zařízení', value: 'b2RevizePlynoveZarizeni' },
      { label: 'Odborná prohlídka nízkotlakých kotelen', value: 'b2OdbornaProhlidkaKotelny' },
      { label: 'Kontrola a provozní revize dle ČSN 070703', value: 'b2RevizeKotelnyCsn070703' },
      { label: 'Provozní a vnitřní revize tlakových nádob', value: 'b2RevizeTlakoveNadoby' },
      { label: 'Kontrola těsnosti chladicího okruhu tepelného čerpadla', value: 'b2KontrolaTesnostiTepelneCerpadlo' }
    ]
  });

  // === selectBoxes2 ===
  applySelectBoxesAnoNe(body, {
    key: 'selectBoxes2',
    values: [
      { label: 'Účetní doklady za paliva / energonositele', value: 'ucetniDokladyZaPalivaEnergonositele' },
      { label: 'Zdroj tepla je trvale monitorován', value: 'zdrojTeplaJeTrvaleMonitorovan' },
      { label: 'Odečty měřidel energonositelů', value: 'odectyMeridelEnergonositelu' },
      { label: 'Průkaz energetické náročnosti budovy', value: 'prukazEnergetickeNarocnostiBudovy' }
    ]
  });

  // === selectBoxes3 ===
  applySelectBoxesAnoNe(body, {
    key: 'selectBoxes3',
    values: [
      { label: 'Pravidelná údržba', value: 'pravidelnaUdrzba' },
      { label: 'Dokumenty a informace jsou aktuální', value: 'dokumentyAInformaceJsouAktualniOdpovidajiSoucasnemuStavu' },
      { label: 'Zpráva o čištění otopného okruhu', value: 'zpravaOCisteniOtopnehoOkruhu' },
      {
        label: 'Zpráva o výměně termostatických hlavic a uzavíracích ventilů',
        value: 'zpravaOVymeneTermostatickychHlavicAUzaviracichVentiluAInformaceOTomKdyBylyMeneny'
      },
      {
        label: 'Zpráva (protokol chemického rozboru) o kontrole otopné vody',
        value: 'zpravaProtokolChemickehoRozboruOKontroleOtopneVody'
      },
      { label: 'Energetický audit', value: 'energetickyAudit' }
    ]
  });
};
