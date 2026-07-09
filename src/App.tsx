import {
  addEdge,
  Background,
  BackgroundVariant,
  BaseEdge,
  Connection,
  Controls,
  Edge,
  EdgeProps,
  Handle,
  MiniMap,
  Node,
  NodeProps,
  Position,
  ReactFlow,
  ReactFlowProvider,
  getBezierPath,
  useEdgesState,
  useNodesState,
  useReactFlow,
} from '@xyflow/react';
import {
  Archive,
  AlertTriangle,
  BadgeHelp,
  BookOpen,
  Box,
  ChevronsUpDown,
  CheckCircle2,
  Clock3,
  Captions,
  ChevronDown,
  Clapperboard,
  Copy,
  Cpu,
  Download,
  Expand,
  Film,
  FolderOpen,
  Gauge,
  GitBranch,
  Grid3X3,
  ImageIcon,
  Keyboard,
  Layers3,
  Library,
  ListPlus,
  Maximize2,
  MessageSquareText,
  Minus,
  Minimize2,
  MoreHorizontal,
  MousePointer2,
  Plus,
  Scissors,
  Search,
  Settings2,
  Share2,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Split,
  Square,
  Upload,
  UserRound,
  Video,
  Volume2,
  WandSparkles,
  X,
  Zap,
  Pause,
  Play,
  RefreshCcw,
  Rows3,
  Timer,
} from 'lucide-react';
import { projectConfig } from './config/projectConfig';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

type AiNodeType =
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

type NodeKind = 'image' | 'video' | 'text' | 'group' | 'audio' | 'tool';

