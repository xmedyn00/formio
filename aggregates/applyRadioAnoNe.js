module.exports = function applyRadioAnoNe(body, key) {
  const value = body[key];

  const isAno = value === 'ano';
  const isNe = value === 'ne';

  // ☑ / ☐
  body[`${key}_ano`] = isAno ? '☒' : '☐';
  body[`${key}_ne`] = isNe ? '☒' : '☐';

  // anone
  body[`${key}_anone`] =
    isAno ? 'ANO' :
    isNe ? 'NE'  :
    ''; // ⬅ пусто, если нет значения или некорректно
};
