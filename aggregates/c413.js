/**
 * C.4.1.3 – Příprava teplé vody
 *
 * FIX: writes directly to body (consistent with all other handlers).
 * Previously returned a plain object which required Object.assign(body, ...)
 * at the call site, and used short keys (T31/T32) inconsistent with the
 * {{placeholder}} naming convention used everywhere else.
 */
module.exports = function handleC413(body) {
  const src = body.C413_pripravaTepleVody || {};

  body['C413.T31'] = check(src.t31ZasobnikovyOhrivacTepleVodySeZabudovanymVymenikem);
  body['C413.T32'] = check(src.t32ZasobnikovyOhrivacTepleVodySExternimVymenikem);
  body['C413.T33'] = check(src.t33PrutokovyOhrevTepleVody);
  body['C413.T34'] = check(src.t34JinyUvedte);

  body['C413.T34_JINY'] = body.C413_Jiny || '';
};

function check(val) {
  return val === true ? '☒' : '☐';
}
