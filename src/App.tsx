import { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';
import GameScene from './game/GameScene';
import Joystick from './Joystick';

type Hero = 'drums' | 'draane';
const HEROES: Record<Hero, { name: string; desc: string; color: string }> = {
  drums: { name: 'DRUMS', desc: 'Energia originaria. Attacco e velocità.', color: '#4fa3ff' },
  draane: { name: 'DRAANE', desc: 'Fratture dimensionali. Magia e teletrasporto.', color: '#b06cff' },
};

function Game({ hero, onExit }: { hero: Hero; onExit: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const touch = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches;
  useEffect(() => {
    const game = new Phaser.Game({
      type: Phaser.AUTO,
      parent: ref.current!,
      backgroundColor: '#0b0b1a',
      pixelArt: true,
      scale: { mode: Phaser.Scale.RESIZE, width: '100%', height: '100%' },
      scene: [GameScene],
      callbacks: { preBoot: (g) => g.registry.set('character', hero) },
    });
    return () => game.destroy(true);
  }, [hero]);
  return (
    <div className="stage">
      <div ref={ref} className="canvas" />
      <div className="hud">
        <button onClick={onExit}>◀ Menu</button>
        {document.fullscreenEnabled && (
          <button onClick={() => (document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen())}>⛶</button>
        )}
        <span>Aetheria · Villaggio di partenza</span>
      </div>
      {touch ? <Joystick /> : <div className="help">WASD / frecce = muovi · Shift = corri</div>}
    </div>
  );
}

export default function App() {
  const [hero, setHero] = useState<Hero>('drums');
  const [playing, setPlaying] = useState(false);
  if (playing) return <Game hero={hero} onExit={() => setPlaying(false)} />;
  return (
    <div className="menu">
      <h1>D&amp;D<span> THE ADVENTURE</span></h1>
      <p className="motto">Two heroes. One broken world. Infinite adventures.</p>
      <div className="cards">
        {(Object.keys(HEROES) as Hero[]).map((h) => (
          <button key={h} className={'card' + (hero === h ? ' sel' : '')}
            style={{ ['--c' as string]: HEROES[h].color }} onClick={() => setHero(h)}>
            <b>{HEROES[h].name}</b><small>{HEROES[h].desc}</small>
          </button>
        ))}
      </div>
      <button className="play" onClick={() => setPlaying(true)}>PLAY</button>
      <p className="note">Fase 1 · login, salvataggi e multiplayer arrivano nelle fasi successive</p>
    </div>
  );
}
