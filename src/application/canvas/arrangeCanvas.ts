import type { FlowNodeData } from '../../domain/workflow/model';

export type ArrangeableNode = {
  data: Pick<FlowNodeData, 'kind'>;
  position: { x: number; y: number };
};

export function arrangeCanvasNodes<T extends ArrangeableNode>(nodes: T[]): T[] {
  const textNodes = nodes.filter((node) => node.data.kind === 'text');
  const imageNodes = nodes.filter((node) => node.data.kind === 'image');
  const videoNodes = nodes.filter((node) => node.data.kind === 'video');
  const otherNodes = nodes.filter((node) => !['text', 'image', 'video', 'group'].includes(node.data.kind));
  const groupNodes = nodes.filter((node) => node.data.kind === 'group');

  return [
    ...groupNodes,
    ...positionTextNodes(textNodes),
    ...positionImageNodes(imageNodes),
    ...positionVideoNodes(videoNodes),
    ...positionOtherNodes(otherNodes),
  ];
}

function positionTextNodes<T extends ArrangeableNode>(nodes: T[]): T[] {
  return nodes.map((node, index) => ({
    ...node,
    position: { x: -860, y: 170 + index * 230 },
  }));
}

function positionImageNodes<T extends ArrangeableNode>(nodes: T[]): T[] {
  const columnSize = Math.ceil(nodes.length / 2);
  return nodes.map((node, index) => {
    const col = index < columnSize ? 0 : 1;
    const row = col === 0 ? index : index - columnSize;
    return {
      ...node,
      position: { x: -380 + col * 300, y: -250 + row * 165 },
    };
  });
}

function positionVideoNodes<T extends ArrangeableNode>(nodes: T[]): T[] {
  return nodes.map((node, index) => ({
    ...node,
    position: { x: 450, y: 170 + index * 230 },
  }));
}

function positionOtherNodes<T extends ArrangeableNode>(nodes: T[]): T[] {
  return nodes.map((node, index) => ({
    ...node,
    position: { x: 820 + (index % 2) * 290, y: -190 + Math.floor(index / 2) * 190 },
  }));
}
