/**
 * EditGrid → okruh.N.*
 * Max 3 okruhy
 * 
 * ❗ Правило:
 * - агрегат ТОЛЬКО дополняет body
 * - НИКОГДА не перезаписывает существующие ключи
 */

module.exports = function applyOkruhy(body, options = {}) {
  const {
    sourceKey = 'editGrid',
    targetKey = 'okruh',
    max = 3
  } = options;

  const rows = Array.isArray(body[sourceKey])
    ? body[sourceKey].slice(0, max)
    : [];

  rows.forEach((row, i) => {
    const p = `${targetKey}.${i}`;

    /* =====================
       ZÁKLAD
       ===================== */
    setIfEmpty(body, `${p}.cislo`, row.textField || '');

    setIfEmpty(
      body,
      `${p}.oznaceni`,
      row.oznaceniNaprOtopnaTelesaPodlahoveVytapeniVzduchotechnika || ''
    );

    /* =====================
       VÝPOČTOVÝ TEPLOTNÍ SPÁD
       ===================== */
    const vypoctovySpad =
      row.teplotaVPrivodnimPotrubiC1 != null &&
      row.teplotaVeVratnemPotrubiC3 != null
        ? `${row.teplotaVPrivodnimPotrubiC1}/${row.teplotaVeVratnemPotrubiC3}`
        : '';

    setIfEmpty(body, `${p}.vypoctovyTeplotniSpad`, vypoctovySpad);

    /* =====================
       PROVOZOVANÝ TEPLOTNÍ SPÁD
       ===================== */
    const provozovanySpad =
      row.teplotaVPrivodnimPotrubiC != null &&
      row.teplotaVeVratnemPotrubiC2 != null
        ? `${row.teplotaVPrivodnimPotrubiC}/${row.teplotaVeVratnemPotrubiC2}`
        : '';

    setIfEmpty(body, `${p}.provozovanyTeplotniSpad`, provozovanySpad);

    /* =====================
       VÝKONY
       ===================== */
    const vypoctovyVykon =
      row.number != null ? String(row.number) : '';

    setIfEmpty(body, `${p}.vypoctovyTepelnyVykon`, vypoctovyVykon);

    const prenasenyVykon =
      row.prenasenyVykonKW != null
        ? String(row.prenasenyVykonKW)
        : '';

    setIfEmpty(body, `${p}.prenasenyVykon`, prenasenyVykon);

    /* =====================
       IZOLACE
       ===================== */
    setIfEmpty(
      body,
      `${p}.typTepelneIzolace`,
      row.typTepelneIzolace || ''
    );

    /* =====================
       ČERPADLO
       ===================== */
    setIfEmpty(
      body,
      `${p}.oznaceniCerpadla`,
      row.oznaceniATypObehovehoCerpadlaElOkruhu || ''
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
       REGULACE ČERPADLA (SELECT → LABEL)
       ===================== */
    const regulaceMap = {
      bezRegulaceKonstantniOtacky: 'Bez regulace, konstantní otáčky',
      rucneNastaveneKonstantniOtacky: 'Ručně nastavené konstantní otáčky',
      regulacePodleProporcionalnihoTlaku: 'Regulace podle proporcionálního tlaku',
      regulacePodleKonstantnihoTlaku: 'Regulace podle konstantního tlaku',
      automatickaRegulaceRizenaElektronikouCerpadla:
        'Automatická regulace řízená elektronikou čerpadla',
      jine: 'Jiné'
    };

    setIfEmpty(
      body,
      `${p}.zpusobRegulace`,
      regulaceMap[
        row.zpusobRegulace
      ] || ''
    );

    /* =====================
       ELEKTRICKÝ PŘÍKON
       ===================== */
    setIfEmpty(
      body,
      `${p}.jmenovityPrikon`,
      row.jmenovityElektrickyPrikonCerpadelW != null
        ? String(row.jmenovityElektrickyPrikonCerpadelW)
        : ''
    );

    /* =====================
       RADIO: ANO / NE → CHECK
       ===================== */
    applyAnoNe(body, p, 'jsouOsazenyVyvazovaciArmaturyNaRozvodechTepelneEnergie', row);
    applyAnoNe(body, p, 'lzeOveritSpravnostDimenzeANastaveni', row);
    applyAnoNe(body, p, 'jeProvedenoHydraulickeNastaveniVyvazovacichArmatur', row);
    applyAnoNe(body, p, 'vsechnyPristupneCastiRozvoduTepelneEnergieTepelneIzolovany', row);
    applyAnoNe(body, p, 'vyhovujiciStavTepelneIzolace', row);
    applyAnoNe(body, p, 'dochaziKeZtrateTeplonosneLatky', row);
    applyAnoNe(body, p, 'kontrolaKvalityTeplonosneLatky', row);
  });

  /* =====================
     ČIŠTĚNÍ NEPOUŽITÝCH ŘÁDKŮ
     (BEZ RIZIKA PŘEPSÁNÍ)
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
    'zpusobRegulace',
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
