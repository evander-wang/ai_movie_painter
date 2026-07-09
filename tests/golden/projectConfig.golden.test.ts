import { join } from 'node:path';
import { describe, it } from 'vitest';
import { projectConfig } from '../../src/config/projectConfig';
import { expectGolden } from './goldenHelper';

describe('project config golden', () => {
  it('matches the reviewed TOML-backed project configuration', () => {
    expectGolden(
      {
        schemaVersion: 'golden/project-config/v1',
        projectConfig,
      },
      join(__dirname, 'baselines/project-config.golden.json'),
    );
  });
});