type FlowNodeData = {
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

type NodeAttributeConfig = {
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

type Panel =
  | 'toolbox'
  | 'assets'
  | 'characters'
  | 'history'
  | 'shortcuts'
  | 'zoom'
  | 'nodeMenu'
  | 'selectedExpand'
  | 'nodeInspector'
  | 'storyboard'
  | 'timeline'
  | 'queue'
  | null;

type NodePopover = 'edit' | 'crop' | 'hd' | 'parse' | 'subtitle' | 'audio' | 'download' | null;

type DragOffset = {
  x: number;
  y: number;
};

type AnchorRect = {
  left: number;
  top: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
};

type OverlayPosition = {
  left: number;
  top: number;
};

type OverlaySize = {
  width: number;
  height: number;
};

const swatches = [
  '#F05B5B',
  '#F59E0B',
  '#10B981',
  '#23A6F2',
  '#8B5CF6',
  '#F472B6',
];

const nodeCatalog: Record<AiNodeType, NodeAttributeConfig> = {
  textToVideo: {
    label: '文生视频',
    category: '核心生成',
    kind: 'video',
    accent: '#15c8e8',
    summary: '从提示词直接生成镜头，适合概念镜头、氛围镜头和转场画面。',
    tabs: ['模型', 'Prompt', '画幅', '队列'],
    metrics: [['模型', 'S2.0'], ['时长', '4s'], ['比例', '16:9'], ['消耗', '108']],
    fields: [['生成模型', 'Seedance 2.0'], ['输出规格', '16:9 · 1080P · 4s'], ['采样策略', '精细采样 · 2 候选'], ['失败策略', '自动重试 1 次']],
    chips: ['电影写实', '自然光', '低运动', '固定角色'],
    activeChips: [0, 1, 3],
    sliders: [['运动强度', 46], ['风格强度', 64], ['提示词遵循', 82]],
    actions: ['生成视频', '批量候选', '同步时间线'],
  },
  imageToVideo: {
    label: '图生视频',
    category: '核心生成',
    kind: 'video',
    accent: '#38bdf8',
    summary: '以参考图作为首帧或主体约束，生成带运动的视频片段。',
    tabs: ['参考图', '运动', '一致性', '输出'],
    metrics: [['参考', '1 张'], ['一致性', '高'], ['运动', '中'], ['候选', '3']],
    fields: [['参考模式', '首帧 + 主体保持'], ['运动模板', '缓慢推进'], ['角色保持', '脸部/服装/体态锁定'], ['输出规格', '16:9 · 720P · 4s']],
    chips: ['首帧锁定', '主体不漂移', '背景微动', '镜头推进'],
    activeChips: [0, 1, 3],
    sliders: [['参考权重', 88], ['运动幅度', 52], ['背景自由度', 34]],
    actions: ['重新生成', '替换参考', '保存版本'],
  },
  firstLastFrame: {
    label: '首尾帧',
    category: '核心生成',
    kind: 'video',
    accent: '#60a5fa',
    summary: '输入开始帧和结束帧，让模型补齐中间动作和转场。',
    tabs: ['首帧', '尾帧', '插值', '输出'],
    metrics: [['首帧', '已设'], ['尾帧', '已设'], ['补间', '自然'], ['时长', '6s']],
    fields: [['首帧来源', '图片参考 01'], ['尾帧来源', '图片参考 06'], ['补间策略', '动作连续优先'], ['镜头约束', '不改变主体身份']],
    chips: ['平滑补间', '动作连续', '光线一致', '构图锁定'],
    activeChips: [0, 1, 2],
    sliders: [['首尾遵循', 84], ['补间自由度', 45], ['动作平滑', 76]],
    actions: ['生成补间', '交换首尾', '创建转场'],
  },
  videoExtend: {
    label: '视频续写',
    category: '核心生成',
    kind: 'video',
    accent: '#2dd4bf',
    summary: '基于已有视频继续生成后续片段，维持角色、场景与运动方向。',
    tabs: ['源视频', '续写', '一致性', '队列'],
    metrics: [['源长', '4s'], ['续写', '6s'], ['方向', '保持'], ['版本', 'v2']],
    fields: [['续写位置', '尾部 12 帧'], ['运动趋势', '延续当前镜头'], ['场景保持', '老屋书房'], ['输出拼接', '自动加入时间线']],
    chips: ['延续尾帧', '保留光线', '镜头不断裂', '自动拼接'],
    activeChips: [0, 1, 2],
    sliders: [['连续性', 86], ['新动作幅度', 42], ['主体保持', 79]],
    actions: ['续写视频', '预览拼接', '生成备选'],
  },
  videoToVideo: {
    label: '视频重绘',
    category: '核心生成',
    kind: 'video',
    accent: '#22c55e',
    summary: '对已有视频做风格迁移、换背景、换角色或整体重生成。',
    tabs: ['源视频', '重绘', '遮罩', '输出'],
    metrics: [['强度', '42'], ['遮罩', '无'], ['风格', '写实'], ['帧率', '24']],
    fields: [['重绘模式', '整体风格保留运动'], ['运动来源', '原视频轨迹'], ['结构保持', '人物位置/道具位置'], ['输出帧率', '24fps']],
    chips: ['保留运动', '重绘背景', '风格迁移', '结构锁定'],
    activeChips: [0, 2, 3],
    sliders: [['重绘强度', 42], ['运动保真', 88], ['纹理细节', 63]],
    actions: ['开始重绘', '编辑遮罩', '对比版本'],
  },
  imageReference: {
    label: '图片参考',
    category: '参考控制',
    kind: 'image',
    accent: '#f6b84d',
    summary: '通用图片参考，可作为角色、场景、风格、道具的输入来源。',
    tabs: ['参考设置', '裁剪', '用途', '版本'],
    metrics: [['权重', '78'], ['绑定', '3'], ['相似', '高'], ['版本', 'v4']],
    fields: [['来源', '本地上传 / 资产库'], ['裁剪比例', '16:9'], ['默认用途', '全能参考'], ['下游节点', '3 个生成节点']],
    chips: ['角色外观', '服装道具', '场景光线', '构图比例'],
    activeChips: [0, 1],
    sliders: [['参考权重', 78], ['风格迁移', 52], ['细节保留', 70]],
    actions: ['设为角色', '生成视频', '抠像裁剪'],
  },
  characterReference: {
    label: '角色库',
    category: '参考控制',
    kind: 'image',
    accent: '#fb7185',
    summary: '维护同一角色的正侧背、服装、表情与动作参考。',
    tabs: ['角色', '姿态', '服装', '绑定'],
    metrics: [['图片', '8'], ['视频', '5'], ['一致性', '高'], ['锁定', '开']],
    fields: [['角色名', '孙子 / 爷爷'], ['参考视角', '正面、侧面、背面'], ['服装规则', '蓝色 T 恤、短裤'], ['禁用规则', '不出现正脸特写']],
    chips: ['身份锁定', '服装锁定', '年龄保持', '体态保持'],
    activeChips: [0, 1, 3],
    sliders: [['身份一致性', 92], ['姿态自由度', 48], ['服装保真', 86]],
    actions: ['绑定下游', '补充视角', '生成角色卡'],
  },
  sceneReference: {
    label: '场景参考',
    category: '参考控制',
    kind: 'image',
    accent: '#a3e635',
    summary: '固定空间结构、光线、时间、陈设和场景连续性。',
    tabs: ['空间', '光线', '陈设', '镜头'],
    metrics: [['场景', '老屋'], ['光线', '晨光'], ['节点', '6'], ['锁定', '中']],
    fields: [['空间结构', '老屋书房'], ['主光源', '清晨暖金色自然光'], ['关键陈设', '木桌、窗棂、民俗道具'], ['连续策略', '维持桌面方位']],
    chips: ['空间锁定', '自然光', '道具保持', '景深统一'],
    activeChips: [0, 1, 2],
    sliders: [['场景保真', 82], ['光线一致', 74], ['背景变化', 28]],
    actions: ['应用场景', '提取风格', '生成空镜'],
  },
  propReference: {
    label: '道具/产品参考',
    category: '参考控制',
    kind: 'image',
    accent: '#f97316',
    summary: '固定产品或道具外观，避免生成时形状、纹理、标识漂移。',
    tabs: ['道具', '细节', '遮罩', '绑定'],
    metrics: [['道具', '4'], ['细节', '高'], ['绑定', '5'], ['漂移', '低']],
    fields: [['道具类型', '布老虎 / 泥塑钟馗 / 纸鸢'], ['细节锁定', '纹样、颜色、轮廓'], ['摆放规则', '桌面近景优先'], ['出镜方式', '手部操作或静物展示']],
    chips: ['轮廓锁定', '纹理锁定', '颜色锁定', '局部特写'],
    activeChips: [0, 1, 2],
    sliders: [['道具保真', 89], ['局部权重', 66], ['背景融合', 58]],
    actions: ['设为道具', '局部重绘', '生成特写'],
  },
  styleReference: {
    label: '风格参考',
    category: '参考控制',
    kind: 'image',
    accent: '#c084fc',
    summary: '控制摄影、美术、色调、质感和整体审美方向。',
    tabs: ['摄影', '色调', '质感', '迁移'],
    metrics: [['风格', '电影'], ['强度', '64'], ['色温', '暖'], ['镜头', '50mm']],
    fields: [['摄影风格', '电影级写实'], ['镜头质感', 'Canon R5 50mm f1.8'], ['色彩策略', '暖金色自然光'], ['颗粒/锐化', '轻微胶片颗粒']],
    chips: ['电影写实', '暖色调', '浅景深', '自然光'],
    activeChips: [0, 1, 2, 3],
    sliders: [['风格强度', 64], ['色彩统一', 76], ['写实保真', 83]],
    actions: ['应用风格', '保存预设', '生成样片'],
  },
  prompt: {
    label: 'Prompt 节点',
    category: '文本脚本',
    kind: 'text',
    accent: '#8b5cf6',
    summary: '存放可复用提示词，可连接到多个生成节点。',
    tabs: ['Prompt', '变量', '结构化', '下游'],
    metrics: [['字数', '186'], ['变量', '5'], ['下游', '4'], ['版本', 'v7']],
    fields: [['主描述', '非遗短片老屋书房场景'], ['变量', '{角色} {道具} {镜头}'], ['复用范围', '全局 + 单镜头覆盖'], ['校验', '缺少负向词提醒']],
    chips: ['全局提示词', '分镜提示词', '镜头语言', '风格描述'],
    activeChips: [0, 2, 3],
    sliders: [['提示词权重', 82], ['结构化程度', 68], ['下游继承', 74]],
    actions: ['优化提示词', '应用下游', '保存模板'],
  },
  negativePrompt: {
    label: '负向 Prompt',
    category: '文本脚本',
    kind: 'text',
    accent: '#a855f7',
    summary: '统一管理不要出现的内容，减少模型常见错误。',
    tabs: ['负向词', '规则', '继承', '检查'],
    metrics: [['规则', '12'], ['继承', '全局'], ['命中', '3'], ['强度', '高']],
    fields: [['禁用内容', '正脸、五官特写、字幕、水印'], ['质量约束', '畸形手、低清、过锐'], ['继承策略', '所有视频节点默认继承'], ['冲突检查', '与镜头描述实时校验']],
    chips: ['人物不露脸', '无字幕', '无水印', '手部修复'],
    activeChips: [0, 1, 2, 3],
    sliders: [['约束强度', 88], ['质量修正', 72], ['创意限制', 44]],
    actions: ['应用全局', '检查冲突', '生成规则'],
  },
  script: {
    label: '脚本节点',
    category: '文本脚本',
    kind: 'text',
    accent: '#7c3aed',
    summary: '存放完整故事脚本、旁白、对白和结构节奏。',
    tabs: ['剧本', '旁白', '节奏', '拆分'],
    metrics: [['段落', '5'], ['时长', '20s'], ['旁白', '无'], ['分镜', '5']],
    fields: [['故事结构', '开场、道具、互动、陈列、收束'], ['旁白策略', '无旁白，环境声为主'], ['节奏', '慢节奏、静物展示'], ['拆分规则', '按动作和场景切镜']],
    chips: ['无对白', '无旁白', '慢节奏', '非遗主题'],
    activeChips: [1, 2, 3],
    sliders: [['叙事密度', 48], ['镜头数量', 60], ['情绪强度', 54]],
    actions: ['拆成分镜', '生成旁白', '提取约束'],
  },
  storyboard: {
    label: '分镜节点',
    category: '文本脚本',
    kind: 'text',
    accent: '#6d28d9',
    summary: '把脚本拆成镜头，定义景别、运镜、主体动作和时长。',
    tabs: ['镜头', '动作', '景别', '生成'],
    metrics: [['镜头', '5'], ['总时长', '20s'], ['完成', '4/5'], ['冲突', '0']],
    fields: [['镜头 01', '老屋晨光，背影入场'], ['镜头 02', '手部整理布老虎'], ['镜头 03', '泥塑钟馗近景'], ['镜头 04', '纸鸢展开']],
    chips: ['景别完整', '运镜完整', '角色约束', '可批量生成'],
    activeChips: [0, 1, 2, 3],
    sliders: [['拆镜粒度', 68], ['镜头连续性', 76], ['执行完整度', 84]],
    actions: ['批量生成', '同步画布', '导出表格'],
  },
  camera: {
    label: '镜头语言',
    category: '文本脚本',
    kind: 'text',
    accent: '#4c1d95',
    summary: '专门控制推拉摇移、景别、焦段、景深和镜头速度。',
    tabs: ['运镜', '景别', '焦段', '速度'],
    metrics: [['运镜', '推进'], ['焦段', '50mm'], ['景深', '浅'], ['速度', '慢']],
    fields: [['镜头动作', '极缓推进 + 轻微右移'], ['景别', '中近景 / 局部特写'], ['焦段', '50mm'], ['稳定策略', '轻微手持但不抖动']],
    chips: ['缓推', '浅景深', '局部特写', '稳定镜头'],
    activeChips: [0, 1, 2, 3],
    sliders: [['推进速度', 42], ['景深强度', 70], ['稳定程度', 82]],
    actions: ['应用镜头', '保存预设', '生成运动'],
  },
  voiceover: {
    label: '配音节点',
    category: '音频',
    kind: 'audio',
    accent: '#10b981',
    summary: '文本转语音，控制音色、语速、情绪和口播节奏。',
    tabs: ['文本', '音色', '情绪', '导出'],
    metrics: [['字数', '64'], ['语速', '0.9x'], ['音色', '男声'], ['时长', '8s']],
    fields: [['音色', '温和中年男声'], ['语速', '偏慢'], ['情绪', '克制、纪录片感'], ['响度', '-16 LUFS']],
    chips: ['纪录片', '低情绪', '无口播', '可对口型'],
    activeChips: [0, 1],
    sliders: [['语速', 44], ['情绪强度', 38], ['清晰度', 78]],
    actions: ['生成配音', '试听', '同步字幕'],
  },
  music: {
    label: '背景音乐',
    category: '音频',
    kind: 'audio',
    accent: '#34d399',
    summary: '生成或引用 BGM，控制情绪、节奏、时长和音量。',
    tabs: ['音乐', '情绪', '音量', '版权'],
    metrics: [['时长', '20s'], ['音量', '-24db'], ['情绪', '安静'], ['状态', '禁用']],
    fields: [['音乐策略', '全程无背景音乐'], ['替代方案', '保留自然环境声'], ['响度', '不高于人声'], ['版权', '项目内生成']],
    chips: ['无背景音乐', '环境声优先', '低音量', '淡入淡出'],
    activeChips: [0, 1],
    sliders: [['音乐音量', 0], ['环境融合', 35], ['情绪强度', 22]],
    actions: ['生成 BGM', '静音', '加入时间线'],
  },
  soundEffect: {
    label: '音效节点',
    category: '音频',
    kind: 'audio',
    accent: '#22c55e',
    summary: '生成脚步声、道具碰撞、环境声和转场音效。',
    tabs: ['音效', '时间点', '混音', '导出'],
    metrics: [['音效', '4'], ['同步', '帧级'], ['音量', '-18db'], ['状态', '待混']],
    fields: [['音效类型', '纸鸢展开、木桌轻响、脚步'], ['对齐方式', '绑定视频帧点'], ['空间感', '室内近距离'], ['混音', '低音量自然融合']],
    chips: ['脚步声', '纸张声', '木桌声', '室内混响'],
    activeChips: [1, 2, 3],
    sliders: [['音效音量', 42], ['同步精度', 88], ['混响强度', 36]],
    actions: ['生成音效', '自动对齐', '混入轨道'],
  },
  audioSeparation: {
    label: '音频分离',
    category: '音频',
    kind: 'audio',
    accent: '#14b8a6',
    summary: '从视频中拆分人声、音乐和环境声，支持静音或单独导出。',
    tabs: ['分离', '通道', '降噪', '导出'],
    metrics: [['人声', '82%'], ['环境', '48%'], ['音乐', '0%'], ['时长', '10s']],
    fields: [['分离模型', 'Vocal / Music / Ambience'], ['保留通道', '环境声'], ['静音策略', '移除背景音乐'], ['导出格式', 'WAV / AAC']],
    chips: ['人声分离', '音乐静音', '环境保留', '降噪'],
    activeChips: [1, 2, 3],
    sliders: [['降噪强度', 64], ['环境声保留', 35], ['人声清晰', 82]],
    actions: ['重新分离', '导出 WAV', '生成字幕'],
  },
  lipSync: {
    label: '对口型',
    category: '音频',
    kind: 'video',
    accent: '#0d9488',
    summary: '让角色口型匹配配音或导入音频，适合数字人和对白镜头。',
    tabs: ['音频', '人脸', '口型', '输出'],
    metrics: [['音频', '8s'], ['人脸', '1'], ['同步', '高'], ['强度', '72']],
    fields: [['驱动音频', '配音节点 01'], ['人脸来源', '视频首帧检测'], ['口型强度', '自然'], ['保护区域', '眼部和背景不动']],
    chips: ['自然口型', '保留表情', '人脸锁定', '静音替换'],
    activeChips: [0, 1, 2],
    sliders: [['口型强度', 72], ['表情保留', 61], ['背景保护', 86]],
    actions: ['生成口型', '校准音频', '导出结果'],
  },
  trim: {
    label: '剪辑节点',
    category: '视频处理',
    kind: 'tool',
    accent: '#f59e0b',
    summary: '截取时间范围、分割片段、保留关键动作区间。',
    tabs: ['区间', '分割', '预览', '输出'],
    metrics: [['入点', '00:01'], ['出点', '00:04'], ['片段', '2'], ['状态', '预览']],
    fields: [['剪辑范围', '00:01.2 - 00:04.8'], ['分割点', '当前播放头'], ['保留音频', '跟随视频'], ['输出', '新建视频节点']],
    chips: ['保留首尾', '分割片段', '吸附帧点', '同步音频'],
    activeChips: [1, 2, 3],
    sliders: [['片段长度', 54], ['动作完整度', 78], ['尾帧保留', 66]],
    actions: ['应用剪辑', '分割节点', '加入时间线'],
  },
  cropRatio: {
    label: '裁剪/画幅',
    category: '视频处理',
    kind: 'tool',
    accent: '#f97316',
    summary: '调整 16:9、9:16、1:1 或自由裁剪，适配发布平台。',
    tabs: ['比例', '取景', '安全区', '输出'],
    metrics: [['比例', '16:9'], ['输出', '1080P'], ['主体', '居中'], ['平台', '通用']],
    fields: [['目标比例', '16:9 / 9:16 / 1:1'], ['取景策略', '主体自动居中'], ['安全区', '字幕与平台 UI 避让'], ['输出规则', '生成新版本']],
    chips: ['16:9', '9:16', '主体居中', '安全区'],
    activeChips: [0, 2, 3],
    sliders: [['主体居中', 84], ['边缘保留', 58], ['裁剪强度', 40]],
    actions: ['应用裁剪', '生成竖版', '预览平台'],
  },
  upscale: {
    label: '高清增强',
    category: '视频处理',
    kind: 'tool',
    accent: '#eab308',
    summary: '超分、去噪、锐化和细节补强，提高最终成片质量。',
    tabs: ['超分', '去噪', '细节', '输出'],
    metrics: [['倍率', '2x'], ['输出', '2K'], ['噪声', '低'], ['队列', '1']],
    fields: [['增强模式', '细节增强 + 去噪'], ['输出分辨率', '1920×1080 / 2K'], ['保护区域', '人物边缘与文字'], ['处理帧率', '24fps']],
    chips: ['2x 超分', '去噪', '细节补强', '边缘保护'],
    activeChips: [0, 1, 2, 3],
    sliders: [['清晰度', 76], ['去噪强度', 58], ['锐化强度', 42]],
    actions: ['开始增强', '对比前后', '替换原片'],
  },
  interpolate: {
    label: '补帧节点',
    category: '视频处理',
    kind: 'tool',
    accent: '#ca8a04',
    summary: '提升帧率，让动作更顺滑，减少跳帧和卡顿。',
    tabs: ['帧率', '运动', '伪影', '输出'],
    metrics: [['输入', '24fps'], ['输出', '48fps'], ['伪影', '低'], ['时长', '不变']],
    fields: [['目标帧率', '48fps'], ['运动估计', '标准'], ['伪影处理', '边缘保护'], ['音频同步', '保持原时长']],
    chips: ['48fps', '动作平滑', '边缘保护', '保持时长'],
    activeChips: [0, 1, 2, 3],
    sliders: [['平滑强度', 72], ['伪影抑制', 68], ['运动保真', 74]],
    actions: ['开始补帧', '预览运动', '导出版本'],
  },
  removeText: {
    label: '去字幕/水印',
    category: '视频处理',
    kind: 'tool',
    accent: '#d97706',
    summary: '去除画面文字、字幕和水印，并修复背景区域。',
    tabs: ['检测', '遮罩', '修复', '输出'],
    metrics: [['区域', '2'], ['强度', '标准'], ['保护', '人物'], ['状态', '待处理']],
    fields: [['检测区域', '底部字幕 + 右上角水印'], ['修复策略', '时序一致性修复'], ['保护对象', '人物边缘、道具纹理'], ['输出', '覆盖或新建版本']],
    chips: ['自动检测', '手动遮罩', '人物保护', '时序修复'],
    activeChips: [0, 2, 3],
    sliders: [['修复强度', 66], ['边缘保护', 84], ['纹理一致', 72]],
    actions: ['开始修复', '编辑遮罩', '对比结果'],
  },
  matting: {
    label: '抠像节点',
    category: '视频处理',
    kind: 'tool',
    accent: '#ea580c',
    summary: '去背景、保留人物或产品，生成透明通道或新背景合成。',
    tabs: ['主体', '边缘', '背景', '输出'],
    metrics: [['主体', '1'], ['边缘', '中'], ['格式', 'Alpha'], ['帧率', '24']],
    fields: [['主体类型', '人物 / 道具'], ['边缘策略', '发丝与手部保护'], ['背景处理', '透明或替换场景'], ['输出格式', 'MOV Alpha / PNG 序列']],
    chips: ['人物抠像', '道具抠像', '边缘保护', '透明输出'],
    activeChips: [1, 2, 3],
    sliders: [['边缘精细', 74], ['背景移除', 88], ['时序稳定', 69]],
    actions: ['开始抠像', '替换背景', '导出 Alpha'],
  },
  inpaint: {
    label: '局部重绘',
    category: '视频处理',
    kind: 'tool',
    accent: '#c2410c',
    summary: '只修改画面局部区域，适合修手、换道具、换服装、清除穿帮。',
    tabs: ['遮罩', 'Prompt', '时序', '输出'],
    metrics: [['遮罩', '1'], ['范围', '局部'], ['时序', '开'], ['版本', 'v3']],
    fields: [['重绘区域', '手部与道具边缘'], ['局部提示词', '自然手部、保持道具纹理'], ['时序一致', '跨帧跟踪遮罩'], ['保护区域', '人物身体和背景']],
    chips: ['修手', '换道具', '局部遮罩', '时序一致'],
    activeChips: [0, 2, 3],
    sliders: [['重绘强度', 58], ['边缘融合', 76], ['时序稳定', 82]],
    actions: ['开始重绘', '编辑遮罩', '保存修复'],
  },
  timeline: {
    label: '时间线',
    category: '编排',
    kind: 'tool',
    accent: '#06b6d4',
    summary: '把多个视频片段、音频、字幕和转场编排成完整短片。',
    tabs: ['轨道', '片段', '音频', '导出'],
    metrics: [['片段', '5'], ['总长', '20s'], ['轨道', '3'], ['状态', '可导出']],
    fields: [['视频轨', '5 个镜头顺序拼接'], ['音频轨', '环境声 + 可选配音'], ['字幕轨', '非遗道具说明'], ['导出策略', 'MP4 H.264']],
    chips: ['自动拼接', '吸附片段', '多轨道', '导出成片'],
    activeChips: [0, 1, 2, 3],
    sliders: [['节奏紧凑', 52], ['转场柔和', 44], ['音画同步', 88]],
    actions: ['打开时间线', '自动拼接', '导出短片'],
  },
  transition: {
    label: '转场节点',
    category: '编排',
    kind: 'tool',
    accent: '#0891b2',
    summary: '控制片段之间的转场方式、时长、方向和视觉连续性。',
    tabs: ['类型', '时长', '方向', '预览'],
    metrics: [['类型', '溶解'], ['时长', '12f'], ['方向', '保持'], ['位置', '2-3']],
    fields: [['转场类型', '自然溶解 / 匹配剪辑'], ['转场时长', '12 帧'], ['运动方向', '延续前镜头'], ['音频处理', '交叉淡化']],
    chips: ['溶解', '匹配剪辑', '交叉淡化', '方向保持'],
    activeChips: [0, 2, 3],
    sliders: [['转场时长', 48], ['连续感', 76], ['可见强度', 34]],
    actions: ['应用转场', '预览前后', '同步音频'],
  },
  subtitle: {
    label: '字幕节点',
    category: '编排',
    kind: 'tool',
    accent: '#0e7490',
    summary: '自动字幕、样式字幕、双语字幕和安全区控制。',
    tabs: ['文本', '样式', '时间轴', '安全区'],
    metrics: [['字幕', '6'], ['语言', '中文'], ['样式', '纪录片'], ['安全', '通过']],
    fields: [['字幕来源', '脚本 / 语音识别'], ['样式', '小号白字，低存在感'], ['位置', '底部安全区'], ['导出', '烧录或 SRT']],
    chips: ['自动断句', '安全区', 'SRT 导出', '双语预留'],
    activeChips: [0, 1, 2],
    sliders: [['字号', 42], ['背景透明', 28], ['时间对齐', 86]],
    actions: ['生成字幕', '编辑样式', '导出 SRT'],
  },
  composite: {
    label: '合成节点',
    category: '编排',
    kind: 'tool',
    accent: '#155e75',
    summary: '把视频、音频、字幕、Logo、贴纸和调色结果合成为成片。',
    tabs: ['输入', '图层', '混音', '输出'],
    metrics: [['输入', '8'], ['图层', '4'], ['音轨', '2'], ['输出', 'MP4']],
    fields: [['视频输入', '时间线主轨'], ['图层', '字幕 / Logo / 遮罩'], ['音频', '环境声 + 可选音效'], ['输出编码', 'H.264 高质量']],
    chips: ['多图层', '混音', '统一调色', '最终渲染'],
    activeChips: [0, 1, 2, 3],
    sliders: [['图层融合', 64], ['响度统一', 72], ['渲染质量', 88]],
    actions: ['开始合成', '预览成片', '导出文件'],
  },
  versionCompare: {
    label: '版本对比',
    category: '编排',
    kind: 'tool',
    accent: '#164e63',
    summary: '同一镜头多个候选并排比较，选择最佳版本进入时间线。',
    tabs: ['候选', '评分', '差异', '选择'],
    metrics: [['候选', '4'], ['已选', '1'], ['评分', '8.6'], ['差异', '明显']],
    fields: [['比较维度', '清晰度、角色一致性、运动自然'], ['当前最佳', '候选 B'], ['淘汰原因', '手部畸形 / 构图偏移'], ['下游动作', '替换时间线片段']],
    chips: ['并排播放', '评分', '差异高亮', '一键替换'],
    activeChips: [0, 1, 3],
    sliders: [['清晰度权重', 72], ['一致性权重', 88], ['美感权重', 62]],
    actions: ['选择版本', '对比播放', '生成更多'],
  },
  batchGenerate: {
    label: '批量生成',
    category: '任务输出',
    kind: 'tool',
    accent: '#64748b',
    summary: '同一组参数批量生成多个候选，支持并发、种子和成本控制。',
    tabs: ['数量', '变量', '成本', '队列'],
    metrics: [['数量', '6'], ['并发', '2'], ['成本', '648'], ['状态', '待发']],
    fields: [['候选数量', '每镜头 3 个'], ['变量范围', '种子、运镜、风格强度'], ['并发限制', '2 个任务同时运行'], ['成本上限', '800 积分']],
    chips: ['多候选', '固定种子', '成本上限', '失败重试'],
    activeChips: [0, 2, 3],
    sliders: [['候选数量', 60], ['变量幅度', 44], ['成本控制', 72]],
    actions: ['开始批量', '估算成本', '加入队列'],
  },
  taskQueue: {
    label: '任务队列',
    category: '任务输出',
    kind: 'tool',
    accent: '#475569',
    summary: '展示生成中、排队、失败、重试、消耗积分和预计时间。',
    tabs: ['运行中', '排队', '失败', '历史'],
    metrics: [['运行', '2'], ['排队', '4'], ['失败', '1'], ['消耗', '648']],
    fields: [['调度策略', '按镜头顺序 + 高优先级插队'], ['失败处理', '自动重试 1 次'], ['预计完成', '03:18'], ['通知', '完成后桌面提醒']],
    chips: ['并发控制', '失败重试', '成本统计', '进度轮询'],
    activeChips: [0, 1, 2, 3],
    sliders: [['并发数', 40], ['重试次数', 33], ['优先级', 68]],
    actions: ['打开队列', '暂停全部', '重试失败'],
  },
  export: {
    label: '导出节点',
    category: '任务输出',
    kind: 'tool',
    accent: '#334155',
    summary: '输出 MP4、MOV、GIF、封面图、分镜图和工程文件。',
    tabs: ['格式', '规格', '封面', '路径'],
    metrics: [['格式', 'MP4'], ['分辨率', '1080P'], ['码率', '12M'], ['封面', '1']],
    fields: [['视频格式', 'MP4 H.264'], ['分辨率', '1920×1080'], ['码率', '12 Mbps'], ['附加文件', '封面图 + SRT']],
    chips: ['MP4', '封面图', 'SRT', '工程包'],
    activeChips: [0, 1, 2],
    sliders: [['画质', 86], ['文件体积', 52], ['导出速度', 58]],
    actions: ['开始导出', '生成封面', '打开文件夹'],
  },
  publish: {
    label: '发布节点',
    category: '任务输出',
    kind: 'tool',
    accent: '#1e293b',
    summary: '适配抖音、小红书、B站、视频号等平台比例、标题和封面。',
    tabs: ['平台', '标题', '封面', '检查'],
    metrics: [['平台', '4'], ['比例', '9:16'], ['标题', '已写'], ['检查', '通过']],
    fields: [['目标平台', '抖音 / 小红书 / B站 / 视频号'], ['平台规格', '竖屏 1080×1920'], ['标题文案', '非遗主题短片'], ['发布检查', '水印、版权、字幕安全区']],
    chips: ['竖屏适配', '封面标题', '平台检查', '发布清单'],
    activeChips: [0, 1, 2, 3],
    sliders: [['标题吸引力', 62], ['封面可读性', 78], ['平台适配', 86]],
    actions: ['生成发布包', '检查规格', '复制文案'],
  },
};

const workflowGroups = [
  {
    id: 'core-generation',
    title: '核心生成',
    count: 5,
    accent: '#15c8e8',
    position: { x: -1620, y: -620 },
    nodeTypes: ['textToVideo', 'imageToVideo', 'firstLastFrame', 'videoExtend', 'videoToVideo'] as AiNodeType[],
  },
  {
    id: 'reference-control',
    title: '参考控制',
    count: 5,
    accent: '#f6b84d',
    position: { x: -480, y: -620 },
    nodeTypes: ['imageReference', 'characterReference', 'sceneReference', 'propReference', 'styleReference'] as AiNodeType[],
  },
  {
    id: 'text-script',
    title: '文本与脚本',
    count: 5,
    accent: '#8b5cf6',
    position: { x: 660, y: -620 },
    nodeTypes: ['prompt', 'negativePrompt', 'script', 'storyboard', 'camera'] as AiNodeType[],
  },
  {
    id: 'audio',
    title: '音频',
    count: 5,
    accent: '#10b981',
    position: { x: -1620, y: 280 },
    nodeTypes: ['voiceover', 'music', 'soundEffect', 'audioSeparation', 'lipSync'] as AiNodeType[],
  },
  {
    id: 'video-processing',
    title: '视频处理',
    count: 7,
    accent: '#f59e0b',
    position: { x: -480, y: 280 },
    nodeTypes: ['trim', 'cropRatio', 'upscale', 'interpolate', 'removeText', 'matting', 'inpaint'] as AiNodeType[],
  },
  {
    id: 'orchestration-output',
    title: '编排与输出',
    count: 9,
    accent: '#06b6d4',
    position: { x: 660, y: 280 },
    nodeTypes: ['timeline', 'transition', 'subtitle', 'composite', 'versionCompare', 'batchGenerate', 'taskQueue', 'export', 'publish'] as AiNodeType[],
  },
];

export function createDefaultCanvasNodes(): Node<FlowNodeData>[] {
  const promptConfig = nodeCatalog.prompt;
  const videoConfig = nodeCatalog.imageToVideo;
  const imageConfig = nodeCatalog.imageReference;
  const nodes: Node<FlowNodeData>[] = [
    {
      id: 'default-text',
      type: 'mediaNode',
      position: { x: -860, y: 170 },
      data: {
        title: '全局分镜 Prompt',
        kind: 'text',
        nodeType: 'prompt',
        size: '文本节点',
        status: 'ready',
        accent: promptConfig.accent,
        body:
          '非遗主题短片：老屋书房，清晨暖金色自然光，爷爷与孙子只拍手、脚、背影、肩以下。桌面依次展示布老虎、泥塑钟馗、纸鸢等道具，全程无背景音乐。',
      },
    },
  ];

  Array.from({ length: 10 }).forEach((_, index) => {
    const col = index < 5 ? 0 : 1;
    const row = index % 5;
    nodes.push({
      id: `default-image-${index + 1}`,
      type: 'mediaNode',
      position: {
        x: -380 + col * 300,
        y: -250 + row * 165,
      },
      data: {
        title: `图片参考 ${index + 1}`,
        kind: 'image',
        nodeType: 'imageReference',
        size: index < 5 ? '参与视频生成' : '仅作为参考',
        status: 'ready',
        accent: imageConfig.accent,
        preview:
          index % 3 === 0
            ? 'linear-gradient(135deg, #69413a, #b89463 45%, #1f2937)'
            : index % 3 === 1
              ? 'radial-gradient(circle at 35% 35%, #f7d8a6, #a4423a 42%, #121416)'
              : 'linear-gradient(135deg, #e6e0c8, #648a6a 45%, #121212)',
        body: imageConfig.summary,
      },
    });
  });

  nodes.push({
    id: 'default-video',
    type: 'mediaNode',
    position: { x: 450, y: 170 },
    data: {
      title: '图生视频合成',
      kind: 'video',
      nodeType: 'imageToVideo',
      size: '5 张参考 · 16:9',
      status: 'working',
      accent: videoConfig.accent,
      preview: makeNodePreview(videoConfig),
      body: videoConfig.summary,
    },
  });

  return nodes;
}

function makeNodePreview(config: NodeAttributeConfig) {
  return `linear-gradient(135deg, ${config.accent}44, rgba(255,255,255,0.06) 42%, rgba(9,11,14,0.92)), radial-gradient(circle at 72% 32%, ${config.accent}88, transparent 20%)`;
}

function rectFromElement(element: Element): AnchorRect {
  const rect = element.getBoundingClientRect();
  return {
    left: rect.left,
    top: rect.top,
    right: rect.right,
    bottom: rect.bottom,
    width: rect.width,
    height: rect.height,
  };
}

function chooseOverlayPosition(anchor: AnchorRect, size: OverlaySize): OverlayPosition {
  const gap = 14;
  const padding = 16;
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const candidates = [
    { left: anchor.right + gap, top: anchor.top + anchor.height / 2 - size.height / 2 },
    { left: anchor.left - size.width - gap, top: anchor.top + anchor.height / 2 - size.height / 2 },
    { left: anchor.left + anchor.width / 2 - size.width / 2, top: anchor.bottom + gap },
    { left: anchor.left + anchor.width / 2 - size.width / 2, top: anchor.top - size.height - gap },
  ];

  const score = (candidate: OverlayPosition) => {
    const visibleWidth =
      Math.min(candidate.left + size.width, viewportWidth - padding) - Math.max(candidate.left, padding);
    const visibleHeight =
      Math.min(candidate.top + size.height, viewportHeight - padding) - Math.max(candidate.top, padding);
    return Math.max(0, visibleWidth) * Math.max(0, visibleHeight);
  };

  const best = candidates.reduce((winner, candidate) => (score(candidate) > score(winner) ? candidate : winner));

  return {
    left: Math.min(Math.max(best.left, padding), viewportWidth - size.width - padding),
    top: Math.min(Math.max(best.top, padding), viewportHeight - size.height - padding),
  };
}

const initialNodes: Node<FlowNodeData>[] = createDefaultCanvasNodes();

export const initialEdges: Edge[] = [
  ...Array.from({ length: 10 }, (_, index) => ({
    id: `e-text-image-${index + 1}`,
    source: 'default-text',
    target: `default-image-${index + 1}`,
    type: 'pulse',
    animated: true,
  })),
  ...Array.from({ length: 5 }, (_, index) => ({
    id: `e-image-video-${index + 1}`,
    source: `default-image-${index + 1}`,
    target: 'default-video',
    type: 'pulse',
    animated: true,
  })),
];

function createNodeFromCatalog(nodeType: AiNodeType, id: string, position: { x: number; y: number }): Node<FlowNodeData> {
  const config = nodeCatalog[nodeType];
  return {
    id,
    type: 'mediaNode',
    position,
    selected: true,
    data: {
      title: config.label,
      kind: config.kind,
      nodeType,
      size: config.category,
      status: nodeType === 'taskQueue' ? 'working' : nodeType === 'music' ? 'muted' : 'ready',
      accent: config.accent,
      preview: makeNodePreview(config),
      body: config.summary,
    },
  };
}

function getNodeDomRectById(id: string): AnchorRect | null {
  const nodeElement = document.querySelector(`[data-id="${CSS.escape(id)}"]`);
  return nodeElement ? rectFromElement(nodeElement) : null;
}

function readCurrentViewport() {
  const viewport = document.querySelector('.react-flow__viewport');
  const transform = viewport instanceof HTMLElement ? new DOMMatrixReadOnly(getComputedStyle(viewport).transform) : null;
  return {
    x: transform?.e ?? 0,
    y: transform?.f ?? 0,
    zoom: transform?.a ?? projectConfig.canvas.defaultViewport.zoom,
  };
}

function downloadJson(filename: string, payload: unknown) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function parseImportedCanvas(payload: unknown): {
  nodes: Node<FlowNodeData>[];
  edges: Edge[];
  viewport?: { x: number; y: number; zoom: number };
} {
  if (!isRecord(payload)) throw new Error('文件不是有效的画布 JSON');
  if (payload.schemaVersion !== 'short-flow-canvas/v1') throw new Error('不支持的画布版本');
  if (!Array.isArray(payload.nodes) || !Array.isArray(payload.edges)) throw new Error('缺少 nodes 或 edges');

  const nodes = payload.nodes.map((rawNode, index): Node<FlowNodeData> => {
    if (!isRecord(rawNode) || typeof rawNode.id !== 'string' || !isRecord(rawNode.position) || !isRecord(rawNode.data)) {
      throw new Error(`第 ${index + 1} 个节点结构无效`);
    }

    const data = rawNode.data as Partial<FlowNodeData>;
    if (typeof data.title !== 'string' || typeof data.kind !== 'string') {
      throw new Error(`第 ${index + 1} 个节点缺少 title 或 kind`);
    }

    return {
      id: rawNode.id,
      type: typeof rawNode.type === 'string' ? rawNode.type : 'mediaNode',
      position: {
        x: Number(rawNode.position.x) || 0,
        y: Number(rawNode.position.y) || 0,
      },
      selected: Boolean(rawNode.selected),
      data: data as FlowNodeData,
    };
  });

  const edges = payload.edges.map((rawEdge, index): Edge => {
    if (!isRecord(rawEdge) || typeof rawEdge.id !== 'string' || typeof rawEdge.source !== 'string' || typeof rawEdge.target !== 'string') {
      throw new Error(`第 ${index + 1} 条连线结构无效`);
    }

    return {
      id: rawEdge.id,
      source: rawEdge.source,
      target: rawEdge.target,
      type: typeof rawEdge.type === 'string' ? rawEdge.type : 'pulse',
      sourceHandle: typeof rawEdge.sourceHandle === 'string' ? rawEdge.sourceHandle : null,
      targetHandle: typeof rawEdge.targetHandle === 'string' ? rawEdge.targetHandle : null,
      animated: Boolean(rawEdge.animated),
      label: rawEdge.label as Edge['label'],
    };
  });

  const viewport = isRecord(payload.viewport)
    ? {
        x: Number(payload.viewport.x) || 0,
        y: Number(payload.viewport.y) || 0,
        zoom: Number(payload.viewport.zoom) || projectConfig.canvas.defaultViewport.zoom,
      }
    : undefined;

  return { nodes, edges, viewport };
}

const nodeTypes = {
  mediaNode: MediaNode,
};

const edgeTypes = {
  pulse: PulseEdge,
};

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

function PulseEdge({
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

function useDraggableOverlay(position?: OverlayPosition) {
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

function MediaNode({ id, data, selected }: NodeProps<Node<FlowNodeData>>) {
  const isGroup = data.kind === 'group';
  const config = data.nodeType ? nodeCatalog[data.nodeType] : undefined;
  const emitSelection = (event: React.MouseEvent<HTMLElement>) => {
    window.dispatchEvent(
      new CustomEvent('prototype-node-select', {
        detail: {
          id,
          kind: data.kind,
          anchor: rectFromElement(event.currentTarget),
        },
      }),
    );
  };

  if (isGroup) {
    return (
      <div
        className="group-node"
        role="button"
        tabIndex={0}
        onClick={emitSelection}
        style={{
          '--group-accent': data.accent ?? '#334155',
        } as React.CSSProperties}
      >
        <div className="group-node-title">
          <span>{data.title}</span>
          <small>{data.count} 个节点</small>
        </div>
      </div>
    );
  }

  return (
    <div className={`flow-node ${selected ? 'is-selected' : ''}`} role="button" tabIndex={0} onClick={emitSelection}>
      <Handle className="node-handle node-handle-target" type="target" position={Position.Left} />
      <div className="node-head">
        <span className={`node-kind ${data.kind}`}>
          {data.kind === 'video' && <Video size={13} />}
          {data.kind === 'image' && <ImageIcon size={13} />}
          {data.kind === 'text' && <MessageSquareText size={13} />}
          {data.kind === 'audio' && <Zap size={13} />}
          {data.kind === 'tool' && <Settings2 size={13} />}
        </span>
        <span className="node-title">{data.title}</span>
        <button className="node-more" aria-label="more">
          <MoreHorizontal size={14} />
        </button>
      </div>
      {data.kind === 'text' ? (
        <div className="text-preview">
          <strong>{data.size}</strong>
          <p>{data.body}</p>
        </div>
      ) : (
        <div className="media-preview" style={{ background: data.preview }}>
          {data.kind === 'video' && <Film size={26} />}
          {data.kind === 'audio' && <Zap size={26} />}
          {data.kind === 'image' && <ImageIcon size={26} />}
          {data.kind === 'tool' && <Settings2 size={26} />}
          <span className="node-category-badge">{config?.category}</span>
        </div>
      )}
      <div className="node-foot">
        <span>{data.size}</span>
        {data.status === 'working' && <span className="pill busy">生成中</span>}
        {data.status === 'ready' && <span className="pill ok">完成</span>}
        {data.status === 'muted' && <span className="pill muted">静音</span>}
      </div>
      <Handle className="node-handle node-handle-source" type="source" position={Position.Right} />
    </div>
  );
}

export function App() {
  return (
    <ReactFlowProvider>
      <CanvasPrototype />
    </ReactFlowProvider>
  );
}

function CanvasPrototype() {
  const reactFlow = useReactFlow<Node<FlowNodeData>, Edge>();
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const importInputRef = useRef<HTMLInputElement | null>(null);
  const [panel, setPanel] = useState<Panel>(null);
  const [nodePopover, setNodePopover] = useState<NodePopover>(null);
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedAnchor, setSelectedAnchor] = useState<AnchorRect | null>(null);
  const [showMiniMap, setShowMiniMap] = useState(false);
  const [snap, setSnap] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [zoomPercent, setZoomPercent] = useState(58);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({ ...params, type: 'pulse', animated: true }, eds)),
    [setEdges],
  );
  const displayEdges = useMemo(
    () =>
      edges.map((edge) => ({
        ...edge,
        data: {
          ...(edge.data ?? {}),
          pulseActive: selectedNodeId ? edge.source === selectedNodeId || edge.target === selectedNodeId : false,
        },
      })),
    [edges, selectedNodeId],
  );

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
        const baseX = -closestHandle.offsetWidth / 2;
        const baseY = -closestHandle.offsetHeight / 2;
        closestHandle.style.setProperty(
          'transform',
          `translate(${(baseX + closestOffset.x).toFixed(2)}px, ${(baseY + closestOffset.y).toFixed(2)}px) scale(${isConnecting ? 1.28 : 1.16})`,
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

  const selectNodeById = useCallback((id: string, kind: FlowNodeData['kind']) => {
    setSelectedNodeId(id);
    setSelectedVideoId(kind === 'video' ? id : null);
    setNodePopover(null);
    setPanel(null);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const rect = getNodeDomRectById(id);
        if (rect) setSelectedAnchor(rect);
      });
    });
  }, []);

  const addWorkflowNode = useCallback((nodeType: AiNodeType) => {
    const config = nodeCatalog[nodeType];
    const currentViewport = readCurrentViewport();
    const zoom = currentViewport.zoom || 0.48;
    const viewportX = currentViewport.x || 0;
    const viewportY = currentViewport.y || 0;
    const id = `${nodeType}-${Date.now().toString(36)}`;
    const position = {
      x: (window.innerWidth / 2 - viewportX) / zoom - 120,
      y: (window.innerHeight / 2 - viewportY) / zoom - 90,
    };

    setNodes((currentNodes): Node<FlowNodeData>[] => [
      ...currentNodes.map((node) => ({ ...node, selected: false })),
      createNodeFromCatalog(nodeType, id, position),
    ]);
    selectNodeById(id, config.kind);
  }, [selectNodeById, setNodes]);

  const exportCanvas = useCallback(() => {
    const payload = {
      schemaVersion: 'short-flow-canvas/v1',
      exportedAt: new Date().toISOString(),
      app: projectConfig.app.name,
      viewport: readCurrentViewport(),
      nodes: nodes.map((node) => ({
        id: node.id,
        type: node.type,
        position: node.position,
        width: node.width,
        height: node.height,
        selected: Boolean(node.selected),
        data: node.data,
      })),
      edges: edges.map((edge) => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        sourceHandle: edge.sourceHandle,
        targetHandle: edge.targetHandle,
        type: edge.type,
        animated: Boolean(edge.animated),
        label: edge.label,
      })),
    };

    downloadJson(`short-flow-canvas-${Date.now()}.json`, payload);
  }, [edges, nodes]);

  const importCanvasFile = useCallback(async (file: File) => {
    try {
      const payload = parseImportedCanvas(JSON.parse(await file.text()));
      setNodes(payload.nodes);
      setEdges(payload.edges);
      setSelectedNodeId(null);
      setSelectedVideoId(null);
      setSelectedAnchor(null);
      setNodePopover(null);
      setPanel(null);
      if (payload.viewport) {
        requestAnimationFrame(() => {
          reactFlow.setViewport(payload.viewport!, { duration: 180 });
        });
      }
    } catch (error) {
      window.alert(error instanceof Error ? error.message : '导入失败');
    }
  }, [reactFlow, setEdges, setNodes]);

  const openImportDialog = useCallback(() => {
    importInputRef.current?.click();
  }, []);

  const fitCanvasView = useCallback(() => {
    reactFlow.fitView({ padding: 0.18, duration: 320, includeHiddenNodes: false });
  }, [reactFlow]);

  const resetCanvasView = useCallback(() => {
    reactFlow.setViewport(projectConfig.canvas.defaultViewport, { duration: 260 });
  }, [reactFlow]);

  const zoomCanvasTo = useCallback((zoom: number) => {
    const viewport = readCurrentViewport();
    reactFlow.setViewport({ ...viewport, zoom }, { duration: 180 });
  }, [reactFlow]);

  const zoomCanvasIn = useCallback(() => {
    const viewport = readCurrentViewport();
    zoomCanvasTo(Math.min(1.4, Number((viewport.zoom * 1.18).toFixed(3))));
  }, [zoomCanvasTo]);

  const zoomCanvasOut = useCallback(() => {
    const viewport = readCurrentViewport();
    zoomCanvasTo(Math.max(0.12, Number((viewport.zoom / 1.18).toFixed(3))));
  }, [zoomCanvasTo]);

  const arrangeCanvas = useCallback(() => {
    setNodes((currentNodes) => {
      const textNodes = currentNodes.filter((node) => node.data.kind === 'text');
      const imageNodes = currentNodes.filter((node) => node.data.kind === 'image');
      const videoNodes = currentNodes.filter((node) => node.data.kind === 'video');
      const otherNodes = currentNodes.filter(
        (node) => !['text', 'image', 'video', 'group'].includes(node.data.kind),
      );
      const groupNodes = currentNodes.filter((node) => node.data.kind === 'group');

      return [
        ...groupNodes,
        ...textNodes.map((node, index) => ({
          ...node,
          position: { x: -860, y: 170 + index * 230 },
        })),
        ...imageNodes.map((node, index) => {
          const col = index < Math.ceil(imageNodes.length / 2) ? 0 : 1;
          const row = col === 0 ? index : index - Math.ceil(imageNodes.length / 2);
          return {
            ...node,
            position: { x: -380 + col * 300, y: -250 + row * 165 },
          };
        }),
        ...videoNodes.map((node, index) => ({
          ...node,
          position: { x: 450, y: 170 + index * 230 },
        })),
        ...otherNodes.map((node, index) => ({
          ...node,
          position: { x: 820 + (index % 2) * 290, y: -190 + Math.floor(index / 2) * 190 },
        })),
      ];
    });
    requestAnimationFrame(() => {
      requestAnimationFrame(fitCanvasView);
    });
  }, [fitCanvasView, setNodes]);

  const selectedNode = useMemo(
    () =>
      nodes.find((node) => node.id === selectedNodeId)?.data ??
      nodes.find((node) => node.selected)?.data ??
      nodes.find((node) => node.id === 'default-text')?.data,
    [nodes, selectedNodeId],
  );
  const activeSelectedNode = useMemo(
    () => (selectedNodeId ? nodes.find((node) => node.id === selectedNodeId)?.data : undefined),
    [nodes, selectedNodeId],
  );
  const overlayPosition = useMemo(() => {
    if (!selectedAnchor || !activeSelectedNode) return undefined;
    return chooseOverlayPosition(
      selectedAnchor,
      activeSelectedNode.kind === 'video' ? { width: 650, height: 548 } : { width: 520, height: 620 },
    );
  }, [activeSelectedNode, selectedAnchor]);

  useEffect(() => {
    const handleNodeSelect = (event: Event) => {
      const detail = (event as CustomEvent<{ id: string; kind: FlowNodeData['kind']; anchor?: AnchorRect }>).detail;
      setNodePopover(null);
      setPanel(null);
      setSelectedNodeId(detail.id);
      if (detail.anchor) setSelectedAnchor(detail.anchor);
      setSelectedVideoId(detail.kind === 'video' ? detail.id : null);
    };

    window.addEventListener('prototype-node-select', handleNodeSelect);
    return () => window.removeEventListener('prototype-node-select', handleNodeSelect);
  }, []);

  return (
    <div className="app-shell">
      <input
        ref={importInputRef}
        className="hidden-file-input"
        type="file"
        accept="application/json,.json"
        onChange={(event) => {
          const file = event.currentTarget.files?.[0];
          event.currentTarget.value = '';
          if (file) void importCanvasFile(file);
        }}
      />
      <TopNav />
      <div className={`canvas-wrap ${isConnecting ? 'is-connecting' : ''}`}>
        <ReactFlow
          nodes={nodes}
          edges={displayEdges}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onConnectStart={() => setIsConnecting(true)}
          onConnectEnd={() => setIsConnecting(false)}
          onMove={(_, viewport) => setZoomPercent(Math.round(viewport.zoom * 100))}
          onNodeClick={(_, node) => {
            setNodePopover(null);
            setPanel(null);
            setSelectedNodeId(node.id);
            const nodeElement = document.querySelector(`[data-id="${node.id}"]`);
            if (nodeElement) setSelectedAnchor(rectFromElement(nodeElement));
            setSelectedVideoId(node.data.kind === 'video' ? node.id : null);
          }}
          onPaneClick={() => {
            setSelectedVideoId(null);
            setSelectedNodeId(null);
            setSelectedAnchor(null);
            setNodePopover(null);
          }}
          defaultViewport={projectConfig.canvas.defaultViewport}
          minZoom={projectConfig.canvas.minZoom}
          maxZoom={projectConfig.canvas.maxZoom}
          snapToGrid={snap}
          snapGrid={[projectConfig.canvas.snapGrid, projectConfig.canvas.snapGrid]}
          fitView={false}
          proOptions={{ hideAttribution: true }}
        >
          <Background variant={BackgroundVariant.Dots} gap={projectConfig.canvas.snapGrid} size={1.15} />
          <Controls showInteractive={false} position="bottom-right" />
          {showMiniMap && (
            <MiniMap
              pannable
              zoomable
              position="bottom-left"
              nodeColor={(node) => (node.data.kind === 'group' ? '#27313e' : '#49b6d6')}
            />
          )}
        </ReactFlow>
      </div>

      <LeftStatus
        snap={snap}
        setSnap={setSnap}
        setShowMiniMap={setShowMiniMap}
        setPanel={setPanel}
        onExportCanvas={exportCanvas}
        onImportCanvas={openImportDialog}
        onArrangeCanvas={arrangeCanvas}
        onZoomIn={zoomCanvasIn}
        onZoomOut={zoomCanvasOut}
        zoomPercent={zoomPercent}
      />
      <CenterToolbar setPanel={setPanel} activePanel={panel} />
      <WorkflowRail activePanel={panel} setPanel={setPanel} />
      {selectedVideoId && activeSelectedNode?.kind === 'video' && (
        <SelectedVideoOverlay
          node={activeSelectedNode}
          position={overlayPosition}
          activePopover={nodePopover}
          setActivePopover={setNodePopover}
          openExpand={() => setPanel('selectedExpand')}
        />
      )}
      {activeSelectedNode && activeSelectedNode.kind !== 'video' && !panel && (
        <NodeAttributePopover
          node={activeSelectedNode}
          position={overlayPosition}
          onClose={() => {
            setSelectedNodeId(null);
            setSelectedAnchor(null);
          }}
        />
      )}
      <PanelLayer
        panel={panel}
        setPanel={setPanel}
        selectedNode={selectedNode}
        onAddNode={addWorkflowNode}
        onFitView={fitCanvasView}
        onZoom100={() => zoomCanvasTo(1)}
        onZoomOut={zoomCanvasOut}
        onResetView={resetCanvasView}
      />
    </div>
  );
}

