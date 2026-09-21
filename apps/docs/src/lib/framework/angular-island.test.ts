import { JSDOM } from "jsdom";
import { afterEach, describe, expect, it, vi } from "vitest";

import { mountAngularIsland } from "./angular-island";
import type { NodeSpec } from "./examples";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("mountAngularIsland", () => {
  it("mounts a real Angular design-system component", async () => {
    const dom = new JSDOM("<!doctype html><div id=\"host\"></div>");
    const host = dom.window.document.getElementById("host") as HTMLElement;
    vi.stubGlobal("window", dom.window);
    vi.stubGlobal("document", dom.window.document);
    vi.stubGlobal("HTMLElement", dom.window.HTMLElement);
    vi.stubGlobal("Node", dom.window.Node);

    const handle = await mountAngularIsland(host, [
      { comp: "Button", props: { variant: "primary" }, children: ["Primary"] }
    ]);

    expect(host.querySelector("[data-st-component=\"Button\"]")?.textContent).toBe("Primary");

    handle.unmount();
    expect(host.textContent).toBe("");
  }, 20_000);

  // Le conteneur appartient a la page : TabbedExample le reutilise a chaque
  // changement d'onglet, et la demo live Modal/Drawer remonte une ile dedans a
  // chaque clic. Angular retire du document l'hote d'une vue racine qu'on
  // detache — le conteneur ne doit donc jamais etre cet hote.
  it("leaves the page container in place for the next island", async () => {
    const dom = new JSDOM("<!doctype html><div id=\"host\"></div>");
    const host = dom.window.document.getElementById("host") as HTMLElement;
    vi.stubGlobal("window", dom.window);
    vi.stubGlobal("document", dom.window.document);
    vi.stubGlobal("HTMLElement", dom.window.HTMLElement);
    vi.stubGlobal("Node", dom.window.Node);

    const first = await mountAngularIsland(host, [{ comp: "Button", children: ["One"] }]);
    first.unmount();
    expect(dom.window.document.getElementById("host")).toBe(host);

    const second = await mountAngularIsland(host, [{ comp: "Button", children: ["Two"] }]);
    expect(dom.window.document.getElementById("host")?.textContent).toBe("Two");
    second.unmount();
  }, 20_000);

  // Garde-fou du cas que l'ile a longtemps rendu faux en silence : un composant
  // parent qui decouvre ses enfants par `@ContentChildren`. Une requete de
  // contenu ne resout QUE du contenu declare dans un template, jamais des
  // noeuds passes en `projectableNodes` — le stack ne voyait donc aucune
  // section et chacune gardait ses defauts hors-stack (toutes dépliées, toutes
  // proprietaires du defilement, aucune primaire), c'est-a-dire l'inverse de ce
  // que la page PanelSection enseigne, sans la moindre exception ni
  // placeholder.
  it("lets a PanelStack coordinate the PanelSection children it is given", async () => {
    const dom = new JSDOM("<!doctype html><div id=\"host\"></div>");
    const host = dom.window.document.getElementById("host") as HTMLElement;
    vi.stubGlobal("window", dom.window);
    vi.stubGlobal("document", dom.window.document);
    vi.stubGlobal("HTMLElement", dom.window.HTMLElement);
    vi.stubGlobal("Node", dom.window.Node);

    const sections = (): NodeSpec[] => [
      { comp: "PanelSection", props: { id: "a", label: "A" }, children: ["one"] },
      { comp: "PanelSection", props: { id: "b", label: "B" }, children: ["two"] },
      { comp: "PanelSection", props: { id: "c", label: "C" }, children: ["three"] }
    ];

    const sticky = await mountAngularIsland(host, [
      {
        comp: "PanelStack",
        props: { label: "Panel", defaultExpanded: "a" },
        children: sections()
      }
    ]);

    // sticky-item : une seule section dépliée, donc un seul propriétaire du
    // défilement, et chaque en-tête reste un bouton de divulgation.
    expect(host.querySelectorAll(".st-panelSection").length).toBe(3);
    expect(host.querySelectorAll(".st-panelSection__body--scrollOwner").length).toBe(1);
    expect(host.querySelectorAll(".st-panelSection__trigger").length).toBe(3);
    expect(host.querySelectorAll(".st-panelSection__title--primary").length).toBe(0);
    sticky.unmount();

    const split = await mountAngularIsland(host, [
      {
        comp: "PanelStack",
        props: { shape: "split-primary", label: "Panel", primary: "a" },
        children: sections()
      }
    ]);

    // split-primary : la primaire est un titre, pas un bouton — une affordance
    // de repli mentirait — et c'est elle qui possède le défilement.
    expect(host.querySelectorAll(".st-panelSection__body--scrollOwner").length).toBe(1);
    expect(host.querySelectorAll(".st-panelSection__trigger").length).toBe(2);
    expect(host.querySelectorAll(".st-panelSection__title--primary").length).toBe(1);
    split.unmount();
  }, 20_000);
});
