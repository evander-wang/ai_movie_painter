import { describe, expect, it } from 'vitest';
import {
  createEdgeForAddedWorkflowNode,
  createInteractiveWorkflowEdge,
  resolveEdgeForAddedWorkflowNode,
  resolveInteractiveWorkflowConnection,
} from '../../src/application/workflow/connectWorkflowNode';
import { evaluateWorkflowConnection } from '../../src/domain/workflow/connectionRules';
import { nodeRef } from './testWorkflowFixtures';

describe('workflow node connection use cases', () => {
  it('creates pulse edges when adding a workflow node from a selected source node', () => {
    expect(
      createEdgeForAddedWorkflowNode({
        existingEdges: [],
        sourceNodeId: 'source-node',
        targetNodeId: 'new-node',
      }),
    ).toEqual({
      animated: true,
      id: 'e-source-node-new-node',
      source: 'source-node',
      sourceHandle: undefined,
      target: 'new-node',
      targetHandle: undefined,
      type: 'pulse',
    });
  });

  it('skips automatic workflow edges without a selected source or with duplicates', () => {
    expect(
      createEdgeForAddedWorkflowNode({
        existingEdges: [],
        sourceNodeId: null,
        targetNodeId: 'new-node',
      }),
    ).toBeNull();

    expect(
      createEdgeForAddedWorkflowNode({
        existingEdges: [{ source: 'source-node', target: 'new-node' }],
        sourceNodeId: 'source-node',
        targetNodeId: 'new-node',
      }),
    ).toBeNull();
  });

  it('returns a rejection reason when automatic node linking is not allowed', () => {
    expect(
      resolveEdgeForAddedWorkflowNode({
        existingEdges: [],
        sourceNodeId: 'image-node',
        sourceNodeType: 'imageReference',
        targetNodeId: 'audio-node',
        targetNodeType: 'voiceover',
      }),
    ).toEqual({
      edge: null,
      rejectionReason: '图片参考不能直接连接音频节点',
    });
  });

  it('decorates interactive React Flow connections as pulse edges', () => {
    expect(createInteractiveWorkflowEdge({ source: 'a', target: 'b' })).toEqual({
      animated: true,
      source: 'a',
      target: 'b',
      type: 'pulse',
    });
  });

  it('returns a rejection reason for invalid interactive workflow connections', () => {
    expect(
      resolveInteractiveWorkflowConnection(
        { source: 'image-node', target: 'audio-node' },
        {
          existingEdges: [],
          nodes: [
            nodeRef('image-node', 'imageReference'),
            nodeRef('audio-node', 'voiceover'),
          ],
        },
      ),
    ).toEqual({
      edge: null,
      rejectionReason: '图片参考不能直接连接音频节点',
    });
  });

  it('returns a decorated edge for valid interactive workflow connections', () => {
    expect(
      resolveInteractiveWorkflowConnection(
        { source: 'image-node', target: 'video-node' },
        {
          existingEdges: [],
          nodes: [
            nodeRef('image-node', 'imageReference'),
            nodeRef('video-node', 'imageToVideo'),
          ],
        },
      ),
    ).toEqual({
      edge: {
        animated: true,
        source: 'image-node',
        target: 'video-node',
        type: 'pulse',
      },
      rejectionReason: null,
    });
  });

  it('allows reference nodes to feed video generation and adjacent reference controls', () => {
    expect(
      evaluateWorkflowConnection({
        sourceNodeType: 'imageReference',
        targetNodeType: 'imageToVideo',
      }),
    ).toEqual({ allowed: true });

    expect(
      evaluateWorkflowConnection({
        sourceNodeType: 'imageReference',
        targetNodeType: 'styleReference',
      }),
    ).toEqual({ allowed: true });
  });

  it('rejects invalid workflow connections with product-facing reasons', () => {
    expect(
      evaluateWorkflowConnection({
        sourceNodeType: 'imageReference',
        targetNodeType: 'voiceover',
      }),
    ).toEqual({
      allowed: false,
      reason: '图片参考不能直接连接音频节点',
    });

    expect(
      evaluateWorkflowConnection({
        sourceNodeType: 'export',
        targetNodeType: 'imageToVideo',
      }),
    ).toEqual({
      allowed: false,
      reason: '输出节点只能作为终点',
    });
  });

  it('rejects workflow connections that would create a cycle', () => {
    expect(
      evaluateWorkflowConnection({
        existingEdges: [
          { source: 'prompt', target: 'image' },
          { source: 'image', target: 'video' },
        ],
        source: 'video',
        target: 'prompt',
      }),
    ).toEqual({
      allowed: false,
      reason: '不能创建环路连接',
    });
  });
});
