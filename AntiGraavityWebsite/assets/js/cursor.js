// Custom Cursor — Glowing trail + particle burst
(function () {
  'use strict';

  let canvas, ctx;
  let particles = [];
  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let rafId;

  // Current section color (updated by scroll observer)
  let cursorHue = 185; // cyan by default

  function init() {
    // Create canvas overlay
    canvas = document.createElement('canvas');
    canvas.id = 'cursor-canvas';
    canvas.style.cssText = `
      position: fixed; inset: 0; pointer-events: none;
      z-index: 8000; width: 100%; height: 100%;
    `;
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    document.body.appendChild(canvas);
    ctx = canvas.getContext('2d');

    // Create custom dot cursor
    const dot = document.createElement('div');
    dot.id = 'cursor-dot';
    dot.style.cssText = `
      position: fixed; top: 0; left: 0;
      width: 12px; height: 12px; border-radius: 50%;
      background: #00f2fe;
      pointer-events: none; z-index: 8001;
      transform: translate(-50%, -50%);
      transition: transform 0.15s ease, background 0.15s ease;
      box-shadow: 0 0 12px 4px rgba(0,242,254,0.8);
      mix-blend-mode: screen;
    `;
    document.body.appendChild(dot);

    // Ring cursor
    const ring = document.createElement('div');
    ring.id = 'cursor-ring';
    ring.style.cssText = `
      position: fixed; top: 0; left: 0;
      width: 36px; height: 36px; border-radius: 50%;
      border: 2px solid rgba(0,242,254,0.8);
      pointer-events: none; z-index: 8000;
      transform: translate(-50%, -50%);
      transition: width 0.15s ease, height 0.15s ease, border-color 0.15s ease;
      mix-blend-mode: screen;
    `;
    document.body.appendChild(ring);

    // Track mouse
    let ringX = mouseX, ringY = mouseY;

    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      // Move dot instantly
      dot.style.left = mouseX + 'px';
      dot.style.top  = mouseY + 'px';

      // Spawn trail particle
      spawnParticle(mouseX, mouseY);
    });

    // Expand ring on hover over interactive elements
    document.querySelectorAll('a, button, .magnetic-btn, .tilt-card, .timeline-node-wrap').forEach(el => {
      el.addEventListener('mouseenter', () => {
        ring.style.width  = '56px';
        ring.style.height = '56px';
        ring.style.borderColor = `hsla(${cursorHue}, 100%, 65%, 1)`;
        dot.style.transform = 'translate(-50%, -50%) scale(1.5)';
      });
      el.addEventListener('mouseleave', () => {
        ring.style.width  = '36px';
        ring.style.height = '36px';
        ring.style.borderColor = 'rgba(0,242,254,0.8)';
        dot.style.transform = 'translate(-50%, -50%) scale(1)';
      });
    });

    // Smooth ring follow with lerp
    function followRing() {
      ringX += (mouseX - ringX) * 0.25;
      ringY += (mouseY - ringY) * 0.25;
      ring.style.left = ringX + 'px';
      ring.style.top  = ringY + 'px';
      requestAnimationFrame(followRing);
    }
    followRing();

    // Resize
    window.addEventListener('resize', () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    });

    // Scroll-based hue shift per section
    const sections = [
      { id: 'about',      hue: 270  }, // purple
      { id: 'projects',   hue: 185  }, // cyan
      { id: 'experience', hue: 200  }, // teal
      { id: 'contact',    hue: 280  }, // violet
    ];

    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const sec = sections.find(s => s.id === entry.target.id);
          if (sec) {
            cursorHue = sec.hue;
            const color = `hsl(${cursorHue}, 100%, 65%)`;
            dot.style.background = color;
            dot.style.boxShadow  = `0 0 10px 3px hsla(${cursorHue},100%,65%,0.5)`;
            // Also shift the ambient glow
            document.documentElement.style.setProperty('--cursor-hue', cursorHue);
          }
        }
      });
    }, { threshold: 0.4 });

    sections.forEach(s => {
      const el = document.getElementById(s.id);
      if (el) io.observe(el);
    });

    // Scroll back to hero resets
    const heroObs = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        cursorHue = 185;
        dot.style.background = '#00f2fe';
        dot.style.boxShadow  = '0 0 10px 3px rgba(0,242,254,0.5)';
      }
    }, { threshold: 0.5 });
    const hero = document.querySelector('section');
    if (hero) heroObs.observe(hero);

    animate();
  }

  function spawnParticle(x, y) {
    const hsl = `hsl(${cursorHue + (Math.random() * 40 - 20)}, 100%, ${55 + Math.random() * 20}%)`;
    particles.push({
      x, y,
      vx: (Math.random() - 0.5) * 1.2,
      vy: (Math.random() - 0.5) * 1.2,
      life: 1.0,
      decay: 0.04 + Math.random() * 0.04,
      size: 2 + Math.random() * 3,
      color: hsl,
    });

    // Cap for performance
    if (particles.length > 120) particles.splice(0, particles.length - 120);
  }

  function animate() {
    rafId = requestAnimationFrame(animate);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= p.decay;
      p.vx *= 0.96;
      p.vy *= 0.96;

      if (p.life <= 0) { particles.splice(i, 1); continue; }

      ctx.save();
      ctx.globalAlpha = p.life * 0.8;
      ctx.shadowBlur  = 12;
      ctx.shadowColor = p.color;
      ctx.fillStyle   = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  // Disable default cursor
  const style = document.createElement('style');
  style.textContent = `
    * { cursor: none !important; }
    #cursor-dot, #cursor-ring { cursor: none !important; }
  `;
  document.head.appendChild(style);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
