# Golden Tests

Golden tests protect reviewed project behavior by comparing deterministic output
against committed baselines.

Run the normal gate:

```bash
npm run test:golden
```

Regenerate baselines only after inspecting the diff and deciding the behavior
change is intentional:

```bash
UPDATE_GOLDEN=1 npm run test:golden
```

Golden coverage is intentionally limited to stable, versioned contracts. Product
copy, visual tuning, node catalog content, connection rules, and project config
values should use focused unit or UI tests instead of golden baselines.

Current baselines cover:

- `canvas-schema.golden.json`: the complete versioned canvas export payload,
  including full and minimal node and edge shapes.
- `default-canvas-topology.golden.json`: only the reviewed default workflow node
  types and edge topology; copy, positions, colors, statuses, and animation are
  deliberately excluded.

`UPDATE_GOLDEN=1` is rejected when `CI` is enabled. Baselines must be regenerated
locally, inspected, and committed together with the intentional contract change.
