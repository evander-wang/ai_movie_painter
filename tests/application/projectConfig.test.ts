import { describe, expect, it } from 'vitest';
import { projectConfig } from '../../src/config/projectConfig';

describe('project config', () => {
  it('loads a structurally valid editor configuration without pinning tuning values', () => {
    expect(projectConfig.app.name.trim()).not.toBe('');
    expect(projectConfig.app.displayName.trim()).not.toBe('');
    expect(projectConfig.server.host.trim()).not.toBe('');
    expect(Number.isInteger(projectConfig.server.port)).toBe(true);
    expect(projectConfig.server.port).toBeGreaterThan(0);
    expect(projectConfig.server.port).toBeLessThanOrEqual(65_535);

    expect(projectConfig.canvas.minZoom).toBeGreaterThan(0);
    expect(projectConfig.canvas.maxZoom).toBeGreaterThan(projectConfig.canvas.minZoom);
    expect(projectConfig.canvas.defaultViewport.zoom).toBeGreaterThanOrEqual(projectConfig.canvas.minZoom);
    expect(projectConfig.canvas.defaultViewport.zoom).toBeLessThanOrEqual(projectConfig.canvas.maxZoom);
    expect(projectConfig.canvas.snapGrid).toBeGreaterThan(0);

    expect(['active-only', 'always', 'off']).toContain(projectConfig.ui.nodePulseMode);
  });
});
