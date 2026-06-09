<script lang="ts" module>
  /**
   * En mode simple : `string | null` ("YYYY-MM-DD").
   * En mode plage (`range`) : tuple `[start, end]` où chaque borne est
   * "YYYY-MM-DD" ou null.
   */
  export type CalendarValue = string | null | [string | null, string | null];
</script>

<script lang="ts">
  import { ChevronLeft, ChevronRight } from "@lucide/svelte";
  import type { HTMLAttributes } from "svelte/elements";

  type CalendarProps = Omit<HTMLAttributes<HTMLDivElement>, "class" | "onchange"> & {
    /** Date sélectionnée ("YYYY-MM-DD") ou tuple [start,end] si `range`. */
    value?: CalendarValue;
    /** Appelé avec la nouvelle date (ou le tuple en mode plage). */
    onChange?: (value: CalendarValue) => void;
    /** Borne minimale "YYYY-MM-DD" (inclusive). */
    min?: string;
    /** Borne maximale "YYYY-MM-DD" (inclusive). */
    max?: string;
    /** Sélection d'une plage de deux dates. */
    range?: boolean;
    /** Premier jour de la semaine : 0 = dimanche, 1 = lundi. */
    weekStartsOn?: 0 | 1;
    locale?: string;
    /** Mois affiché ("YYYY-MM"), contrôlable de l'extérieur. */
    month?: string;
    class?: string;
    previousMonthLabel?: string;
    nextMonthLabel?: string;
  };

  let {
    value = null,
    onChange,
    min,
    max,
    range = false,
    weekStartsOn = 1,
    locale = "fr-FR",
    month,
    class: className,
    previousMonthLabel,
    nextMonthLabel,
    ...rest
  }: CalendarProps = $props();

  const isFr = $derived((locale ?? "fr-FR").toLowerCase().startsWith("fr"));
  const resolvedPrevLabel = $derived(
    previousMonthLabel ?? (isFr ? "Mois précédent" : "Previous month")
  );
  const resolvedNextLabel = $derived(nextMonthLabel ?? (isFr ? "Mois suivant" : "Next month"));

  const monthFormatter = $derived(
    new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" })
  );
  const weekdayFormatter = $derived(new Intl.DateTimeFormat(locale, { weekday: "short" }));
  const cellFormatter = $derived(
    new Intl.DateTimeFormat(locale, { day: "numeric", month: "long", year: "numeric" })
  );

  // --- Helpers de dates (alignés sur DatePicker.svelte) --------------------
  function startOfDay(date: Date): Date {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  function toISO(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  function parseISO(iso: string | null | undefined): Date | null {
    if (!iso) return null;
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
    if (!match) return null;
    const d = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
    return Number.isNaN(d.getTime()) ? null : startOfDay(d);
  }

  function isSameDay(a: Date | null, b: Date | null): boolean {
    if (!a || !b) return false;
    return (
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate()
    );
  }

  // --- Valeurs normalisées --------------------------------------------------
  const single = $derived<Date | null>(range ? null : parseISO(value as string | null));

  const rangeStart = $derived<Date | null>(
    range && Array.isArray(value) ? parseISO(value[0]) : null
  );
  const rangeEnd = $derived<Date | null>(
    range && Array.isArray(value) ? parseISO(value[1]) : null
  );

  function pickInitialMonth(): Date {
    const parsed = parseISO(month ? `${month}-01` : undefined);
    if (parsed) return parsed;
    if (!range && single) return single;
    if (range && rangeStart) return rangeStart;
    return startOfDay(new Date());
  }

  let viewYear = $state(pickInitialMonth().getFullYear());
  let viewMonth = $state(pickInitialMonth().getMonth());

  // Resynchronise le mois affiché lorsque la prop `month` change.
  $effect(() => {
    const parsed = parseISO(month ? `${month}-01` : undefined);
    if (parsed) {
      viewYear = parsed.getFullYear();
      viewMonth = parsed.getMonth();
    }
  });

  const today = startOfDay(new Date());

  const weekdayLabels = $derived.by(() => {
    // 2024-01-07 est un dimanche : on énumère puis on tourne selon weekStartsOn.
    const sample = new Date(Date.UTC(2024, 0, 7));
    const labels: string[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(sample);
      d.setUTCDate(sample.getUTCDate() + i);
      labels.push(weekdayFormatter.format(d));
    }
    return [...labels.slice(weekStartsOn), ...labels.slice(0, weekStartsOn)];
  });

  type Cell = { date: Date; inMonth: boolean };

  const grid = $derived.by<Cell[]>(() => {
    const first = new Date(viewYear, viewMonth, 1);
    const firstDayIdx = first.getDay();
    const offset = (firstDayIdx - weekStartsOn + 7) % 7;
    const start = new Date(viewYear, viewMonth, 1 - offset);
    const cells: Cell[] = [];
    for (let i = 0; i < 42; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      cells.push({ date: startOfDay(d), inMonth: d.getMonth() === viewMonth });
    }
    return cells;
  });

  const minDate = $derived(parseISO(min));
  const maxDate = $derived(parseISO(max));

  function isOutOfBounds(date: Date): boolean {
    const d = startOfDay(date).getTime();
    if (minDate && d < minDate.getTime()) return true;
    if (maxDate && d > maxDate.getTime()) return true;
    return false;
  }

  function isSelected(date: Date): boolean {
    if (!range) return isSameDay(single, date);
    return isSameDay(rangeStart, date) || isSameDay(rangeEnd, date);
  }

  function isInRange(date: Date): boolean {
    if (!range || !rangeStart || !rangeEnd) return false;
    const d = startOfDay(date).getTime();
    return d > rangeStart.getTime() && d < rangeEnd.getTime();
  }

  /**
   * Retourne le premier jour activable (non-disabled) du mois `year`/`month`,
   * en partant de `preferred` si celui-ci est dans le bon mois et non-disabled,
   * sinon en balayant du 1er au dernier jour du mois.
   * Renvoie `null` si tous les jours sont disabled (cas extrême).
   */
  function clampToMonth(preferred: Date, year: number, month: number): Date | null {
    // Si preferred est dans le bon mois et non-disabled → on le garde.
    if (
      preferred.getFullYear() === year &&
      preferred.getMonth() === month &&
      !isOutOfBounds(preferred)
    ) {
      return preferred;
    }
    // Chercher le jour sélectionné dans ce mois en priorité.
    const sel = !range ? single : rangeStart;
    if (sel && sel.getFullYear() === year && sel.getMonth() === month && !isOutOfBounds(sel)) {
      return sel;
    }
    // Balayer du 1er au dernier jour du mois.
    const lastDay = new Date(year, month + 1, 0).getDate();
    for (let d = 1; d <= lastDay; d++) {
      const candidate = startOfDay(new Date(year, month, d));
      if (!isOutOfBounds(candidate)) return candidate;
    }
    // Aucun jour activable (mois entièrement hors-bornes) : retourner null pour
    // signaler l'absence de cellule focusable. Les appelants doivent traiter ce cas.
    return null;
  }

  function previousMonth() {
    const targetMonth = viewMonth === 0 ? 11 : viewMonth - 1;
    const targetYear = viewMonth === 0 ? viewYear - 1 : viewYear;
    viewMonth = targetMonth;
    viewYear = targetYear;
    const clamped = clampToMonth(focusDate, targetYear, targetMonth);
    if (clamped) focusDate = clamped;
    // Si clamped === null, le mois est entièrement hors-bornes : focusDate garde
    // l'ancienne valeur — aucune cellule ne sera tabindex=0 car toutes sont disabled.
  }

  function nextMonth() {
    const targetMonth = viewMonth === 11 ? 0 : viewMonth + 1;
    const targetYear = viewMonth === 11 ? viewYear + 1 : viewYear;
    viewMonth = targetMonth;
    viewYear = targetYear;
    const clamped = clampToMonth(focusDate, targetYear, targetMonth);
    if (clamped) focusDate = clamped;
    // Si clamped === null, le mois est entièrement hors-bornes : idem.
  }

  function pickDate(date: Date) {
    if (isOutOfBounds(date)) return;
    const picked = startOfDay(date);
    const iso = toISO(picked);

    if (!range) {
      value = iso;
      onChange?.(iso);
      return;
    }

    // Mode plage : (re)démarrage si pas de début, ou si plage déjà complète,
    // ou si la date est antérieure au début courant.
    if (!rangeStart || (rangeStart && rangeEnd) || picked.getTime() < rangeStart.getTime()) {
      const next: CalendarValue = [iso, null];
      value = next;
      onChange?.(next);
      return;
    }
    const next: CalendarValue = [toISO(rangeStart), iso];
    value = next;
    onChange?.(next);
  }

  const monthLabel = $derived(monthFormatter.format(new Date(viewYear, viewMonth, 1)));

  // --- Roving tabindex : date active dans la grille -------------------------
  // La "date active" est celle qui a tabindex=0 ; elle suit la sélection ou
  // se positionne sur le 1er jour activable du mois affiché en l'absence de sélection.
  // INVARIANT : focusDate est toujours dans le mois affiché ET non-disabled.
  function initialFocusDate(): Date {
    const sel = !range ? single : rangeStart;
    if (sel && sel.getFullYear() === viewYear && sel.getMonth() === viewMonth && !isOutOfBounds(sel)) {
      return sel;
    }
    // Trouver le premier jour activable du mois.
    const lastDay = new Date(viewYear, viewMonth + 1, 0).getDate();
    for (let d = 1; d <= lastDay; d++) {
      const candidate = startOfDay(new Date(viewYear, viewMonth, d));
      if (!isOutOfBounds(candidate)) return candidate;
    }
    // Mois entièrement hors-bornes : retourner le 1er jour quand même pour
    // initialiser focusDate, mais aucune cellule ne sera tabindex=0 (toutes disabled).
    return startOfDay(new Date(viewYear, viewMonth, 1));
  }

  let focusDate = $state<Date>(initialFocusDate());

  // Resynchronise focusDate quand la prop value change (sélection externe).
  // Si la nouvelle valeur est dans le mois affiché et non-disabled, on la pointe ;
  // sinon on re-clamp pour garantir l'invariant.
  $effect(() => {
    const sel = !range ? single : rangeStart;
    if (sel) {
      if (sel.getFullYear() === viewYear && sel.getMonth() === viewMonth && !isOutOfBounds(sel)) {
        focusDate = sel;
      } else {
        const clamped = clampToMonth(focusDate, viewYear, viewMonth);
        if (clamped) focusDate = clamped;
        // Si null (mois entièrement hors-bornes), on ne touche pas focusDate :
        // le tabindex=0 ne sera posé sur aucune cellule disabled.
      }
    }
  });

  // Resynchronise focusDate quand le mois affiché change via la prop `month`
  // (l'$effect sur `month` dans le bloc précédent met viewYear/viewMonth à jour,
  //  mais focusDate peut pointer vers l'ancien mois).
  $effect(() => {
    // Dépendances explicites : viewYear + viewMonth.
    const y = viewYear;
    const m = viewMonth;
    if (focusDate.getFullYear() !== y || focusDate.getMonth() !== m || isOutOfBounds(focusDate)) {
      const clamped = clampToMonth(focusDate, y, m);
      if (clamped) focusDate = clamped;
      // Si null (mois entièrement hors-bornes), aucune cellule ne reçoit tabindex=0.
    }
  });

  // Résoud l'élément DOM du jour actif et y place le focus.
  let gridEl = $state<HTMLElement | null>(null);

  function focusActiveCell() {
    if (!gridEl) return;
    const iso = toISO(focusDate);
    const btn = gridEl.querySelector<HTMLElement>(`[data-date="${iso}"]`);
    btn?.focus();
  }

  // Déplace focusDate de `deltaDays` jours ; change de mois si nécessaire.
  function moveFocus(deltaDays: number) {
    const next = new Date(focusDate);
    next.setDate(next.getDate() + deltaDays);
    // Si hors mois affiché, on bascule le mois.
    if (next.getFullYear() !== viewYear || next.getMonth() !== viewMonth) {
      viewYear = next.getFullYear();
      viewMonth = next.getMonth();
    }
    focusDate = startOfDay(next);
    // Focus après rendu.
    setTimeout(focusActiveCell, 0);
  }

  function onKeyDown(event: KeyboardEvent) {
    switch (event.key) {
      case "ArrowLeft":
        event.preventDefault();
        moveFocus(-1);
        break;
      case "ArrowRight":
        event.preventDefault();
        moveFocus(1);
        break;
      case "ArrowUp":
        event.preventDefault();
        moveFocus(-7);
        break;
      case "ArrowDown":
        event.preventDefault();
        moveFocus(7);
        break;
      case "Home": {
        // Début de la semaine (selon weekStartsOn).
        event.preventDefault();
        const dayOfWeek = focusDate.getDay();
        const offset = (dayOfWeek - weekStartsOn + 7) % 7;
        moveFocus(-offset);
        break;
      }
      case "End": {
        // Fin de la semaine.
        event.preventDefault();
        const dayOfWeek = focusDate.getDay();
        const offset = (6 - ((dayOfWeek - weekStartsOn + 7) % 7));
        moveFocus(offset);
        break;
      }
      case "PageUp": {
        event.preventDefault();
        // previousMonth() met à jour viewYear/viewMonth ET clamp focusDate via clampToMonth,
        // en essayant de conserver le même numéro de jour dans le mois cible.
        const puDay = focusDate.getDate();
        const puTargetMonth = viewMonth === 0 ? 11 : viewMonth - 1;
        const puTargetYear = viewMonth === 0 ? viewYear - 1 : viewYear;
        // Construit le candidat "même jour" avant d'appeler previousMonth pour que
        // clampToMonth puisse l'évaluer (il utilise focusDate en argument).
        const puLastDay = new Date(puTargetYear, puTargetMonth + 1, 0).getDate();
        focusDate = startOfDay(new Date(puTargetYear, puTargetMonth, Math.min(puDay, puLastDay)));
        previousMonth();
        setTimeout(focusActiveCell, 0);
        break;
      }
      case "PageDown": {
        event.preventDefault();
        const pdDay = focusDate.getDate();
        const pdTargetMonth = viewMonth === 11 ? 0 : viewMonth + 1;
        const pdTargetYear = viewMonth === 11 ? viewYear + 1 : viewYear;
        const pdLastDay = new Date(pdTargetYear, pdTargetMonth + 1, 0).getDate();
        focusDate = startOfDay(new Date(pdTargetYear, pdTargetMonth, Math.min(pdDay, pdLastDay)));
        nextMonth();
        setTimeout(focusActiveCell, 0);
        break;
      }
      case "Enter":
      case " ": {
        event.preventDefault();
        if (!isOutOfBounds(focusDate)) pickDate(focusDate);
        break;
      }
    }
  }
</script>

<div class={["st-calendar", className].filter(Boolean).join(" ")} {...rest}>
  <div class="st-calendar__nav">
    <button
      type="button"
      class="st-calendar__navBtn"
      aria-label={resolvedPrevLabel}
      onclick={previousMonth}
    >
      <ChevronLeft size={18} aria-hidden="true" />
    </button>
    <span class="st-calendar__monthLabel" aria-live="polite">{monthLabel}</span>
    <button
      type="button"
      class="st-calendar__navBtn"
      aria-label={resolvedNextLabel}
      onclick={nextMonth}
    >
      <ChevronRight size={18} aria-hidden="true" />
    </button>
  </div>
  <!-- svelte-ignore a11y_interactive_supports_focus -->
  <!-- Faux positif : le grid utilise le roving tabindex (cellules-enfants portent tabindex),
       pas un tabindex sur le conteneur — conforme ARIA Grid Pattern. -->
  <div
    class="st-calendar__grid"
    role="grid"
    aria-label={monthLabel}
    onkeydown={onKeyDown}
    bind:this={gridEl}
  >
    <div class="st-calendar__weekdays" role="row">
      {#each weekdayLabels as wd (wd)}
        <span class="st-calendar__weekday" role="columnheader">{wd}</span>
      {/each}
    </div>
    <div class="st-calendar__days">
      {#each { length: 6 } as _, rowIdx (rowIdx)}
        <div class="st-calendar__week" role="row">
          {#each grid.slice(rowIdx * 7, rowIdx * 7 + 7) as cell, colIdx (rowIdx * 7 + colIdx)}
            {@const oob = isOutOfBounds(cell.date)}
            {@const selected = isSelected(cell.date)}
            {@const inRange = isInRange(cell.date)}
            {@const isToday = isSameDay(cell.date, today)}
            {@const isActive = isSameDay(cell.date, focusDate)}
            <button
              type="button"
              class="st-calendar__day"
              class:st-calendar__day--outside={!cell.inMonth}
              class:st-calendar__day--selected={selected}
              class:st-calendar__day--inRange={inRange}
              class:st-calendar__day--today={isToday}
              role="gridcell"
              aria-label={cellFormatter.format(cell.date)}
              aria-selected={selected ? "true" : "false"}
              aria-current={isToday ? "date" : undefined}
              aria-disabled={oob ? "true" : undefined}
              disabled={oob}
              tabindex={isActive && !oob ? 0 : -1}
              data-date={toISO(cell.date)}
              onclick={() => {
                focusDate = startOfDay(cell.date);
                pickDate(cell.date);
              }}
            >
              {cell.date.getDate()}
            </button>
          {/each}
        </div>
      {/each}
    </div>
  </div>
</div>

<style>
  .st-calendar {
    background: var(--st-component-popover-background, var(--st-semantic-surface-raised));
    border: 1px solid var(--st-component-popover-border, var(--st-semantic-border-subtle));
    border-radius: var(--st-component-popover-radius, 0.5rem);
    color: var(--st-component-popover-text, var(--st-semantic-text-primary));
    display: inline-grid;
    gap: var(--st-spacing-3, 0.75rem);
    min-width: 18rem;
    padding: var(--st-spacing-3, 0.75rem);
  }

  .st-calendar__nav {
    align-items: center;
    display: grid;
    gap: var(--st-spacing-2, 0.5rem);
    grid-template-columns: auto 1fr auto;
  }

  .st-calendar__navBtn {
    align-items: center;
    background: transparent;
    border: 0;
    border-radius: var(--st-component-control-radius, 0.375rem);
    color: inherit;
    cursor: pointer;
    display: inline-flex;
    justify-content: center;
    line-height: 0;
    padding: 0.25rem 0.5rem;
  }

  .st-calendar__navBtn:hover {
    background: var(--st-component-control-hoverBackground, var(--st-semantic-surface-subtle));
  }

  .st-calendar__navBtn:focus-visible {
    outline: 2px solid var(--st-component-control-focusRing, var(--st-semantic-border-interactive));
    outline-offset: 2px;
  }

  .st-calendar__monthLabel {
    font-weight: 600;
    text-align: center;
    text-transform: capitalize;
  }

  .st-calendar__grid {
    display: grid;
    gap: var(--st-spacing-1, 0.25rem);
  }

  .st-calendar__weekdays {
    display: grid;
    gap: 2px;
    grid-template-columns: repeat(7, minmax(2rem, 1fr));
  }

  .st-calendar__days {
    display: grid;
    gap: 2px;
  }

  /* role="row" doit être un vrai nœud exposé à l'arbre a11y.
     display:contents supprime le nœud → on utilise display:grid à la place. */
  .st-calendar__week {
    display: grid;
    gap: 2px;
    grid-template-columns: repeat(7, minmax(2rem, 1fr));
  }

  .st-calendar__weekday {
    color: var(--st-semantic-text-secondary);
    font-size: 0.75rem;
    font-weight: 600;
    padding: 0.25rem 0;
    text-align: center;
    text-transform: capitalize;
  }

  .st-calendar__day {
    aspect-ratio: 1 / 1;
    background: transparent;
    border: 0;
    border-radius: var(--st-component-control-radius, 0.375rem);
    color: inherit;
    cursor: pointer;
    font: inherit;
    font-size: 0.875rem;
    line-height: 1;
    min-width: 0;
    padding: 0;
    text-align: center;
  }

  .st-calendar__day:hover:not(:disabled) {
    background: var(--st-component-control-hoverBackground, var(--st-semantic-surface-subtle));
  }

  .st-calendar__day:focus-visible {
    outline: 2px solid var(--st-component-control-focusRing, var(--st-semantic-border-interactive));
    outline-offset: -2px;
  }

  .st-calendar__day--outside {
    color: var(--st-semantic-text-muted);
  }

  .st-calendar__day--today {
    font-weight: 700;
    box-shadow: inset 0 0 0 1px var(--st-semantic-border-interactive);
  }

  .st-calendar__day--inRange {
    background: var(--st-component-control-hoverBackground, var(--st-semantic-surface-subtle));
  }

  .st-calendar__day--selected {
    background: var(--st-component-dropdown-selectedBackground, var(--st-semantic-action-primary));
    color: var(--st-component-dropdown-selectedText, var(--st-semantic-action-primaryText));
  }

  /* Jour sélectionné survolé : garder un fond FONCÉ (sinon le :hover générique
     met surface-subtle clair sous le texte blanc -> texte invisible). Spécificité
     (0,4,0) > le :hover générique (0,3,0). Bug récurrent de contraste hover. */
  .st-calendar__day--selected:hover:not(:disabled) {
    background: var(
      --st-semantic-action-primaryHover,
      var(--st-component-dropdown-selectedBackground, var(--st-semantic-action-primary))
    );
    color: var(--st-component-dropdown-selectedText, var(--st-semantic-action-primaryText));
  }

  .st-calendar__day:disabled {
    color: var(--st-semantic-text-muted);
    cursor: not-allowed;
    opacity: 0.5;
  }
</style>
