let _counter = 0;

export function nextTimePickerId(): string {
  return `st-timepicker-${++_counter}`;
}
