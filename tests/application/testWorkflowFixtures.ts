import type { WorkflowNode } from '../../src/domain/workflow/model';

export function workflowNode(id: string, kind: WorkflowNode['data']['kind']): WorkflowNode {
  return {
    id,
    type: 'mediaNode',
    position: { x: 0, y: 0 },
    data: {
      title: id,
      kind,
    },
  };
}

export function nodeRef(id: string, nodeType: NonNullable<WorkflowNode['data']['nodeType']>) {
  return {
    id,
    data: {
      nodeType,
    },
  };
}

export function createMemoryStorage(): Storage {
  const values = new Map<string, string>();

  return {
    get length() {
      return values.size;
    },
    clear: () => values.clear(),
    getItem: (key) => values.get(key) ?? null,
    key: (index) => Array.from(values.keys())[index] ?? null,
    removeItem: (key) => values.delete(key),
    setItem: (key, value) => values.set(key, value),
  };
}
