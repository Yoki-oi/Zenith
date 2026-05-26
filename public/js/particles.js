// particles.js — ambient floating particles + cursor glow
(function () {
  // ── Cursor glow ──────────────────────────────────────────
  const glow = document.getElementById('cursor-glow');
  if (glow) {
    document.addEventListener('mousemove', (e) => {
      glow.style.left = e.clientX + 'px';
      glow.style.top  = e.clientY + 'px';
    });
  }

  // ── Particle canvas ──────────────────────────────────────
  const canvas = document.getElementById('particle-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, particles = [];

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', () => { resize(); init(); });

  const COLORS = ['rgba(255,107,53,', 'rgba(0,212,255,', 'rgba(157,125,255,', 'rgba(168,255,62,'];

  class Particle {
    constructor() { this.reset(); this.y = Math.random() * H; }
    reset() {
      this.x  = Math.random() * W;
      this.y  = H + 20;
      this.vx = (Math.random() - 0.5) * 0.3;
      this.vy = -(Math.random() * 0.4 + 0.1);
      this.r  = Math.random() * 1.5 + 0.4;
      this.col = COLORS[Math.floor(Math.random() * COLORS.length)];
      this.alpha = Math.random() * 0.35 + 0.06;
      this.life = 0;
      this.maxLife = Math.random() * 300 + 200;
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.life++;
      if (this.y < -10 || this.life > this.maxLife) this.reset();
    }
    draw() {
      const fade = Math.min(1, Math.min(this.life / 40, (this.maxLife - this.life) / 40));
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = this.col + (this.alpha * fade) + ')';
      ctx.fill();
    }
  }

  function init() {
    particles = [];
    const count = Math.floor(W * H / 14000);
    for (let i = 0; i < count; i++) particles.push(new Particle());
  }

  function loop() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(loop);
  }

  init();
  loop();
})();
