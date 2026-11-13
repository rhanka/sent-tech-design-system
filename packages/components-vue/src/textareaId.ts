let _counter = 0;

export function nextTextareaId(): string {
  return `st-textarea-${++_counter}`;
}
