/**
 * EditGrid → okruh.N.*
 * Max 3 okruhy
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

    /* ===== ZÁKLAD ===== */
    body[`${p}.cislo`] = row.textField || '';
    body[`${p}.oznaceni`] =
      row.oznaceniNaprOtopnaTelesaPodlahoveVytapeniVzduchotechnika || '';

    /* ===== VÝPOČTOVÝ TEPLOTNÍ SPÁD ===== */
    body[`${p}.vypoctovyTeplotniSpad`] =
      row.teplotaVPrivodnimPotrubiC1 != null &&
      row.teplotaVeVratnemPotrubiC3 != null
        ? `${row.teplotaVPrivodnimPotrubiC1}/${row.teplotaVeVratnemPotrubiC3}`
        : '';

    /* ===== PROVOZOVANÝ TEPLOTNÍ SPÁD ===== */
    body[`${p}.provozovanyTeplotniSpad`] =
      row.teplotaVPrivodnimPotrubiC != null &&
      row.teplotaVeVratnemPotrubiC2 != null
        ? `${row.teplotaVPrivodnimPotrubiC}/${row.teplotaVeVratnemPotrubiC2}`
        : '';

    /* ===== VÝKONY ===== */
    body[`${p}.vypoctovyTepelnyVykon`] =
      row.number != null ? String(row.number) : '';

    body[`${p}.prenasenyVykon`] =
      row.prenasenyVykonKW != null
        ? String(row.prenasenyVykonKW)
        : '';

    /* ===== IZOLACE ===== */
    body[`${p}.typTepelneIzolace`] =
      row.typTepelneIzolace || '';

    /* ===== ČERPADLO ===== */
    body[`${p}.oznaceniCerpadla`] =
      row.oznaceniATypObehovehoCerpadlaElOkruhu || '';

    /* ===== REGULACE ČERPADLA (SELECT → LABEL) ===== */
    const regulaceMap = {
      bezRegulaceKonstantniOtacky: 'Bez regulace, konstantní otáčky',
      rucneNastaveneKonstantniOtacky: 'Ručně nastavené konstantní otáčky',
      regulacePodleProporcionalnihoTlaku: 'Regulace podle proporcionálního tlaku',
      regulacePodleKonstantnihoTlaku: 'Regulace podle konstantního tlaku',
      automatickaRegulaceRizenaElektronikouCerpadla:
        'Automatická regulace řízená elektronikou čerpadla',
      jine: 'Jiné'
    };

    body[`${p}.zpusobRegulace`] =
      regulaceMap[row.zpusobRegulaceANastaveniObehovehoCerpadlaElDanehoOkruhu1] || '';

    /* ===== ELEKTRICKÝ PŘÍKON ===== */
    body[`${p}.jmenovityPrikon`] =
      row.jmenovityElektrickyPrikonCerpadelW != null
        ? String(row.jmenovityElektrickyPrikonCerpadelW)
        : '';

    /* ===== RADIO → CHECKBOX LOGIKA ===== */
    applyAnoNe(body, p, 'jsouOsazenyVyvazovaciArmaturyNaRozvodechTepelneEnergie', row);
    applyAnoNe(body, p, 'lzeOveritSpravnostDimenzeANastaveni', row);
    applyAnoNe(body, p, 'jeProvedenoHydraulickeNastaveniVyvazovacichArmatur', row);
    applyAnoNe(body, p, 'vsechnyPristupneCastiRozvoduTepelneEnergieTepelneIzolovany', row);
  });

  /* ===== ČIŠTĚNÍ NEPOUŽITÝCH ŘÁDKŮ ===== */
  for (let i = rows.length; i < max; i++) {
    const p = `${targetKey}.${i}`;
    Object.keys(body)
      .filter(k => k.startsWith(p))
      .forEach(k => (body[k] = ''));
  }
};

/* ===== HELPER: ANO / NE → ☒ ☑ ===== */
function applyAnoNe(body, prefix, key, row) {
  const value = row[key];

  body[`${prefix}.${key}.yes`] = value === 'ano' ? '☒' : '☐';
  body[`${prefix}.${key}.no`] = value === 'ne' ? '☒' : '☐';
}
