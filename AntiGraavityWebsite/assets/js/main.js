// Anti-Gravity Portfolio - Core Interactive Features
document.addEventListener('DOMContentLoaded', () => {
  // Initialize Lucide Icons
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }

  // 1. Mouse-Tracking Radial Glow Background
  const radialGlow = document.querySelector('.radial-glow');
  if (radialGlow) {
    document.addEventListener('mousemove', (e) => {
      radialGlow.style.left = `${e.clientX}px`;
      radialGlow.style.top  = `${e.clientY}px`;
    });
  }

  // 2. Real-time Telemetry Log Simulator
  initTelemetrySimulator();

  // 3. 3D Tilt Physics for Glass Bento Cards
  init3DTilt();

  // 4. Magnetic Pull on Action Buttons & Navigation links
  initMagneticElements();

  // 5. Dual-Axis Matrix Interactive Hover Actions
  initCoreMatrixSynergy();

  // 6. Quantum Timeline Milestone Readouts
  initTimelineDetails();

  // 7. Rocket-Launch Contact Form Sequence
  initRocketLaunchForm();

  // 8. Glitch-reveal hero name (fires after boot sequence)
  document.addEventListener('boot-complete', initGlitchReveal);

  // 9. Section ambient hue shift
  initSectionAmbientShift();
});


// Real-time Telemetry Simulator
function initTelemetrySimulator() {
  const coordX = document.getElementById('telemetry-x');
  const coordY = document.getElementById('telemetry-y');
  const latVal = document.getElementById('telemetry-latency');
  const gravVal = document.getElementById('telemetry-gravity');
  const fpsVal = document.getElementById('telemetry-fps');

  // Track coordinates in grid space
  document.addEventListener('mousemove', (e) => {
    if (coordX && coordY) {
      const pctX = Math.round((e.clientX / window.innerWidth) * 100);
      const pctY = Math.round((e.clientY / window.innerHeight) * 100);
      coordX.innerText = `X: ${pctX.toString().padStart(3, '0')}%`;
      coordY.innerText = `Y: ${pctY.toString().padStart(3, '0')}%`;
    }
  });

  // Loop simulation for network logs and gravity drifts
  setInterval(() => {
    if (latVal) {
      const jitter = Math.floor(Math.random() * 8) - 4;
      const baseLat = 24 + jitter;
      latVal.innerText = `${baseLat}ms`;
    }
    
    if (gravVal) {
      // Simulate weightlessness variance
      const gravity = (0.01 + Math.sin(Date.now() / 4000) * 0.008).toFixed(4);
      gravVal.innerText = `${gravity} G`;
    }

    if (fpsVal) {
      // Minor FPS fluctuate
      const fps = Math.random() > 0.9 ? 58 : 60;
      fpsVal.innerText = `${fps} FPS`;
    }
  }, 1000);
}

// 3D Tilt Effect on hoverable cards using GSAP for buttery smooth animations
function init3DTilt() {
  const tiltCards = document.querySelectorAll('.tilt-card');

  tiltCards.forEach((card) => {
    // Set transform perspective via GSAP
    gsap.set(card, { transformPerspective: 1000 });

    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left; // x position inside elements
      const y = e.clientY - rect.top;  // y position inside elements

      // Normalize coordinates (-0.5 to 0.5)
      const px = (x / rect.width) - 0.5;
      const py = (y / rect.height) - 0.5;

      // Max Tilt angle (reduced slightly for premium feel)
      const maxTilt = 12;
      const rx = -py * maxTilt;
      const ry = px * maxTilt;

      // Smooth GSAP translation for card rotation
      gsap.to(card, {
        rotateX: rx,
        rotateY: ry,
        scale: 1.02,
        duration: 0.45,
        ease: 'power2.out',
        overwrite: 'auto'
      });
      
      // Dynamic contextual glowing shadow
      const shadowColor = card.id === 'matrix-biz' || card.querySelector('[class*="bg-accentPurple"]') 
        ? 'rgba(138, 43, 226, 0.2)' 
        : 'rgba(0, 242, 254, 0.2)';
        
      gsap.to(card, {
        boxShadow: `${-ry * 1.8}px ${rx * 1.8}px 35px ${shadowColor}`,
        duration: 0.45,
        ease: 'power2.out',
        overwrite: 'auto'
      });

      // Holographic parallax depth: shift children on X, Y and Z axes
      const parallaxChildren = card.querySelectorAll('.tilt-depth-layer');
      parallaxChildren.forEach((child) => {
        const depth = parseFloat(child.getAttribute('data-depth-z')) || 30;
        const transX = px * (depth * 0.45);
        const transY = py * (depth * 0.45);
        
        gsap.to(child, {
          x: transX,
          y: transY,
          z: depth,
          duration: 0.45,
          ease: 'power2.out',
          overwrite: 'auto'
        });
      });
    });

    card.addEventListener('mouseleave', () => {
      // Return everything to neutral grid coordinates smoothly
      gsap.to(card, {
        rotateX: 0,
        rotateY: 0,
        scale: 1,
        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        duration: 0.8,
        ease: 'power3.out',
        overwrite: 'auto'
      });

      const parallaxChildren = card.querySelectorAll('.tilt-depth-layer');
      parallaxChildren.forEach((child) => {
        gsap.to(child, {
          x: 0,
          y: 0,
          z: 0,
          duration: 0.8,
          ease: 'power3.out',
          overwrite: 'auto'
        });
      });
    });
  });
}

