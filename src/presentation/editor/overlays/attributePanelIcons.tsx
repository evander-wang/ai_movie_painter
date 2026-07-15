import {
  Archive,
  Captions,
  Download,
  Film,
  GitBranch,
  Grid3X3,
  ImageIcon,
  Layers3,
  MessageSquareText,
  Play,
  Scissors,
  Settings2,
  ShieldCheck,
  Sparkles,
  Video,
  Volume2,
} from 'lucide-react';
import type { NodeAttributeConfig } from '@/domain/workflow/model';
import type { AttributeActionIcon } from './attributePanelPresenter';

export function renderPreviewIcon(kind: NodeAttributeConfig['kind']) {
  if (kind === 'video') return <Film size={28} />;
  if (kind === 'image') return <ImageIcon size={28} />;
  if (kind === 'text') return <MessageSquareText size={28} />;
  if (kind === 'audio') return <Volume2 size={28} />;
  return <Settings2 size={28} />;
}

export function renderActionIcon(icon: AttributeActionIcon) {
  switch (icon) {
    case 'archive':
      return <Archive size={15} />;
    case 'captions':
      return <Captions size={15} />;
    case 'download':
      return <Download size={15} />;
    case 'gitBranch':
      return <GitBranch size={15} />;
    case 'grid':
      return <Grid3X3 size={15} />;
    case 'layers':
      return <Layers3 size={15} />;
    case 'play':
      return <Play size={15} />;
    case 'scissors':
      return <Scissors size={15} />;
    case 'shield':
      return <ShieldCheck size={15} />;
    case 'sparkles':
      return <Sparkles size={15} />;
    case 'video':
      return <Video size={15} />;
    case 'volume':
      return <Volume2 size={15} />;
  }
}
