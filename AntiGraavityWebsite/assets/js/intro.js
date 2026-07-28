// Zero-G Space OS Boot Sequence
(function () {
  'use strict';

  const BOOT_LINES = [
    { text: '[ZERO-G OS v4.0.9] QUANTUM CORE INITIALIZING...', delay: 0,    color: '#00f2fe' },
    { text: '> Mounting reality engine...                        [  OK  ]', delay: 320,  color: '#e2e8f0' },
    { text: '> Calibrating gravitational flux sensors...         [  OK  ]', delay: 620,  color: '#e2e8f0' },
    { text: '> Loading neural pathway matrices...                [  OK  ]', delay: 920,  color: '#e2e8f0' },
    { text: '> Scanning identity protocol...                     [  OK  ]', delay: 1180, color: '#e2e8f0' },
    { text: '> Decrypting biometric signature...', delay: 1440, color: '#8a2be2' },
    { text: '', delay: 1700, color: '#00f2fe', special: 'name-reveal' },
    { text: '> CONFIRMED: MBA TECH CE // NMIMS SHIRPUR', delay: 2150, color: '#00f2fe' },
    { text: '> Establishing orbital link...                       [  OK  ]', delay: 2450, color: '#e2e8f0' },
    { text: '> All systems nominal. Gravity: DEFIED.', delay: 2700, color: '#8a2be2' },
    { text: '', delay: 2950, color: '#ffffff', special: 'launch' },
  ];

  function createIntroOverlay() {
    const overlay = document.createElement('div');
    overlay.id = 'boot-overlay';
    overlay.style.cssText = `
      position: fixed; inset: 0; z-index: 9999;
      background: #020205;
      display: flex; flex-direction: column; justify-content: center; align-items: center;
      font-family: 'JetBrains Mono', monospace;
      overflow: hidden;
    `;

    // Scanline effect inside boot
    const scanline = document.createElement('div');
    scanline.style.cssText = `
      position: absolute; inset: 0; pointer-events: none;
      background: repeating-linear-gradient(0deg,
        transparent, transparent 2px,
        rgba(0,242,254,0.015) 2px, rgba(0,242,254,0.015) 4px
      );
      animation: bootScan 10s linear infinite;
    `;
    overlay.appendChild(scanline);

    // Corner brackets
    ['top:20px;left:20px;border-top:1px solid;border-left:1px solid',
     'top:20px;right:20px;border-top:1px solid;border-right:1px solid',
     'bottom:20px;left:20px;border-bottom:1px solid;border-left:1px solid',
     'bottom:20px;right:20px;border-bottom:1px solid;border-right:1px solid'
    ].forEach(corner => {
      const el = document.createElement('div');
      el.style.cssText = `position:absolute;${corner};width:30px;height:30px;border-color:rgba(0,242,254,0.4);`;
      overlay.appendChild(el);
    });

    // Terminal container
    const terminal = document.createElement('div');
    terminal.id = 'boot-terminal';
    terminal.style.cssText = `
      width: min(700px, 90vw); max-height: 80vh;
      display: flex; flex-direction: column; gap: 0;
    `;
    overlay.appendChild(terminal);

    // Progress bar at bottom
    const progressWrap = document.createElement('div');
    progressWrap.style.cssText = `
      position: absolute; bottom: 60px; left: 50%; transform: translateX(-50%);
      width: min(700px, 90vw);
    `;
    const progressLabel = document.createElement('div');
    progressLabel.style.cssText = 'font-size:10px;color:rgba(0,242,254,0.5);margin-bottom:6px;letter-spacing:0.2em;';
    progressLabel.textContent = 'SYSTEM BOOT PROGRESS';
    const progressTrack = document.createElement('div');
    progressTrack.style.cssText = 'width:100%;height:2px;background:rgba(255,255,255,0.05);';
    const progressFill = document.createElement('div');
    progressFill.id = 'boot-progress';
    progressFill.style.cssText = 'height:100%;width:0%;background:linear-gradient(90deg,#00f2fe,#8a2be2);transition:width 0.3s ease;box-shadow:0 0 8px rgba(0,242,254,0.6);';
    progressTrack.appendChild(progressFill);
    progressWrap.appendChild(progressLabel);
    progressWrap.appendChild(progressTrack);
    overlay.appendChild(progressWrap);

    document.body.appendChild(overlay);
    return { overlay, terminal, progressFill };
  }

  function printLine(terminal, text, color) {
    const line = document.createElement('p');
    line.style.cssText = `
      color: ${color}; font-size: clamp(10px, 1.5vw, 13px);
      line-height: 1.9; margin: 0; padding: 0;
      white-space: pre; opacity: 0;
      animation: bootLineFade 0.2s ease forwards;
    `;
    line.textContent = text;
    terminal.appendChild(line);
    terminal.scrollTop = terminal.scrollHeight;
    return line;
  }

  function printNameReveal(terminal) {
    const wrap = document.createElement('div');
    wrap.style.cssText = 'margin: 8px 0; display: flex; align-items: center; gap: 12px;';

    const prefix = document.createElement('span');
    prefix.style.cssText = 'color: rgba(0,242,254,0.6); font-size: clamp(10px,1.5vw,13px);';
    prefix.textContent = '> IDENTITY: ';

    const name = document.createElement('span');
    name.style.cssText = `
      font-size: clamp(16px, 3vw, 28px); font-weight: 900;
      letter-spacing: 0.12em;
      background: linear-gradient(90deg, #00f2fe, #ffffff, #b44fff);
      background-size: 200%;
      -webkit-background-clip: text; -webkit-text-fill-color: transparent;
      background-clip: text;
      animation: bootNameShimmer 2s ease infinite;
      opacity: 0; transition: opacity 0.4s;
      font-family: 'Outfit', sans-serif;
    `;
    name.textContent = 'DIVIJ KOTHARI';

    wrap.appendChild(prefix);
    wrap.appendChild(name);
    terminal.appendChild(wrap);

    setTimeout(() => { name.style.opacity = '1'; }, 100);
    return wrap;
  }

  function runBootSequence() {
    const { overlay, terminal, progressFill } = createIntroOverlay();
    const totalLines = BOOT_LINES.length;

    BOOT_LINES.forEach((item, index) => {
      setTimeout(() => {
        // Update progress
        progressFill.style.width = `${((index + 1) / totalLines) * 100}%`;

        if (item.special === 'name-reveal') {
          printNameReveal(terminal);
        } else if (item.special === 'launch') {
          // Trigger launch sequence
          setTimeout(() => launchSequence(overlay), 400);
        } else if (item.text) {
          printLine(terminal, item.text, item.color);
        }
      }, item.delay);
    });
  }

  function launchSequence(overlay) {
    // Flash white
    overlay.style.transition = 'background 0.1s';
    overlay.style.background = '#ffffff';

    setTimeout(() => {
      overlay.style.background = '#020205';

      // Type final line
      const terminal = document.getElementById('boot-terminal');
      if (terminal) {
        const line = printLine(terminal, '>> LAUNCHING ZERO-G PORTFOLIO...', '#00f2fe');
        line.style.fontSize = 'clamp(12px, 2vw, 16px)';
        line.style.fontWeight = '700';
      }

      setTimeout(() => {
        // Slide entire overlay upward and dissolve
        overlay.style.transition = 'transform 0.9s cubic-bezier(0.85,0,0.15,1), opacity 0.6s ease 0.4s';
        overlay.style.transform = 'translateY(-100vh)';
        overlay.style.opacity = '0';

        setTimeout(() => {
          overlay.remove();
          // Trigger hero text reveal
          document.dispatchEvent(new CustomEvent('boot-complete'));
        }, 1000);
      }, 600);
    }, 120);
  }

  // Add required keyframes
  const style = document.createElement('style');
  style.textContent = `
    @keyframes bootLineFade {
      from { opacity: 0; transform: translateX(-6px); }
      to   { opacity: 1; transform: translateX(0); }
    }
    @keyframes bootNameShimmer {
      0%   { background-position: 0% 50%; }
      50%  { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }
    @keyframes bootScan {
      0%   { transform: translateY(0); }
      100% { transform: translateY(4px); }
    }
  `;
  document.head.appendChild(style);

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runBootSequence);
  } else {
    runBootSequence();
  }
})();
