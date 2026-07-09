import { useCallback, useEffect, useRef, useState } from 'react';
import type React from 'react';
import type { OverlayPosition } from '@/shared/geometry/overlayPosition';

type DragOffset = {
  x: number;
  y: number;
};

export function useDraggableOverlay(position?: OverlayPosition) {
  const [offset, setOffset] = useState<DragOffset>({ x: 0, y: 0 });
  const dragRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    originX: number;
    originY: number;
  } | null>(null);

  useEffect(() => {
    setOffset({ x: 0, y: 0 });
  }, [position?.left, position?.top]);

  const onPointerDown = useCallback((event: React.PointerEvent<HTMLElement>) => {
    if (event.button !== 0) return;
    const target = event.target as HTMLElement;
    if (target.closest('button, input, textarea, select, a, [data-no-drag="true"]')) return;

    const origin = offset;
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: origin.x,
      originY: origin.y,
    };

    event.currentTarget.setPointerCapture(event.pointerId);
    event.preventDefault();
  }, [offset]);

  const onPointerMove = useCallback((event: React.PointerEvent<HTMLElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;

    setOffset({
      x: drag.originX + event.clientX - drag.startX,
      y: drag.originY + event.clientY - drag.startY,
    });
  }, []);

  const onPointerUp = useCallback((event: React.PointerEvent<HTMLElement>) => {
    if (dragRef.current?.pointerId !== event.pointerId) return;
    dragRef.current = null;
    event.currentTarget.releasePointerCapture(event.pointerId);
  }, []);

  return {
    dragStyle: {
      left: position ? `${position.left}px` : undefined,
      top: position ? `${position.top}px` : undefined,
      '--drag-x': `${offset.x}px`,
      '--drag-y': `${offset.y}px`,
    } as React.CSSProperties,
    dragHandleProps: {
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel: onPointerUp,
    },
  };
}
