import { join } from 'node:path';
import { describe, it } from 'vitest';
import { buildCanvasExportPayload } from '../../src/application/canvas/importExportCanvas';
import { canvasSchemaFixture } from './fixtures/canvasSchemaFixture';
import { expectGolden } from './goldenHelper';

describe('canvas schema golden', () => {
  it('matches the reviewed complete canvas export contract', () => {
    const payload = buildCanvasExportPayload(canvasSchemaFixture);

    expectGolden(
      {
        goldenSchemaVersion: 'golden/canvas-schema/v2',
        payload,
      },
      join(__dirname, 'baselines/canvas-schema.golden.json'),
    );
  });
});
