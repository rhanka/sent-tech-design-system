<script lang="ts">
  import TabbedExample from "$lib/framework/TabbedExample.svelte";
  import { Badge } from "@sentropic/design-system-svelte";
  import { locale } from "$lib/locale.svelte";
  import type { NodeSpec } from "$lib/framework/examples";

  const fr = $derived(locale.value === "fr");

  const defaultDemo = $derived<NodeSpec[]>([
    {
      comp: "TimeRangePicker",
      props: {
        label: fr ? "Période observée" : "Observed period",
        locale: fr ? "fr-FR" : "en-CA"
      }
    }
  ]);

  const presetsDemo = $derived<NodeSpec[]>([
    {
      comp: "TimeRangePicker",
      props: {
        label: fr ? "Fenêtre d'incident" : "Incident window",
        presets: ["5m", "15m", "1h", "24h", "7d"],
        locale: fr ? "fr-FR" : "en-CA",
        size: "sm"
      }
    },
    {
      comp: "TimeRangePicker",
      props: {
        label: fr ? "Rétrospective" : "Retrospective",
        presets: ["7d", "30d", "12w"],
        calendarMonths: 1,
        locale: fr ? "fr-FR" : "en-CA",
        size: "lg"
      }
    }
  ]);

  const statesDemo = $derived<NodeSpec[]>([
    {
      comp: "TimeRangePicker",
      props: {
        label: fr ? "12 h, verrouillé" : "12 h, locked",
        locale: fr ? "fr-FR" : "en-CA",
        disabled: true
      }
    },
    {
      comp: "TimeRangePicker",
      props: {
        label: fr ? "Horaire sur 12 h" : "12-hour clock",
        timeFormat: "12",
        timeStep: 30,
        locale: fr ? "fr-FR" : "en-CA"
      }
    }
  ]);
</script>

