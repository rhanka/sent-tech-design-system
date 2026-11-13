let counter = 0;

export function nextNumberInputId(): string {
  return `st-numberInput-${++counter}`;
}
