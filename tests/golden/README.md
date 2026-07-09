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

Current baselines cover:

- `default-canvas.golden.json`: the default AI video workflow node and edge graph.
- `project-config.golden.json`: the TOML-backed project configuration surface.
