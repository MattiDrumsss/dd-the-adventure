import Phaser from 'phaser';

// ASSET PROVVISORI: tutti gli sprite sono disegnati dal codice.
// Per sostituirli con pixel art vera: carica gli PNG in public/assets e caricali in GameScene.preload().
type G = Phaser.GameObjects.Graphics;
const px = (g: G, c: number, x: number, y: number, w: number, h: number) => { g.fillStyle(c, 1); g.fillRect(x, y, w, h); };
const mk = (s: Phaser.Scene, key: string, w: number, h: number, draw: (g: G) => void) => {
  if (s.textures.exists(key)) return;
  const g = s.make.graphics({ x: 0, y: 0 }, false);
  draw(g); g.generateTexture(key, w, h); g.destroy();
};
const rnd = (n: number) => { const x = Math.sin(n * 127.1) * 43758.5453; return x - Math.floor(x); };

export function makeWorldTextures(s: Phaser.Scene) {
  for (let v = 0; v < 2; v++) mk(s, 'grass' + v, 32, 32, (g) => {
    px(g, v ? 0x3c8a47 : 0x3f8f4a, 0, 0, 32, 32);
    for (let i = 0; i < 9; i++) px(g, 0x5aa85a, Math.floor(rnd(i + v * 9) * 30), Math.floor(rnd(i + 50 + v) * 30), 2, 2);
  });
  mk(s, 'path', 32, 32, (g) => {
    px(g, 0xb08a5a, 0, 0, 32, 32);
    for (let i = 0; i < 8; i++) px(g, 0x947044, Math.floor(rnd(i + 7) * 30), Math.floor(rnd(i + 70) * 30), 3, 2);
  });
  for (let v = 0; v < 2; v++) mk(s, 'water' + v, 32, 32, (g) => {
    px(g, 0x2a6fd6, 0, 0, 32, 32);
    px(g, 0x6fb4ff, 4 + v * 10, 8, 10, 2); px(g, 0x6fb4ff, 16 - v * 8, 22, 10, 2);
  });
  mk(s, 'tree', 32, 64, (g) => {
    px(g, 0x6b4426, 13, 40, 7, 24);
    g.fillStyle(0x1f6b34, 1); g.fillCircle(16, 24, 16);
    g.fillStyle(0x2f8f45, 1); g.fillCircle(12, 20, 9); g.fillCircle(21, 26, 8);
  });
  mk(s, 'house', 96, 96, (g) => {
    px(g, 0x5b2a8a, 0, 0, 96, 22); px(g, 0x7a3cb5, 4, 4, 88, 16); px(g, 0x3a1a5e, 0, 22, 96, 4);
    px(g, 0xd8cdb0, 4, 26, 88, 70); px(g, 0xb8ad90, 4, 26, 88, 4);
    px(g, 0x5a3a1e, 38, 54, 20, 42); px(g, 0xffd35a, 52, 76, 3, 3);
    px(g, 0x6fb4ff, 12, 44, 16, 16); px(g, 0x6fb4ff, 68, 44, 16, 16);
    px(g, 0x3a1a5e, 19, 44, 2, 16); px(g, 0x3a1a5e, 75, 44, 2, 16);
  });
  mk(s, 'flower', 8, 8, (g) => { px(g, 0xffffff, 3, 3, 2, 2); px(g, 0xff6fb4, 2, 3, 1, 2); px(g, 0xff6fb4, 5, 3, 1, 2); });
  mk(s, 'shadow', 24, 10, (g) => { g.fillStyle(0x000000, 0.35); g.fillEllipse(12, 5, 20, 8); });
}

type Pal = { hair: number; skin: number; top: number; legs: number; accent: number; curly: boolean };
export const HEROES: Record<string, Pal> = {
  // Drums: capelli lisci con frangia, felpa nera con colletto verde, catena d'argento
  drums: { hair: 0x4a3322, skin: 0xe0ac86, top: 0x1c1c22, legs: 0x22222c, accent: 0x3fae5a, curly: false },
  // Draane: capelli ricci castano-ramati, felpa nera, pantaloni beige, catenine d'argento
  draane: { hair: 0x8a5230, skin: 0xe6b48e, top: 0x1c1c22, legs: 0xcfc6a8, accent: 0xc8ccd6, curly: true },
};

export function makeCharacter(s: Phaser.Scene, name: string) {
  const p = HEROES[name];
  for (const dir of ['down', 'up', 'left', 'right']) for (let f = 0; f < 3; f++) {
    mk(s, `${name}_${dir}_${f}`, 24, 32, (g) => {
      const l = f === 1 ? 2 : 0, r = f === 2 ? 2 : 0; // gambe alternate
      px(g, p.legs, 7, 22, 4, 9 - l); px(g, p.legs, 13, 22, 4, 9 - r);
      px(g, 0x111111, 7, 30 - l, 4, 2); px(g, 0x111111, 13, 30 - r, 4, 2);
      const side = dir === 'left' || dir === 'right';
      px(g, p.top, side ? 7 : 6, 13, side ? 10 : 12, 10);
      if (!side) { px(g, p.top, 3, 14, 3, 8); px(g, p.top, 18, 14, 3, 8); px(g, p.skin, 3, 21, 3, 2); px(g, p.skin, 18, 21, 3, 2); }
      else px(g, p.top, dir === 'left' ? 6 : 14, 14, 4, 8);
      if (dir === 'down') { px(g, p.accent, 9, 13, 6, 1); px(g, p.accent, 11, 15, 2, 4); if (p.curly) { px(g, p.accent, 9, 15, 1, 3); px(g, p.accent, 14, 15, 1, 3); } }
      px(g, p.skin, side ? 8 : 7, 5, side ? 8 : 10, 9);
      if (dir === 'down') { px(g, 0x1a1008, 9, 9, 2, 2); px(g, 0x1a1008, 13, 9, 2, 2); }
      if (dir === 'left') px(g, 0x1a1008, 9, 9, 2, 2);
      if (dir === 'right') px(g, 0x1a1008, 13, 9, 2, 2);
      if (p.curly) {
        px(g, p.hair, 5, 2, 14, 7); px(g, p.hair, 4, 4, 2, 6); px(g, p.hair, 18, 4, 2, 6);
        px(g, p.hair, 7, 0, 4, 3); px(g, p.hair, 13, 0, 4, 3);
        if (dir === 'up') px(g, p.hair, 5, 2, 14, 12);
        if (dir === 'down') px(g, 0xdddddd, 5, 9, 1, 1);
      } else {
        px(g, p.hair, 6, 3, 12, 5); px(g, p.hair, 6, 3, 2, 9); px(g, p.hair, 16, 3, 2, 9);
        if (dir === 'down') px(g, p.hair, 7, 8, 10, 2);
        if (dir === 'up') px(g, p.hair, 6, 3, 12, 11);
      }
    });
  }
}
