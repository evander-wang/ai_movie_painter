import type { Node } from '@xyflow/react';
import { useCallback, useEffect, useMemo, useState, type Dispatch, type SetStateAction } from 'react';
import type { FlowNodeData } from '@/domain/workflow/model';
import { getNodeDomRectById, rectFromElement } from '@/infrastructure/browser/domGeometry';
import { chooseOverlayPosition, type AnchorRect } from '@/shared/geometry/overlayPosition';
import type { NodePopover, Panel } from '@/presentation/editor/editorTypes';
import { getVideoNodeId, markSelectedCanvasNode } from '@/presentation/editor/state/editorSelection';

type UseEditorSelectionInput = {
  initialSelectedNodeId: string | null;
  nodes: Node<FlowNodeData>[];
  setNodes: Dispatch<SetStateAction<Node<FlowNodeData>[]>>;
  setPanel: (nextPanel: Panel) => void;
};

export function useEditorSelection({
  initialSelectedNodeId,
  nodes,
  setNodes,
  setPanel,
}: UseEditorSelectionInput) {
  const [nodePopover, setNodePopover] = useState<NodePopover>(null);
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(() =>
    getVideoNodeId(nodes, initialSelectedNodeId),
  );
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(initialSelectedNodeId);
  const [selectedAnchor, setSelectedAnchor] = useState<AnchorRect | null>(null);

  const setSelectedFlowNodeId = useCallback((id: string | null) => {
    setSelectedNodeId((currentId) => (currentId === id ? currentId : id));
    setNodes((currentNodes) => markSelectedCanvasNode(currentNodes, id));
  }, [setNodes]);

  const resetEditorState = useCallback(() => {
    setSelectedFlowNodeId(null);
    setSelectedVideoId(null);
    setSelectedAnchor(null);
    setNodePopover(null);
    setPanel(null);
  }, [setPanel, setSelectedFlowNodeId]);

  const clearSelection = useCallback(() => {
    setSelectedVideoId(null);
    setSelectedFlowNodeId(null);
    setSelectedAnchor(null);
    setNodePopover(null);
  }, [setSelectedFlowNodeId]);

  const selectNodeById = useCallback((id: string, kind: FlowNodeData['kind']) => {
    setSelectedFlowNodeId(id);
    setSelectedVideoId(kind === 'video' ? id : null);
    setNodePopover(null);
    setPanel(null);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const rect = getNodeDomRectById(id);
        if (rect) setSelectedAnchor(rect);
      });
    });
  }, [setPanel, setSelectedFlowNodeId]);

  const handleNodeClick = useCallback((node: Node<FlowNodeData>) => {
    setNodePopover(null);
    setPanel(null);
    setSelectedFlowNodeId(node.id);
    const nodeElement = document.querySelector(`[data-id="${node.id}"]`);
    if (nodeElement) setSelectedAnchor(rectFromElement(nodeElement));
    setSelectedVideoId(node.data.kind === 'video' ? node.id : null);
  }, [setPanel, setSelectedFlowNodeId]);

  const handlePaneClick = useCallback(() => {
    clearSelection();
  }, [clearSelection]);

  useEffect(() => {
    const handleNodeSelect = (event: Event) => {
      const detail = (event as CustomEvent<{ id: string; kind: FlowNodeData['kind']; anchor?: AnchorRect }>).detail;
      setNodePopover(null);
      setPanel(null);
      setSelectedFlowNodeId(detail.id);
      if (detail.anchor) setSelectedAnchor(detail.anchor);
      setSelectedVideoId(detail.kind === 'video' ? detail.id : null);
    };

    window.addEventListener('prototype-node-select', handleNodeSelect);
    return () => window.removeEventListener('prototype-node-select', handleNodeSelect);
  }, [setPanel, setSelectedFlowNodeId]);

  const selectedNode = useMemo(
    () =>
      nodes.find((node) => node.id === selectedNodeId)?.data ??
      nodes.find((node) => node.selected)?.data ??
      nodes.find((node) => node.id === 'default-text')?.data,
    [nodes, selectedNodeId],
  );

  const activeSelectedNode = useMemo(
    () => (selectedNodeId ? nodes.find((node) => node.id === selectedNodeId)?.data : undefined),
    [nodes, selectedNodeId],
  );

  const overlayPosition = useMemo(() => {
    if (!selectedAnchor || !activeSelectedNode) return undefined;
    return chooseOverlayPosition(
      selectedAnchor,
      activeSelectedNode.kind === 'video' ? { width: 650, height: 548 } : { width: 520, height: 620 },
      { width: window.innerWidth, height: window.innerHeight },
    );
  }, [activeSelectedNode, selectedAnchor]);

  return useMemo(
    () => ({
      activeSelectedNode,
      clearSelection,
      handleNodeClick,
      handlePaneClick,
      nodePopover,
      overlayPosition,
      resetEditorState,
      selectNodeById,
      selectedNode,
      selectedNodeId,
      selectedVideoId,
      setNodePopover,
      setSelectedAnchor,
      setSelectedFlowNodeId,
      setSelectedVideoId,
    }),
    [
      activeSelectedNode,
      clearSelection,
      handleNodeClick,
      handlePaneClick,
      nodePopover,
      overlayPosition,
      resetEditorState,
      selectNodeById,
      selectedNode,
      selectedNodeId,
      selectedVideoId,
      setSelectedFlowNodeId,
    ],
  );
}
