const applyRadioAnoNe = require('./applyRadioAnoNe');

module.exports = function handleC62(body) {

  applyRadioAnoNe(body, 'c62_jeKDispoziciDokladOKvaliteNapajeci');
  applyRadioAnoNe(body, 'c62_kvalitaNapajeci');

};

