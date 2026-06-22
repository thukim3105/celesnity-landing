# Navbar — Solutions & Resources menu items

**Date:** 2026-06-22
**Status:** Approved (design)

## Goal

Define the menu structure for the navbar's `Solutions` and `Resources`
dropdowns. The landing page's current priority is **building credibility and
SEO content**, so the menus should expose the content/vertical surfaces worth
ranking for — without flooding the navbar with empty placeholders.

The product (Celesnity / Minder AI) is early-stage: real pages for these items
do not exist yet, so every item links to the shared `/coming-soon` placeholder
until its page is built.

## Scope

In scope:
- Update the `Solutions` and `Resources` dropdown items in the navbar data.

Out of scope (deliberately deferred):
- Building real destination pages for any item.
- An ROI Calculator (heavy to build, needs real benchmark data from case
  studies first; stays a footer / coming-soon item for now).
- Re-aligning the footer columns to match the navbar. The footer currently
  lists a different set (Customer Stories, ROI Calculator, Newsroom, etc.); it
  is left untouched in this change.
- Top-level navbar items — `About Us`, `Minder AI`, `Contact` stay as they are.

## Design

### Top-level nav (unchanged)

`About Us` · `Minder AI` · `Solutions ▾` · `Resources ▾` · `Contact`

### Solutions ▾ — by industry (3 items)

Industry verticals that match the product's stated target markets
(manufacturing, logistics and energy per the CTA copy). `Field Service` is
dropped — it overlaps with the other verticals and was not in the core target.

1. Manufacturing
2. Logistics
3. Energy

Each industry page (when built later) is expected to contain: an
industry-framed headline, 2–3 industry-specific pain points, the three Minder
roles (Coach / Inspector / Agent) applied to that industry, proof (stats /
mini case study / quote), relevant integrations (MES/ERP, WMS/TMS, EAM/CMMS),
and a "Request a demo" CTA. This is reference context for future page work, not
part of this change.

### Resources ▾ — by content type (4 items)

Each item is a content format that earns search traffic / builds authority.

1. Blog — topical articles, product updates; tagged, published regularly.
2. Case Studies — Challenge → Solution → Results (with metrics) + customer
   quote. Highest conversion impact.
3. Guides — long-form evergreen pillar content (deployment guides, buyer's
   guides, playbooks).
4. Glossary — term definitions (SOP, MES, agentic AI, multimodal, edge AI…);
   long-tail SEO and an internal-linking hub.

Suggested future production order (all currently coming-soon):
Case Studies → Blog → Guides → Glossary.

### Link behavior

- Every Solutions and Resources item links to `/coming-soon?from=<label>`
  (`<label>` URL-encoded), reusing the existing pattern. The Coming Soon page
  already personalizes its heading from the `from` query param.
- Applies to both the desktop dropdown and the mobile panel — both render from
  the same `menu` data, so no per-surface work is needed.
- When a real page ships, only that item's `href` changes (from the
  coming-soon URL to the real route).

## Implementation notes

- The only file that changes is `src/data/navigation.ts`: update the `items`
  arrays for the `Solutions` and `Resources` entries.
- `Navbar.tsx`, `NavDropdown.tsx`, and the `MenuItem` type need no changes —
  dropdown items are already mapped to `/coming-soon?from=<label>` links.
- Verify with `npx tsc --noEmit`.

## Acceptance criteria

- Solutions dropdown shows exactly: Manufacturing, Logistics, Energy.
- Resources dropdown shows exactly: Blog, Case Studies, Guides, Glossary.
- Field Service no longer appears anywhere in the navbar.
- Each of these items navigates to `/coming-soon` with its label reflected in
  the page heading, on both desktop and mobile.
- No other navbar entries or behaviors change.