function TopNav() {
  return (
    <header className="top-nav">
      <div className="brand-block">
        <div className="brand-mark">
          <Split size={20} />
        </div>
        <button className="project-name">{projectConfig.app.displayName}</button>
      </div>
      <div className="top-actions">
        <button className="promo-button">
          <Sparkles size={15} />
          <span>会员特惠</span>
          <strong>37折</strong>
        </button>
        <button className="credit-button">
          <Zap size={15} />
          68
        </button>
        <button className="avatar-button">
          <UserRound size={18} />
        </button>
      </div>
    </header>
  );
}

function CenterToolbar({ setPanel, activePanel }: { setPanel: (panel: Panel) => void; activePanel: Panel }) {
  const tools: Array<[Panel, React.ReactNode, string]> = [
    ['nodeMenu', <Plus size={20} />, '添加节点'],
    ['toolbox', <Box size={18} />, '打开工具箱'],
    ['assets', <Library size={18} />, '素材库'],
    ['characters', <UserRound size={18} />, '角色库'],
    ['history', <Clock3 size={18} />, '历史记录'],
    ['shortcuts', <Keyboard size={18} />, '快捷键'],
  ];

  return (
    <div className="center-toolbar" role="toolbar">
      {tools.map(([key, icon, label]) => (
        <button
          key={key}
          className={activePanel === key ? 'active' : ''}
          title={label}
          onClick={() => setPanel(activePanel === key ? null : key)}
        >
          {icon}
        </button>
      ))}
      <span className="tool-divider" />
      <button title="教程">
        <BadgeHelp size={18} />
      </button>
    </div>
  );
}

