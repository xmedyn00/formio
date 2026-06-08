module.exports = function handleC413(body) {
  const src = body.C413_pripravaTepleVody || {};

  return {
    T31: check(src.t31ZasobnikovyOhrivacTepleVodySeZabudovanymVymenikem),
    T32: check(src.t32ZasobnikovyOhrivacTepleVodySExternimVymenikem),
    T33: check(src.t33PrutokovyOhrevTepleVody),
    T34: check(src.t34JinyUvedte),

    T34_JINY: body.t34Jiny || ''
  };
};

function check(val) {
	return val === true ? '☒' : '☐';
}