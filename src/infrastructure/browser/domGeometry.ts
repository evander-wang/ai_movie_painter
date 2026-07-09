import type { CanvasViewport } from '../../domain/workflow/model';
import type { AnchorRect } from '../../shared/geometry/overlayPosition';

export function rectFromElement(element: Element): AnchorRect {
  const rect = element.getBoundingClientRect();
  return {
    left: rect.left,
    top: rect.top,
    right: rect.right,
    bottom: rect.bottom,
    width: rect.width,
    height: rect.height,
  };
}

export function getNodeDomRectById(id: string): AnchorRect | null {
  const nodeElement = document.querySelector(`[data-id="${CSS.escape(id)}"]`);
  return nodeElement ? rectFromElement(nodeElement) : null;
}

export function readCurrentViewport(fallbackZoom: number): CanvasViewport {
  const viewport = document.querySelector('.react-flow__viewport');
  const transform = viewport instanceof HTMLElement ? new DOMMatrixReadOnly(getComputedStyle(viewport).transform) : null;
  return {
    x: transform?.e ?? 0,
    y: transform?.f ?? 0,
    zoom: transform?.a ?? fallbackZoom,
  };
}