function WorkflowRail({ activePanel, setPanel }: { activePanel: Panel; setPanel: (panel: Panel) => void }) {
  const tools: Array<[Panel, React.ReactNode, string, string]> = [
    ['nodeInspector', <Settings2 size={17} />, '参数', '节点详情参数面板'],
    ['storyboard', <Layers3 size={17} />, '分镜', 'Storyboard 分镜面板'],
    ['timeline', <Rows3 size={17} />, '时间线', '拼接与轨道预览'],
    ['queue', <Timer size={17} />, '任务', '生成任务队列'],
  ];

  return (
    <div className="workflow-rail" role="toolbar" aria-label="AI 视频工作流工具">
      {tools.map(([key, icon, label, title]) => (
        <button
          key={key}
          className={activePanel === key ? 'active' : ''}
          title={title}
          onClick={() => setPanel(activePanel === key ? null : key)}
        >
          {icon}
          <span>{label}</span>
        </button>
      ))}
    </div>
  );
}

function LeftStatus({
  snap,
  setSnap,
  setShowMiniMap,
  setPanel,
  onExportCanvas,
  onImportCanvas,
  onArrangeCanvas,
  onZoomIn,
  onZoomOut,
  zoomPercent,
}: {
  snap: boolean;
  setSnap: (snap: boolean) => void;
  setShowMiniMap: (value: (prev: boolean) => boolean) => void;
  setPanel: (panel: Panel) => void;
  onExportCanvas: () => void;
  onImportCanvas: () => void;
  onArrangeCanvas: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  zoomPercent: number;
}) {
  return (
    <div className="left-status">
      <button title="资产管理">
        <Archive size={16} />
        <span>资产管理</span>
      </button>
      <button title="整理画布" onClick={onArrangeCanvas}>
        <Grid3X3 size={16} />
      </button>
      <button title="切换小地图" onClick={() => setShowMiniMap((prev) => !prev)}>
        <MousePointer2 size={16} />
      </button>
      <button className={snap ? 'active' : ''} title="网格吸附" onClick={() => setSnap(!snap)}>
        <Grid3X3 size={16} />
      </button>
      <button title="导出画布 JSON" onClick={onExportCanvas}>
        <Download size={16} />
        <span>导出</span>
      </button>
      <button title="导入画布 JSON" onClick={onImportCanvas}>
        <Upload size={16} />
        <span>导入</span>
      </button>
      <button title="缩小画布" onClick={onZoomOut}>
        <Minus size={16} />
      </button>
      <button className="zoom-chip" title="缩放选项" onClick={() => setPanel('zoom')}>
        {zoomPercent}%
      </button>
      <button title="放大画布" onClick={onZoomIn}>
        <Plus size={16} />
      </button>
    </div>
  );
}

