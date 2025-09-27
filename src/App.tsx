import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';
import SlotMachine from './components/SlotMachine';

const DEFAULT_CENTER = { lat: 25.033964, lng: 121.564468 }; // 台北101
const RADIUS = 500; // 公尺

interface Restaurant {
  id: number;
  name: string;
  lat: number;
  lon: number;
}

function App() {
  const mapRef = useRef<HTMLDivElement>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(false);
  const leafletRef = useRef<any>(null);
  const [spinning, setSpinning] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const lastIdxRef = useRef<number | null>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
        },
        () => {
          setLocation(DEFAULT_CENTER);
        }
      );
    } else {
      setLocation(DEFAULT_CENTER);
    }
  }, []);

  useEffect(() => {
    if (location) {
      setLoading(true);
      const query = `[
        out:json
      ];
      node[amenity=restaurant](around:${RADIUS},${location.lat},${location.lng});
      out;`;
      axios
        .get('https://overpass-api.de/api/interpreter', {
          params: { data: query },
        })
        .then((res) => {
          const elements = res.data.elements || [];
          const list: Restaurant[] = elements.map((el: any) => ({
            id: el.id,
            name: el.tags && el.tags.name ? el.tags.name : '無店名',
            lat: el.lat,
            lon: el.lon,
          }));
          setRestaurants(list);
        })
        .catch(() => setRestaurants([]))
        .finally(() => setLoading(false));
    }
  }, [location]);

  useEffect(() => {
    // 動態載入 leaflet
    const loadLeaflet = async () => {
      // @ts-ignore
      const L = await import('leaflet');
      if (!mapRef.current) return;
      if (leafletRef.current) {
        leafletRef.current.remove();
      }
      const map = L.map(mapRef.current);
      leafletRef.current = map;
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(map);
      if (location) {
        L.marker([location.lat, location.lng]).addTo(map).bindPopup('你的位置').openPopup();
        L.circle([location.lat, location.lng], { radius: RADIUS, color: 'blue' }).addTo(map);
        // fitBounds 讓搜尋圓完整顯示
        const bounds = L.latLng([location.lat, location.lng]).toBounds(RADIUS * 2);
        map.fitBounds(bounds, { padding: [24, 24] });
      }
      // 只顯示店名 label，不顯示 marker 圖示
      restaurants.forEach((r) => {
        const divIcon = L.divIcon({
          className: 'custom-label-icon',
          html: `<div class='custom-label-text'>${r.name}</div>`
        });
        L.marker([r.lat, r.lon], { icon: divIcon, interactive: false }).addTo(map);
      });
    };
    loadLeaflet();
    // 清理
    return () => {
      if (leafletRef.current) {
        leafletRef.current.remove();
        leafletRef.current = null;
      }
    };
  }, [location, restaurants]);

  // 圓盤相關
  const wheelRef = useRef<HTMLDivElement>(null);
  const spinWheel = () => {
    if (restaurants.length === 0 || spinning) return;
    setSpinning(true);
    setSelectedIdx(null);
    let idx = Math.floor(Math.random() * restaurants.length);
    // 避免連續選到同一間
    if (restaurants.length > 1 && lastIdxRef.current !== null) {
      let tryCount = 0;
      while (idx === lastIdxRef.current && tryCount < 10) {
        idx = Math.floor(Math.random() * restaurants.length);
        tryCount++;
      }
    }
    lastIdxRef.current = idx;
    setTimeout(() => {
      setSelectedIdx(idx);
      setSpinning(false);
    }, 3500);
    // 旋轉動畫
    if (wheelRef.current) {
      const degPerSlice = 360 / restaurants.length;
      const extra = 360 * 5; // 多轉幾圈
      const rotateTo = extra + (360 - idx * degPerSlice - degPerSlice / 2);
      wheelRef.current.style.transition = 'transform 3.5s cubic-bezier(0.33,1,0.68,1)';
      wheelRef.current.style.transform = `rotate(${rotateTo}deg)`;
      setTimeout(() => {
        if (wheelRef.current) {
          wheelRef.current.style.transition = '';
          wheelRef.current.style.transform = `rotate(${360 - idx * degPerSlice - degPerSlice / 2}deg)`;
        }
      }, 3600);
    }
  };

  // 圓盤切片顏色
  const colors = [
    'linear-gradient(135deg, #FFD700 60%, #FFFACD 100%)',
    'linear-gradient(135deg, #FF8C00 60%, #FFDAB9 100%)',
    'linear-gradient(135deg, #FF69B4 60%, #FFF0F5 100%)',
    'linear-gradient(135deg, #87CEEB 60%, #E0FFFF 100%)',
    'linear-gradient(135deg, #90EE90 60%, #F0FFF0 100%)',
    'linear-gradient(135deg, #FF6347 60%, #FFE4E1 100%)',
    'linear-gradient(135deg, #B0C4DE 60%, #F8F8FF 100%)',
    'linear-gradient(135deg, #FFA07A 60%, #FFF5EE 100%)',
  ];

  return (
    <div style={{
      maxWidth: 480,
      margin: '0 auto',
      padding: '0 4vw',
      boxSizing: 'border-box',
    }}>
      <h2 style={{textShadow:'1px 2px 8px #bbb',fontWeight:'bold',fontSize:24,margin:'16px 0 8px 0',textAlign:'center'}}>中午吃甚麼?</h2>
      <div ref={mapRef} style={{ width: '100%', height: '40vh', minHeight: 220, maxHeight: 340, borderRadius: 16, overflow: 'hidden', boxShadow:'0 2px 12px #bbb' }} />
      <div style={{ marginTop: 16, fontSize: 16, textAlign:'center' }}>
        {loading ? '搜尋附近餐廳中...' : `找到 ${restaurants.length} 間餐廳`}
      </div>
      {/* 豪華拉霸機 UI */}
      {restaurants.length > 0 && (
        <SlotMachine items={restaurants.map(r => r.name)} />
      )}
      {/* Leaflet label 樣式覆蓋 */}
      <style>{`
        .custom-label-icon {
          background: none !important;
          border: none !important;
          box-shadow: none !important;
        }
        .custom-label-text {
          background: #fffbe6;
          color: #e67e22;
          font-weight: bold;
          font-size: 14px;
          border-radius: 8px;
          box-shadow: 0 2px 8px #e67e22;
          border: 1.5px solid #e67e22;
          padding: 2px 10px;
          margin-bottom: 8px;
          white-space: nowrap;
        }
        @media (max-width: 600px) {
          .custom-label-text { font-size: 12px; }
        }
      `}</style>
    </div>
  );
}

export default App;
