let _counter = 0;

export function nextTimeRangePickerId(): string {
  return `st-timerangepicker-${++_counter}`;
}