// Magnetic Pull for action buttons
function initMagneticElements() {
  const magnets = document.querySelectorAll('.magnetic-btn');

  magnets.forEach((btn) => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const btnX = rect.left + rect.width / 2;
      const btnY = rect.top + rect.height / 2;

      // Distance from center of button
      const dist = Math.hypot(e.clientX - btnX, e.clientY - btnY);

      // Max pulling range
      const limit = 80;
      if (dist < limit) {
        // Calculate vector
        const pullX = (e.clientX - btnX) * 0.35;
        const pullY = (e.clientY - btnY) * 0.35;

        // Apply dynamic shift using GSAP for smooth execution
        gsap.to(btn, {
          x: pullX,
          y: pullY,
          duration: 0.3,
          ease: 'power2.out'
        });
      } else {
        // Snap back when mouse gets slightly out of range
        gsap.to(btn, {
          x: 0,
          y: 0,
          duration: 0.6,
          ease: 'elastic.out(1, 0.3)'
        });
      }
    });

    btn.addEventListener('mouseleave', () => {
      // Ensure resets
      gsap.to(btn, {
        x: 0,
        y: 0,
        duration: 0.6,
        ease: 'elastic.out(1, 0.3)'
      });
    });
  });
}

// Core Matrix split layout dynamics
function initCoreMatrixSynergy() {
  const techCard = document.getElementById('matrix-tech');
  const bizCard = document.getElementById('matrix-biz');
  const intersectionNode = document.getElementById('matrix-intersection');

  if (techCard && bizCard && intersectionNode) {
    // Hovering the intersection node highlights both panels
    intersectionNode.addEventListener('mouseenter', () => {
      techCard.classList.add('matrix-active-cyan');
      bizCard.classList.add('matrix-active-purple');
      gsap.to(intersectionNode, {
        scale: 1.25,
        rotate: 45,
        boxShadow: '0 0 25px #ffffff, 0 0 10px #00f2fe, 0 0 10px #8a2be2',
        duration: 0.4,
        ease: 'power2.out',
        overwrite: 'auto'
      });
    });

    intersectionNode.addEventListener('mouseleave', () => {
      techCard.classList.remove('matrix-active-cyan');
      bizCard.classList.remove('matrix-active-purple');
      gsap.to(intersectionNode, {
        scale: 1,
        rotate: 0,
        boxShadow: '0 0 15px rgba(255, 255, 255, 0.2)',
        duration: 0.4,
        ease: 'power2.out',
        overwrite: 'auto'
      });
    });

    // Tech hover focus
    techCard.addEventListener('mouseenter', () => {
      techCard.style.borderColor = 'rgba(0, 242, 254, 0.4)';
    });
    
    // Biz hover focus
    bizCard.addEventListener('mouseenter', () => {
      bizCard.style.borderColor = 'rgba(138, 43, 226, 0.4)';
    });
  }
}

