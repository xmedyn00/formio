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

    


	/*C111*/

    setIfEmpty(body, `${p}.cislo`, row.C11_cisloZ1Zn || '');
    setIfEmpty(body, `${p}.oznaceni`, row.C11_oznaceni || '');
    if (Array.isArray(row.C11_palivo)) {
      row.C11_palivo.forEach(v => {
        body[`${p}.palivo.${v}`] = '☒';
      });
    }
	setIfEmpty(body, `${p}.palivoJine`, row.C11_palivoJine || '');
    applyRadio(body, p, 'typKotle', row.C11_typKotle, [
      'standardni',
      'kondenzacni',
      'nizkoteplotni'
    ]);
    
    setIfEmpty(body, `${p}.vyrobceTypModel`, row.C11_vyrobceTypModel || '');
    setIfEmpty(body, `${p}.zakladniCharakteristikaKotle`, row.C11_zakladniCharakteristikaKotle || '');
    setIfEmpty(body, `${p}.rokVyrobyVyrobniCislo`, row.C11_rokVyrobyVyrobniCislo || '');
    setIfEmpty(body, `${p}.minKW`, toStr(row.C11_minKW));
    setIfEmpty(body, `${p}.maxKW`, toStr(row.C11_maxKW));
	setIfEmpty(body, `${p}.celkovaZtrata`, toStr(row.C11_celkovaZtrata)); //kominova ztrata
	setIfEmpty(body, `${p}.namerenaKoncentraceCoVeSpalinachMgM3`, toStr(row.C11_namerenaKoncentraceCoVeSpalinachMgM3)); //Emise CO
	setIfEmpty(body, `${p}.vyslednaUcinnost`, toStr(row.C11_vyslednaUcinnost)); //Vypocetna ucinost
	setIfEmpty(body, `${p}.regulaceVykonu`, row.C11_regulaceVykonu || '');
	if (Array.isArray(row.C11_zdrojTeplaJeUrcenPro)) {
      row.C11_zdrojTeplaJeUrcenPro.forEach(v => {
        body[`${p}.urceni.${v}`] = '☒';
      });
    }
	setIfEmpty(body, `${p}.zdrojTeplaUrcenProDalsi`, row.C11_zdrojTeplaUrcenProDalsi || '');
	setIfEmpty(body, `${p}.poznamkyKeZdrojiTepla`, row.C11_poznamkyKeZdrojiTepla || '');
	
	
	
	
	/*Priloha 6 */
	
    setIfEmpty(body, `${p}.teplotaSpalinNaVystupuZKotleC`, toStr(row.C11_teplotaSpalinNaVystupuZKotleC));
    setIfEmpty(body, `${p}.teplotaVzduchuNaVstupuDoKotleC`, toStr(row.C11_teplotaVzduchuNaVstupuDoKotleC));
    setIfEmpty(body, `${p}.koeficientADinO2`, toStr(row.C11_koeficientADinO2));
    setIfEmpty(body, `${p}.koeficientBDinO2`, toStr(row.C11_koeficientBDinO2));
    setIfEmpty(body, `${p}.koeficientADinCo2`, toStr(row.C11_koeficientADinCo2));
    setIfEmpty(body, `${p}.koeficientBDinCo2`, toStr(row.C11_koeficientBDinCo2));
    setIfEmpty(body, `${p}.koncentraceO2VeSpalinach`, toStr(row.C11_koncentraceO2VeSpalinach));
    setIfEmpty(body, `${p}.koncentraceCo2VeSpalinach`, toStr(row.C11_koncentraceCo2VeSpalinach));
    setIfEmpty(body, `${p}.kominovaZtrataDinO2`, toStr(row.C11_kominovaZtrataDinO2));
    setIfEmpty(body, `${p}.kominovaZtrataDinCo2`, toStr(row.C11_kominovaZtrataDinCo2));
    setIfEmpty(body, `${p}.ucinnostStanovenaAnalyzatoremSpalin`, toStr(row.C11_ucinnostStanovenaAnalyzatoremSpalin));
    //celkova ztrata v c111
	//vesledna ucinost v c111 
    setIfEmpty(body, `${p}.minimalniPozadovanaUcinnost`, toStr(row.C11_minimalniPozadovanaUcinnost));
	setIfEmpty(body, `${p}.splneniPozadavkuNaUcinnost`, toStr(row.C11_splneniPozadavkuNaUcinnost));

	//Namerena konc. oxidu v c111 namerenaKoncentraceCoVeSpalinachMgM3
	setIfEmpty(body, `${p}.referencniKoncentraceCoVeSpalinachMgM3`, toStr(row.C11_referencniKoncentraceCoVeSpalinachMgM3));
	applyAnoNe(body, `${p}.splneniPozadavkuVyhlaskyC382022Sb`, toStr(row.C11_splneniPozadavkuVyhlaskyC382022Sb));
	
	
	setIfEmpty(body, `${p}.vhodneDimenzovaniZdroje`, toStr(row.C11_vhodneDimenzovaniZdroje));
	
	
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

function applyAnoNe(body, path, value) {
  setIfEmpty(body, `${path}.yes`, value === 'ano' ? 'Ano' : 'Ne');
  setIfEmpty(body, `${path}.no`, value === 'ne' ? 'Ano' : 'Ne');
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
