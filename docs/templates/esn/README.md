# WP12 ESN Templates

Source package for service-company documents and slide decks. The scope is structure and typology, not client branding or color mapping.

## Format Decision

Use Markdown-first templates:

- Easy to version, review and diff in git.
- Convertible later to `.docx`, `.pptx`, HTML or Slidev without locking the design system to one office suite.
- Compatible with the design-system role: define reusable structure, editorial rhythm and content contracts; keep final client assets in project repositories.

## Templates

| File | Purpose | Target output |
|---|---|---|
| `proposal-template.md` | ESN commercial proposal or mission framing | Markdown, docx later |
| `delivery-report-template.md` | Weekly/monthly delivery report | Markdown, docx later |
| `slide-deck-template.md` | Consulting deck skeleton, Slidev-compatible | Slidev, pptx later |
| `taxonomy.md` | Shared slide and document families | Reference |

## Rules

- Keep client-specific pricing, names, staffing and confidential context out of this repo.
- Use these templates as neutral structure; apply brand theme and legal boilerplate in the consuming project.
- Keep slide copy concise: one message per slide, one evidence block, one requested decision or next step.
