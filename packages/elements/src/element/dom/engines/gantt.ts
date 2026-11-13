interface Task { task: string; start: number; end: number; category?: string }
const NS = "http://www.w3.org/2000/svg";

/** Static SVG plus a text row per task; all payload strings stay text nodes. */
export function renderGantt(node: HTMLElement, props: Record<string, unknown>, alt: string): void {
  const tasks = props.data as Task[];
  const width = typeof props.width === "number" && props.width > 0 ? props.width : 640;
  const height = typeof props.height === "number" && props.height > 0 ? props.height : Math.max(80, tasks.length * 28 + 32);
  const svg = document.createElementNS(NS, "svg");
  svg.setAttribute("role", "img");
  svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
  const title = document.createElementNS(NS, "title");
  title.textContent = alt;
  svg.append(title);
  const label = document.createElementNS(NS, "text");
  label.setAttribute("x", "0");
  label.setAttribute("y", "16");
  label.textContent = props.label as string;
  svg.append(label);
  // Normalize before subtracting so even opposite finite extremes stay finite.
  const values = [...tasks.flatMap((task) => [task.start, task.end]),
    ...(typeof props.marker === "number" ? [props.marker] : [])];
  const magnitude = Math.max(1, ...values.map(Math.abs));
  const normalized = values.map((value) => value / magnitude);
  const min = Math.min(0, ...normalized);
  const max = Math.max(1 / magnitude, ...normalized);
  const x = (value: number) => ((value / magnitude - min) / (max - min || 1)) * width;
  const list = document.createElement("ul");
  list.className = "st-dossier__diagramData";
  for (const [index, task] of tasks.entries()) {
    const bar = document.createElementNS(NS, "rect");
    bar.setAttribute("x", String(Math.min(x(task.start), x(task.end))));
    bar.setAttribute("y", String(24 + (index / Math.max(1, tasks.length)) * (height - 24)));
    bar.setAttribute("width", String(Math.abs(x(task.end) - x(task.start))));
    bar.setAttribute("height", String(Math.max(1, (height - 24) / Math.max(1, tasks.length) * 0.7)));
    const description = document.createElementNS(NS, "title");
    description.textContent = task.task;
    bar.append(description);
    svg.append(bar);
    const row = document.createElement("li");
    row.textContent = `${task.task}: ${task.start} – ${task.end}${task.category === undefined ? "" : ` (${task.category})`}`;
    list.append(row);
  }
  if (typeof props.marker === "number") {
    const marker = document.createElementNS(NS, "line");
    marker.setAttribute("x1", String(x(props.marker)));
    marker.setAttribute("x2", String(x(props.marker)));
    marker.setAttribute("y1", "24");
    marker.setAttribute("y2", String(height));
    svg.append(marker);
  }
  node.append(svg, list);
}