// Quantum Timeline log typewriter reveal
function initTimelineDetails() {
  const milestones = document.querySelectorAll('.timeline-node-wrap');
  const detailPanel = document.getElementById('timeline-detail-log');
  const detailTitle = document.getElementById('timeline-detail-title');
  const detailText = document.getElementById('timeline-detail-text');

  // Logs mapping
  const timelineLogs = {
    nmims: {
      title: "NMIMS UNIVERSITY: MBA TECH COMPUTER ENGINEERING",
      text: "Executing concurrent specializations in B.Tech Computer Engineering & MBA Corporate Management. Maintaining core technical operations with active training in systems engineering, neural architectures, corporate economics, and financial modeling. Core GPA tracker healthy. Operational nodes: active."
    },
    internship: {
      title: "SYSTEMS ARCHITECT & STRATEGY INTERNSHIP",
      text: "Engineered scalable cloud endpoints using decoupled serverless models. Spearheaded market-sizing evaluations for next-generation AI pipelines. Combined infrastructure architecture logs with strategic business modeling calculations, realizing a 15% latency drop and 10% structural resource optimization."
    },
    committee: {
      title: "CORE TECHNICAL & OPERATIONS COMMAND",
      text: "Commanded the technical deployment and operations division for college tech festivals. Developed centralized real-time registration frameworks receiving 10,000+ incoming queries. Coordinated budgets, team distribution networks, and telemetry pipelines."
    }
  };

  milestones.forEach((node) => {
    node.addEventListener('click', () => {
      // Highlight active node
      milestones.forEach(n => n.classList.remove('border-white', 'text-cyan-400'));
      node.classList.add('border-white');

      const logId = node.getAttribute('data-log-id');
      const data = timelineLogs[logId];
      if (data && detailPanel && detailTitle && detailText) {
        // Fade in details panel
        gsap.to(detailPanel, { opacity: 0.1, duration: 0.15, onComplete: () => {
          detailTitle.innerText = data.title;
          
          // Typewriter print simulation
          let wordIdx = 0;
          const words = data.text.split(' ');
          detailText.innerHTML = '';
          
          function printWord() {
            if (wordIdx < words.length) {
              detailText.innerHTML += words[wordIdx] + ' ';
              wordIdx++;
              setTimeout(printWord, 35);
            }
          }
          printWord();
          
          gsap.to(detailPanel, { opacity: 1, duration: 0.4 });
        }});
      }
    });
  });

  // Auto trigger the first milestone
  if (milestones.length > 0) {
    milestones[0].click();
  }
}

// Rocket-launch submission sequence
function initRocketLaunchForm() {
  const form = document.getElementById('contact-form');
  const sendBtn = document.getElementById('submit-btn');
  const buttonText = document.getElementById('submit-text');
  const launchPlume = document.getElementById('launch-plume');
  const statusScreen = document.getElementById('transmission-status');

  if (form && sendBtn) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      // Disable inputs to prevent spamming
      const inputs = form.querySelectorAll('input, textarea');
      inputs.forEach(i => i.disabled = true);

      // Trigger telemetry countdown indicators
      if (buttonText) buttonText.innerText = "COUNTDOWN START: T-3s";
      sendBtn.disabled = true;

      // Setup countdown sequence
      let seconds = 3;
      const countdownInterval = setInterval(() => {
        seconds--;
        if (seconds > 0) {
          if (buttonText) buttonText.innerText = `IGNITION IN: T-${seconds}s`;
        } else {
          clearInterval(countdownInterval);
          igniteAndLaunch();
        }
      }, 1000);
    });

    function igniteAndLaunch() {
      if (buttonText) buttonText.innerText = "LAUNCHING TRANSMISSION...";
      
      // Plume fire particle generation
      let particleTimer = setInterval(() => {
        createPlumeParticle();
      }, 25);

      // Submit Button flies upwards
      gsap.to(sendBtn, {
        y: -400,
        scale: 0.2,
        opacity: 0,
        duration: 1.2,
        ease: 'power4.in',
        onComplete: () => {
          clearInterval(particleTimer);
          
          // Animate the entire contact card fading and showing telemetry confirmation
          gsap.to(form, {
            opacity: 0,
            y: -50,
            duration: 0.6,
            onComplete: () => {
              form.classList.add('hidden');
              if (statusScreen) {
                statusScreen.classList.remove('hidden');
                gsap.fromTo(statusScreen, 
                  { opacity: 0, scale: 0.9, y: 30 },
                  { opacity: 1, scale: 1, y: 0, duration: 0.8, ease: 'back.out(1.7)' }
                );
              }
            }
          });
        }
      });
    }

    function createPlumeParticle() {
      if (!launchPlume) return;
      const p = document.createElement('div');
      p.className = 'plume-particle';

      const rect = sendBtn.getBoundingClientRect();
      const plumeRect = launchPlume.getBoundingClientRect();

      // Spawn relative to button base center
      const size = Math.random() * 15 + 5;
      p.style.width = `${size}px`;
      p.style.height = `${size}px`;
      
      const relativeLeft = (rect.left + rect.width / 2) - plumeRect.left + (Math.random() * 40 - 20);
      const relativeTop = (rect.bottom) - plumeRect.top;

      p.style.left = `${relativeLeft}px`;
      p.style.top = `${relativeTop}px`;

      // Random colored particles (flame, smoke, purple telemetry)
      const randColor = Math.random();
      if (randColor > 0.6) {
        p.style.setProperty('--color-cyan', '#8a2be2'); // purple fire
      } else if (randColor > 0.3) {
        p.style.setProperty('--color-cyan', '#00f2fe'); // cyan fire
      } else {
        p.style.setProperty('--color-cyan', '#ffffff'); // star dust
      }

      launchPlume.appendChild(p);

      // Remove after animation completes
      setTimeout(() => {
        p.remove();
      }, 600);
    }
  }
}

