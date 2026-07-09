import type { EditorRoutePanel } from '@/application/canvas/editorRouteState';

export type Panel = EditorRoutePanel | null;

export type NodePopover = 'edit' | 'crop' | 'hd' | 'parse' | 'subtitle' | 'audio' | 'download' | null;
