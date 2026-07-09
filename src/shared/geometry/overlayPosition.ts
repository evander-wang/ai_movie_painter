export type AnchorRect = {
  left: number;
  top: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
};

export type OverlayPosition = {
  left: number;
  top: number;
};

export type OverlaySize = {
  width: number;
  height: number;
};

export type OverlayViewport = {
  width: number;
  height: number;
};

export function chooseOverlayPosition(
  anchor: AnchorRect,
  size: OverlaySize,
  viewport: OverlayViewport,
): OverlayPosition {
  const gap = 14;
  const padding = 16;
  const candidates = [
    { left: anchor.right + gap, top: anchor.top + anchor.height / 2 - size.height / 2 },
    { left: anchor.left - size.width - gap, top: anchor.top + anchor.height / 2 - size.height / 2 },
    { left: anchor.left + anchor.width / 2 - size.width / 2, top: anchor.bottom + gap },
    { left: anchor.left + anchor.width / 2 - size.width / 2, top: anchor.top - size.height - gap },
  ];

  const best = candidates.reduce((winner, candidate) =>
    scoreOverlayPosition(candidate, size, viewport, padding) > scoreOverlayPosition(winner, size, viewport, padding)
      ? candidate
      : winner,
  );

  return {
    left: clamp(best.left, padding, viewport.width - size.width - padding),
    top: clamp(best.top, padding, viewport.height - size.height - padding),
  };
}

function scoreOverlayPosition(
  candidate: OverlayPosition,
  size: OverlaySize,
  viewport: OverlayViewport,
  padding: number,
) {
  const visibleWidth = Math.min(candidate.left + size.width, viewport.width - padding) - Math.max(candidate.left, padding);
  const visibleHeight = Math.min(candidate.top + size.height, viewport.height - padding) - Math.max(candidate.top, padding);
  return Math.max(0, visibleWidth) * Math.max(0, visibleHeight);
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}
