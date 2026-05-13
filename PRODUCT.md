# Product

## Register

product

## Users

School and university staff and administrators. People who run an institution day-to-day: registrars, department heads, admissions officers, finance staff, IT admins. They use Academix at a desk on a workday, on a 13"–27" monitor, often with many tabs open, often in a hurry between meetings. They have real institutional responsibility (student records, billing, compliance), which means they value precision and a tool that respects their time over one that performs friendliness at them. Many work bilingually, so RTL is a first-class case, not an afterthought.

## Product Purpose

Academix is the operational backbone for an academic institution: identity (multi-role auth, role selection, account lifecycle), CRM (student, parent, applicant relations), analytics, and organization-level administration. It exists so an institution can run its day from one place instead of stitching together a student information system, a CRM, and three spreadsheets. Success looks like staff getting routine tasks done in fewer clicks and with fewer errors, and being willing to keep the tab open all day.

## Brand Personality

Editorial, structured, serious. The voice is composed and exact: short sentences, real labels, no marketing voice inside the product. We sound like a registrar's office that respects the user, not like a startup celebrating its own onboarding flow. The interface should feel typeset, not styled: clear hierarchy, generous margins, restrained color, no decorative flourishes. The goal emotion is *quiet competence* — the user should trust the product within the first screen and stop thinking about it.

## Anti-references

- **Generic SaaS template look.** No cream/off-white surfaces with gradient buttons. No hero-metric stat blocks (big number, small label, decorative gradient). No identical card grids of icon + heading + body. No purple-to-blue gradient anywhere. No "Get started in seconds" copy.
- **Cartoony EdTech.** No mascots, no rounded-everything, no bright primary colors used flatly, no playful illustrations of students with laptops, no Duolingo-energy micro-interactions. Education here is institutional, not gamified.
- **Decorative glassmorphism, gradient text, side-stripe alerts.** All three read as 2021-era template cliches and undercut the editorial register.
- **Auth pages that try to sell the product.** No testimonials, no feature bullets, no "Why Academix" copy on sign-in. Auth is a doorway, not a landing page.

## Design Principles

1. **Typeset, not styled.** Treat the interface like a piece of print typography: hierarchy through scale, weight, and space before color. Color is the last lever, not the first.
2. **Quiet competence over warmth performance.** Don't perform friendliness at staff who are mid-task. Confidence is built by being correct and fast, not by being smiley.
3. **Auth is a doorway.** Sign-in and register exist to let the user in, not to market the product. Minimal chrome, no decorative content, every element earns its row.
4. **Bilingual by construction.** Every layout works in RTL and LTR without bespoke overrides. Directional iconography, mirrored spacing, logical properties.
5. **Density matches the user's day.** Staff keep this open for hours. Generous but not wasteful: comfortable for an 8-hour session, never cramped, never airy-for-airy's-sake.

## Accessibility & Inclusion

- **WCAG 2.1 AA** as the floor for every surface. Body text and interactive labels target a 4.5:1 contrast minimum; large display type and non-text UI components hit 3:1 minimum.
- **Bidirectional (RTL + LTR) first-class.** Use CSS logical properties (`padding-inline`, `margin-block`, `start`/`end`) rather than `left`/`right`. Mirror directional icons (arrows, chevrons, back). Tested in both directions on every auth screen.
- **Keyboard-first.** Every action reachable via keyboard with a visible focus ring; tab order matches visual order in both reading directions.
- **Reduced motion respected.** Honor `prefers-reduced-motion`: cross-fade instead of slide, no parallax, no decorative looping animation. Motion is functional (state change feedback), never ambient.
- **Resilient at zoom.** Layouts hold to 200% browser zoom and 320px viewport without horizontal scroll.
