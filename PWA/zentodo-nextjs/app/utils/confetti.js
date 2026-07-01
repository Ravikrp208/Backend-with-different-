export const triggerConfetti = () => {
  const existingCanvas = document.getElementById('zen-confetti-canvas');
  if (existingCanvas) existingCanvas.remove();

  const canvas = document.createElement('canvas');
  canvas.id = 'zen-confetti-canvas';
  canvas.style.position = 'fixed';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100vw';
  canvas.style.height = '100vh';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '9999';
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const resizeCanvas = () => {
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    ctx.scale(dpr, dpr);
  };
  resizeCanvas();

  const colors = ['#8b5cf6', '#6366f1', '#ec4899', '#10b981', '#f59e0b', '#3b82f6'];
  const particles = [];

  const createConfettiPart = (x, angleRange) => {
    for (let i = 0; i < 40; i++) {
      const angle = angleRange[0] + Math.random() * (angleRange[1] - angleRange[0]);
      const speed = 12 + Math.random() * 14;
      particles.push({
        x, y: window.innerHeight + 10,
        vx: Math.cos(angle) * speed,
        vy: -Math.sin(angle) * speed,
        r: Math.random() * 5 + 3,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotationSpeed: Math.random() * 8 - 4,
        opacity: 1
      });
    }
  };

  createConfettiPart(0, [0.15 * Math.PI, 0.35 * Math.PI]);
  createConfettiPart(window.innerWidth, [0.65 * Math.PI, 0.85 * Math.PI]);

  let animationFrameId;
  const update = () => {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    let active = false;
    particles.forEach((p) => {
      p.vy += 0.35;
      p.vx *= 0.98;
      p.x += p.vx;
      p.y += p.vy;
      p.rotation += p.rotationSpeed;
      p.opacity -= 0.012;
      if (p.opacity > 0 && p.y <= window.innerHeight + 20) {
        active = true;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation * Math.PI / 180);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.opacity;
        ctx.fillRect(-p.r, -p.r / 2, p.r * 2, p.r);
        ctx.restore();
      }
    });
    if (active) {
      animationFrameId = requestAnimationFrame(update);
    } else {
      cancelAnimationFrame(animationFrameId);
      canvas.remove();
    }
  };
  update();

  return () => {
    cancelAnimationFrame(animationFrameId);
    canvas.remove();
  };
};
