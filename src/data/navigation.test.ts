import { describe, expect, it } from "vitest";
import { menu } from "./navigation";

const itemsOf = (label: string) =>
  menu.find((m) => m.label === label)?.items;

describe("navbar menu", () => {
  it("lists the three target industries under Solutions", () => {
    expect(itemsOf("Solutions")).toEqual([
      "Manufacturing",
      "Logistics",
      "Energy",
    ]);
  });

  it("lists the four content types under Resources", () => {
    expect(itemsOf("Resources")).toEqual([
      "Blog",
      "Case Studies",
      "Guides",
      "Glossary",
    ]);
  });

  it("no longer references Field Service anywhere", () => {
    const allItems = menu.flatMap((m) => m.items ?? []);
    expect(allItems).not.toContain("Field Service");
  });
});
