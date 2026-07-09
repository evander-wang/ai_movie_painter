import { BaseEdge, type EdgeProps, getBezierPath } from '@xyflow/react';
import type React from 'react';

export function PulseEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  selected,
  data,
}: EdgeProps) {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });
  const edgePhase = getEdgePhase(id);
  const edgeData = data as { active?: boolean; pulseActive?: boolean } | undefined;
  const shouldPulse = selected || edgeData?.active === true || edgeData?.pulseActive === true;

  return (
    <g
      className={`pulse-edge ${selected ? 'is-selected' : ''}`}
      data-edge-id={id}
      style={{ '--edge-phase': `${edgePhase}s` } as React.CSSProperties}
    >
      <BaseEdge id={`${id}-base`} path={edgePath} className="pulse-edge__base" interactionWidth={26} />
      {shouldPulse &&
        Array.from({ length: 4 }, (_, index) => (
          <g key={`${id}-shot-${index}`} style={{ '--shot-delay': `${index * 1.45}s` } as React.CSSProperties}>
            <path className="pulse-edge__shot-glow" d={edgePath} fill="none" pathLength={100} />
            <path className="pulse-edge__shot-core" d={edgePath} fill="none" pathLength={100} />
          </g>
        ))}
    </g>
  );
}

function getEdgePhase(id: string) {
  let hash = 2166136261;
  for (const char of id) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  hash ^= hash >>> 16;
  hash = Math.imul(hash, 2246822507);
  hash ^= hash >>> 13;
  hash = Math.imul(hash, 3266489909);
  hash ^= hash >>> 16;
  return -((hash >>> 0) % 5800) / 1000;
}
