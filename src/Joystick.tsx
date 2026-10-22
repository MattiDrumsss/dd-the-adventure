import { useState } from 'react';
import { joy } from './game/input';

const R = 55;
// Joystick "flottante": tocca ovunque nella metà sinistra dello schermo e compare sotto il dito.
export default function Joystick() {
  const [o, setO] = useState<{ x: number; y: number } | null>(null);
  const [k, setK] = useState({ x: 0, y: 0 });
  const [id, setId] = useState<number | null>(null);
  const upd = (e: React.PointerEvent) => {
    if (!o) return;
    let dx = e.clientX - o.x, dy = e.clientY - o.y;
    const l = Math.hypot(dx, dy);
    if (l > R) { dx = (dx / l) * R; dy = (dy / l) * R; }
    joy.x = dx / R; joy.y = dy / R; joy.active = true;
    setK({ x: dx, y: dy });
  };
  const end = () => { joy.x = 0; joy.y = 0; joy.active = false; setO(null); setK({ x: 0, y: 0 }); setId(null); };
  return (
    <div className="joyzone"
      onPointerDown={(e) => { if (id !== null) return; (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId); setId(e.pointerId); setO({ x: e.clientX, y: e.clientY }); joy.active = true; }}
      onPointerMove={(e) => { if (e.pointerId === id) upd(e); }}
      onPointerUp={(e) => { if (e.pointerId === id) end(); }}
      onPointerCancel={end}>
      {o ? (
        <div className="joy" style={{ left: o.x - 65, top: o.y - 65 }}>
          <div className="knob" style={{ transform: `translate(${k.x}px, ${k.y}px)` }} />
        </div>
      ) : (
        <div className="joyhint">Tocca e trascina qui per muoverti</div>
      )}
    </div>
  );
}
