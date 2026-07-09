import { GitBranch, Play, Sparkles, X } from 'lucide-react';

export function StoryboardPanel({ onClose }: { onClose: () => void }) {
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