function PanelLayer({
  panel,
  setPanel,
  selectedNode,
  onAddNode,
  onFitView,
  onZoom100,
  onZoomOut,
  onResetView,
}: {
  panel: Panel;
  setPanel: (panel: Panel) => void;
  selectedNode?: FlowNodeData;
  onAddNode: (nodeType: AiNodeType) => void;
  onFitView: () => void;
  onZoom100: () => void;
  onZoomOut: () => void;
  onResetView: () => void;
}) {
  return (
    <>
      {panel === 'nodeMenu' && <NodeMenu onAddNode={onAddNode} onClose={() => setPanel(null)} />}
      {panel === 'zoom' && (
        <ZoomPopover
          onClose={() => setPanel(null)}
          onFitView={onFitView}
          onZoom100={onZoom100}
          onZoomOut={onZoomOut}
          onResetView={onResetView}
        />
      )}
      {panel === 'shortcuts' && <ShortcutsModal onClose={() => setPanel(null)} />}
      {panel === 'selectedExpand' && <SelectedExpandModal onClose={() => setPanel(null)} />}
      {panel === 'nodeInspector' && <NodeInspectorPanel onClose={() => setPanel(null)} />}
      {panel === 'storyboard' && <StoryboardPanel onClose={() => setPanel(null)} />}
      {panel === 'timeline' && <TimelinePanel onClose={() => setPanel(null)} />}
      {panel === 'queue' && <QueuePanel onClose={() => setPanel(null)} />}
      {['toolbox', 'assets', 'characters', 'history'].includes(panel ?? '') && (
        <SideDrawer panel={panel} onClose={() => setPanel(null)} selectedNode={selectedNode} />
      )}
    </>
  );
}

