/* =======================
       🧩 AGGREGATE PRIPOMINKY
       ======================= */
    const pripominkyFields = [
      { key: 'pouzitiKoncepcniReseni1', label: 'Použití, koncepční řešení' },
      { key: 'dimenzovani1', label: 'Dimenzování' },
      { key: 'zapojeni1', label: 'Zapojení' },
      { key: 'regulace1', label: 'Regulace' },
      { key: 'provozniNastaveni1', label: 'Provozní nastavení' },
      { key: 'tepelnaIzolace1', label: 'Tepelná izolace' },
      { key: 'stavArmatur1', label: 'Stav armatur' },
      { key: 'dalsi1', label: 'Další' }
    ];

    const pripominkyCombined = pripominkyFields
      .map(({ key, label }) => {
        const value = body[key];
        if (!value || !String(value).trim()) return null;

        return `${label}:\n${String(value).trim()}`;
      })
      .filter(Boolean)
      .join('\n\n');

    // 👉 финальное поле для шаблона
    body.c32_vsechnyPripominky =
      pripominkyCombined || 'bez připomínek';
/* =======================
   ☑ C32 – CELKOVÉ HODNOCENÍ (SPRÁVNÁ LOGIKA)
   ======================= */

// поля, которые АВТОМАТИЧЕСКИ означают "Vážný nedostatek"
const vaznyNedostatekFields = [
  'tepelnaIzolace1',
  'zjisteneRozporySPokynyVyrobce2',
  'dalsiZjisteneVazneNedostatky2'
];

// проверяем, заполнено ли хотя бы одно
const hasVaznyNedostatek = vaznyNedostatekFields.some(
  key => body[key] && String(body[key]).trim()
);

// есть ли обычные připomínky (кроме "bez připomínek")
const hasAnyPripominky =
  Boolean(pripominkyCombined && pripominkyCombined !== 'bez připomínek');

let c32Status = 'bezPripominek';

if (hasVaznyNedostatek) {
  c32Status = 'vaznyNedostatek';
} else if (hasAnyPripominky) {
  c32Status = 'pripominky';
}

/* =======================
   ☑ CHECKBOXY DO DOKUMENTU
   ======================= */

body.c32_bezPripominek =
  c32Status === 'bezPripominek' ? '☒' : '☐';

body.c32_pripominky =
  c32Status === 'pripominky' ? '☒' : '☐';

body.c32_vaznyNedostatek =
  c32Status === 'vaznyNedostatek' ? '☒' : '☐';