// === GLITCH REVEAL: hero name letters scramble then resolve ===
function initGlitchReveal() {
  const h1 = document.querySelector('h1.font-hero');
  if (!h1) return;

  const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#%&';
  const fullText  = 'DIVIJ';
  const gradSpan  = h1.querySelector('.hero-name-gradient');
  const lastName  = gradSpan ? 'KOTHARI' : '';

  // Animate the plain "DIVIJ" text node
  const textNode = h1.childNodes[0]; // text node "\n        DIVIJ\n        "

  function scrambleTo(el, target, isCSSClass) {
    let iteration = 0;
    const total   = 18;
    const chars   = CHARS;
    const orig    = target;

    const interval = setInterval(() => {
      const resolved = Math.floor((iteration / total) * orig.length);
      let result = '';
      for (let i = 0; i < orig.length; i++) {
        if (orig[i] === ' ') { result += ' '; continue; }
        if (i < resolved) {
          result += orig[i];
        } else {
          result += chars[Math.floor(Math.random() * chars.length)];
        }
      }
      if (isCSSClass) {
        el.textContent = result;
      } else {
        el.textContent = '\n        ' + result + '\n        ';
      }
      iteration++;
      if (iteration > total) {
        if (isCSSClass) el.textContent = orig;
        else el.textContent = '\n        ' + orig + '\n        ';
        clearInterval(interval);
      }
    }, 55);
  }

  // Stagger: first name, then last name
  setTimeout(() => scrambleTo(textNode, fullText, false), 100);
  if (gradSpan) {
    setTimeout(() => scrambleTo(gradSpan, lastName, true), 450);
  }
}

// === SECTION AMBIENT SHIFT: background tints per section ===
function initSectionAmbientShift() {
  const gridOverlay = document.querySelector('.grid-overlay');
  if (!gridOverlay) return;

  const sectionColors = [
    { id: 'about',      color: 'rgba(138,43,226,0.035)' },
    { id: 'projects',   color: 'rgba(0,242,254,0.025)'  },
    { id: 'experience', color: 'rgba(0,200,220,0.03)'   },
    { id: 'contact',    color: 'rgba(180,79,255,0.04)'  },
  ];

  const defaultGrid = `
    linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)
  `;

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const sec = sectionColors.find(s => s.id === entry.target.id);
      if (sec) {
        gridOverlay.style.transition = 'background-color 1.2s ease';
        gridOverlay.style.backgroundColor = sec.color;
      } else {
        gridOverlay.style.backgroundColor = 'transparent';
      }
    });
  }, { threshold: 0.35 });

  sectionColors.forEach(s => {
    const el = document.getElementById(s.id);
    if (el) io.observe(el);
  });

  // Reset on hero
  const hero = document.querySelector('section');
  if (hero) {
    const heroObs = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        gridOverlay.style.backgroundColor = 'transparent';
      }
    }, { threshold: 0.4 });
    heroObs.observe(hero);
  }
}
