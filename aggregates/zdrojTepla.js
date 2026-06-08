const { setIfEmpty, toStr } = require('../utils/helpers');

/**
 * EditGrid → zdrojeTepla.N.*
 * Fills body keys from form.io editGrid rows.
 * Never overwrites existing keys.
 */
module.exports = function applyZdrojTepla(body, options = {}) {
  const {
    sourceKey = 'zdrojeTepla',
    targetKey  = 'zdrojeTepla',
    max        = 10
  } = options;

  const rows = Array.isArray(body[sourceKey])
    ? body[sourceKey].slice(0, max)
    : [];

  rows.forEach((row, i) => {
    const p = `${targetKey}.${i}`;

    // C111 fields
    setIfEmpty(body, `${p}.cislo`,                              row.C11_cisloZ1Zn || '');
    setIfEmpty(body, `${p}.oznaceni`,                           row.C11_oznaceni  || '');
    setIfEmpty(body, `${p}.palivoJine`,                         row.C11_palivoJine || '');
    setIfEmpty(body, `${p}.vyrobceTypModel`,                    row.C11_vyrobceTypModel || '');
    setIfEmpty(body, `${p}.zakladniCharakteristikaKotle`,       row.C11_zakladniCharakteristikaKotle || '');
    setIfEmpty(body, `${p}.rokVyrobyVyrobniCislo`,              row.C11_rokVyrobyVyrobniCislo || '');
    setIfEmpty(body, `${p}.minKW`,                              toStr(row.C11_minKW));
    setIfEmpty(body, `${p}.maxKW`,                              toStr(row.C11_maxKW));
    setIfEmpty(body, `${p}.celkovaZtrata`,                      toStr(row.C11_celkovaZtrata));
    setIfEmpty(body, `${p}.namerenaKoncentraceCoVeSpalinachMgM3`, toStr(row.C11_namerenaKoncentraceCoVeSpalinachMgM3));
    setIfEmpty(body, `${p}.vyslednaUcinnost`,                   toStr(row.C11_vyslednaUcinnost));
    setIfEmpty(body, `${p}.regulaceVykonu`,                     row.C11_regulaceVykonu || '');
    setIfEmpty(body, `${p}.zdrojTeplaUrcenProDalsi`,            row.C11_zdrojTeplaUrcenProDalsi || '');
    setIfEmpty(body, `${p}.poznamkyKeZdrojiTepla`,              row.C11_poznamkyKeZdrojiTepla || '');

    // Palivo checkboxes
    if (Array.isArray(row.C11_palivo)) {
      row.C11_palivo.forEach(v => { body[`${p}.palivo.${v}`] = '☒'; });
    }

    // Typ kotle radio
    applyRadio(body, p, 'typKotle', row.C11_typKotle, [
      'standardni',
      'kondenzacni',
      'nizkoteplotni'
    ]);

    // Určení checkboxes
    if (Array.isArray(row.C11_zdrojTeplaJeUrcenPro)) {
      row.C11_zdrojTeplaJeUrcenPro.forEach(v => { body[`${p}.urceni.${v}`] = '☒'; });
    }

    // Příloha 6 — flue gas / efficiency fields
    const priloha6Fields = [
      'teplotaSpalinNaVystupuZKotleC',
      'teplotaVzduchuNaVstupuDoKotleC',
      'koeficientADinO2',
      'koeficientBDinO2',
      'koeficientADinCo2',
      'koeficientBDinCo2',
      'koncentraceO2VeSpalinach',
      'koncentraceCo2VeSpalinach',
      'kominovaZtrataDinO2',
      'kominovaZtrataDinCo2',
      'ucinnostStanovenaAnalyzatoremSpalin',
      'minimalniPozadovanaUcinnost',
      'referencniKoncentraceCoVeSpalinachMgM3'
    ];
    priloha6Fields.forEach(field => {
      setIfEmpty(body, `${p}.${field}`, toStr(row[`C11_${field}`]));
    });

    // Ano/Ne fields stored as plain text
    const anoNeFields = [
      'splneniPozadavkuNaUcinnost',
      'splneniPozadavkuVyhlaskyC382022Sb',
      'vhodneDimenzovaniZdroje'
    ];
    anoNeFields.forEach(field => {
      const raw = row[`C11_${field}`];
      setIfEmpty(body, `${p}.${field}`,
        raw === 'ano' ? 'Ano' : raw === 'ne' ? 'Ne' : ''
      );
    });
  });

  // Clean up unused slots — runs ONCE after all rows are processed
  const SAFE_FIELDS = [
    'cislo', 'oznaceni', 'vyrobceTypModel', 'rokVyrobyVyrobniCislo',
    'minKW', 'maxKW', 'regulaceVykonu', 'poznamky'
  ];
  for (let i = rows.length; i < max; i++) {
    const p = `${targetKey}.${i}`;
    SAFE_FIELDS.forEach(field => setIfEmpty(body, `${p}.${field}`, ''));
  }
};

function applyRadio(body, prefix, key, selected, values) {
  values.forEach(v => {
    body[`${prefix}.${key}.${v}`] = selected === v ? '☒' : '☐';
  });
}
