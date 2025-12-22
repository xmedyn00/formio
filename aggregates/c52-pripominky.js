/* =======================
    C52 – AGGREGATE PRIPOMINKY
   ======================= */

const c52PripominkyFields = [
  { key: 'celkoveReseni', label: 'Celkové řešení' },
  { key: 'fakturacniMereniDodaneEnergie', label: 'Fakturační měření dodané energie' },
  { key: 'podruzneMereniNaOkruzich', label: 'Podružné měření na okruzích' },
  { key: 'mereniNaPrvcichNaSdileniTepla', label: 'Měření na prvcích pro sdílení tepla' },
  { key: 'rozuctovaniNakladu', label: 'Rozúčtování nákladů' },
  { key: 'ukladaniDatOSpotrebeAPraceSNimi', label: 'Ukládání dat o spotřebě a práce s nimi' },
  {
    key: 'autodiagnostikaOdchylekOdBezneSpotrebyUpozorneniProObsluhu',
    label: 'Autodiagnostika odchylek od běžné spotřeby'
  },
  {
    key: 'uzivatelskeRozhraniSchopnostSystemuPoskytnoutInformaciOUzitiEnergieProObsluhuAUzivatele',
    label: 'Uživatelské rozhraní a informování uživatelů'
  },
  { key: 'dalsi3', label: 'Další' },
{
    key: 'zjisteneRozporySPozadavkyPravnichPredpisu4',
    label: 'Zjištěné rozpory s požadavky právních předpisů'
  },
  {
    key: 'zjisteneRozporySPokynyVyrobce4',
    label: 'Zjištěné rozpory s pokyny výrobce'
  },
  {
    key: 'dalsiZjisteneVazneNedostatky4',
    label: 'Další zjištěné vážné nedostatky'
  }
];

const c52PripominkyCombined = c52PripominkyFields
  .map(({ key, label }) => {
    const value = body[key];
    if (!value || !String(value).trim()) return null;
    return `${label}:\n${String(value).trim()}`;
  })
  .filter(Boolean)
  .join('\n\n');

body.c52_vsechnyPripominky =
  c52PripominkyCombined || 'bez připomínek';

/* =======================
   ☑ C52 – CELKOVÉ HODNOCENÍ
   ======================= */

// pole, která AUTOMATICKY znamenají vážný nedostatek
const c52VaznyNedostatekFields = [
  'zjisteneRozporySPozadavkyPravnichPredpisu4',
  'zjisteneRozporySPokynyVyrobce4',
  'dalsiZjisteneVazneNedostatky4'
];

// existuje vážný nedostatek?
const c52HasVaznyNedostatek = c52VaznyNedostatekFields.some(
  key => body[key] && String(body[key]).trim()
);

// existují běžné připomínky?
const c52HasAnyPripominky =
  Boolean(c52PripominkyCombined && c52PripominkyCombined !== 'bez připomínek');

let c52Status = 'bezPripominek';

if (c52HasVaznyNedostatek) {
  c52Status = 'vaznyNedostatek';
} else if (c52HasAnyPripominky) {
  c52Status = 'pripominky';
}

/* =======================
   ☑ CHECKBOXY DO DOKUMENTU
   ======================= */

body.c52_bezPripominek =
  c52Status === 'bezPripominek' ? '☒' : '☐';

body.c52_pripominky =
  c52Status === 'pripominky' ? '☒' : '☐';

body.c52_vaznyNedostatek =
  c52Status === 'vaznyNedostatek' ? '☒' : '☐';
