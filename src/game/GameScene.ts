import Phaser from 'phaser';
import { makeWorldTextures, makeCharacter } from './sprites';
import { joy } from './input';

const T = 32, W = 40, H = 28;
const rnd = (n: number) => { const x = Math.sin(n * 91.7) * 43758.5453; return x - Math.floor(x); };

export default class GameScene extends Phaser.Scene {
  private blocked: boolean[][] = [];
  private water: Phaser.GameObjects.Image[] = [];
  private hero = 'drums';
  private player!: Phaser.GameObjects.Image;
  private shadow!: Phaser.GameObjects.Image;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: Record<string, Phaser.Input.Keyboard.Key>;
  private dir = 'down';
  private anim = 0;
  private px = 20 * T + 16;
  private py = 14 * T + 28;

  constructor() { super('game'); }

  create() {
    this.hero = (this.registry.get('character') as string) || 'drums';
    makeWorldTextures(this); makeCharacter(this, 'drums'); makeCharacter(this, 'draane');
    this.blocked = Array.from({ length: H }, () => Array(W).fill(false));

    const onPath = (x: number, y: number) => (Math.abs(x - 20) <= 1 && y > 0 && y < H - 1) || (Math.abs(y - 14) <= 1 && x > 0 && x < W - 1);
    const houses: [number, number][] = [[6, 5], [13, 5], [6, 18], [26, 18], [31, 5]];
    const inHouse = (x: number, y: number) => houses.some(([hx, hy]) => x >= hx - 1 && x <= hx + 3 && y >= hy - 2 && y <= hy + 2);
    const inPond = (x: number, y: number) => ((x - 31) / 5) ** 2 + ((y - 20) / 3) ** 2 <= 1;

    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      if (inPond(x, y)) {
        const w = this.add.image(x * T, y * T, 'water0').setOrigin(0).setDepth(-10);
        this.water.push(w); this.blocked[y][x] = true;
      } else if (onPath(x, y)) this.add.image(x * T, y * T, 'path').setOrigin(0).setDepth(-10);
      else {
        this.add.image(x * T, y * T, 'grass' + (rnd(x * 31 + y) > 0.5 ? 1 : 0)).setOrigin(0).setDepth(-10);
        if (rnd(x * 7 + y * 13) > 0.93) this.add.image(x * T + 12, y * T + 12, 'flower').setDepth(-9);
      }
    }
    this.time.addEvent({ delay: 500, loop: true, callback: () => {
      const k = Math.floor(this.time.now / 500) % 2;
      this.water.forEach((w) => w.setTexture('water' + k));
    } });

    for (const [hx, hy] of houses) {
      this.add.image(hx * T, (hy + 2) * T, 'house').setOrigin(0, 1).setDepth((hy + 2) * T);
      for (let y = hy; y <= hy + 1; y++) for (let x = hx; x <= hx + 2; x++) this.blocked[y][x] = true;
    }
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const border = x < 1 || y < 1 || x >= W - 1 || y >= H - 1;
      const near = Math.abs(x - 20) < 3 && Math.abs(y - 14) < 3;
      if (this.blocked[y][x] || onPath(x, y) || inHouse(x, y) || near) continue;
      if (border || rnd(x * 17 + y * 5) > 0.9) {
        this.add.image(x * T + 16, (y + 1) * T, 'tree').setOrigin(0.5, 1).setDepth((y + 1) * T);
        this.blocked[y][x] = true;
      }
    }

    this.shadow = this.add.image(this.px, this.py, 'shadow').setDepth(-5);
    this.player = this.add.image(this.px, this.py, `${this.hero}_down_0`).setOrigin(0.5, 1);
    this.cameras.main.setBounds(0, 0, W * T, H * T).setZoom(2).startFollow(this.player, true, 0.15, 0.15);
    this.cameras.main.roundPixels = true;
    this.scale.on('resize', () => this.cameras.main.setZoom(Math.max(1.25, Math.min(3, Math.min(this.scale.width, this.scale.height) / 260))));
    this.cameras.main.setZoom(Math.max(1.25, Math.min(3, Math.min(this.scale.width, this.scale.height) / 260)));

    const kb = this.input.keyboard!;
    this.cursors = kb.createCursorKeys();
    this.wasd = kb.addKeys('W,A,S,D,SHIFT') as Record<string, Phaser.Input.Keyboard.Key>;
  }

  private free(x: number, y: number) {
    for (const dx of [-6, 6]) for (const dy of [-5, 0]) {
      const tx = Math.floor((x + dx) / T), ty = Math.floor((y + dy) / T);
      if (tx < 0 || ty < 0 || tx >= W || ty >= H || this.blocked[ty][tx]) return false;
    }
    return true;
  }

  update(_: number, delta: number) {
    const c = this.cursors, k = this.wasd;
    let vx = (c.right.isDown || k.D.isDown ? 1 : 0) - (c.left.isDown || k.A.isDown ? 1 : 0);
    let vy = (c.down.isDown || k.S.isDown ? 1 : 0) - (c.up.isDown || k.W.isDown ? 1 : 0);
    if (joy.active) { vx = joy.x; vy = joy.y; }
    const len = Math.hypot(vx, vy);
    if (len > 1) { vx /= len; vy /= len; }
    const dead = len < 0.12;
    const speed = ((k.SHIFT.isDown || len > 0.85) && !dead ? 140 : 90) * (delta / 1000);
    if (!dead) {
      const nx = this.px + vx * speed, ny = this.py + vy * speed;
      if (this.free(nx, this.py)) this.px = nx;
      if (this.free(this.px, ny)) this.py = ny;
      this.dir = Math.abs(vx) > Math.abs(vy) ? (vx > 0 ? 'right' : 'left') : (vy > 0 ? 'down' : 'up');
      this.anim += delta;
    } else this.anim = 0;
    const f = dead ? 0 : 1 + (Math.floor(this.anim / 150) % 2);
    this.player.setTexture(`${this.hero}_${this.dir}_${f}`).setPosition(this.px, this.py).setDepth(this.py);
    this.shadow.setPosition(this.px, this.py - 2);
  }
}
