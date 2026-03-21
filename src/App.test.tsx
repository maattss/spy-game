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
});
