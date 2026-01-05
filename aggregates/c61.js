const applyRadioAnoNe = require('./applyRadioAnoNe');

module.exports = function handleC61(body) {

  applyRadioAnoNe(body, 'jeUpravnaNapajeciAOtopneVody');
  applyRadioAnoNe(body, 'jeUpravnaFunkcni');
  applyRadioAnoNe(body, 'pouzivaSeUpravnaVodyProDoplnovaniNapajeciAOtopneVody');

};