function NodeAttributePopover({
  node,
  position,
  onClose,
}: {
  node: FlowNodeData;
  position?: OverlayPosition;
  onClose: () => void;
}) {
  const { dragStyle, dragHandleProps } = useDraggableOverlay(position);
  const config = node.nodeType ? nodeCatalog[node.nodeType] : undefined;
  const iconMap: Record<NodeKind, React.ReactNode> = {
    image: <ImageIcon size={17} />,
    text: <MessageSquareText size={17} />,
    audio: <Volume2 size={17} />,
    group: <FolderOpen size={17} />,
    video: <Video size={17} />,
    tool: <Settings2 size={17} />,
  };

  return (
    <aside className={`node-attribute-popover ${node.kind}`} style={dragStyle}>
      <div className="attribute-head draggable-handle" {...dragHandleProps}>
        <div className="attribute-title">
          <span className={`attribute-icon ${node.kind}`}>{iconMap[node.kind]}</span>
          <div>
            <strong>{node.title}</strong>
            <small>{getNodeSubtitle(node)}</small>
          </div>
        </div>
        <button onClick={onClose}>
          <X size={17} />
        </button>
      </div>
      {config && <ConfigAttributePanel node={node} config={config} />}
      {!config && node.kind === 'image' && <ImageAttributePanel node={node} />}
      {!config && node.kind === 'text' && <TextAttributePanel node={node} />}
      {!config && node.kind === 'audio' && <AudioAttributePanel />}
      {!config && node.kind === 'group' && <GroupAttributePanel node={node} />}
    </aside>
  );
}

function getNodeSubtitle(node: FlowNodeData) {
  if (node.nodeType) return `${nodeCatalog[node.nodeType].category} · ${nodeCatalog[node.nodeType].summary}`;
  if (node.kind === 'image') return `${node.size ?? '参考图'} · 可作为角色/场景/风格约束`;
  if (node.kind === 'text') return `${node.size ?? 'Prompt'} · 可连接到多个生成节点`;
  if (node.kind === 'audio') return `${node.size ?? '音频'} · 人声/音乐/环境声处理`;
  if (node.kind === 'group') return `${node.count ?? 0} 个节点 · 批量管理与一致性约束`;
  if (node.kind === 'tool') return `${node.size ?? '工具'} · 工作流处理节点`;
  return `${node.size ?? '视频'} · 生成结果`;
}

