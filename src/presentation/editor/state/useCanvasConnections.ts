import {
  addEdge,
  type Connection,
  type Edge,
  type Node,
} from '@xyflow/react';
import type { Dispatch, SetStateAction } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { markActivePathEdges } from '@/application/canvas/activePath';
import {
  resolveEdgeForAddedWorkflowNode,
  resolveInteractiveWorkflowConnection,
} from '@/application/workflow/connectWorkflowNode';
import type { AiNodeType, FlowNodeData } from '@/domain/workflow/model';

type AddEdgeForAddedNodeInput = {
  sourceNodeId: string | null;
  targetNodeId: string;
  targetNodeType: AiNodeType;
};

type UseCanvasConnectionsInput = {
  edges: Edge[];
  nodes: Node<FlowNodeData>[];
  selectedNodeId: string | null;
  setEdges: Dispatch<SetStateAction<Edge[]>>;
};

export function useCanvasConnections({
  edges,
  nodes,
  selectedNodeId,
  setEdges,
}: UseCanvasConnectionsInput) {
  const [connectionNotice, setConnectionNotice] = useState<string | null>(null);

  const onConnect = useCallback((params: Connection) => {
    const result = resolveInteractiveWorkflowConnection(params, {
      existingEdges: edges,
      nodes,
    });

    setConnectionNotice(result.rejectionReason);
    if (result.edge) setEdges((currentEdges) => addEdge(result.edge!, currentEdges));
  }, [edges, nodes, setEdges]);

  const addEdgeForAddedNode = useCallback(({
    sourceNodeId,
    targetNodeId,
    targetNodeType,
  }: AddEdgeForAddedNodeInput) => {
    const sourceNodeType = nodes.find((node) => node.id === sourceNodeId)?.data.nodeType;
    const result = resolveEdgeForAddedWorkflowNode({
      existingEdges: edges,
      sourceNodeId,
      sourceNodeType,
      targetNodeId,
      targetNodeType,
    });

    setConnectionNotice(result.rejectionReason);
    if (result.edge) setEdges((currentEdges) => addEdge(result.edge as Edge, currentEdges));
  }, [edges, nodes, setEdges]);

  useEffect(() => {
    if (!connectionNotice) return;
    const timer = window.setTimeout(() => setConnectionNotice(null), 2200);
    return () => window.clearTimeout(timer);
  }, [connectionNotice]);

  const displayEdges = useMemo(
    () => markActivePathEdges(edges, selectedNodeId),
    [edges, selectedNodeId],
  );

  return {
    addEdgeForAddedNode,
    connectionNotice,
    displayEdges,
    onConnect,
  };
}
