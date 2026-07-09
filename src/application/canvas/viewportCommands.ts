import type { CanvasViewport } from '../../domain/workflow/model';

export function getNextZoomIn(viewport: CanvasViewport, maxZoom: number): number {
  return Math.min(maxZoom, Number((viewport.zoom * 1.18).toFixed(3)));
}

export function getNextZoomOut(viewport: CanvasViewport, minZoom: number): number {
  return Math.max(minZoom, Number((viewport.zoom / 1.18).toFixed(3)));
}
