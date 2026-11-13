let _dpCounter = 0;

export function nextDatepickerId(): string {
  return `st-datepicker-${++_dpCounter}`;
}
