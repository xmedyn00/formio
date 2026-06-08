/**
 * Collects structured okruh data from the flattened body keys
 * that were written by applyOkruhy().
 */
function collectOkruhy(body) {
  const REGULACE_KEYS = [
    'bezRegulaceKonstantniOtacky',
    'rucneNastaveneKonstantniOtacky',
    'regulacePodleProporcionalnihoTlaku',
    'regulacePodleKonstantnihoTlaku',
    'automatickaRegulaceRizenaElektronikouCerpadla',
    'jine'
  ];

  const ANO_NE_KEYS = [
    'jsouOsazenyVyvazovaciArmaturyNaRozvodechTepelneEnergie',
    'lzeOveritSpravnostDimenzeANastaveni',
    'jeProvedenoHydraulickeNastaveniVyvazovacichArmatur',
    'vsechnyPristupneCastiRozvoduTepelneEnergieTepelneIzolovany',
    'dochaziKeZtrateTeplonosneLatky',
    'vyhovujiciStavTepelneIzolace',
    'kontrolaKvalityTeplonosneLatky'
  ];

  const okruhy = [];

  for (let i = 0; i < 100; i++) {
    // FIX: use strict undefined check instead of falsy check.
    // Previously `if (!cislo) break` would stop on '0', 0, or '' which are
    // valid-but-empty slot markers written by the cleanup loop in applyOkruhy.
    const cislo = body[`okruh.${i}.cislo`];
    if (cislo === undefined) break;
    if (!cislo) continue; // skip empty cleanup slots, keep iterating

    const selectedRegulace = body[`okruh.${i}.zpusobRegulace`] || '';

    const okruh = {
      cislo,
      vypoctovyTepelnyVykon:                  body[`okruh.${i}.vypoctovyTepelnyVykon`]                  || '',
      vypoctovyTeplotniSpad:                  body[`okruh.${i}.vypoctovyTeplotniSpad`]                  || '',
      provozovanyTeplotniSpad:                body[`okruh.${i}.provozovanyTeplotniSpad`]                || '',
      oznaceniCerpadla:                       body[`okruh.${i}.oznaceniCerpadla`]                       || '',
      jmenovityPrikon:                        body[`okruh.${i}.jmenovityPrikon`]                        || '',
      poznamkyKRozvodumTepelneEnergie:        body[`okruh.${i}.poznamkyKRozvodumTepelneEnergie`]        || '',
      typHydraulickehoVyvazeniOtopneSoustavy: body[`okruh.${i}.typHydraulickehoVyvazeniOtopneSoustavy`] || '',
      teplotniLatka:                          body[`okruh.${i}.teplotniLatka`]                          || 'teplotniLatka'
    };

    REGULACE_KEYS.forEach(key => {
      okruh[key] = selectedRegulace === key ? '☒' : '☐';
    });

    ANO_NE_KEYS.forEach(key => {
      okruh[key] = {
        yes: body[`okruh.${i}.${key}.yes`] || '☐',
        no:  body[`okruh.${i}.${key}.no`]  || '☐'
      };
    });

    okruhy.push(okruh);
  }

  return okruhy;
}

/**
 * Collects structured zdrojeTepla data from the flattened body keys
 * that were written by applyZdrojTepla().
 */
function collectZdrojeTepla(body) {
  const PALIVA = ['zemniPlyn', 'lehkyTopnyOlej', 'uhli', 'lpg', 'drevoPelety', 'jine'];

  const URCENI_KEYS = [
    'vytapeniProstoruOtopnouSoustavouNeboPrimymSdilenimTepla',
    'pripravaTepleVody',
    'ohrevVzduchuVeVzduchotechnickemZarizeni',
    'teploProTechnologii',
    'dalsi'
  ];

  const TYP_KOTLE = ['standardni', 'kondenzacni', 'nizkoteplotni'];

  const SCALAR_FIELDS = [
    'cislo', 'oznaceni', 'palivoJine', 'vyrobceTypModel',
    'zakladniCharakteristikaKotle', 'rokVyrobyVyrobniCislo',
    'minKW', 'maxKW', 'celkovaZtrata', 'namerenaKoncentraceCoVeSpalinachMgM3',
    'vyslednaUcinnost', 'regulaceVykonu', 'zdrojTeplaUrcenProDalsi',
    'poznamkyKeZdrojiTepla',
    'teplotaSpalinNaVystupuZKotleC', 'teplotaVzduchuNaVstupuDoKotleC',
    'koeficientADinO2', 'koeficientBDinO2', 'koeficientADinCo2', 'koeficientBDinCo2',
    'koncentraceO2VeSpalinach', 'koncentraceCo2VeSpalinach',
    'kominovaZtrataDinO2', 'kominovaZtrataDinCo2',
    'ucinnostStanovenaAnalyzatoremSpalin', 'minimalniPozadovanaUcinnost',
    'splneniPozadavkuNaUcinnost', 'referencniKoncentraceCoVeSpalinachMgM3',
    'splneniPozadavkuVyhlaskyC382022Sb', 'vhodneDimenzovaniZdroje'
  ];

  const zdroje = [];

  for (let i = 0; i < 100; i++) {
    // FIX: same strict undefined check as collectOkruhy
    const cislo = body[`zdrojeTepla.${i}.cislo`];
    if (cislo === undefined) break;
    if (!cislo) continue;

    const zdroj = {};

    SCALAR_FIELDS.forEach(field => {
      zdroj[field] = body[`zdrojeTepla.${i}.${field}`] || '';
    });

    zdroj.palivo = {};
    PALIVA.forEach(p => {
      zdroj.palivo[p] = body[`zdrojeTepla.${i}.palivo.${p}`] === '☒' ? '☒' : '☐';
    });

    zdroj.urceni = {};
    URCENI_KEYS.forEach(key => {
      zdroj.urceni[key] = body[`zdrojeTepla.${i}.urceni.${key}`] === '☒' ? '☒' : '☐';
    });

    zdroj.typKotle = {};
    TYP_KOTLE.forEach(t => {
      zdroj.typKotle[t] = body[`zdrojeTepla.${i}.typKotle.${t}`] === '☒' ? '☒' : '☐';
    });

    zdroje.push(zdroj);
  }

  return zdroje;
}

module.exports = { collectOkruhy, collectZdrojeTepla };
