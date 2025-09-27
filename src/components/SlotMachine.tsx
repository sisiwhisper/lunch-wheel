import React, { useState, useRef } from 'react';

interface SlotMachineProps {
  items: string[];
  onResult?: (result: string) => void;
}

const getRandomIdx = (len: number, avoid?: number) => {
  let idx = Math.floor(Math.random() * len);
  if (len > 1 && avoid !== undefined) {
    let tryCount = 0;
    while (idx === avoid && tryCount < 10) {
      idx = Math.floor(Math.random() * len);
      tryCount++;
    }
  }
  return idx;
};

// 動態計算字體大小
function getFontSize(name: string) {
  if (name.length <= 8) return 'clamp(18px, 6vw, 32px)';
  if (name.length <= 14) return 'clamp(15px, 4.5vw, 24px)';
  return 'clamp(12px, 3.5vw, 18px)';
}

const SlotMachine: React.FC<SlotMachineProps> = ({ items, onResult }) => {
  const [spinning, setSpinning] = useState(false);
  const [resultIdx, setResultIdx] = useState<number>(0);
  const lastIdxRef = useRef<number>(0);

  const handleSpin = () => {
    if (spinning || items.length === 0) return;
    setSpinning(true);
    let idx = getRandomIdx(items.length, lastIdxRef.current);
    let count = 0;
    const interval = setInterval(() => {
      setResultIdx(Math.floor(Math.random() * items.length));
      count++;
      if (count > 20) {
        clearInterval(interval);
        setResultIdx(idx);
        setSpinning(false);
        lastIdxRef.current = idx;
        if (onResult) onResult(items[idx]);
      }
    }, 60);
  };

  // 取得目前顯示的店名
  const name = items.length > 0 ? items[resultIdx % items.length] : '';
  // 最多兩行自動換行
  const nameLines = name.length > 14 ? [name.slice(0, 14), name.slice(14)] : [name];

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '32px 0',
      width: '100%',
      maxWidth: 420,
      minHeight: 180,
      flexDirection: 'row',
    }}>
      {/* 豪華拉霸外框 */}
      <div style={{
        width: '100%',
        maxWidth: 400,
        minWidth: 0,
        height: 140,
        background: 'linear-gradient(135deg, #fffbe6 60%, #ffe4b2 100%)',
        border: '8px solid gold',
        borderRadius: 28,
        boxShadow: '0 8px 32px #e67e22, 0 0 40px #ffd700 inset',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* 上方燈條 */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: 14,
          background: 'repeating-linear-gradient(90deg, #ffd700 0 10px, #fff 10px 20px)',
          boxShadow: '0 2px 8px #e67e22',
          zIndex: 2,
        }} />
        {/* 下方燈條 */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '100%',
          height: 14,
          background: 'repeating-linear-gradient(90deg, #ffd700 0 10px, #fff 10px 20px)',
          boxShadow: '0 -2px 8px #e67e22',
          zIndex: 2,
        }} />
        {/* 轉輪視窗 */}
        <div style={{
          width: '80%',
          minWidth: 0,
          height: 70,
          background: 'linear-gradient(180deg, #fff 80%, #ffe4b2 100%)',
          border: '4px solid #e67e22',
          borderRadius: 14,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          fontWeight: 'bold',
          color: '#e67e22',
          textShadow: '2px 2px 12px #ffd700, 0 2px 8px #fff',
          overflow: 'hidden',
          boxShadow: '0 2px 12px #e67e22',
        }}>
          {nameLines.map((line, idx) => (
            <span
              key={idx}
              style={{
                fontSize: getFontSize(name),
                lineHeight: 1.2,
                wordBreak: 'break-all',
                textAlign: 'center',
                width: '100%',
                display: 'block',
                whiteSpace: 'pre-line',
              }}
            >
              {line}
            </span>
          ))}
        </div>
        {/* 側邊金屬裝飾 */}
        <div style={{
          position: 'absolute',
          left: -12,
          top: 24,
          width: 16,
          height: 80,
          background: 'linear-gradient(90deg,#bbb 60%,#eee 100%)',
          borderRadius: 12,
          boxShadow: '0 2px 8px #888',
        }} />
        <div style={{
          position: 'absolute',
          right: -12,
          top: 24,
          width: 16,
          height: 80,
          background: 'linear-gradient(90deg,#eee 60%,#bbb 100%)',
          borderRadius: 12,
          boxShadow: '0 2px 8px #888',
        }} />
      </div>
      {/* 豪華拉桿 */}
      <button
        onClick={handleSpin}
        disabled={spinning}
        style={{
          marginLeft: 12,
          width: 28,
          height: 120,
          background: 'linear-gradient(180deg,#eee 60%,#bbb 100%)',
          border: '3px solid #888',
          borderRadius: 16,
          position: 'relative',
          cursor: spinning ? 'not-allowed' : 'pointer',
          boxShadow: '0 2px 8px #aaa',
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
          minWidth: 28,
        }}
        title="拉霸！"
      >
        <div style={{
          width: 22,
          height: 22,
          background: 'radial-gradient(circle at 60% 40%, #e74c3c 70%, #fff 100%)',
          borderRadius: '50%',
          border: '3px solid #888',
          position: 'absolute',
          top: -18,
          left: '50%',
          transform: 'translateX(-50%)',
          boxShadow: '0 2px 8px #e67e22',
        }} />
        <div style={{ width: 8, height: 70, background: 'linear-gradient(180deg,#bbb 60%,#eee 100%)', borderRadius: 4, marginTop: 18, boxShadow:'0 2px 8px #888' }} />
      </button>
      <style>{`
        @media (max-width: 600px) {
          div[style*='width: 400px'] { width: 98vw !important; min-width: 0 !important; }
          div[style*='maxWidth: 400px'] { max-width: 98vw !important; }
          div[style*='height: 140px'] { height: 100px !important; }
          div[style*='height: 160px'] { height: 120px !important; }
          button[title='拉霸！'] { height: 80px !important; min-width: 20px !important; }
        }
      `}</style>
    </div>
  );
};

export default SlotMachine;
