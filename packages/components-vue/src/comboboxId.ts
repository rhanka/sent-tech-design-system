let _comboCounter = 0;

export function nextComboboxId(): string {
  return `st-combobox-${++_comboCounter}`;
}
