module.exports = function handleC2(body) {

  /**
   * ☑ SINGLE SELECTBOX → SINGLE CHECKBOX PLACEHOLDER
   *
   * body[sourceKey] = { [valueKey]: true | false }
   * generates:
   * body[targetKey] = '☒' | '☐'
   */
  function applySingleSelectBoxCheckbox(sourceKey, valueKey, targetKey) {
    let checkbox = '☐';

    if (
      body[sourceKey] &&
      typeof body[sourceKey] === 'object' &&
      body[sourceKey][valueKey] === true
    ) {
      checkbox = '☒';
    }

    body[targetKey] = checkbox;
  }

  // =========================
  // C2 – Příprava teplé vody
  // =========================
  applySingleSelectBoxCheckbox(
    'c2_pripravaTepleVody',
    'pripravaTepleVody',
    'c2_pripravaTepleVody_checkbox'
  );

  // 🔜 další SelectBoxy C2 přidáš stejným způsobem
  
  applySingleSelectBoxCheckbox(
    'c2_pripravaTepleVodyTeplSolarniSoustava',
    'pripravaTepleVodyTeplSolarniSoustava',
    'c2_pripravaTepleVodyTeplSolarniSoustava_checkbox'
  );
  
  applySingleSelectBoxCheckbox(
    'c2_zasobnikTepelnehoCerpadla',
    'vyrovnavaciZasobnikTepelnehoCerpadla',
    'c2_zasobnikTepelnehoCerpadla_checkbox'
  );
  
  applySingleSelectBoxCheckbox(
    'c2_ZasobnikKotleNaTuhaPaliva',
    'vyrovnavaciZasobnikKotleNaTuhaPaliva',
    'c2_ZasobnikKotleNaTuhaPaliva_checkbox'
  );
  
  applySingleSelectBoxCheckbox(
    'c2_sb_jine',
    'jine',
    'c2_sb_jine_checkbox'
  );
};

