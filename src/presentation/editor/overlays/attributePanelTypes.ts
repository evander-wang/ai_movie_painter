import type { NodeKind } from '@/domain/workflow/model';

export type AttributeActionIcon =
  | 'archive'
  | 'captions'
  | 'download'
  | 'gitBranch'
  | 'grid'
  | 'layers'
  | 'play'
  | 'scissors'
  | 'shield'
  | 'sparkles'
  | 'video'
  | 'volume';

export type AttributeAction = {
  icon: AttributeActionIcon;
  label: string;
};

export type AttributeChip = {
  active: boolean;
  label: string;
};

export type AttributeSlider = {
  label: string;
  value: number;
};

export type AudioChannel = {
  label: string;
  state: string;
  value: number;
};

export type AttributePreview = {
  background?: string;
  kind?: Exclude<NodeKind, 'group'>;
  label?: string;
};

export type AttributePanelView = {
  actions: AttributeAction[];
  audioChannels?: AudioChannel[];
  chips?: AttributeChip[];
  chipsTitle?: string;
  fields?: Array<[string, string]>;
  metrics?: Array<[string, string]>;
  preview?: AttributePreview;
  prompt?: {
    label: string;
    body?: string;
  };
  sliders?: AttributeSlider[];
  tabs?: string[];
};