function ConfigAttributePanel({ node, config }: { node: FlowNodeData; config: NodeAttributeConfig }) {
  return (
    <div className="attribute-body config-attribute-body">
      <div className="config-hero">
        <div className={`config-preview ${config.kind}`} style={{ background: node.preview ?? makeNodePreview(config) }}>
          {config.kind === 'video' && <Film size={28} />}
          {config.kind === 'image' && <ImageIcon size={28} />}
          {config.kind === 'text' && <MessageSquareText size={28} />}
          {config.kind === 'audio' && <Volume2 size={28} />}
          {config.kind === 'tool' && <Settings2 size={28} />}
        </div>
        <div className="config-summary">
          <span>{config.category}</span>
          <p>{config.summary}</p>
        </div>
      </div>
      <div className="attribute-tabs">
        {config.tabs.map((tab, index) => (
          <button key={tab} className={index === 0 ? 'active' : ''}>{tab}</button>
        ))}
      </div>
      <div className="attribute-metrics">
        {config.metrics.map(([label, value]) => (
          <div key={label}>
            <strong>{value}</strong>
            <span>{label}</span>
          </div>
        ))}
      </div>
      <div className="structured-list dense">
        {config.fields.map(([label, value]) => (
          <div key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </div>
      <div className="attribute-section">
        <div className="attribute-section-title">能力开关</div>
        <div className="chip-grid">
          {config.chips.map((item, index) => (
            <button key={item} className={config.activeChips.includes(index) ? 'active' : ''}>{item}</button>
          ))}
        </div>
      </div>
      {config.sliders.map(([label, value]) => (
        <AttributeSlider key={label} label={label} value={value} />
      ))}
      <div className="attribute-actions">
        {config.actions.map((action, index) => (
          <button key={action}>
            {index === 0 ? <Play size={15} /> : index === 1 ? <Sparkles size={15} /> : <GitBranch size={15} />}
            {action}
          </button>
        ))}
      </div>
    </div>
  );
}

function ImageAttributePanel({ node }: { node: FlowNodeData }) {
  return (
    <div className="attribute-body">
      <div className="attribute-preview" style={{ background: node.preview }}>
        <span>参考图</span>
      </div>
      <div className="attribute-tabs">
        {['参考设置', '裁剪', '用途', '版本'].map((tab, index) => (
          <button key={tab} className={index === 0 ? 'active' : ''}>{tab}</button>
        ))}
      </div>
      <div className="attribute-metrics">
        {[
          ['权重', '78'],
          ['绑定节点', '3'],
          ['相似度', '高'],
          ['版本', 'v4'],
        ].map(([label, value]) => (
          <div key={label}>
            <strong>{value}</strong>
            <span>{label}</span>
          </div>
        ))}
      </div>
      <div className="attribute-section">
        <div className="attribute-section-title">参考用途</div>
        <div className="chip-grid">
          {['角色外观', '服装道具', '场景光线', '构图比例'].map((item, index) => (
            <button key={item} className={index < 2 ? 'active' : ''}>{item}</button>
          ))}
        </div>
      </div>
      <AttributeSlider label="角色一致性" value={86} />
      <AttributeSlider label="风格迁移强度" value={52} />
      <div className="attribute-actions">
        <button><ShieldCheck size={15} />设为角色参考</button>
        <button><Video size={15} />生成视频</button>
        <button><Scissors size={15} />抠像裁剪</button>
      </div>
    </div>
  );
}

function TextAttributePanel({ node }: { node: FlowNodeData }) {
  return (
    <div className="attribute-body">
      <div className="attribute-tabs">
        {['Prompt', '结构化', '负向词', '下游'].map((tab, index) => (
          <button key={tab} className={index === 0 ? 'active' : ''}>{tab}</button>
        ))}
      </div>
      <div className="prompt-editor">
        <small>镜头描述</small>
        <p>{node.body}</p>
      </div>
      <div className="attribute-section">
        <div className="attribute-section-title">Prompt 类型</div>
        <div className="chip-grid">
          {['全局约束', '分镜描述', '镜头语言', '负向约束'].map((item, index) => (
            <button key={item} className={index === 1 ? 'active' : ''}>{item}</button>
          ))}
        </div>
      </div>
      <div className="structured-list">
        {[
          ['景别', '中近景 / 局部特写'],
          ['运镜', '极缓推进，轻微右移'],
          ['主体', '爷爷与孙子肩以下、手部、背影'],
          ['禁用', '正脸、五官特写、背景音乐'],
        ].map(([label, value]) => (
          <div key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </div>
      <div className="attribute-actions">
        <button><Layers3 size={15} />拆成分镜</button>
        <button><GitBranch size={15} />应用到下游</button>
        <button><Sparkles size={15} />优化提示词</button>
      </div>
    </div>
  );
}

function AudioAttributePanel() {
  return (
    <div className="attribute-body">
      <div className="waveform">
        {Array.from({ length: 34 }).map((_, index) => (
          <i key={index} style={{ height: `${18 + ((index * 17) % 34)}px` }} />
        ))}
      </div>
      <div className="attribute-tabs">
        {['分离', '音量', '降噪', '导出'].map((tab, index) => (
          <button key={tab} className={index === 0 ? 'active' : ''}>{tab}</button>
        ))}
      </div>
      <div className="audio-channel-list">
        {[
          ['人声', '已分离', 82],
          ['环境声', '可增强', 48],
          ['背景音乐', '静音约束', 0],
        ].map(([label, state, value]) => (
          <div key={label as string}>
            <span>{label as string}</span>
            <small>{state as string}</small>
            <b>{value}%</b>
          </div>
        ))}
      </div>
      <AttributeSlider label="降噪强度" value={64} />
      <AttributeSlider label="环境声保留" value={35} />
      <div className="attribute-actions">
        <button><Volume2 size={15} />重新分离</button>
        <button><Download size={15} />导出 WAV</button>
        <button><Captions size={15} />生成字幕</button>
      </div>
    </div>
  );
}

function GroupAttributePanel({ node }: { node: FlowNodeData }) {
  return (
    <div className="attribute-body">
      <div className="group-overview">
        <div>
          <strong>{node.count ?? 0}</strong>
          <span>节点</span>
        </div>
        <div>
          <strong>5</strong>
          <span>视频</span>
        </div>
        <div>
          <strong>2</strong>
          <span>参考</span>
        </div>
        <div>
          <strong>1</strong>
          <span>约束</span>
        </div>
      </div>
      <div className="attribute-section">
        <div className="attribute-section-title">批量策略</div>
        <div className="chip-grid">
          {['统一模型', '锁定角色', '继承负向词', '自动排版'].map((item, index) => (
            <button key={item} className={index !== 0 ? 'active' : ''}>{item}</button>
          ))}
        </div>
      </div>
      <div className="structured-list">
        {[
          ['默认模型', 'Seedance 2.0'],
          ['输出比例', '16:9 · 720P'],
          ['命名规则', '分组名 + 镜头序号'],
          ['失败策略', '自动重试 1 次'],
        ].map(([label, value]) => (
          <div key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </div>
      <div className="attribute-actions">
        <button><Grid3X3 size={15} />整理分组</button>
        <button><Play size={15} />批量生成</button>
        <button><Archive size={15} />加入资产</button>
      </div>
    </div>
  );
}

function AttributeSlider({ label, value }: { label: string; value: number }) {
  return (
    <div className="attribute-slider">
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
      <i>
        <b style={{ width: `${value}%` }} />
      </i>
    </div>
  );
}

function SelectedVideoOverlay({
  node,
  position,
  activePopover,
  setActivePopover,
  openExpand,
}: {
  node: FlowNodeData;
  position?: OverlayPosition;
  activePopover: NodePopover;
  setActivePopover: (popover: NodePopover) => void;
  openExpand: () => void;
}) {
  const { dragStyle, dragHandleProps } = useDraggableOverlay(position);
  const config = node.nodeType ? nodeCatalog[node.nodeType] : nodeCatalog.textToVideo;
  const toolButtons: Array<[NodePopover, React.ReactNode, string]> = [
    ['edit', <Scissors size={15} />, '剪辑'],
    ['crop', <Square size={15} />, '裁剪'],
    ['hd', <span className="hd-badge">HD</span>, '高清'],
    ['parse', <BookOpen size={15} />, '解析'],
    ['subtitle', <Captions size={15} />, '智能去字幕'],
    ['audio', <Volume2 size={15} />, '音频分离'],
  ];

  return (
    <div className="selected-video-overlay" style={dragStyle}>
      <div className="selected-media-node draggable-handle" {...dragHandleProps}>
        <div className="node-caption">{node.title} · {config.category}</div>
        <div className="selected-media-preview" style={{ background: node.preview ?? makeNodePreview(config) }}>
          <div className="play-chip">00:00</div>
          <div className="duration-chip">00:06</div>
        </div>
      </div>

      <div className="floating-video-toolbar">
        {toolButtons.map(([key, icon, label]) => (
          <button
            key={key}
            className={activePopover === key ? 'active' : ''}
            onClick={() => setActivePopover(activePopover === key ? null : key)}
          >
            {icon}
            <span>{label}</span>
            {(key === 'subtitle' || key === 'audio') && <ChevronDown size={13} />}
          </button>
        ))}
        <span className="toolbar-separator" />
        <button onClick={() => setActivePopover(activePopover === 'download' ? null : 'download')}>
          <Download size={16} />
        </button>
        <button onClick={openExpand}>
          <Expand size={16} />
        </button>
      </div>

      {activePopover && <ToolbarPopover type={activePopover} />}
      <VideoConfigCard node={node} config={config} openExpand={openExpand} />
    </div>
  );
}

function ToolbarPopover({ type }: { type: NodePopover }) {
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

function VideoConfigCard({
  node,
  config,
  openExpand,
}: {
  node: FlowNodeData;
  config: NodeAttributeConfig;
  openExpand: () => void;
}) {
  const references = [
    'linear-gradient(135deg,#f8f8f4,#bfc4c5 50%,#f8f8f4)',
    'linear-gradient(135deg,#e9d8bd,#4b7a9a 48%,#f0d295)',
    'radial-gradient(circle at 42% 36%,#b77957,#321915 48%,#c1a67b)',
    'linear-gradient(135deg,#d8c6a5,#8b4b32 45%,#222)',
    'linear-gradient(135deg,#a66538,#f0b36a 52%,#221b17)',
    'linear-gradient(135deg,#8d5d3c,#d7b373 48%,#2d241e)',
  ];

  return (
    <section className="video-config-card">
      <button className="card-expand" onClick={openExpand} aria-label="展开参数卡">
        <Expand size={15} />
      </button>
      <div className="mode-tabs">
        {config.tabs.slice(0, 5).map((tab, index) => (
          <button key={tab} className={index === 1 ? 'active' : ''}>
            {tab}
          </button>
        ))}
      </div>
      <div className="quick-actions">
        {[
          ['标记', Search],
          ['特效', ImageIcon],
          ['角色库', ShieldCheck],
          ['参考', Plus],
        ].map(([label, Icon]) => (
          <button key={label as string}>
            <Icon size={15} />
            <span>{label as string}</span>
          </button>
        ))}
        <div className="reference-strip">
          {references.map((bg, index) => (
            <button key={index} style={{ background: bg }}>
              <span>{index + 1}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="prompt-scroll">
        <p>## {node.title} · {config.category}</p>
        <p>{config.summary}</p>
        <p>{config.fields.map(([label, value]) => `${label}：${value}`).join('；')}</p>
      </div>
      <div className="video-attribute-compact">
        <div className="video-metrics-row">
          {config.metrics.map(([label, value]) => (
            <span key={label}>
              <strong>{value}</strong>
              <small>{label}</small>
            </span>
          ))}
        </div>
        <div className="video-chip-row">
          {config.chips.slice(0, 4).map((chip, index) => (
            <button key={chip} className={config.activeChips.includes(index) ? 'active' : ''}>{chip}</button>
          ))}
        </div>
        <div className="video-action-row">
          {config.actions.map((action, index) => (
            <button key={action}>
              {index === 0 ? <Play size={14} /> : index === 1 ? <Sparkles size={14} /> : <GitBranch size={14} />}
              {action}
            </button>
          ))}
        </div>
      </div>
      <div className="config-footer">
        <button><SlidersHorizontal size={15} />{config.metrics[0]?.[1]} <span className="tiny-gold">◆</span></button>
        <button><Square size={15} />{config.fields[1]?.[1] ?? '16:9 · 720P · 4s'}</button>
        <button><Volume2 size={15} /></button>
        <button><Clapperboard size={15} />运镜</button>
        <button><ListPlus size={15} /></button>
        <button><Share2 size={15} /></button>
        <button>1个<ChevronDown size={13} /></button>
        <button className="cost">✦ {config.metrics.find(([label]) => label === '消耗')?.[1] ?? '108'}</button>
        <button className="submit-arrow"><Upload size={18} /></button>
      </div>
    </section>
  );
}

function SelectedExpandModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="modal-backdrop">
      <section className="selected-expand-modal">
        <div className="modal-head">
          <div>
            <span>视频节点 5 - 副本</span>
            <p>全能参考 · 16:9 · 720P · 4s</p>
          </div>
          <button onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        <div className="expand-layout">
          <div className="expand-video">
            <div className="play-chip">00:00</div>
            <div className="duration-chip">00:06</div>
          </div>
          <div className="expand-data">
            <h3>节点参数</h3>
            <dl>
              <dt>模型</dt>
              <dd>Seedance 2.0</dd>
              <dt>比例</dt>
              <dd>16:9</dd>
              <dt>清晰度</dt>
              <dd>720P</dd>
              <dt>时长</dt>
              <dd>4s</dd>
              <dt>参考数量</dt>
              <dd>6 张图片参考</dd>
              <dt>消耗</dt>
              <dd>108 积分</dd>
            </dl>
          </div>
        </div>
      </section>
    </div>
  );
}

function NodeMenu({ onAddNode, onClose }: { onAddNode: (nodeType: AiNodeType) => void; onClose: () => void }) {
  return (
    <div className="popover node-menu">
      <div className="popover-head">
        <div>
          <strong>添加节点</strong>
          <small>选择一种 AI 视频工作流节点，添加到当前视口中心</small>
        </div>
        <button onClick={onClose}>
          <X size={15} />
        </button>
      </div>
      <div className="node-menu-library">
        {workflowGroups.map((group) => (
          <section key={group.id} className="node-menu-section">
            <div className="node-menu-section-head">
              <span style={{ background: group.accent }} />
              <strong>{group.title}</strong>
              <small>{group.count}</small>
            </div>
            <div className="node-menu-grid">
              {group.nodeTypes.map((nodeType) => {
                const config = nodeCatalog[nodeType];
                return (
                  <button
                    key={nodeType}
                    onClick={() => {
                      onAddNode(nodeType);
                      onClose();
                    }}
                  >
                    <span className={`node-kind ${config.kind}`}>
                      {config.kind === 'video' && <Video size={13} />}
                      {config.kind === 'image' && <ImageIcon size={13} />}
                      {config.kind === 'text' && <MessageSquareText size={13} />}
                      {config.kind === 'audio' && <Zap size={13} />}
                      {config.kind === 'tool' && <Settings2 size={13} />}
                    </span>
                    <span>{config.label}</span>
                    <small>{config.summary}</small>
                  </button>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

function ZoomPopover({
  onClose,
  onFitView,
  onZoom100,
  onZoomOut,
  onResetView,
}: {
  onClose: () => void;
  onFitView: () => void;
  onZoom100: () => void;
  onZoomOut: () => void;
  onResetView: () => void;
}) {
  const options = [
    { label: '适应屏幕', shortcut: 'F', icon: <Maximize2 size={16} />, action: onFitView },
    { label: '缩放到 100%', shortcut: '100%', icon: <Maximize2 size={16} />, action: onZoom100 },
    { label: '缩小一级', shortcut: '-18%', icon: <Minimize2 size={16} />, action: onZoomOut },
    { label: '重置视图', shortcut: '58%', icon: <Minimize2 size={16} />, action: onResetView },
  ];

  return (
    <div className="popover zoom-popover">
      <div className="popover-head">
        <strong>缩放选项</strong>
        <button onClick={onClose}>
          <X size={15} />
        </button>
      </div>
      {options.map((item) => (
        <button
          key={item.label}
          className="menu-row"
          onClick={() => {
            item.action();
            onClose();
          }}
        >
          {item.icon}
          <span>{item.label}</span>
          <kbd>{item.shortcut}</kbd>
        </button>
      ))}
    </div>
  );
}

function ShortcutsModal({ onClose }: { onClose: () => void }) {
  const rows = [
    ['空格 + 拖拽', '平移画布'],
    ['⌘ / Ctrl + 滚轮', '缩放画布'],
    ['Option + Shift + F', '整理画布'],
    ['⌘ / Ctrl + C', '复制节点'],
    ['⌘ / Ctrl + V', '粘贴节点'],
    ['Delete', '删除选中节点'],
  ];

  return (
    <div className="modal-backdrop">
      <section className="shortcut-modal">
        <div className="modal-head">
          <div>
            <span>快捷键</span>
            <p>高频操作会保持在画布底部工具条附近。</p>
          </div>
          <button onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        <div className="shortcut-list">
          {rows.map(([key, action]) => (
            <div key={key}>
              <kbd>{key}</kbd>
              <span>{action}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function NodeInspectorPanel({ onClose }: { onClose: () => void }) {
  const sliders = [
    ['运动强度', 68, '更明显的推拉摇移'],
    ['风格强度', 42, '保留写实质感'],
    ['角色一致性', 86, '锁定服装与体态'],
    ['镜头稳定', 73, '减少主体漂移'],
  ] as const;

  return (
    <aside className="workflow-panel inspector-panel">
      <div className="drawer-head">
        <div>
          <span>节点详情参数</span>
          <small>视频节点 5 - 副本 · 全能参考</small>
        </div>
        <button onClick={onClose}>
          <X size={18} />
        </button>
      </div>
      <div className="workflow-body">
        <section className="parameter-section">
          <div className="section-title">
            <Cpu size={16} />
            <span>生成模型</span>
          </div>
          <div className="segmented-grid">
            {['Seedance 2.0', 'Kling 3.0', 'Runway Gen-4', 'Veo 3'].map((item, index) => (
              <button key={item} className={index === 0 ? 'active' : ''}>{item}</button>
            ))}
          </div>
        </section>

        <section className="parameter-section compact-parameter-grid">
          <label>
            <span>画幅</span>
            <div className="mini-segment">
              {['16:9', '9:16', '1:1'].map((item, index) => (
                <button key={item} className={index === 0 ? 'active' : ''}>{item}</button>
              ))}
            </div>
          </label>
          <label>
            <span>清晰度</span>
            <div className="mini-segment">
              {['720P', '1080P', '2K'].map((item, index) => (
                <button key={item} className={index === 1 ? 'active' : ''}>{item}</button>
              ))}
            </div>
          </label>
          <label>
            <span>时长</span>
            <div className="mini-segment">
              {['4s', '8s', '12s'].map((item, index) => (
                <button key={item} className={index === 0 ? 'active' : ''}>{item}</button>
              ))}
            </div>
          </label>
          <label>
            <span>采样</span>
            <div className="mini-segment">
              {['标准', '精细'].map((item, index) => (
                <button key={item} className={index === 1 ? 'active' : ''}>{item}</button>
              ))}
            </div>
          </label>
        </section>

        <section className="parameter-section">
          <div className="section-title">
            <Gauge size={16} />
            <span>控制强度</span>
          </div>
          <div className="slider-stack">
            {sliders.map(([label, value, hint]) => (
              <div className="slider-row" key={label}>
                <div>
                  <strong>{label}</strong>
                  <small>{hint}</small>
                </div>
                <span>{value}</span>
                <div className="fake-slider">
                  <i style={{ width: `${value}%` }} />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="parameter-section">
          <div className="section-title">
            <ShieldCheck size={16} />
            <span>一致性锁定</span>
          </div>
          <div className="lock-list">
            {['角色锁定', '场景锁定', '服装道具锁定'].map((item, index) => (
              <button key={item} className={index !== 1 ? 'active' : ''}>
                <span>{item}</span>
                <i />
              </button>
            ))}
          </div>
        </section>

        <section className="parameter-section">
          <div className="section-title">
            <MessageSquareText size={16} />
            <span>负向约束</span>
          </div>
          <div className="negative-prompt">
            正脸、五官特写、字幕、水印、手指畸形、背景穿帮、角色服装漂移、过度锐化
          </div>
        </section>
      </div>
    </aside>
  );
}

function StoryboardPanel({ onClose }: { onClose: () => void }) {
  const shots = [
    ['01', '老屋晨光', '远景', '缓慢推进', '爷爷与孙子背影进入书房，桌面民俗道具被自然光扫过', 'ready'],
    ['02', '布老虎特写', '近景', '右移跟拍', '只拍手部整理布老虎与泥塑钟馗，避免人物露脸', 'working'],
    ['03', '泥塑钟馗', '中近景', '轻微环绕', '镜头围绕道具，强调金色光线和木质纹理', 'ready'],
    ['04', '纸鸢展开', '中景', '俯拍转平视', '孩子肩以下打开纸鸢，布面纹样清晰可见', 'queue'],
    ['05', '合成结尾', '大全景', '缓慢拉远', '道具在桌面形成非遗主题陈列，画面安静收束', 'ready'],
  ] as const;

  return (
    <section className="bottom-workflow-sheet storyboard-sheet">
      <div className="sheet-head">
        <div>
          <span>Storyboard 分镜面板</span>
          <small>从提示词拆镜、批量生成并同步回画布节点</small>
        </div>
        <div className="sheet-actions">
          <button><Sparkles size={15} />一键拆镜</button>
          <button><Play size={15} />批量生成</button>
          <button><GitBranch size={15} />同步到画布</button>
          <button className="icon-only" onClick={onClose}><X size={17} /></button>
        </div>
      </div>
      <div className="shot-strip">
        {shots.map(([num, scene, shot, motion, prompt, status]) => (
          <article key={num} className={`shot-card ${status}`}>
            <div className="shot-thumb">
              <span>镜头 {num}</span>
            </div>
            <div className="shot-meta">
              <strong>{scene}</strong>
              <div>
                <span>{shot}</span>
                <span>{motion}</span>
              </div>
              <p>{prompt}</p>
            </div>
            <button>{status === 'working' ? '生成中' : status === 'queue' ? '排队' : '可生成'}</button>
          </article>
        ))}
      </div>
    </section>
  );
}

function TimelinePanel({ onClose }: { onClose: () => void }) {
  const ticks = ['00:00', '00:04', '00:08', '00:12', '00:16', '00:20'];

  return (
    <section className="bottom-workflow-sheet timeline-sheet">
      <div className="sheet-head">
        <div>
          <span>Timeline 拼接时间线</span>
          <small>把画布视频节点编排成可导出的短片轨道</small>
        </div>
        <div className="sheet-actions">
          <button><Pause size={15} />预览</button>
          <button><Split size={15} />添加转场</button>
          <button><Download size={15} />导出短片</button>
          <button className="icon-only" onClick={onClose}><X size={17} /></button>
        </div>
      </div>
      <div className="timeline-ruler">
        {ticks.map((tick) => <span key={tick}>{tick}</span>)}
      </div>
      <div className="timeline-tracks">
        <div className="track-row">
          <label><Film size={15} />视频轨</label>
          <div className="track-lane">
            <span className="clip clip-a">1-1 副本</span>
            <span className="clip clip-b">钟馗细节</span>
            <span className="clip clip-c">老屋结尾</span>
            <i className="playhead" />
          </div>
        </div>
        <div className="track-row">
          <label><Volume2 size={15} />音乐轨</label>
          <div className="track-lane audio-lane">
            <span className="clip audio">无背景音乐约束</span>
          </div>
        </div>
        <div className="track-row">
          <label><Captions size={15} />字幕轨</label>
          <div className="track-lane subtitle-lane">
            <span className="subtitle-block">非遗道具说明</span>
            <span className="subtitle-block second">结尾字幕</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function QueuePanel({ onClose }: { onClose: () => void }) {
  const tasks = [
    ['视频节点 5 - 副本', 'running', 72, 'Seedance 2.0 · 108'],
    ['纸鸢展开镜头', 'running', 38, 'Kling 3.0 · 142'],
    ['布老虎近景增强', 'queue', 0, '等待 2 个任务'],
    ['泥塑钟馗解析', 'done', 100, '已生成 4s'],
    ['首尾帧转场', 'failed', 64, '参考图缺失'],
  ] as const;

  return (
    <aside className="workflow-panel queue-panel">
      <div className="drawer-head">
        <div>
          <span>生成任务队列</span>
          <small>运行中 2 · 排队 4 · 失败 1 · 预计 03:18</small>
        </div>
        <button onClick={onClose}>
          <X size={18} />
        </button>
      </div>
      <div className="queue-summary">
        {[
          ['运行中', '2'],
          ['排队', '4'],
          ['失败', '1'],
          ['本轮消耗', '648'],
        ].map(([label, value]) => (
          <div key={label}>
            <strong>{value}</strong>
            <span>{label}</span>
          </div>
        ))}
      </div>
      <div className="queue-list">
        {tasks.map(([title, status, progress, meta]) => (
          <article key={title} className={`queue-row ${status}`}>
            <div className="queue-icon">
              {status === 'done' ? <CheckCircle2 size={17} /> : status === 'failed' ? <AlertTriangle size={17} /> : <Timer size={17} />}
            </div>
            <div className="queue-main">
              <div>
                <strong>{title}</strong>
                <small>{meta}</small>
              </div>
              <div className="queue-progress">
                <i style={{ width: `${progress}%` }} />
              </div>
            </div>
            <button title={status === 'failed' ? '重试' : '刷新'}>
              <RefreshCcw size={15} />
            </button>
          </article>
        ))}
      </div>
    </aside>
  );
}

function SideDrawer({
  panel,
  onClose,
  selectedNode,
}: {
  panel: Panel;
  onClose: () => void;
  selectedNode?: FlowNodeData;
}) {
  const title =
    panel === 'assets' ? '素材库' : panel === 'characters' ? '角色库' : panel === 'history' ? '历史记录' : '工具箱';

  return (
    <aside className="side-drawer">
      <div className="drawer-head">
        <div>
          <span>{title}</span>
          <small>{panel === 'assets' ? '全局参考、图片、视频、音频' : '节点和项目工具'}</small>
        </div>
        <button onClick={onClose}>
          <X size={18} />
        </button>
      </div>
      {panel === 'assets' && <AssetsPanel />}
      {panel === 'characters' && <CharactersPanel />}
      {panel === 'history' && <HistoryPanel />}
      {panel === 'toolbox' && <ToolboxPanel selectedNode={selectedNode} />}
    </aside>
  );
}

function AssetsPanel() {
  return (
    <div className="drawer-body">
      <label className="search-box">
        <Search size={16} />
        <input placeholder="搜索素材、节点或文件名" />
      </label>
      <div className="tabs">
        <button className="active">全部参考</button>
        <button>图片</button>
        <button>视频</button>
        <button>音频</button>
      </div>
      <div className="asset-grid">
        {Array.from({ length: 10 }).map((_, index) => (
          <button key={index} className="asset-card">
            <div
              style={{
                background:
                  index % 3 === 0
                    ? 'linear-gradient(135deg,#2b1b17,#f0b36a 52%,#111827)'
                    : index % 3 === 1
                      ? 'linear-gradient(135deg,#1e293b,#38bdf8 48%,#fde68a)'
                      : 'radial-gradient(circle at 45% 35%,#f8d7a3,#8f3430 42%,#141414)',
              }}
            />
            <span>{['钟馗', '黎侯虎', '战鼓', '纸鸢'][index % 4]}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function CharactersPanel() {
  return (
    <div className="drawer-body">
      <div className="character-list">
        {['钟馗', '寅虎', '赤发青面', '燕儿'].map((name, index) => (
          <button key={name} className="character-card">
            <span style={{ background: swatches[index] }} />
            <div>
              <strong>{name}</strong>
              <small>{index + 3} 张参考图 · {index + 2} 个视频节点</small>
            </div>
            <ChevronsUpDown size={16} />
          </button>
        ))}
      </div>
    </div>
  );
}

function HistoryPanel() {
  return (
    <div className="drawer-body">
      <div className="timeline">
        {['整理画布', '新增视频节点', '替换参考图', '复制分组', '保存项目'].map((event, index) => (
          <div key={event} className="timeline-row">
            <span />
            <div>
              <strong>{event}</strong>
              <small>{index * 7 + 3} 分钟前</small>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ToolboxPanel({ selectedNode }: { selectedNode?: FlowNodeData }) {
  return (
    <div className="drawer-body">
      <div className="selected-node-card">
        <span>当前节点</span>
        <strong>{selectedNode?.title ?? '视频节点 2'}</strong>
        <small>{selectedNode?.size ?? '1280 × 720'}</small>
      </div>
      <div className="tool-list">
        {[
          ['裁剪', Scissors],
          ['高清', WandSparkles],
          ['解析', BookOpen],
          ['复制', Copy],
        ].map(([name, Icon]) => (
          <button key={name as string}>
            <Icon size={17} />
            <span>{name as string}</span>
          </button>
        ))}
      </div>
      <div className="prompt-box">
        <span>生成提示词</span>
        <p>
          全局执行限制，全程无背景音乐。人物不露脸，只拍手、脚、背影、肩以下、局部身体或影子。
        </p>
        <button>展开参数</button>
      </div>
    </div>
  );
}
