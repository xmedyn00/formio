const { setIfEmpty } = require('../utils/helpers');

/**
 * EditGrid → okruh.N.*
 * Max 10 okruhy (configurable)
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

    setIfEmpty(body, `${p}.cislo`,    row.cislo    || '');
    setIfEmpty(body, `${p}.oznaceni`, row.oznaceni || '');

    const vypoctovySpad =
      row.teplotaVPrivodnimPotrubiC1 != null &&
      row.teplotaVeVratnemPotrubiC3  != null
        ? `${row.teplotaVPrivodnimPotrubiC1}/${row.teplotaVeVratnemPotrubiC3}`
        : '';
    setIfEmpty(body, `${p}.vypoctovyTeplotniSpad`, vypoctovySpad);

    setIfEmpty(body, `${p}.vypoctovyTepelnyVykon`,
      row.vypoctovyTepelnyVykon != null ? String(row.vypoctovyTepelnyVykon) : '');

    const provozovanySpad =
      row.teplotaVPrivodnimPotrubiC != null &&
      row.teplotaVeVratnemPotrubiC2 != null
        ? `${row.teplotaVPrivodnimPotrubiC}/${row.teplotaVeVratnemPotrubiC2}`
        : '';
    setIfEmpty(body, `${p}.provozovanyTeplotniSpad`, provozovanySpad);

    setIfEmpty(body, `${p}.prenasenyVykon`,
      row.prenasenyVykon != null ? String(row.prenasenyVykon) : '');

    setIfEmpty(body, `${p}.typTepelneIzolace`, row.typTepelneIzolace || '');
    setIfEmpty(body, `${p}.zpusobRegulace`,    row.zpusobRegulace    || '');
    setIfEmpty(body, `${p}.jmenovityPrikon`,
      row.jmenovityPrikon != null ? String(row.jmenovityPrikon) : '');

    applyAnoNe(body, p, 'jsouOsazenyVyvazovaciArmaturyNaRozvodechTepelneEnergie', row);
    applyAnoNe(body, p, 'lzeOveritSpravnostDimenzeANastaveni', row);
    applyAnoNe(body, p, 'jeProvedenoHydraulickeNastaveniVyvazovacichArmatur', row);

    /* =====================
       ČERPADLO
       ===================== */
    setIfEmpty(body, `${p}.oznaceniCerpadla`,    row.oznaceniCerpadla    || '');
    setIfEmpty(body, `${p}.popisKonceptuRozvodu`, row.popisKonceptuRozvodu || '');

    setIfEmpty(body, `${p}.poznamkyKRozvodumTepelneEnergie`,
      row.poznamkyKRozvodumTepelneEnergie || '');

    setIfEmpty(body, `${p}.typHydraulickehoVyvazeniOtopneSoustavy`,
      row.typHydraulickehoVyvazeniOtopneSoustavy || '');

    /* =====================
       RADIO: ANO / NE → CHECK
       ===================== */
    applyAnoNe(body, p, 'vsechnyPristupneCastiRozvoduTepelneEnergieTepelneIzolovany', row);
    applyAnoNe(body, p, 'vyhovujiciStavTepelneIzolace', row);
    applyAnoNe(body, p, 'dochaziKeZtrateTeplonosneLatky', row);
    applyAnoNe(body, p, 'kontrolaKvalityTeplonosneLatky', row);

    // FIX: removed debug console.log that was left in production code
  });

  /* =====================
     ČIŠTĚNÍ NEPOUŽITÝCH ŘÁDKŮ
     FIX: extended to cover ALL placeholder fields used in the template,
     not just SAFE_FIELDS — prevents raw {{placeholders}} appearing in doc
     ===================== */
  const ALL_CLEARABLE_FIELDS = [
    'cislo',
    'oznaceni',
    'vypoctovyTeplotniSpad',
    'provozovanyTeplotniSpad',
    'vypoctovyTepelnyVykon',
    'prenasenyVykon',
    'typTepelneIzolace',
    'oznaceniCerpadla',
    'jmenovityPrikon',
    'popisKonceptuRozvodu',
    'poznamkyKRozvodumTepelneEnergie',
    'typHydraulickehoVyvazeniOtopneSoustavy',
    'zpusobRegulace'
  ];

  const ANO_NE_FIELDS = [
    'jsouOsazenyVyvazovaciArmaturyNaRozvodechTepelneEnergie',
    'lzeOveritSpravnostDimenzeANastaveni',
    'jeProvedenoHydraulickeNastaveniVyvazovacichArmatur',
    'vsechnyPristupneCastiRozvoduTepelneEnergieTepelneIzolovany',
    'vyhovujiciStavTepelneIzolace',
    'dochaziKeZtrateTeplonosneLatky',
    'kontrolaKvalityTeplonosneLatky'
  ];

  for (let i = rows.length; i < max; i++) {
    const p = `${targetKey}.${i}`;

    ALL_CLEARABLE_FIELDS.forEach(field =>
      setIfEmpty(body, `${p}.${field}`, '')
    );

    // Clear yes/no checkbox pairs for unused rows
    ANO_NE_FIELDS.forEach(field => {
      setIfEmpty(body, `${p}.${field}.yes`, '☐');
      setIfEmpty(body, `${p}.${field}.no`,  '☐');
    });
  }
};

/* ======================================================
   HELPERS
   ====================================================== */

/**
 * Radio Ano / Ne → checkbox znaky
 */
function applyAnoNe(body, prefix, key, row) {
  const value = row[key];

  setIfEmpty(body, `${prefix}.${key}.yes`, value === 'ano' ? '☒' : '☐');
  setIfEmpty(body, `${prefix}.${key}.no`,  value === 'ne'  ? '☒' : '☐');
}
