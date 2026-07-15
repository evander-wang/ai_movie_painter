import {
  Box,
  Clock3,
  Keyboard,
  Layers3,
  Library,
  Plus,
  Rows3,
  Settings2,
  Timer,
  UserRound,
} from 'lucide-react';
import type { PanelIconKey } from '@/presentation/editor/panels/panelRegistry';

export function renderPanelIcon(icon: PanelIconKey, size: number) {
  const icons = {
    box: <Box size={size} />,
    characters: <UserRound size={size} />,
    clock: <Clock3 size={size} />,
    keyboard: <Keyboard size={size} />,
    layers: <Layers3 size={size} />,
    library: <Library size={size} />,
    'node-menu': <Plus size={size} />,
    queue: <Timer size={size} />,
    settings: <Settings2 size={size} />,
    timeline: <Rows3 size={size} />,
    zoom: <Plus size={size} />,
  } satisfies Record<PanelIconKey, React.ReactNode>;

  return icons[icon];
}
