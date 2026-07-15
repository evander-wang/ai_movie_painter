import { describe, expect, it } from 'vitest';
import {
  createWorkflowEdge,
  evaluateWorkflowConnection,
} from '../../src/domain/workflow/connectionRules';

describe('workflow connection rules', () => {
  it('allows incomplete drag connections while the user is still connecting handles', () => {
    expect(evaluateWorkflowConnection({ source: 'image-node' })).toEqual({ allowed: true });
    expect(evaluateWorkflowConnection({ target: 'video-node' })).toEqual({ allowed: true });
  });

  it('rejects self connections before other structural rules', () => {
    expect(
      evaluateWorkflowConnection({
        existingEdges: [{ source: 'node-a', target: 'node-a' }],
        source: 'node-a',
        target: 'node-a',
      }),
    ).toEqual({
      allowed: false,
      reason: '不能连接节点自身',
    });
  });

  it('keeps duplicate edge handling out of user-facing rejection reasons', () => {
    const duplicateConnection = {
      existingEdges: [{ source: 'source-node', target: 'target-node' }],
      source: 'source-node',
      target: 'target-node',
    };

    expect(evaluateWorkflowConnection(duplicateConnection)).toEqual({ allowed: true });
    expect(createWorkflowEdge(duplicateConnection)).toBeNull();
  });
});
