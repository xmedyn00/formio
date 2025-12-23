/**
 * C.4.1.1 – Prvky pro vytápění prostoru
 * select (multiple) → checkboxy ☒ / ☐
 */

module.exports = function handleC411(body) {
  if (!body || typeof body !== 'object') return;

  /*
    Form.io vrací:
    prvkyProVytapeniProstoru = [
      "t11OtopnaTelesa",
      "t14IntegrovanePlosneVytapeniPodlahaStropSteny"
    ]
  */

  const selected = Array.isArray(body.prvkyProVytapeniProstoru)
    ? body.prvkyProVytapeniProstoru
    : [];

  const variants = [
    't11OtopnaTelesa',
    't12Konvektory',
    't13VentilatoroveKonvektoryFanCoily',
    't14IntegrovanePlosneVytapeniPodlahaStropSteny',
    't15SalavePanelyAPasy',
    't16TeplovzdusneVytapeni',
    't17PrimeSdileniTeplaZdrojemKrbKamnaPrimotopPlynovyZaric',
    't18DalsiJake'
  ];

  variants.forEach(value => {
    body[`c411.${value}`] =
      selected.includes(value) ? '☒' : '☐';
  });
};
