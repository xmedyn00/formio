/**
 * ☑ SELECT → CHECKBOXES
 * Использует выбранное значение из body[key]
 */
module.exports = function applySelectCheckboxes(body, selectComponent) {
  if (
    !selectComponent?.key ||
    !Array.isArray(selectComponent?.data?.values)
  ) {
    return;
  }

  const selectedValue = body[selectComponent.key];

  selectComponent.data.values.forEach(item => {
    body[
      `${selectComponent.key}_${item.value}_check`
    ] = item.value === selectedValue ? '☒' : '☐';
  });
};
