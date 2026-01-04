/**
 * EditGrid → zdrojTepla.N.*
 *
 * ❗ Pravidla:
 * - agregát POUZE doplňuje body
 * - NIKDY nepřepisuje existující klíče
 */

module.exports = function applyZdrojTepla(body, options = {}) {
  const {
    sourceKey = 'zdrojeTepla',
    targetKey = 'zdrojeTepla',
    max = 10
  } = options;

  const rows = Array.isArray(body[sourceKey])
    ? body[sourceKey].slice(0, max)
    : [];

  rows.forEach((row, i) => {
    const p = `${targetKey}.${i}`;

    /* =====================
       ZÁKLAD
       ===================== */
    setIfEmpty(body, `${p}.cislo`, row.C11_cisloZ1Zn || '');
    setIfEmpty(body, `${p}.oznaceni`, row.C11_oznaceni || '');

    /* =====================
       PALIVO (MULTISELECT)
       ===================== */
    if (Array.isArray(row.C11_palivo)) {
      row.C11_palivo.forEach(v => {
        body[`${p}.palivo.${v}`] = '☒';
      });
    }

    /* =====================
       TYP KOTLE (RADIO)
       ===================== */
    applyRadio(body, p, 'typKotle', row.C11_typKotle, [
      'standardni',
      'kondenzacni',
      'nizkoteplotni'
    ]);

    /* =====================
       VÝROBCE / ROK
       ===================== */
    setIfEmpty(body, `${p}.vyrobceTypModel`, row.C11_vyrobceTypModel || '');
    setIfEmpty(body, `${p}.rokVyrobyVyrobniCislo`, row.C11_rokVyrobyVyrobniCislo || '');

    /* =====================
       REGULOVATELNÝ ROZSAH
       ===================== */
    setIfEmpty(body, `${p}.minKW`, toStr(row.C11_minKW));
    setIfEmpty(body, `${p}.maxKW`, toStr(row.C11_maxKW));

    /* =====================
       ÚČINNOST – HODNOTY
       ===================== */
    copyNumber(body, p, row, [
      'C11_teplotaSpalinNaVystupuZKotleC',
      'C11_teplotaVzduchuNaVstupuDoKotleC',
      'C11_koeficientADinO2',
      'C11_koeficientBDinO2',
      'C11_koeficientADinCo2',
      'C11_koeficientBDinCo2',
      'C11_koncentraceO2VeSpalinach',
      'C11_koncentraceCo2VeSpalinach',
      'C11_kominovaZtrataDinO2',
      'C11_kominovaZtrataDinCo2',
      'C11_ucinnostStanovenaAnalyzatoremSpalin',
      'C11_celkovaZtrata',
      'C11_vyslednaUcinnost',
      'C11_minimalniPozadovanaUcinnost'
    ]);

    /* =====================
       SPLNĚNÍ POŽADAVKŮ
       ===================== */
    applyAnoNe(body, p, 'splneniPozadavkuNaUcinnost', row.C11_splneniPozadavkuNaUcinnost);

    /* =====================
       KONCENTRACE CO
       ===================== */
    setIfEmpty(
      body,
      `${p}.namerenaKoncentraceCo`,
      toStr(row.C11_namerenaKoncentraceCoVeSpalinachMgM3)
    );

    setIfEmpty(
      body,
      `${p}.referencniKoncentraceCo`,
      toStr(row.C11_referencniKoncentraceCoVeSpalinachMgM3)
    );

    applyAnoNe(
      body,
      p,
      'splneniPozadavkuVyhlaskyC382022Sb',
      row.C11_splneniPozadavkuVyhlaskyC382022Sb
    );

    /* =====================
       URČENÍ ZDROJE
       ===================== */
    if (Array.isArray(row.C11_zdrojTeplaJeUrcenPro)) {
      row.C11_zdrojTeplaJeUrcenPro.forEach(v => {
        body[`${p}.urceni.${v}`] = '☒';
      });
    }

    /* =====================
       OSTATNÍ
       ===================== */
    setIfEmpty(body, `${p}.regulaceVykonu`, row.C11_regulaceVykonu || '');
    setIfEmpty(body, `${p}.poznamky`, row.C11_poznamkyKeZdrojiTepla || '');
	
	  /* =====================
     ČIŠTĚNÍ NEPOUŽITÝCH ZDROJŮ
     ===================== */
	  const SAFE_FIELDS = [
		'cislo',
		'oznaceni',
		'vyrobceTypModel',
		'rokVyrobyVyrobniCislo',
		'minKW',
		'maxKW',
		'regulaceVykonu',
		'poznamky'
	  ];

	  for (let i = rows.length; i < max; i++) {
		const p = `${targetKey}.${i}`;

		SAFE_FIELDS.forEach(field => {
		  body[`${p}.${field}`] = '';
		});
	  }

  });
};

/* ======================================================
   HELPERS
   ====================================================== */

function setIfEmpty(body, key, value) {
  if (body[key] === undefined || body[key] === '') {
    body[key] = value;
  }
}

function toStr(v) {
  return v != null ? String(v) : '';
}

function applyAnoNe(body, prefix, key, value) {
  setIfEmpty(body, `${prefix}.${key}.yes`, value === 'ano' ? '☒' : '☐');
  setIfEmpty(body, `${prefix}.${key}.no`, value === 'ne' ? '☒' : '☐');
}

function applyRadio(body, prefix, key, selected, values) {
  values.forEach(v => {
    body[`${prefix}.${key}.${v}`] =
      selected === v ? '☒' : '☐';
  });
}

function copyNumber(body, prefix, row, keys) {
  keys.forEach(k => {
    setIfEmpty(body, `${prefix}.${k}`, toStr(row[k]));
  });
}
