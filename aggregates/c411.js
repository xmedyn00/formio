module.exports = function handleC411(body) {
  if (!body || typeof body !== 'object') return;

  /*
    Источник:
    umisteniPrvkuProSdileniTeplaVeVytapenemProstoru
    → string (textarea), например:
    "OT obvykle pod okny, na stěnách"
  */

  const src =
    body.umisteniPrvkuProSdileniTeplaVeVytapenemProstoru || '';

  const value = String(src).toLowerCase();

  const variants = [
    {
      key: 'otPodOkny',
      match: ['pod okny'],
      label:
        'OT obvykle pod okny (případně v jejich blízkosti)'
    },
    {
      key: 'naStenach',
      match: ['na stěn'],
      label: 'Na stěnách'
    },
    {
      key: 'vPodlaze',
      match: ['v podlah'],
      label: 'V podlaze'
    },
    {
      key: 'vStropu',
      match: ['ve strop', 'v strop'],
      label: 'Ve stropě'
    },
    {
      key: 'jine',
      match: ['jin'],
      label: 'Jiné'
    }
  ];

  variants.forEach(v => {
    const checked = v.match.some(m =>
      value.includes(m)
    );

    body[`c411.umisteni.${v.key}`] =
      checked ? '☒' : '☐';
  });
};
