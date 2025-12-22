/* =======================
       🧩 AGGREGATE PRIPOMINKY
       ======================= */
const c42PripominkyFields = [
  { key: 'pouzitiKoncepcniReseni2', label: 'Použití, koncepční řešení' },
  { key: 'dimenzovani2', label: 'Dimenzování' },
  { key: 'zapojeni2', label: 'Zapojení' },
  { key: 'regulace2', label: 'Regulace' },
  { key: 'provozniNastaveni2', label: 'Provozní nastavení' },
  { key: 'tepelnaIzolace2', label: 'Tepelná izolace' },
  { key: 'stavArmatur2', label: 'Stav armatur' },
  { key: 'dalsi2', label: 'Další' }
];

const c42PripominkyCombined = c42PripominkyFields
  .map(({ key, label }) => {
    const value = body[key];
    if (!value || !String(value).trim()) return null;
    return `${label}:\n${String(value).trim()}`;
  })
  .filter(Boolean)
  .join('\n\n');

body.c42_vsechnyPripominky =
  c42PripominkyCombined || 'bez připomínek';

/* =======================
   ☑ C42 – CELKOVÉ HODNOCENÍ
   ======================= */

// поля, которые AUTOMATICKY znamenají vážný nedostatek
const c42VaznyNedostatekFields = [
  'zjisteneRozporySPozadavkyPravnichPredpisu3',
  'zjisteneRozporySPokynyVyrobce3',
  'dalsiZjisteneVazneNedostatky3'
];

// есть ли vážný nedostatek
const c42HasVaznyNedostatek = c42VaznyNedostatekFields.some(
  key => body[key] && String(body[key]).trim()
);

// есть ли běžné připomínky
const c42HasAnyPripominky =
  Boolean(c42PripominkyCombined && c42PripominkyCombined !== 'bez připomínek');

let c42Status = 'bezPripominek';

if (c42HasVaznyNedostatek) {
  c42Status = 'vaznyNedostatek';
} else if (c42HasAnyPripominky) {
  c42Status = 'pripominky';
}

/* =======================
   ☑ CHECKBOXY DO DOKUMENTU
   ======================= */

body.c42_bezPripominek =
  c42Status === 'bezPripominek' ? '☒' : '☐';

body.c42_pripominky =
  c42Status === 'pripominky' ? '☒' : '☐';

body.c42_vaznyNedostatek =
  c42Status === 'vaznyNedostatek' ? '☒' : '☐';

