import React, { useState, useRef } from 'react';

interface SlotBarProps {
  items: string[];
  onSelect?: (selected: string) => void;
}

const SlotBar: React.FC<SlotBarProps> = ({ items, onSelect }) => {
  const [spinning, setSpinning] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const lastIdxRef = useRef<number | null>(null);

  const handleSpin = () => {
    if (spinning || items.length === 0) return;
    setSpinning(true);
    setSelectedIdx(null);
    let idx = Math.floor(Math.random() * items.length);
    // 避免連續選到同一個
    if (items.length > 1 && lastIdxRef.current !== null) {
      let tryCount = 0;
      while (idx === lastIdxRef.current && tryCount < 10) {
        idx = Math.floor(Math.random() * items.length);
        tryCount++;
      }
    }
    lastIdxRef.current = idx;
    // 拉霸動畫：快速輪播名稱
    let count = 0;
    const interval = setInterval(() => {
      setSelectedIdx(Math.floor(Math.random() * items.length));
      count++;
      if (count > 20) {
        clearInterval(interval);
        setSelectedIdx(idx);
        setSpinning(false);
        if (onSelect) onSelect(items[idx]);
      }
    }, 60);
  };

  return (
    <div style={{ margin: '40px 0', textAlign: 'center' }}>
      <div style={{
        margin: '0 auto',
        width: 340,
        height: 120,
        background: 'linear-gradient(135deg, #fffbe6 60%, #ffe4b2 100%)',
        border: '6px solid #e67e22',
        borderRadius: 24,
        boxShadow: '0 4px 24px #e67e22',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 32,
        fontWeight: 'bold',
        color: '#e67e22',
        letterSpacing: 2,
        position: 'relative',
        overflow: 'hidden',
      }}>
        <span style={{
          display: 'block',
          width: '100%',
          textAlign: 'center',
          fontSize: 32,
          fontWeight: 'bold',
          textShadow: '1px 2px 8px #ffd194',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          transition: 'color 0.2s',
          minHeight: 40,
        }}>
          {spinning ? (
            <span>{items[Math.floor(Math.random() * items.length)]}</span>
          ) : (
            selectedIdx !== null ? items[selectedIdx] : '請拉霸選餐廳')}
        </span>
      </div>
      <button
        onClick={handleSpin}
        disabled={spinning}
        style={{
          marginTop: 24,
          padding: '14px 40px',
          fontSize: 22,
          background: 'linear-gradient(90deg,#e67e22 60%,#ffd194 100%)',
          color: '#fff',
          border: 'none',
          borderRadius: 12,
          cursor: spinning ? 'not-allowed' : 'pointer',
          boxShadow: '0 2px 12px #e67e22',
          fontWeight: 'bold',
          letterSpacing: 2,
        }}
      >
        {spinning ? '拉霸中...' : '拉霸選餐廳'}
      </button>
      {selectedIdx !== null && !spinning && (
        <div style={{ marginTop: 28, fontSize: 26, color: '#e74c3c', fontWeight: 'bold', textShadow:'1px 2px 8px #ffd194' }}>
          🎉 選中餐廳：{items[selectedIdx]}
        </div>
      )}
    </div>
  );
};

export default SlotBar;
