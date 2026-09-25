import * as THREE from 'three';

/**
 * Aegis 3D Threat Detection Particle System
 * Centerpiece WebGL experience representing real-time LLM prompt stream inspection.
 * - Dense, orderly stream of safe prompt particles.
 * - Anomalous threat particles that glow hazard red and get intercepted/neutralized by the shield.
 * - Mouse magnetic repulsion / interaction.
 * - Camera scroll parallax across landing page sections.
 * - Degrades gracefully on mobile and respects prefers-reduced-motion.
 */

export class ThreatDetectionScene {
  constructor(canvasElement, options = {}) {
    this.canvas = canvasElement;
    this.onLoadProgress = options.onLoadProgress || (() => {});
    this.onLoaded = options.onLoaded || (() => {});
    this.onIntercept = options.onIntercept || (() => {});

    // State & device detection
    this.isMobile = window.innerWidth < 768;
    this.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.particleCount = this.isMobile ? 600 : 1800;
    this.anomalyCount = this.isMobile ? 18 : 45;

    // Mouse & Scroll Tracking
    this.mouse = {
      x: 0,
      y: 0,
      targetX: 0,
      targetY: 0,
      worldX: 0,
      worldY: 0,
      isHovered: false,
    };
    this.scrollProgress = 0;
    this.targetScrollProgress = 0;
    this.clock = new THREE.Clock();
    this.interceptCounter = 14892;

    this.init();
  }

  async init() {
    this.onLoadProgress(15, 'Initializing WebGL Context...');

    // 1. Scene, Camera, Renderer
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x06080f, 0.008);

    const width = this.canvas.clientWidth || window.innerWidth;
    const height = this.canvas.clientHeight || window.innerHeight;

