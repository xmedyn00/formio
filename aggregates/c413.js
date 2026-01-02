module.exports = function handleC413(body) {
  const src = body.C413_pripravaTepleVody || {};

  return {
    pripravaTepleVody: {
      t31: src.t31ZasobnikovyOhrivacTepleVodySeZabudovanymVymenikem === true,
      t32: src.t32ZasobnikovyOhrivacTepleVodySExternimVymenikem === true,
      t33: src.t33PrutokovyOhrevTepleVody === true,
      t34: src.t34JinyUvedte === true
    },

    // если есть отдельное поле "jiný – uveďte"
    t34Jiny: body.t34Jiny || ''
  };
};