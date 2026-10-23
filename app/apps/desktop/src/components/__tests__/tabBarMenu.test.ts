// SPDX-License-Identifier: Apache-2.0
// @vitest-environment jsdom

import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { useStore } from "../../store";
import { TabBar } from "../TabBar";

const initial = useStore.getInitialState();

describe("TabBar context menu", () => {
  let host: HTMLDivElement;
  let root: Root;

  beforeAll(() => {
    (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
    HTMLElement.prototype.scrollIntoView = () => {};
  });

  beforeEach(() => {
    host = document.createElement("div");
    document.body.appendChild(host);
    root = createRoot(host);
    useStore.setState({
      ...initial,
      openNote: { path: "one.md", id: "one", title: "One" },
      openTabs: ["one.md", "two.md"],
      openingNotePath: null,
      virtualTabs: [],
      activeVirtualTab: null,
    });
    act(() => root.render(createElement(TabBar)));
  });

  afterEach(() => {
    act(() => root.unmount());
    host.remove();
    document.body.querySelectorAll(".context-menu").forEach((menu) => menu.remove());
  });

  it("portals the right-click menu outside the scrolling tab strip", () => {
    const tab = host.querySelector<HTMLElement>(".tab")!;
    act(() => {
      tab.dispatchEvent(new MouseEvent("contextmenu", {
        bubbles: true,
        cancelable: true,
        clientX: 48,
        clientY: 32,
      }));
    });

    const menu = document.body.querySelector<HTMLElement>('[role="menu"]');
    expect(menu).not.toBeNull();
    expect(menu!.parentElement).toBe(document.body);
    expect(menu!.classList.contains("menu-portal")).toBe(true);
    expect(host.querySelector('[role="menu"]')).toBeNull();
  });
});
