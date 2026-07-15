# Domain Docs

How the engineering skills should consume this repo's domain documentation.

## Before exploring, read these

- `CONTEXT.md` at the repo root.
- `docs/adr/` ADRs that touch the area being changed.

If these files do not exist, proceed silently.

## File structure

This repo uses single-context layout:

```text
/
├── CONTEXT.md
├── docs/adr/
└── src/
```

## Use the glossary's vocabulary

Use terms as defined in `CONTEXT.md`: Workflow, Canvas, Node, Edge, Handle, Viewport, Attribute Panel, Node Catalog, Default Canvas, Import/Export Schema, Active Path.

## Flag ADR conflicts

If a change contradicts an existing ADR, surface it explicitly instead of silently overriding it.
