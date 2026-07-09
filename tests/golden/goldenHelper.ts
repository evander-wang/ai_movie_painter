import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { expect } from 'vitest';

export function stableJson(value: unknown): string {
  return `${JSON.stringify(sortValue(value), null, 2)}\n`;
}

export function expectGolden(actual: unknown, goldenPath: string): void {
  const actualJson = stableJson(actual);

  if (process.env.UPDATE_GOLDEN === '1') {
    mkdirSync(dirname(goldenPath), { recursive: true });
    writeFileSync(goldenPath, actualJson);
    return;
  }

  let expectedJson: string;
  try {
    expectedJson = readFileSync(goldenPath, 'utf8');
  } catch {
    throw new Error(`Missing golden baseline: ${goldenPath}\nRegenerate with: UPDATE_GOLDEN=1 npm run test:golden`);
  }

  try {
    expect(actualJson).toBe(expectedJson);
  } catch (error) {
    throw new Error(
      `Golden baseline drifted: ${goldenPath}\n` +
        'Inspect this diff. If the behavior change is intentional, run:\n' +
        'UPDATE_GOLDEN=1 npm run test:golden\n\n' +
        `${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

function sortValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortValue);
  if (!value || typeof value !== 'object') return value;

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, entry]) => [key, sortValue(entry)]),
  );
}
