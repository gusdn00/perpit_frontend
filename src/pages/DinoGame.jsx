import React, { useEffect, useRef, useState, useCallback } from 'react';
import '../styles/DinoGame.css';

const W = 700;
const H = 200;
const GROUND_Y = 160;
const DINO_W = 40;
const DINO_H = 50;
const DINO_X = 60;
const GRAVITY = 0.6;
const JUMP_V = -13;

function DinoGame({ onClose }) {
  const canvasRef = useRef(null);
  const stateRef = useRef({
    dinoY: GROUND_Y - DINO_H,
    dinoVY: 0,
    onGround: true,
    cacti: [],
    score: 0,
    speed: 5,
    frame: 0,
    gameOver: false,
    started: false,
    legPhase: 0,
  });
  const animRef = useRef(null);
  const [displayScore, setDisplayScore] = useState(0);
  const [gameState, setGameState] = useState('idle'); // idle | running | over

  const jump = useCallback(() => {
    const s = stateRef.current;
    if (s.gameOver) return;
    if (!s.started) {
      s.started = true;
      setGameState('running');
    }
    if (s.onGround) {
      s.dinoVY = JUMP_V;
      s.onGround = false;
    }
  }, []);

  const restart = useCallback(() => {
    const s = stateRef.current;
    s.dinoY = GROUND_Y - DINO_H;
    s.dinoVY = 0;
    s.onGround = true;
    s.cacti = [];
    s.score = 0;
    s.speed = 5;
    s.frame = 0;
    s.gameOver = false;
    s.started = true;
    s.legPhase = 0;
    setDisplayScore(0);
    setGameState('running');
  }, []);

  const drawDino = useCallback((ctx, x, y, legPhase) => {
    const color = '#333';
    ctx.fillStyle = color;
    // body
    ctx.fillRect(x, y, DINO_W, DINO_H - 10);
    // head
    ctx.fillRect(x + 10, y - 18, 26, 20);
    // eye
    ctx.fillStyle = '#fff';
    ctx.fillRect(x + 28, y - 14, 6, 6);
    ctx.fillStyle = '#000';
    ctx.fillRect(x + 30, y - 13, 3, 3);
    // mouth
    ctx.fillStyle = color;
    ctx.fillRect(x + 34, y - 5, 6, 4);
    // tail
    ctx.fillRect(x - 10, y + 6, 12, 8);
    // arms
    ctx.fillRect(x + 20, y + 10, 12, 6);
    // legs
    ctx.fillStyle = color;
    if (legPhase === 0) {
      ctx.fillRect(x + 4, y + DINO_H - 10, 10, 12);
      ctx.fillRect(x + 22, y + DINO_H - 10, 10, 6);
    } else {
      ctx.fillRect(x + 4, y + DINO_H - 10, 10, 6);
      ctx.fillRect(x + 22, y + DINO_H - 10, 10, 12);
    }
  }, []);

  const drawCactus = useCallback((ctx, cactus) => {
    ctx.fillStyle = '#2d7a2d';
    // main stem
    ctx.fillRect(cactus.x + 8, cactus.y, 12, cactus.h);
    // left arm
    ctx.fillRect(cactus.x, cactus.y + 10, 10, 8);
    ctx.fillRect(cactus.x, cactus.y + 4, 8, 10);
    // right arm
    ctx.fillRect(cactus.x + 18, cactus.y + 14, 10, 8);
    ctx.fillRect(cactus.x + 20, cactus.y + 8, 8, 10);
  }, []);

  const drawCloud = useCallback((ctx, x, y) => {
    ctx.fillStyle = '#e0e0e0';
    ctx.beginPath();
    ctx.arc(x, y, 14, 0, Math.PI * 2);
    ctx.arc(x + 18, y - 6, 18, 0, Math.PI * 2);
    ctx.arc(x + 36, y, 14, 0, Math.PI * 2);
    ctx.fill();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const clouds = [
      { x: 150, y: 40 },
      { x: 400, y: 30 },
      { x: 600, y: 50 },
    ];

    const loop = () => {
      const s = stateRef.current;

      // clear
      ctx.clearRect(0, 0, W, H);

      // sky
      ctx.fillStyle = '#f7f7f7';
      ctx.fillRect(0, 0, W, H);

      // clouds (slow scroll)
      if (s.started && !s.gameOver) {
        clouds.forEach(c => { c.x -= 0.4; if (c.x < -80) c.x = W + 80; });
      }
      clouds.forEach(c => drawCloud(ctx, c.x, c.y));

      // ground
      ctx.fillStyle = '#555';
      ctx.fillRect(0, GROUND_Y, W, 3);
      ctx.fillStyle = '#aaa';
      ctx.fillRect(0, GROUND_Y + 3, W, 1);

      if (s.started && !s.gameOver) {
        s.frame++;

        // physics
        s.dinoVY += GRAVITY;
        s.dinoY += s.dinoVY;
        if (s.dinoY >= GROUND_Y - DINO_H) {
          s.dinoY = GROUND_Y - DINO_H;
          s.dinoVY = 0;
          s.onGround = true;
        }

        // leg animation
        if (s.onGround) {
          s.legPhase = Math.floor(s.frame / 8) % 2;
        }

        // score & speed
        s.score++;
        if (s.score % 500 === 0) s.speed = Math.min(s.speed + 0.5, 14);
        setDisplayScore(Math.floor(s.score / 5));

        // spawn cactus
        const lastCactus = s.cacti[s.cacti.length - 1];
        const minGap = Math.max(200, 350 - s.speed * 10);
        if (!lastCactus || W - lastCactus.x > minGap + Math.random() * 200) {
          const h = 30 + Math.floor(Math.random() * 25);
          s.cacti.push({ x: W, y: GROUND_Y - h, h });
        }

        // move & remove cacti
        s.cacti.forEach(c => { c.x -= s.speed; });
        s.cacti = s.cacti.filter(c => c.x > -40);

        // collision
        const hitbox = { x: DINO_X + 8, y: s.dinoY + 4, w: DINO_W - 10, h: DINO_H - 8 };
        for (const c of s.cacti) {
          if (
            hitbox.x < c.x + 28 &&
            hitbox.x + hitbox.w > c.x &&
            hitbox.y < c.y + c.h &&
            hitbox.y + hitbox.h > c.y
          ) {
            s.gameOver = true;
            setGameState('over');
            break;
          }
        }
      }

      // draw cacti
      s.cacti.forEach(c => drawCactus(ctx, c));

      // draw dino
      drawDino(ctx, DINO_X, s.dinoY, s.legPhase);

      // idle / over overlay
      if (!s.started) {
        ctx.fillStyle = 'rgba(0,0,0,0.35)';
        ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 18px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('스페이스 또는 클릭으로 시작', W / 2, H / 2);
      }

      if (s.gameOver) {
        ctx.fillStyle = 'rgba(0,0,0,0.4)';
        ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 22px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('GAME OVER', W / 2, H / 2 - 10);
        ctx.font = '15px monospace';
        ctx.fillText(`점수: ${Math.floor(s.score / 5)}`, W / 2, H / 2 + 18);
      }

      animRef.current = requestAnimationFrame(loop);
    };

    animRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animRef.current);
  }, [drawDino, drawCactus, drawCloud]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
        if (stateRef.current.gameOver) restart();
        else jump();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [jump, restart]);

  const handleCanvas = () => {
    if (stateRef.current.gameOver) restart();
    else jump();
  };

  return (
    <div className="dino-overlay" onClick={onClose}>
      <div className="dino-modal" onClick={e => e.stopPropagation()}>
        <div className="dino-header">
          <span className="dino-title">🦕 Dino Jump</span>
          <div className="dino-score">Score: {displayScore}</div>
          <button className="dino-close" onClick={onClose}>✕</button>
        </div>
        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          className="dino-canvas"
          onClick={handleCanvas}
        />
        <p className="dino-hint">Space / 클릭으로 점프 · Game Over 후 다시 클릭하면 재시작</p>
      </div>
    </div>
  );
}

export default DinoGame;
