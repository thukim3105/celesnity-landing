# Navbar Solutions/Resources Menu Items Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Update the navbar `Solutions` and `Resources` dropdown items to the approved set, removing `Field Service`.

**Architecture:** The navbar renders entirely from the `menu` data array in `src/data/navigation.ts`. Dropdown entries carry an `items: string[]`; the `Navbar` component maps each string to a `/coming-soon?from=<label>` link for both desktop and mobile. Changing the menu is therefore a pure data edit — no component changes.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript, Vitest.

## Global Constraints

- Solutions dropdown must contain exactly: `Manufacturing`, `Logistics`, `Energy`.
- Resources dropdown must contain exactly: `Blog`, `Case Studies`, `Guides`, `Glossary`.
- `Field Service` must not appear anywhere in the navbar menu.
- Dropdown items stay coming-soon — do NOT build real destination pages, do NOT change `Navbar.tsx`, `NavDropdown.tsx`, or the `MenuItem` type.
- Do NOT touch top-level items (`About Us`, `Minder AI`, `Contact`) or the footer.
- Verify TypeScript with `npx tsc --noEmit`.

---

### Task 1: Update Solutions & Resources menu items

**Files:**
- Modify: `src/data/navigation.ts:11-12`
- Test: `src/data/navigation.test.ts` (create)

**Interfaces:**
- Consumes: `menu: MenuItem[]` exported from `src/data/navigation.ts`. `MenuItem` has `{ label: string; href?: string; items?: string[]; comingSoon?: boolean }`.
- Produces: no new exports. `menu` keeps the same shape; only the two `items` arrays change.

- [ ] **Step 1: Write the failing test**

Create `src/data/navigation.test.ts`:

```ts
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/data/navigation.test.ts`
Expected: FAIL — Solutions still has `Field Service`, Resources still lists `Documentation`/`Guides`/`Blog`.

- [ ] **Step 3: Update the menu data**

In `src/data/navigation.ts`, replace the Solutions and Resources lines (currently lines 11-12):

```ts
  { label: "Solutions", items: ["Manufacturing", "Logistics", "Energy"] },
  { label: "Resources", items: ["Blog", "Case Studies", "Guides", "Glossary"] },
```

Leave every other line in the file unchanged.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/data/navigation.test.ts`
Expected: PASS (3 passing).

- [ ] **Step 5: Verify types**

Run: `npx tsc --noEmit`
Expected: no output (exit 0).

- [ ] **Step 6: Commit**

```bash
git add src/data/navigation.ts src/data/navigation.test.ts
git commit -m "feat(nav): update Solutions/Resources menu items

Solutions = Manufacturing/Logistics/Energy (drop Field Service);
Resources = Blog/Case Studies/Guides/Glossary. Items stay coming-soon.

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Self-Review

**1. Spec coverage:**
- Solutions = Manufacturing/Logistics/Energy → Task 1, Step 3 + test. ✓
- Resources = Blog/Case Studies/Guides/Glossary → Task 1, Step 3 + test. ✓
- Field Service removed everywhere → Task 1 test (`not.toContain`). ✓
- Items stay coming-soon, no component/type changes → Global Constraints + only `navigation.ts` modified. ✓
- Footer / top-level untouched → not modified. ✓
- TypeScript verified → Step 5. ✓

**2. Placeholder scan:** No TBD/TODO/vague steps; all code shown verbatim. ✓

**3. Type consistency:** `itemsOf` returns `string[] | undefined`; `toEqual` compares against literal arrays; `flatMap((m) => m.items ?? [])` matches the optional `items?: string[]` on `MenuItem`. ✓