<div class="docs-page">
  <section class="docs-hero">
    <p class="docs-hero-kicker">
      {fr ? "Composant · Formulaires" : "Component · Forms"}
    </p>
    <div class="docs-hero-title">
      <h1>TimeRangePicker</h1>
      <Badge tone="success">{fr ? "Stable" : "Stable"}</Badge>
    </div>
    <p>
      {#if fr}
        Sélecteur de <strong>plage temporelle</strong> : un déclencheur qui affiche la plage
        courante et un popover à deux onglets — des <strong>presets relatifs</strong>
        (« 30 dernières minutes ») appliqués immédiatement, et un éditeur de
        <strong>plage absolue</strong> validé par un bouton. Registre familier des consoles
        d'observabilité. Le composant <strong>compose</strong> des primitives existantes du DS
        (popover, tabs, liste, calendrier, heure, champ, boutons) : il n'introduit aucun contrôle
        bas niveau supplémentaire.
      {:else}
        A <strong>time-range</strong> selector: a trigger showing the current range, and a
        two-tab popover — <strong>relative presets</strong> (“last 30 minutes”) applied
        immediately, and an <strong>absolute range</strong> editor staged behind an Apply button.
        The familiar register of observability consoles. The component
        <strong>composes</strong> existing DS primitives (popover, tabs, list, calendar,
        time-of-day, input, buttons): it adds no new low-level control.
      {/if}
    </p>
  </section>

  <section class="docs-section">
    <h2>{fr ? "Presets par défaut" : "Default presets"}</h2>
    <p class="section-desc">
      {#if fr}
        Sans <code>presets</code>, le composant propose <code>DEFAULT_TIME_RANGE_PRESETS</code> :
        30m, 1h, 3h, 6h, 12h, 24h, 3d, 7d, 30d. Un preset est un jeton de grammaire
        <code>&lt;nombre&gt;&lt;m|h|d|w&gt;</code>.
      {:else}
        With no <code>presets</code>, the component offers
        <code>DEFAULT_TIME_RANGE_PRESETS</code>: 30m, 1h, 3h, 6h, 12h, 24h, 3d, 7d, 30d. A preset
        is a token of the grammar <code>&lt;number&gt;&lt;m|h|d|w&gt;</code>.
      {/if}
    </p>
    <TabbedExample
      nodes={defaultDemo}
      title={fr ? "Sélecteur par défaut" : "Default selector"}
    />
  </section>

  <section class="docs-section">
    <h2>{fr ? "Presets sur mesure et tailles" : "Custom presets and sizes"}</h2>
    <p class="section-desc">
      {#if fr}
        <code>presets</code> accepte des jetons, ou des objets
        <code>{"{ token, label?, durationMs? }"}</code> quand le libellé par défaut ne convient
        pas. <code>size</code> aligne la hauteur du déclencheur sur celle des autres contrôles de
        la barre d'outils.
      {:else}
        <code>presets</code> accepts tokens, or
        <code>{"{ token, label?, durationMs? }"}</code> objects when the default label does not
        fit. <code>size</code> aligns the trigger height with the other controls in a toolbar.
      {/if}
    </p>
    <TabbedExample
      nodes={presetsDemo}
      title={fr ? "Jeux de presets métier" : "Domain preset sets"}
    />
  </section>

  <section class="docs-section">
    <h2>{fr ? "Horaire et état désactivé" : "Clock format and disabled state"}</h2>
    <TabbedExample nodes={statesDemo} title={fr ? "Variantes" : "Variants"} />
    <p class="docs-demo-note">
      {fr
        ? "Le popover piège le focus tant qu'il est ouvert et le rend au déclencheur à la fermeture (Échap, clic extérieur, validation)."
        : "The popover traps focus while open and returns it to the trigger on close (Escape, outside click, apply)."}
    </p>
  </section>

  <section class="docs-section">
    <h2>{fr ? "Contrat de valeur" : "Value contract"}</h2>
    <p class="section-desc">
      {#if fr}
        La valeur émise est toujours la même forme, quel que soit l'onglet utilisé :
        <code>from</code> et <code>to</code> sont <strong>toujours</strong> des epoch ms, et un
        preset relatif est résolu en bornes concrètes <em>tout en</em> rapportant son jeton dans
        <code>relative</code>. Un consommateur peut donc interroger sans condition, et ré-résoudre
        la fenêtre glissante plus tard s'il le souhaite.
      {:else}
        The emitted value always has the same shape, whichever tab produced it:
        <code>from</code> and <code>to</code> are <strong>always</strong> epoch ms, and a relative
        preset resolves to concrete bounds <em>while</em> reporting its token in
        <code>relative</code>. A consumer can therefore query unconditionally, and re-resolve the
        sliding window later if it wants to.
      {/if}
    </p>
    <table class="docs-table">
      <thead>
        <tr>
          <th>{fr ? "Champ" : "Field"}</th>
          <th>Type</th>
          <th>Description</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><code>mode</code></td>
          <td><code>'relative' | 'absolute'</code></td>
          <td>{fr ? "Onglet d'où vient la plage." : "Which tab produced the range."}</td>
        </tr>
        <tr>
          <td><code>relative</code></td>
          <td><code>string | undefined</code></td>
          <td>
            {fr
              ? "Jeton du preset résolu ; présent uniquement en mode relative."
              : "Resolved preset token; present only in relative mode."}
          </td>
        </tr>
        <tr>
          <td><code>from</code></td>
          <td><code>number</code></td>
          <td>{fr ? "Borne basse incluse, epoch ms." : "Inclusive lower bound, epoch ms."}</td>
        </tr>
        <tr>
          <td><code>to</code></td>
          <td><code>number</code></td>
          <td>{fr ? "Borne haute incluse, epoch ms." : "Inclusive upper bound, epoch ms."}</td>
        </tr>
      </tbody>
    </table>
    <h3 class="api-subhead">{fr ? "Aides exportées" : "Exported helpers"}</h3>
    <p class="section-desc">
      {#if fr}
        La grammaire et le formatage vivent hors du composant, sans dépendance à un framework :
        <code>DEFAULT_TIME_RANGE_PRESETS</code>, <code>parsePresetMs</code>,
        <code>resolveRelative</code>, <code>splitAbsolute</code>, <code>composeAbsolute</code>,
        <code>formatPresetLabel</code>, <code>formatTriggerLabel</code>. Utiles pour ré-résoudre un
        jeton côté serveur ou pour afficher la même étiquette ailleurs.
      {:else}
        The grammar and formatting live outside the component, framework-free:
        <code>DEFAULT_TIME_RANGE_PRESETS</code>, <code>parsePresetMs</code>,
        <code>resolveRelative</code>, <code>splitAbsolute</code>, <code>composeAbsolute</code>,
        <code>formatPresetLabel</code>, <code>formatTriggerLabel</code>. Handy to re-resolve a
        token server-side, or to render the same label elsewhere.
      {/if}
    </p>
  </section>

  <section class="docs-section">
    <h2>{fr ? "API du composant" : "Component API"}</h2>
    <table class="docs-table">
      <thead>
        <tr>
          <th>Prop</th>
          <th>Type</th>
          <th>{fr ? "Défaut" : "Default"}</th>
          <th>Description</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><code>value</code></td>
          <td><code>TimeRange</code></td>
          <td>—</td>
          <td>{fr ? "Plage contrôlée." : "Controlled range."}</td>
        </tr>
        <tr>
          <td><code>defaultValue</code></td>
          <td><code>TimeRange</code></td>
          <td>—</td>
          <td>
            {fr
              ? "Graine non contrôlée. Sans value ni defaultValue, le composant part des 30 dernières minutes — un repli interne, pas un défaut de cette prop."
              : "Uncontrolled seed. With neither value nor defaultValue, the component starts on the last 30 minutes — an internal fallback, not a default on this prop."}
          </td>
        </tr>
        <tr>
          <td><code>onChange</code></td>
          <td><code>(value: TimeRange) =&gt; void</code></td>
          <td>—</td>
          <td>{fr ? "Émis à chaque plage retenue." : "Emitted for every accepted range."}</td>
        </tr>
        <tr>
          <td><code>presets</code></td>
          <td><code>TimeRangePreset[]</code></td>
          <td><code>DEFAULT_TIME_RANGE_PRESETS</code></td>
          <td>{fr ? "Presets relatifs proposés." : "Relative presets on offer."}</td>
        </tr>
        <tr>
          <td><code>min</code> / <code>max</code></td>
          <td><code>number</code></td>
          <td>—</td>
          <td>{fr ? "Bornes autorisées, epoch ms." : "Allowed bounds, epoch ms."}</td>
        </tr>
        <tr>
          <td><code>locale</code></td>
          <td><code>string</code></td>
          <td><code>'fr-FR'</code></td>
          <td>{fr ? "Locale de formatage." : "Formatting locale."}</td>
        </tr>
        <tr>
          <td><code>timeFormat</code></td>
          <td><code>'24' | '12'</code></td>
          <td><code>'24'</code></td>
          <td>{fr ? "Horaire de l'éditeur absolu." : "Clock of the absolute editor."}</td>
        </tr>
        <tr>
          <td><code>timeStep</code></td>
          <td><code>number</code></td>
          <td><code>15</code></td>
          <td>{fr ? "Pas des créneaux horaires, en minutes." : "Time-slot step, in minutes."}</td>
        </tr>
        <tr>
          <td><code>calendarMonths</code></td>
          <td><code>1 | 2</code></td>
          <td><code>2</code></td>
          <td>{fr ? "Mois affichés côte à côte." : "Months shown side by side."}</td>
        </tr>
        <tr>
          <td><code>label</code></td>
          <td><code>string</code></td>
          <td>—</td>
          <td>
            {fr
              ? "Libellé de champ au-dessus du déclencheur (voir la réserve Angular sous le tableau)."
              : "Field label above the trigger (see the Angular caveat below the table)."}
          </td>
        </tr>
        <tr>
          <td><code>size</code></td>
          <td><code>'sm' | 'md' | 'lg'</code></td>
          <td><code>'md'</code></td>
          <td>{fr ? "Hauteur du déclencheur." : "Trigger height."}</td>
        </tr>
        <tr>
          <td><code>placement</code></td>
          <td><code>'bottom-start' | 'bottom-end' | 'top-start' | 'top-end'</code></td>
          <td><code>'bottom-start'</code></td>
          <td>{fr ? "Côté où s'ouvre le popover." : "Which side the popover opens on."}</td>
        </tr>
        <tr>
          <td><code>align</code></td>
          <td><code>'start' | 'end' | 'center'</code></td>
          <td>—</td>
          <td>
            {fr
              ? "Alignement transversal du popover ; sans valeur, aucune classe d'alignement n'est émise."
              : "Cross-axis alignment of the popover; with no value, no alignment class is emitted."}
          </td>
        </tr>
        <tr>
          <td><code>disabled</code></td>
          <td><code>boolean</code></td>
          <td><code>false</code></td>
          <td>{fr ? "Désactive le déclencheur." : "Disables the trigger."}</td>
        </tr>
        <tr>
          <td><code>formatRange</code> / <code>formatPresetLabel</code></td>
          <td><code>function</code></td>
          <td>—</td>
          <td>
            {fr
              ? "Remplacent le formatage par défaut du déclencheur et des presets."
              : "Override the default trigger and preset formatting."}
          </td>
        </tr>
        <tr>
          <td><code>class</code></td>
          <td><code>string</code></td>
          <td>—</td>
          <td>{fr ? "Classe CSS supplémentaire sur la racine." : "Extra CSS class on the root."}</td>
        </tr>
      </tbody>
    </table>
    <p class="docs-demo-note">
      {fr
        ? "React et Vue exposent la même API que Svelte ; en Angular, label ne rend pas le libellé de champ au-dessus du déclencheur — il n'y sert que de aria-label sur le déclencheur et sur le popover. Prévoyez votre propre libellé visible si vous en avez besoin."
        : "React and Vue expose the same API as Svelte; on Angular, label does not render the field label above the trigger — it only becomes an aria-label on the trigger and the popover. Supply your own visible label there if you need one."}
    </p>
  </section>

  <section class="docs-section">
    <h2>{fr ? "Tokens CSS" : "CSS Tokens"}</h2>
    <p class="section-desc">
      {#if fr}
        Le déclencheur est un contrôle de formulaire ordinaire : il n'a pas de famille de tokens
        propre et lit celles des contrôles et des champs, si bien qu'il suit n'importe quel thème
        sans réglage dédié.
      {:else}
        The trigger is an ordinary form control: it has no token family of its own and reads the
        control and field families, so it follows any theme with no dedicated tuning.
      {/if}
    </p>
    <ul class="docs-token-list">
      <li><code>--st-component-control-background</code></li>
      <li><code>--st-component-control-border</code></li>
      <li><code>--st-component-control-text</code></li>
      <li><code>--st-component-control-smHeight / -mdHeight / -lgHeight</code></li>
      <li><code>--st-component-control-hoverBackground</code></li>
      <li><code>--st-component-control-hoverBorder</code></li>
      <li><code>--st-component-control-disabledText</code></li>
      <li><code>--st-component-control-focusRing</code></li>
      <li><code>--st-component-field-labelText</code></li>
      <li><code>--st-component-field-gap</code></li>
      <li><code>--st-semantic-surface-default</code></li>
      <li><code>--st-semantic-border-subtle</code></li>
    </ul>
  </section>
</div>

<style>
  .section-desc {
    color: var(--st-semantic-text-secondary);
    font-size: 1rem;
    line-height: 1.5;
    margin-bottom: 1.5rem;
    max-width: 800px;
  }

  .api-subhead {
    font-size: 1rem;
    margin: 1.5rem 0 0.5rem;
  }

  .docs-demo-note {
    color: var(--st-semantic-text-secondary);
    font-size: 0.875rem;
    margin-top: 0.75rem;
  }
</style>
