import { useEffect } from 'react';

type HandleBaseOffset = {
  x: number;
  y: number;
};

export function getMagneticHandleBaseOffset(className: string, width: number, height: number): HandleBaseOffset {
  const isSourceHandle = className.includes('node-handle-source') || className.includes('react-flow__handle-right');

  return {
    x: isSourceHandle ? width / 2 : -width / 2,
    y: -height / 2,
  };
}

export function useMagneticHandles(isConnecting: boolean) {
  useEffect(() => {
    let frame = 0;
    let lastPointer = { x: -9999, y: -9999 };
    let activeHandle: HTMLElement | null = null;

    const clearActiveHandle = () => {
      if (activeHandle) {
        activeHandle.classList.remove('is-magnetized');
        activeHandle.style.removeProperty('--magnet-x');
        activeHandle.style.removeProperty('--magnet-y');
        activeHandle.style.removeProperty('transform');
      }
      activeHandle = null;
    };

    const updateMagnetHandle = () => {
      frame = 0;
      const radius = isConnecting ? 74 : 42;
      let closestHandle: HTMLElement | null = null;
      let closestDistance = radius;
      let closestOffset = { x: 0, y: 0 };

      const handles = Array.from(document.querySelectorAll<HTMLElement>('.node-handle'));
      for (const handle of handles) {
        const previousTransform = handle.style.transform;
        handle.style.removeProperty('transform');
        const rect = handle.getBoundingClientRect();
        if (previousTransform) handle.style.setProperty('transform', previousTransform, 'important');
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const deltaX = lastPointer.x - centerX;
        const deltaY = lastPointer.y - centerY;
        const distance = Math.hypot(deltaX, deltaY);
        if (distance < closestDistance) {
          closestDistance = distance;
          closestHandle = handle;
          const maxPull = isConnecting ? 16 : 10;
          const strength = Math.min(1, Math.max(0, (radius - distance) / (radius * 0.72)));
          closestOffset = {
            x: Math.max(-maxPull, Math.min(maxPull, deltaX * strength * 0.42)),
            y: Math.max(-maxPull, Math.min(maxPull, deltaY * strength * 0.42)),
          };
        }
      }

      if (activeHandle !== closestHandle) {
        clearActiveHandle();
        activeHandle = closestHandle;
        if (closestHandle) closestHandle.classList.add('is-magnetized');
      }

      if (closestHandle) {
        closestHandle.style.setProperty('--magnet-x', `${closestOffset.x.toFixed(2)}px`);
        closestHandle.style.setProperty('--magnet-y', `${closestOffset.y.toFixed(2)}px`);
        const baseOffset = getMagneticHandleBaseOffset(
          closestHandle.className,
          closestHandle.offsetWidth,
          closestHandle.offsetHeight,
        );
        closestHandle.style.setProperty(
          'transform',
          `translate(${(baseOffset.x + closestOffset.x).toFixed(2)}px, ${(baseOffset.y + closestOffset.y).toFixed(2)}px) scale(${isConnecting ? 1.28 : 1.16})`,
          'important',
        );
      }
    };

    const handlePointerMove = (event: PointerEvent) => {
      lastPointer = { x: event.clientX, y: event.clientY };
      if (!frame) frame = requestAnimationFrame(updateMagnetHandle);
    };

    const handlePointerLeave = () => {
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      clearActiveHandle();
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('blur', handlePointerLeave);
    document.addEventListener('mouseleave', handlePointerLeave);

    return () => {
      if (frame) cancelAnimationFrame(frame);
      clearActiveHandle();
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('blur', handlePointerLeave);
      document.removeEventListener('mouseleave', handlePointerLeave);
    };
  }, [isConnecting]);
}
