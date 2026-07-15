import type { Node } from '@xyflow/react';
import type { Dispatch, SetStateAction } from 'react';
import { useCallback } from 'react';
import { createWorkflowNode } from '@/application/workflow/createWorkflowNode';
import { nodeCatalog } from '@/domain/workflow/nodeCatalog';
import type { AiNodeType, CanvasViewport, FlowNodeData, NodeKind } from '@/domain/workflow/model';

type AddEdgeForAddedNode = (input: {
  sourceNodeId: string | null;
  targetNodeId: string;
  targetNodeType: AiNodeType;
}) => void;

type UseWorkflowNodeActionsInput = {
  addEdgeForAddedNode: AddEdgeForAddedNode;
  readEditorViewport: () => CanvasViewport;
  selectedNodeId: string | null;
  selectNodeById: (nodeId: string, kind: NodeKind) => void;
  setNodes: Dispatch<SetStateAction<Node<FlowNodeData>[]>>;
};

export function useWorkflowNodeActions({
  addEdgeForAddedNode,
  readEditorViewport,
  selectedNodeId,
  selectNodeById,
  setNodes,
}: UseWorkflowNodeActionsInput) {
  const addWorkflowNode = useCallback((nodeType: AiNodeType) => {
    const config = nodeCatalog[nodeType];
    const nodeId = `${nodeType}-${Date.now().toString(36)}`;
    const nextNode = createWorkflowNode({
      id: nodeId,
      nodeType,
      viewport: readEditorViewport(),
      viewportSize: readViewportSize(),
    }) as Node<FlowNodeData>;

    setNodes((currentNodes) => [...currentNodes, { ...nextNode, selected: false }]);
    addEdgeForAddedNode({
      sourceNodeId: selectedNodeId,
      targetNodeId: nodeId,
      targetNodeType: nodeType,
    });
    selectNodeById(nodeId, config.kind);
  }, [addEdgeForAddedNode, readEditorViewport, selectedNodeId, selectNodeById, setNodes]);

  return {
    addWorkflowNode,
  };
}

function readViewportSize() {
  return {
    width: window.innerWidth,
    height: window.innerHeight,
  };
}
