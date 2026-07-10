export type PathEdge = {
  source: string;
  target: string;
  data?: Record<string, unknown>;
};

export function markActivePathEdges<T extends PathEdge>(edges: T[], selectedNodeId: string | null): T[] {
  let changed = false;
  const nextEdges = edges.map((edge) => {
    const pulseActive = selectedNodeId ? edge.source === selectedNodeId || edge.target === selectedNodeId : false;
    if (edge.data?.pulseActive === pulseActive) return edge;

    changed = true;
    return {
      ...edge,
      data: {
        ...(edge.data ?? {}),
        pulseActive,
      },
    };
  });

  return changed ? nextEdges : edges;
}
