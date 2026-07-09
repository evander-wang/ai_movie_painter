import { describe, expect, it } from 'vitest';
import { getMagneticHandleBaseOffset } from '../../src/presentation/editor/state/useMagneticHandles';

describe('magnetic handles', () => {
  it('keeps right handles on the right-side transform origin when magnetized', () => {
    expect(getMagneticHandleBaseOffset('node-handle node-handle-target', 26, 26)).toEqual({
      x: -13,
      y: -13,
    });

    expect(getMagneticHandleBaseOffset('node-handle node-handle-source', 26, 26)).toEqual({
      x: 13,
      y: -13,
    });
  });
});
