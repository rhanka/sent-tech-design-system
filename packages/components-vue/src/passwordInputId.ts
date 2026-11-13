let counter = 0;

export function nextPasswordInputId(): string {
  return `st-passwordInput-${++counter}`;
}
