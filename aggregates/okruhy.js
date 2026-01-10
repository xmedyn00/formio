/**
 * EditGrid → okruh.N.*
 * Max 3 okruhy
 *
 * ❗ Pravidla:
 * - agregát POUZE doplňuje body
 * - NIKDY nepřepisuje existující klíče
 */

module.exports = function applyOkruhy(body, options = {}) {
	
  const {
    sourceKey = 'editGrid',
    targetKey = 'okruh',
    max = 10
  } = options;

  const rows = Array.isArray(body[sourceKey])
    ? body[sourceKey].slice(0, max)
    : [];

  rows.forEach((row, i) => {
    const p = `${targetKey}.${i}`;

    setIfEmpty(body, `${p}.cislo`, row.cislo || '');
    setIfEmpty(body, `${p}.oznaceni`, row.oznaceni || '');
    const vypoctovySpad =
      row.teplotaVPrivodnimPotrubiC1 != null &&
      row.teplotaVeVratnemPotrubiC3 != null
        ? `${row.teplotaVPrivodnimPotrubiC1}/${row.teplotaVeVratnemPotrubiC3}`
        : '';
    setIfEmpty(body, `${p}.vypoctovyTeplotniSpad`, vypoctovySpad);
	setIfEmpty(body, `${p}.vypoctovyTepelnyVykon`, row.vypoctovyTepelnyVykon != null ? String(row.vypoctovyTepelnyVykon) : '');
    const provozovanySpad =
      row.teplotaVPrivodnimPotrubiC != null &&
      row.teplotaVeVratnemPotrubiC2 != null
        ? `${row.teplotaVPrivodnimPotrubiC}/${row.teplotaVeVratnemPotrubiC2}`
        : '';
    setIfEmpty(body, `${p}.provozovanyTeplotniSpad`, provozovanySpad);
    const prenasenyVykon =
      row.prenasenyVykon != null
        ? String(row.prenasenyVykon)
        : '';
    setIfEmpty(body, `${p}.prenasenyVykon`, prenasenyVykon);
    setIfEmpty(body, `${p}.typTepelneIzolace`, row.typTepelneIzolace || '' );
    setIfEmpty(body, `${p}.zpusobRegulace`, row.zpusobRegulace || '' );
	setIfEmpty(body, `${p}.jmenovityPrikon`, row.jmenovityPrikon != null ? String(row.jmenovityPrikon) : '' );
	applyAnoNe(body, p, 'jsouOsazenyVyvazovaciArmaturyNaRozvodechTepelneEnergie', row);
    applyAnoNe(body, p, 'lzeOveritSpravnostDimenzeANastaveni', row);
    applyAnoNe(body, p, 'jeProvedenoHydraulickeNastaveniVyvazovacichArmatur', row);

    /* =====================
       ČERPADLO
       ===================== */
    setIfEmpty(
      body,
      `${p}.oznaceniCerpadla`,
      row.oznaceniCerpadla || ''
    );

    setIfEmpty(
      body,
      `${p}.popisKonceptuRozvodu`,
      row.popisKonceptuRozvodu || ''
    );

    setIfEmpty(
      body,
      `${p}.poznamkyKRozvodumTepelneEnergie`,
      row.poznamkyKRozvodumTepelneEnergie || ''
    );

    setIfEmpty(
      body,
      `${p}.typHydraulickehoVyvazeniOtopneSoustavy`,
      row.typHydraulickehoVyvazeniOtopneSoustavy || ''
    );

    /* =====================
	   REGULACE ČERPADLA (SELECT → ☒ / ☐)
	   ===================== */
	const regulaceOptions = {
	  bezRegulaceKonstantniOtacky: 'Bez regulace, konstantní otáčky',
	  rucneNastaveneKonstantniOtacky: 'Ručně nastavené konstantní otáčky',
	  regulacePodleProporcionalnihoTlaku:
		'Regulace podle proporcionálního tlaku',
	  regulacePodleKonstantnihoTlaku:
		'Regulace podle konstantního tlaku',
	  automatickaRegulaceRizenaElektronikouCerpadla:
		'Automatická regulace řízená elektronikou čerpadla',
	  jine: 'Jiné'
	};

	/*Object.keys(regulaceOptions).forEach(key => {
	  body[`${p}.zpusobRegulace.${key}`] =
		row.zpusobRegulace?.[key] ? '☒' : '☐';
	});*/

    /* =====================
       ELEKTRICKÝ PŘÍKON
       ===================== */
    

    /* =====================
       RADIO: ANO / NE → CHECK
       ===================== */

    applyAnoNe(body, p, 'vsechnyPristupneCastiRozvoduTepelneEnergieTepelneIzolovany', row);
    applyAnoNe(body, p, 'vyhovujiciStavTepelneIzolace', row);
    applyAnoNe(body, p, 'dochaziKeZtrateTeplonosneLatky', row);
    applyAnoNe(body, p, 'kontrolaKvalityTeplonosneLatky', row);
	
	console.log('DEBUG zpusobRegulace:', JSON.stringify(row.zpusobRegulace));
  });

  /* =====================
     ČIŠTĚNÍ NEPOUŽITÝCH ŘÁDKŮ
     ===================== */
  const SAFE_FIELDS = [
    'cislo',
    'oznaceni',
    'vypoctovyTeplotniSpad',
    'provozovanyTeplotniSpad',
    'vypoctovyTepelnyVykon',
    'prenasenyVykon',
    'typTepelneIzolace',
    'oznaceniCerpadla',
    'jmenovityPrikon'
  ];

  for (let i = rows.length; i < max; i++) {
    const p = `${targetKey}.${i}`;
    SAFE_FIELDS.forEach(field =>
      setIfEmpty(body, `${p}.${field}`, '')
    );
  }
  
};

/* ======================================================
   HELPERS
   ====================================================== */

/**
 * Zapíše hodnotu pouze pokud klíč neexistuje nebo je prázdný
 */
function setIfEmpty(body, key, value) {
  if (body[key] === undefined || body[key] === '') {
    body[key] = value;
  }
}

/**
 * Radio Ano / Ne → checkbox znaky
 */
function applyAnoNe(body, prefix, key, row) {
  const value = row[key];

  setIfEmpty(body, `${prefix}.${key}.yes`, value === 'ano' ? '☒' : '☐');
  setIfEmpty(body, `${prefix}.${key}.no`, value === 'ne' ? '☒' : '☐');
}