    this.camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 1000);
    this.camera.position.set(0, 0, 48);
    this.baseCameraPos = new THREE.Vector3(0, 0, 48);

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      alpha: true,
      antialias: !this.isMobile,
      powerPreference: 'high-performance',
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, this.isMobile ? 1.2 : 2));

    this.onLoadProgress(40, 'Generating Particle Stream & Neural Grid...');
    await new Promise((r) => setTimeout(r, 60));

    // 2. Build 3D Components
    this.createShieldBarrier();
    this.createParticleField();
    this.createShockwaveRings();
    this.createAmbientLights();

    this.onLoadProgress(80, 'Calibrating Optical Interceptor Matrix...');
    await new Promise((r) => setTimeout(r, 80));

    // 3. Event Listeners
    this.bindEvents();

    this.onLoadProgress(100, 'Security Engine Online');
    await new Promise((r) => setTimeout(r, 120));
    this.onLoaded();

    // 4. Start Animation Loop
    this.animate();
  }

  createAmbientLights() {
    const amb = new THREE.AmbientLight(0xffffff, 0.8);
    this.scene.add(amb);

    this.shieldLight = new THREE.PointLight(0x00f0ff, 3, 50);
    this.shieldLight.position.set(0, 0, 0);
    this.scene.add(this.shieldLight);

    this.hazardLight = new THREE.PointLight(0xff3366, 0, 40);
    this.hazardLight.position.set(0, 0, 2);
    this.scene.add(this.hazardLight);
  }

  createShieldBarrier() {
    this.shieldGroup = new THREE.Group();
    this.scene.add(this.shieldGroup);

    // Outer Hexagonal Guard Ring
    const hexGeom = new THREE.RingGeometry(7.2, 7.35, 6);
    const hexMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.65,
    });
    this.hexRing = new THREE.Mesh(hexGeom, hexMat);
    this.shieldGroup.add(this.hexRing);

    // Concentric Circular Orbit Rings
    const ring1Geom = new THREE.TorusGeometry(8.5, 0.04, 16, 90);
    const ring1Mat = new THREE.MeshBasicMaterial({
      color: 0x6366f1,
      transparent: true,
      opacity: 0.55,
    });
    this.ring1 = new THREE.Mesh(ring1Geom, ring1Mat);
    this.ring1.rotation.x = Math.PI / 3;
    this.shieldGroup.add(this.ring1);

    const ring2Geom = new THREE.TorusGeometry(6.0, 0.035, 16, 80);
    const ring2Mat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      transparent: true,
      opacity: 0.75,
    });
    this.ring2 = new THREE.Mesh(ring2Geom, ring2Mat);
    this.ring2.rotation.y = Math.PI / 4;
    this.shieldGroup.add(this.ring2);

    // Central Wireframe Detection Core (Icosahedron)
    const coreGeom = new THREE.IcosahedronGeometry(3.2, 1);
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      wireframe: true,
      transparent: true,
      opacity: 0.4,
    });
    this.shieldCore = new THREE.Mesh(coreGeom, coreMat);
    this.shieldGroup.add(this.shieldCore);

    // Scanning Crosshair / Laser Plane
    const laserGeom = new THREE.PlaneGeometry(16, 0.08);
    const laserMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
    });
    this.laserBar = new THREE.Mesh(laserGeom, laserMat);
    this.shieldGroup.add(this.laserBar);
  }

  createShockwaveRings() {
    this.shockwaves = [];
    const geom = new THREE.RingGeometry(0.5, 0.8, 48);

    for (let i = 0; i < 3; i++) {
      const mat = new THREE.MeshBasicMaterial({
        color: 0x10b981,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
      });
      const mesh = new THREE.Mesh(geom, mat);
      mesh.position.set(0, 0, 0.5);
      this.scene.add(mesh);
      this.shockwaves.push({ mesh, scale: 1, maxScale: 14, active: false, colorType: 'safe' });
    }
  }

  triggerShockwave(colorHex = 0x10b981) {
    const wave = this.shockwaves.find((w) => !w.active);
    if (!wave) return;
    wave.active = true;
    wave.scale = 1;
    wave.mesh.scale.set(1, 1, 1);
    wave.mesh.material.color.setHex(colorHex);
    wave.mesh.material.opacity = 0.9;
  }

  createParticleField() {
    const total = this.particleCount;
    this.particlePositions = new Float32Array(total * 3);
    this.particleColors = new Float32Array(total * 3);
    this.particleSizes = new Float32Array(total);
    this.particleData = [];

    // Colors
    const colorSafe1 = new THREE.Color(0x00f0ff); // Electric cyan
    const colorSafe2 = new THREE.Color(0x6366f1); // Indigo
    const colorSafe3 = new THREE.Color(0x38bdf8); // Light sky cyan
    const colorThreat = new THREE.Color(0xff3366); // Alert red/crimson
    const colorAmber = new THREE.Color(0xf59e0b); // Warning amber

    for (let i = 0; i < total; i++) {
      const isAnomaly = i < this.anomalyCount;

      // Distribution: Flowing volumetric cylinder / stream toward camera
      const radius = 2.5 + Math.random() * 24;
      const angle = Math.random() * Math.PI * 2;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius * 0.75;
      const z = (Math.random() - 0.5) * 120; // Flow depth from -60 to +60

      this.particlePositions[i * 3] = x;
      this.particlePositions[i * 3 + 1] = y;
      this.particlePositions[i * 3 + 2] = z;

      let color;
      if (isAnomaly) {
        color = Math.random() > 0.3 ? colorThreat : colorAmber;
      } else {
        const rand = Math.random();
        color = rand < 0.45 ? colorSafe1 : rand < 0.75 ? colorSafe3 : colorSafe2;
      }

      this.particleColors[i * 3] = color.r;
      this.particleColors[i * 3 + 1] = color.g;
      this.particleColors[i * 3 + 2] = color.b;

      this.particleSizes[i] = isAnomaly ? 4.5 + Math.random() * 2 : 2.5 + Math.random() * 2;

      this.particleData.push({
        baseX: x,
        baseY: y,
        speedZ: isAnomaly ? 0.35 + Math.random() * 0.3 : 0.15 + Math.random() * 0.2,
        isAnomaly,
        intercepted: false,
        interceptProgress: 0,
        originalColor: color.clone(),
        currentSize: this.particleSizes[i],
        oscillationSpeed: 0.5 + Math.random() * 1.5,
        oscillationAngle: Math.random() * Math.PI * 2,
      });
    }

    this.particleGeometry = new THREE.BufferGeometry();
    this.particleGeometry.setAttribute('position', new THREE.BufferAttribute(this.particlePositions, 3));
    this.particleGeometry.setAttribute('color', new THREE.BufferAttribute(this.particleColors, 3));
    this.particleGeometry.setAttribute('size', new THREE.BufferAttribute(this.particleSizes, 1));

    // Custom Particle Texture (Sharp soft circular glow)
    const particleTexture = this.generateParticleTexture();

    this.particleMaterial = new THREE.PointsMaterial({
      size: 3.5,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      map: particleTexture,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    this.particleSystem = new THREE.Points(this.particleGeometry, this.particleMaterial);
    this.scene.add(this.particleSystem);
  }

  generateParticleTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');

    const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    grad.addColorStop(0.2, 'rgba(255, 255, 255, 0.85)');
    grad.addColorStop(0.5, 'rgba(0, 240, 255, 0.4)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 64, 64);

    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  }

  bindEvents() {
    // Mouse movement
    const onMouseMove = (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;

      this.mouse.targetX = (x - 0.5) * 2;
      this.mouse.targetY = -(y - 0.5) * 2;
      this.mouse.isHovered = true;

      // Project mouse to approximate 3D world plane at Z=0
      this.mouse.worldX = this.mouse.targetX * 24;
      this.mouse.worldY = this.mouse.targetY * 18;
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });

    // Touch support (mild drag influence)
    window.addEventListener(
      'touchmove',
      (e) => {
        if (e.touches.length > 0) {
          const t = e.touches[0];
          const x = t.clientX / window.innerWidth;
          const y = t.clientY / window.innerHeight;
          this.mouse.targetX = (x - 0.5) * 1.2;
          this.mouse.targetY = -(y - 0.5) * 1.2;
        }
      },
      { passive: true }
    );

    // Scroll parallax tracking
    const onScroll = () => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      this.targetScrollProgress = maxScroll > 0 ? window.scrollY / maxScroll : 0;
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // Window Resize Observer
    const onResize = () => {
      const width = this.canvas.clientWidth || window.innerWidth;
      const height = this.canvas.clientHeight || window.innerHeight;

      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(width, height);
    };

    window.addEventListener('resize', onResize);
    this.resizeHandler = onResize;
  }

  animate() {
    this.animId = requestAnimationFrame(() => this.animate());

    const delta = Math.min(this.clock.getDelta(), 0.1);
    const elapsed = this.clock.getElapsedTime();

    // Interpolate mouse & scroll smoothing
    this.mouse.x += (this.mouse.targetX - this.mouse.x) * 0.05;
    this.mouse.y += (this.mouse.targetY - this.mouse.y) * 0.05;
    this.scrollProgress += (this.targetScrollProgress - this.scrollProgress) * 0.08;

    // 1. Camera Parallax based on Scroll & Mouse
    if (!this.prefersReducedMotion) {
      const scrollYOffset = this.scrollProgress * 22;
      const scrollZOffset = Math.sin(this.scrollProgress * Math.PI) * 12;

      this.camera.position.x = this.baseCameraPos.x + this.mouse.x * 3.5;
      this.camera.position.y = this.baseCameraPos.y + this.mouse.y * 2.5 - scrollYOffset;
      this.camera.position.z = this.baseCameraPos.z - scrollZOffset;

      this.camera.lookAt(
        this.mouse.x * 1.5,
        -scrollYOffset * 0.8,
        0
      );
    }

    // 2. Shield Rotations & Laser Scanning
    if (this.shieldGroup) {
      this.shieldGroup.rotation.y = elapsed * 0.25;
      this.shieldGroup.rotation.x = Math.sin(elapsed * 0.4) * 0.15;

      this.ring1.rotation.z += delta * 0.4;
      this.ring2.rotation.x -= delta * 0.35;
      this.hexRing.rotation.z -= delta * 0.2;

      this.shieldCore.rotation.x += delta * 0.5;
      this.shieldCore.rotation.y += delta * 0.7;

      // Laser bar sweep
      this.laserBar.position.y = Math.sin(elapsed * 3.5) * 5.5;
      this.laserBar.rotation.z = Math.cos(elapsed * 2.0) * 0.1;
    }

    // 3. Shockwave expansion
    this.shockwaves.forEach((wave) => {
      if (wave.active) {
        wave.scale += delta * 18;
        wave.mesh.scale.set(wave.scale, wave.scale, wave.scale);
        wave.mesh.material.opacity = Math.max(0, 0.9 - wave.scale / wave.maxScale);

        if (wave.scale >= wave.maxScale) {
          wave.active = false;
          wave.mesh.material.opacity = 0;
        }
      }
    });

    // 4. Particle Field Dynamics & Interception Logic
    const positions = this.particlePositions;
    const colors = this.particleColors;
    const count = this.particleCount;

    const mouseWorldX = this.mouse.worldX;
    const mouseWorldY = this.mouse.worldY;
    const repelRadius = this.isMobile ? 0 : 8.0;

    let interceptedThisFrame = false;

    for (let i = 0; i < count; i++) {
      const data = this.particleData[i];
      let x = positions[i * 3];
      let y = positions[i * 3 + 1];
      let z = positions[i * 3 + 2];

      // Advance particle along Z axis
      const speed = this.prefersReducedMotion ? 0.05 : data.speedZ;
      z += speed;

      // Subtle organic sway
      data.oscillationAngle += delta * data.oscillationSpeed;
      x = data.baseX + Math.sin(data.oscillationAngle) * 0.4;
      y = data.baseY + Math.cos(data.oscillationAngle) * 0.3;

      // Mouse Repulsion Field (attract/repel subtly when mouse is over canvas)
      if (repelRadius > 0 && Math.abs(z) < 25) {
        const dx = x - mouseWorldX;
        const dy = y - mouseWorldY;
        const distSq = dx * dx + dy * dy;

        if (distSq < repelRadius * repelRadius && distSq > 0.01) {
          const dist = Math.sqrt(distSq);
          const force = (1 - dist / repelRadius) * 1.5;
          x += (dx / dist) * force;
          y += (dy / dist) * force;
        }
      }

      // --- Threat Interception Logic ---
      if (data.isAnomaly) {
        // When anomaly crosses the Shield Barrier zone (Z around 0)
        const distFromShieldCenter = Math.sqrt(x * x + y * y);

        if (!data.intercepted && Math.abs(z) < 3.0 && distFromShieldCenter < 9.5) {
          // INTERCEPTED!
          data.intercepted = true;
          data.interceptProgress = 1.0;
          interceptedThisFrame = true;

          // Shift color to bright neutralized emerald green / white flash
          colors[i * 3] = 0.06;
          colors[i * 3 + 1] = 0.95;
          colors[i * 3 + 2] = 0.6;

          this.triggerShockwave(0x10b981);
          this.interceptCounter++;
          this.onIntercept({
            totalIntercepted: this.interceptCounter,
            x,
            y,
          });

          // Flash hazard light briefly
          if (this.hazardLight) {
            this.hazardLight.intensity = 2.5;
          }
        }

        // Dissolve/neutralize particle when intercepted
        if (data.intercepted) {
          data.interceptProgress -= delta * 2.0;
          x += (Math.random() - 0.5) * 0.3;
          y += (Math.random() - 0.5) * 0.3;

          if (data.interceptProgress <= 0) {
            // Respawn behind the stream
            z = -60 - Math.random() * 20;
            data.intercepted = false;
            // Restore original red/amber threat color
            colors[i * 3] = data.originalColor.r;
            colors[i * 3 + 1] = data.originalColor.g;
            colors[i * 3 + 2] = data.originalColor.b;
          }
        }
      }

      // Loop particles when they flow past the camera
      if (z > 50) {
        z = -60 - Math.random() * 15;
        data.intercepted = false;
        if (data.isAnomaly) {
          colors[i * 3] = data.originalColor.r;
          colors[i * 3 + 1] = data.originalColor.g;
          colors[i * 3 + 2] = data.originalColor.b;
        }
      }

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;
    }

    // Decay hazard light
    if (this.hazardLight && this.hazardLight.intensity > 0) {
      this.hazardLight.intensity -= delta * 4;
      if (this.hazardLight.intensity < 0) this.hazardLight.intensity = 0;
    }

    this.particleGeometry.attributes.position.needsUpdate = true;
    this.particleGeometry.attributes.color.needsUpdate = true;

    // Render Scene
    this.renderer.render(this.scene, this.camera);
  }

  destroy() {
    if (this.animId) cancelAnimationFrame(this.animId);
    window.removeEventListener('resize', this.resizeHandler);
    if (this.renderer) {
      this.renderer.dispose();
    }
  }
}
