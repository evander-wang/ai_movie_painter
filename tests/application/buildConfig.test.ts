import { describe, expect, it } from 'vitest';
import viteConfig from '../../vite.config';

describe('build config', () => {
  it('splits heavy editor vendors into stable chunks', () => {
    if (typeof viteConfig === 'function') throw new Error('Unexpected function vite config');
    const output = viteConfig.build?.rollupOptions?.output;
    const manualChunks = Array.isArray(output) ? output[0]?.manualChunks : output?.manualChunks;

    expect(typeof manualChunks).toBe('function');
    if (typeof manualChunks !== 'function') return;

    expect(manualChunks('/project/node_modules/react/index.js', {})).toBe('vendor-react');
    expect(manualChunks('/project/node_modules/@xyflow/react/dist/index.js', {})).toBe('vendor-reactflow');
    expect(manualChunks('/project/node_modules/lucide-react/dist/esm/icons/video.js', {})).toBe('vendor-icons');
  });
});
