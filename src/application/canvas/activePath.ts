export type PathEdge = {
  source: string;
  target: string;
  data?: Record<string, unknown>;
};

export function markActivePathEdges<T extends PathEdge>(edges: T[], selectedNodeId: string | null): T[] {
  return edges.map((edge) => ({
    ...edge,
    data: {
      ...(edge.data ?? {}),
      pulseActive: selectedNodeId ? edge.source === selectedNodeId || edge.target === selectedNodeId : false,
    },
  }));
}
