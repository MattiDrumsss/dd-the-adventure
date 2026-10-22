# D&D - THE ADVENTURE

*Two heroes. One broken world. Infinite adventures.*

Web app (React + TypeScript + Phaser 3 + Vite). **Stato: Fase 1** – menu, scelta di Drums/Draane, villaggio di Aetheria esplorabile con collisioni, joystick mobile, tastiera (WASD/frecce, Shift per correre).

## Cosa NON c'è ancora
Login, database, missioni, combattimento, NPC, multiplayer, minigiochi. Arrivano nelle fasi 3-7.

## Asset provvisori
Tutta la grafica è disegnata dal codice:
- personaggi: `src/game/sprites.ts` (`HEROES`, `makeCharacter`)
- mondo: `src/game/sprites.ts` (`makeWorldTextures`)
Per usare pixel art vera: metti i PNG in `public/assets/` e caricali in `GameScene` con `this.load.image`/`spritesheet`.

## Avvio in locale (opzionale)
```
npm install
npm run dev
```

## Pubblicazione
Vedi le istruzioni nella chat: GitHub (caricamento file) + Vercel (Import Project, framework Vite rilevato da solo).
