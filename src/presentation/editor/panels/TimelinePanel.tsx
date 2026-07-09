import { Captions, Download, Film, Pause, Split, Volume2, X } from 'lucide-react';

export function TimelinePanel({ onClose }: { onClose: () => void }) {
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


