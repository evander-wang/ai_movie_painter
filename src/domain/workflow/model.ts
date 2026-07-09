export type AiNodeType =
  | 'textToVideo'
  | 'imageToVideo'
  | 'firstLastFrame'
  | 'videoExtend'
  | 'videoToVideo'
  | 'imageReference'
  | 'characterReference'
  | 'sceneReference'
  | 'propReference'
  | 'styleReference'
  | 'prompt'
  | 'negativePrompt'
  | 'script'
  | 'storyboard'
  | 'camera'
  | 'voiceover'
  | 'music'
  | 'soundEffect'
  | 'audioSeparation'
  | 'lipSync'
  | 'trim'
  | 'cropRatio'
  | 'upscale'
  | 'interpolate'
  | 'removeText'
  | 'matting'
  | 'inpaint'
  | 'timeline'
  | 'transition'
  | 'subtitle'
  | 'composite'
  | 'versionCompare'
  | 'batchGenerate'
  | 'taskQueue'
  | 'export'
  | 'publish';

export type NodeKind = 'image' | 'video' | 'text' | 'group' | 'audio' | 'tool';

export type FlowNodeData = {
  title: string;
  kind: NodeKind;
  nodeType?: AiNodeType;
  size?: string;
  status?: 'ready' | 'working' | 'muted';
  accent?: string;
  preview?: string;
  body?: string;
  count?: number;
};

export type NodeAttributeConfig = {
  label: string;
  category: string;
  kind: Exclude<NodeKind, 'group'>;
  accent: string;
  summary: string;
  tabs: string[];
  metrics: Array<[string, string]>;
  fields: Array<[string, string]>;
  chips: string[];
  activeChips: number[];
  sliders: Array<[string, number]>;
  actions: string[];
};


export type CanvasPosition = {
  x: number;
  y: number;
};

export type WorkflowNode = {
  id: string;
  type?: string;
  position: CanvasPosition;
  selected?: boolean;
  data: FlowNodeData;
  width?: number;
  height?: number;
  style?: unknown;
  zIndex?: number;
};

export type WorkflowEdge = {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string | null;
  targetHandle?: string | null;
  type?: string;
  animated?: boolean;
  label?: unknown;
  data?: Record<string, unknown>;
};

export type CanvasViewport = {
  x: number;
  y: number;
  zoom: number;
};
