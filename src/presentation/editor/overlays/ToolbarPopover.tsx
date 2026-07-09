import { BookOpen, Captions, ChevronDown, Clapperboard, Copy, Download, ImageIcon, ListPlus, Maximize2, Scissors, ShieldCheck, Sparkles, Square, Volume2, WandSparkles, Zap } from 'lucide-react';
import type { NodePopover } from '@/presentation/editor/editorTypes';

export function ToolbarPopover({ type }: { type: NodePopover }) {
  const content: Record<Exclude<NodePopover, null>, Array<[React.ReactNode, string, string]>> = {
    edit: [
      [<Scissors size={15} />, '分割片段', '按当前时间点切成两个节点'],
      [<Clapperboard size={15} />, '替换镜头', '保留参数并重新生成画面'],
      [<Copy size={15} />, '复制为副本', '复制视频和生成参数'],
    ],
    crop: [
      [<Square size={15} />, '16:9 · 720P', '当前节点输出比例'],
      [<Square size={15} />, '9:16 · 720P', '竖屏短视频构图'],
      [<Maximize2 size={15} />, '自由裁剪', '拖动裁剪框重新取景'],
    ],
    hd: [
      [<span className="hd-badge">HD</span>, '高清增强', '提升清晰度和细节质感'],
      [<WandSparkles size={15} />, '电影级质感', '增强自然光、景深和胶片感'],
      [<ShieldCheck size={15} />, '保持主体一致', '避免角色脸部和服饰漂移'],
    ],
    parse: [
      [<BookOpen size={15} />, '解析镜头语言', '读取运镜、景别和主体动作'],
      [<ListPlus size={15} />, '生成分镜描述', '输出可复制的文字节点'],
      [<Sparkles size={15} />, '提取参考风格', '保存为全能参考'],
    ],
    subtitle: [
      [<Captions size={15} />, '智能去字幕', '去除底部字幕和水印区域'],
      [<ShieldCheck size={15} />, '保护人物边缘', '减少背景修补痕迹'],
      [<ChevronDown size={15} />, '强度：标准', '适合干净室内镜头'],
    ],
    audio: [
      [<Volume2 size={15} />, '音频分离', '拆分人声、环境声和音乐'],
      [<Zap size={15} />, '静音输出', '保留视频画面，移除声音'],
      [<Download size={15} />, '导出音频', '生成独立音频素材节点'],
    ],
    download: [
      [<Download size={15} />, '下载 720P MP4', '导出当前节点结果'],
      [<ImageIcon size={15} />, '导出首帧', '保存为图片参考'],
      [<Copy size={15} />, '复制资源链接', '复制当前视频地址'],
    ],
  };

  return (
    <div className="toolbar-popover">
      {content[type as Exclude<NodePopover, null>].map(([icon, title, desc]) => (
        <button key={title}>
          {icon}
          <span>
            <strong>{title}</strong>
            <small>{desc}</small>
          </span>
        </button>
      ))}
    </div>
  );
}


