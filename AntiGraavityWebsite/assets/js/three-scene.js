// Three.js Scene - Zero-Gravity 3D Core and Particle Field
let scene, camera, renderer;
let quantumCore, outerShell, satelliteGroup, starsField;
let coreGlowLight1, coreGlowLight2;
let targetRotationX = 0, targetRotationY = 0;
let currentRotationX = 0, currentRotationY = 0;
let mouseX = 0, mouseY = 0;
let windowHalfX = window.innerWidth / 2;
let windowHalfY = window.innerHeight / 2;
let scrollY = 0;
let currentScale = 1;
let targetScale = 1;

const clock = new THREE.Clock();

function initThree() {
  const canvas = document.getElementById('three-canvas');
  if (!canvas) return;

  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 8;

  renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // === LIGHTS ===
  scene.add(new THREE.AmbientLight(0xffffff, 0.3));

  const dirLight1 = new THREE.DirectionalLight(0x00f2fe, 3.0);
  dirLight1.position.set(5, 5, 5);
  scene.add(dirLight1);

  const dirLight2 = new THREE.DirectionalLight(0x8a2be2, 3.0);
  dirLight2.position.set(-5, -5, 5);
  scene.add(dirLight2);

  // Pulsing core point lights
  coreGlowLight1 = new THREE.PointLight(0x00f2fe, 4.0, 9);
  coreGlowLight1.position.set(0, 0, 0);
  scene.add(coreGlowLight1);

  coreGlowLight2 = new THREE.PointLight(0x8a2be2, 4.0, 9);
  coreGlowLight2.position.set(0, 0, 0);
  scene.add(coreGlowLight2);

  // === CORE GROUP ===
  quantumCore = new THREE.Group();
  scene.add(quantumCore);


  // === CUSTOM GLSL ENERGY GLOBE (Shader Material) ===
  // Fresnel rim glow + animated plasma noise — impossible to casually replicate
  const energyVertexShader = `
    varying vec3 vNormal;
    varying vec3 vWorldPos;
    varying vec2 vUv;
    void main() {
      vNormal = normalize(normalMatrix * normal);
      vUv = uv;
      vec4 worldPos = modelMatrix * vec4(position, 1.0);
      vWorldPos = worldPos.xyz;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  const energyFragShader = `
    uniform float uTime;
    uniform vec3  uColorA;   // cyan
    uniform vec3  uColorB;   // purple
    varying vec3  vNormal;
    varying vec3  vWorldPos;
    varying vec2  vUv;

    // Simple hash + smooth noise for plasma effect
    float hash(vec2 p) {
      p = fract(p * vec2(234.34, 435.345));
      p += dot(p, p + 34.23);
      return fract(p.x * p.y);
    }
    float noise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      f = f * f * (3.0 - 2.0 * f); // smoothstep
      return mix(
        mix(hash(i), hash(i + vec2(1,0)), f.x),
        mix(hash(i + vec2(0,1)), hash(i + vec2(1,1)), f.x),
        f.y
      );
    }
    float fbm(vec2 p) {
      float val = 0.0, amp = 0.5, freq = 1.0;
      for (int i = 0; i < 5; i++) {
        val  += amp * noise(p * freq);
        freq *= 2.1;
        amp  *= 0.48;
      }
      return val;
    }

    void main() {
      // Fresnel — bright at edges, dark at center
      vec3 viewDir = normalize(cameraPosition - vWorldPos);
      float fresnel = pow(1.0 - abs(dot(vNormal, viewDir)), 2.5);

      // Animated plasma on sphere UV
      vec2 plasmaUv = vUv * 3.0 + vec2(uTime * 0.12, uTime * 0.08);
      float plasma = fbm(plasmaUv + fbm(plasmaUv + fbm(plasmaUv)));

      // Color mix driven by plasma + time
      float colorMix = 0.5 + 0.5 * sin(uTime * 0.6 + plasma * 4.0);
      vec3 baseColor = mix(uColorA, uColorB, colorMix);

      // Combine: plasma veins + fresnel rim
      float glow = fresnel * 1.4 + plasma * 0.35;
      vec3 finalColor = baseColor * glow;

      // Alpha: opaque at rim, semi-transparent in middle
      float alpha = fresnel * 0.95 + plasma * 0.15;
      alpha = clamp(alpha, 0.0, 1.0);

      gl_FragColor = vec4(finalColor, alpha);
    }
  `;

  let energyShaderMat;
  const shaderSphereGeo = new THREE.SphereGeometry(1.1, 64, 64);
  energyShaderMat = new THREE.ShaderMaterial({
    vertexShader:   energyVertexShader,
    fragmentShader: energyFragShader,
    uniforms: {
      uTime:   { value: 0.0 },
      uColorA: { value: new THREE.Color(0x00f2fe) },
      uColorB: { value: new THREE.Color(0x8a2be2) },
    },
    transparent: true,
    depthWrite:  false,
    side: THREE.FrontSide,
  });
  const shaderSphere = new THREE.Mesh(shaderSphereGeo, energyShaderMat);
  quantumCore.add(shaderSphere);

  // Store ref for animate loop
  quantumCore.userData.shaderMat = energyShaderMat;


  // Inner wireframe Icosahedron
  const innerGeo = new THREE.IcosahedronGeometry(2, 1);
  const innerMat = new THREE.MeshBasicMaterial({
    color: 0x00f2fe, wireframe: true, transparent: true, opacity: 0.9
  });
  quantumCore.add(new THREE.Mesh(innerGeo, innerMat));

  // Outer wireframe Dodecahedron shell
  const outerGeo = new THREE.DodecahedronGeometry(2.6, 1);
  const outerMat = new THREE.MeshBasicMaterial({
    color: 0xb44fff, wireframe: true, transparent: true, opacity: 0.55
  });
  outerShell = new THREE.Mesh(outerGeo, outerMat);
  quantumCore.add(outerShell);

  // Mid Octahedron (white lattice)
  const midGeo = new THREE.OctahedronGeometry(1.7, 2);
  const midMat = new THREE.MeshBasicMaterial({
    color: 0xffffff, wireframe: true, transparent: true, opacity: 0.18
  });
  quantumCore.add(new THREE.Mesh(midGeo, midMat));

  // === 5 ORBITAL RINGS ===
  function addRing(innerR, outerR, color, opacity, rotX, rotY, rotZ) {
    const geo = new THREE.RingGeometry(innerR, outerR, 128);
    const mat = new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide, transparent: true, opacity });
    const ring = new THREE.Mesh(geo, mat);
    ring.rotation.set(rotX, rotY, rotZ);
    quantumCore.add(ring);
  }

  addRing(3.10, 3.15, 0x00f2fe, 0.55, Math.PI / 3, 0, 0);
  addRing(3.38, 3.43, 0x8a2be2, 0.45, 0, Math.PI / 4, 0);
  addRing(3.65, 3.69, 0x00f2fe, 0.28, Math.PI / 6, Math.PI / 5, 0);
  addRing(2.78, 2.82, 0xffffff, 0.14, Math.PI / 2, Math.PI / 8, 0);
  addRing(4.00, 4.04, 0xb44fff, 0.22, Math.PI / 4, Math.PI / 3, Math.PI / 6);

  // === ORBITING SATELLITES (20 nodes) ===
  satelliteGroup = new THREE.Group();
  quantumCore.add(satelliteGroup);

  for (let i = 0; i < 20; i++) {
    const isCyan = i % 2 === 0;
    const satGeo = new THREE.SphereGeometry(0.10, 12, 12);
    const satMat = new THREE.MeshPhongMaterial({
      color:     isCyan ? 0x00f2fe : 0xb44fff,
      emissive:  isCyan ? 0x00f2fe : 0x8a2be2,
      emissiveIntensity: 1.8,
      shininess: 200
    });
    const satellite = new THREE.Mesh(satGeo, satMat);
    const u = Math.random(), v = Math.random();
    const theta = u * 2.0 * Math.PI;
    const phi = Math.acos(2.0 * v - 1.0);
    const radius = 3.2 + Math.random() * 0.9;
    satellite.position.set(
      radius * Math.sin(phi) * Math.cos(theta),
      radius * Math.sin(phi) * Math.sin(theta),
      radius * Math.cos(phi)
    );
    satellite.userData = {
      orbitRadius: radius,
      angle: Math.random() * Math.PI * 2,
      speed: 0.004 + Math.random() * 0.006,
      axisX: Math.random() - 0.5,
      axisY: Math.random() - 0.5
    };
    satelliteGroup.add(satellite);
  }

  // === BACKGROUND STAR FIELD (900 particles) ===
  const starsCount = 900;
  const starsGeo = new THREE.BufferGeometry();
  const starsPositions = new Float32Array(starsCount * 3);
  const starsColors    = new Float32Array(starsCount * 3);

  for (let i = 0; i < starsCount; i++) {
    const i3 = i * 3;
    const r = 8 + Math.random() * 30;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos((Math.random() * 2) - 1);
    starsPositions[i3]   = r * Math.sin(phi) * Math.cos(theta);
    starsPositions[i3+1] = r * Math.sin(phi) * Math.sin(theta);
    starsPositions[i3+2] = r * Math.cos(phi);

    const c = Math.random();
    if (c > 0.65) {
      // Bright cyan
      starsColors[i3] = 0.0; starsColors[i3+1] = 0.95; starsColors[i3+2] = 1.0;
    } else if (c > 0.35) {
      // Purple
      starsColors[i3] = 0.7; starsColors[i3+1] = 0.17; starsColors[i3+2] = 1.0;
    } else if (c > 0.1) {
      // White
      starsColors[i3] = 1.0; starsColors[i3+1] = 1.0; starsColors[i3+2] = 1.0;
    } else {
      // Warm gold accent
      starsColors[i3] = 1.0; starsColors[i3+1] = 0.9; starsColors[i3+2] = 0.6;
    }
  }

  starsGeo.setAttribute('position', new THREE.BufferAttribute(starsPositions, 3));
  starsGeo.setAttribute('color',    new THREE.BufferAttribute(starsColors, 3));

  const starsMat = new THREE.PointsMaterial({
    size: 0.1,
    vertexColors: true,
    transparent: true,
    opacity: 0.88,
    sizeAttenuation: true
  });

  starsField = new THREE.Points(starsGeo, starsMat);
  scene.add(starsField);

  // === CONSTELLATION NETWORK: connect nearby stars with faint lines ===
  const linePositions = [];
  const lineColors    = [];
  const threshold = 6.5; // max distance to draw a line

  for (let i = 0; i < starsCount; i++) {
    for (let j = i + 1; j < starsCount; j++) {
      const ax = starsPositions[i*3], ay = starsPositions[i*3+1], az = starsPositions[i*3+2];
      const bx = starsPositions[j*3], by = starsPositions[j*3+1], bz = starsPositions[j*3+2];
      const dist = Math.sqrt((ax-bx)**2 + (ay-by)**2 + (az-bz)**2);
      if (dist < threshold) {
        const fade = 1.0 - (dist / threshold); // closer = brighter
        const alpha = fade * 0.18;
        linePositions.push(ax, ay, az, bx, by, bz);
        // Cyan lines
        lineColors.push(0, 0.95 * alpha, alpha, 0, 0.95 * alpha, alpha);
      }
    }
  }

  if (linePositions.length > 0) {
    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(linePositions), 3));
    lineGeo.setAttribute('color',    new THREE.BufferAttribute(new Float32Array(lineColors), 3));
    const lineMat = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const constellations = new THREE.LineSegments(lineGeo, lineMat);
    scene.add(constellations);
    // Rotate with stars
    starsField.userData.constellation = constellations;
  }

  document.addEventListener('mousemove', onDocumentMouseMove);
  window.addEventListener('resize', onWindowResize);
  window.addEventListener('scroll', onWindowScroll);

  animate();
}

function onDocumentMouseMove(event) {
  mouseX = (event.clientX - windowHalfX) / 100;
  mouseY = (event.clientY - windowHalfY) / 100;
}

function onWindowResize() {
  windowHalfX = window.innerWidth / 2;
  windowHalfY = window.innerHeight / 2;
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function onWindowScroll() {
  scrollY = window.scrollY;
}

function animate() {
  requestAnimationFrame(animate);
  const elapsedTime = clock.getElapsedTime();

  if (quantumCore) {
    quantumCore.rotation.y += 0.003;
    quantumCore.rotation.x += 0.001;

    targetRotationX = mouseY * 0.15;
    targetRotationY = mouseX * 0.15;
    currentRotationX += (targetRotationX - currentRotationX) * 0.05;
    currentRotationY += (targetRotationY - currentRotationY) * 0.05;
    quantumCore.rotation.x += currentRotationX * 0.1;
    quantumCore.rotation.y += currentRotationY * 0.1;

    // Zero-G idle float
    quantumCore.position.y = Math.sin(elapsedTime * 1.2) * 0.18;

    // Breathing pulse (applied on top of scroll scale)
    const breathe = 1 + Math.sin(elapsedTime * 2.0) * 0.025;
    quantumCore.scale.set(currentScale * breathe, currentScale * breathe, currentScale * breathe);
  }

  if (outerShell) {
    outerShell.rotation.y -= 0.006;
    outerShell.rotation.z += 0.003;
  }

  // Pulsing core lights
  if (coreGlowLight1 && coreGlowLight2) {
    coreGlowLight1.intensity = 3.5 + Math.sin(elapsedTime * 2.5) * 1.8;
    coreGlowLight2.intensity = 3.5 + Math.cos(elapsedTime * 2.0) * 1.8;
  }

  // Satellite orbits
  if (satelliteGroup) {
    satelliteGroup.children.forEach((sat, index) => {
      const ud = sat.userData;
      ud.angle += ud.speed;
      sat.position.x = ud.orbitRadius * Math.sin(ud.angle + index) * Math.cos(ud.angle * 0.3 + ud.axisX);
      sat.position.y = ud.orbitRadius * Math.cos(ud.angle + index);
      sat.position.z = ud.orbitRadius * Math.sin(ud.angle + index) * Math.sin(ud.angle * 0.3 + ud.axisY);
    });
  }

  if (starsField) {
    starsField.rotation.y = elapsedTime * 0.012;
    starsField.rotation.x = elapsedTime * 0.004;
    // Sync constellation rotation
    if (starsField.userData.constellation) {
      starsField.userData.constellation.rotation.y = starsField.rotation.y;
      starsField.userData.constellation.rotation.x = starsField.rotation.x;
    }
  }

  // Update GLSL shader time uniform
  if (quantumCore && quantumCore.userData.shaderMat) {
    quantumCore.userData.shaderMat.uniforms.uTime.value = elapsedTime;
  }

  // Smooth scroll parallax
  if (quantumCore) {
    const progress = Math.min(scrollY / window.innerHeight, 1);
    const easedProgress = progress * progress * (3 - 2 * progress);
    targetScale = Math.max(0.05, 1 - easedProgress * 1.4);
    currentScale += (targetScale - currentScale) * 0.08;
    quantumCore.position.z = -easedProgress * 5;
    camera.position.y += (-easedProgress * 2 - camera.position.y) * 0.06;
  }

  renderer.render(scene, camera);
}

window.addEventListener('DOMContentLoaded', initThree);

