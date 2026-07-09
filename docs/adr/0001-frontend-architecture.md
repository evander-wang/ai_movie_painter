# ADR 0001: Frontend Architecture

## Status

Accepted.

## Context

The editor began as a single-file React Flow prototype. As AI video workflow features grew, `src/App.tsx` accumulated domain data, canvas use cases, browser adapters, React Flow adapters, and UI panels. That shape made future routing, persistence, collaboration, and testing harder because core workflow behavior was coupled to React and DOM APIs.

## Decision

Use a DDD-lite and Clean Architecture layout for the frontend:

- `src/domain/` owns workflow language, node catalog data, default canvas creation, and pure domain rules.
- `src/application/` owns use cases such as arranging canvas nodes, marking active paths, creating workflow nodes, and parsing export/import payloads.
- `src/infrastructure/` owns browser and storage adapters such as DOM geometry, JSON downloads, and schema constants.
- `src/presentation/` will own React pages, React Flow adapters, panels, overlays, and toolbars.
- `src/shared/` owns small framework-independent helpers such as geometry utilities.

Dependencies must flow inward:

```text
presentation -> application -> domain
presentation -> infrastructure
application -> domain
infrastructure -> domain types only
domain -> no React, no DOM, no Vite, no browser API
```

Routing is intentionally deferred. The first migration keeps visible behavior unchanged, then later phases can introduce `/editor`, project canvas routes, and URL-restorable selected node or panel state.

## Consequences

Domain and application behavior can be tested without rendering React. Golden tests can pin reviewed workflow shape at the domain layer. UI refactors can happen later without changing the node catalog or import/export schema. The cost is more files and stricter import discipline, but that cost is appropriate for a long-lived canvas product.
