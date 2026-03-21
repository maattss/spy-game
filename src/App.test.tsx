import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { App } from "./App";

describe("App header controls", () => {
  it("renders language, theme, and large text toggles", () => {
    const html = renderToStaticMarkup(<App />);

    expect(html).toContain("Språk");
    expect(html).toContain("Tema");
    expect(html).toContain("Stor tekst");
    expect(html).toContain('aria-pressed="false"');
  });

  it("renders the large text toggle as active when the preference is stored", () => {
    const originalWindow = globalThis.window;

    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: {
        localStorage: {
          getItem: (key: string) => (key === "spy-vision" ? "enhanced" : null),
        },
      },
    });

    try {
      const html = renderToStaticMarkup(<App />);

      expect(html).toContain('aria-pressed="true"');
      expect(html).toContain("header-switch header-switch--active");
    } finally {
      Object.defineProperty(globalThis, "window", {
        configurable: true,
        value: originalWindow,
      });
    }
  });
});
