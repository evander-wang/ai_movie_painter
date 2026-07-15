import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { expectGolden } from './goldenHelper';

describe('golden helper', () => {
  it('refuses to update committed baselines in CI', () => {
    const directory = mkdtempSync(join(tmpdir(), 'short-flow-golden-'));
    const previousCi = process.env.CI;
    const previousUpdate = process.env.UPDATE_GOLDEN;

    process.env.CI = 'true';
    process.env.UPDATE_GOLDEN = '1';

    try {
      expect(() => expectGolden({ value: 'changed' }, join(directory, 'baseline.json'))).toThrow(
        'Golden baselines cannot be updated in CI',
      );
    } finally {
      restoreEnvironment('CI', previousCi);
      restoreEnvironment('UPDATE_GOLDEN', previousUpdate);
      rmSync(directory, { force: true, recursive: true });
    }
  });
});

function restoreEnvironment(name: string, value: string | undefined): void {
  if (value === undefined) {
    delete process.env[name];
    return;
  }

  process.env[name] = value;
}
