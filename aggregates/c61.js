module.exports = function handleC61(body) {
  const result = {};

  result.jeUpravnaNapajeciAOtopneVody = applyAnoNe(
    body.jeUpravnaNapajeciAOtopneVody
  );


  result.jeUpravnaFunkcni = applyAnoNe(
    body.jeUpravnaFunkcni
  );

  result.pouzivaSeUpravnaVodyProDoplnovaniNapajeciAOtopneVody = applyAnoNe(
    body.pouzivaSeUpravnaVodyProDoplnovaniNapajeciAOtopneVody
  );

  return result;
};

function applyAnoNe(value) {
  if (value === 'ano') {
    return { ano: '☒', ne: '☐' };
  }

  if (value === 'ne') {
    return { ano: '☐', ne: '☒' };
  }

  return { ano: '☐', ne: '☐' };
}