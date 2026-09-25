import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * CyberShield3D - Interactive WebGL 3D Holographic Cyber Defense Matrix
 * Uses Three.js to render an animated 3D core, orbital quantum rings,
 * particle cloud, and responsive laser scanning effects.
 */
export default function CyberShield3D({
  scanning = false,
  isThreat = null, // null: idle, true: threat detected, false: safe
  className = '',
}) {
  const containerRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Dimensions
    const width = container.clientWidth || 320;
    const height = container.clientHeight || 320;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 7;

    // 2. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // 3. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0x6366f1, 2.5, 50);
    pointLight1.position.set(5, 5, 5);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x06b6d4, 2.0, 50);
    pointLight2.position.set(-5, -5, -3);
    scene.add(pointLight2);

    const coreLight = new THREE.PointLight(0x8b5cf6, 3, 15);
    coreLight.position.set(0, 0, 0);
    scene.add(coreLight);

    // 4. Main 3D Pivot Group
    const rootGroup = new THREE.Group();
    scene.add(rootGroup);

    // 4a. Inner Holographic Core (Icosahedron + Wireframe Cage)
    const innerGeom = new THREE.IcosahedronGeometry(1.35, 1);
    const innerMat = new THREE.MeshPhongMaterial({
      color: 0x4f46e5,
      emissive: 0x312e81,
      wireframe: false,
      transparent: true,
      opacity: 0.85,
      shininess: 90,
      flatShading: true,
    });
    const innerCore = new THREE.Mesh(innerGeom, innerMat);
    rootGroup.add(innerCore);

    // Wireframe Outer Cage
    const cageGeom = new THREE.IcosahedronGeometry(1.5, 2);
    const cageMat = new THREE.MeshBasicMaterial({
      color: 0x818cf8,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
    });
    const outerCage = new THREE.Mesh(cageGeom, cageMat);
    rootGroup.add(outerCage);

    // Inner Glowing Nucleus
    const nucleusGeom = new THREE.SphereGeometry(0.65, 32, 32);
    const nucleusMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.9,
    });
    const nucleus = new THREE.Mesh(nucleusGeom, nucleusMat);
    rootGroup.add(nucleus);

    // 4b. Orbital Shield Rings
    const rings = [];

    // Ring 1 - Outer Torus
    const ring1Geom = new THREE.TorusGeometry(2.1, 0.025, 16, 100);
    const ring1Mat = new THREE.MeshBasicMaterial({
      color: 0x6366f1,
      transparent: true,
      opacity: 0.7,
    });
    const ring1 = new THREE.Mesh(ring1Geom, ring1Mat);
    ring1.rotation.x = Math.PI / 3;
    ring1.rotation.y = Math.PI / 6;
    rootGroup.add(ring1);
    rings.push({ mesh: ring1, rx: 0.008, ry: 0.012, rz: 0.005 });

    // Ring 2 - Equatorial Cyber Ring
    const ring2Geom = new THREE.TorusGeometry(2.4, 0.02, 16, 100);
    const ring2Mat = new THREE.MeshBasicMaterial({
      color: 0x06b6d4,
      transparent: true,
      opacity: 0.6,
    });
    const ring2 = new THREE.Mesh(ring2Geom, ring2Mat);
    ring2.rotation.x = -Math.PI / 4;
    ring2.rotation.z = Math.PI / 5;
    rootGroup.add(ring2);
    rings.push({ mesh: ring2, rx: -0.01, ry: 0.007, rz: 0.015 });

    // Ring 3 - Polar Hex Ring
    const ring3Geom = new THREE.RingGeometry(2.65, 2.7, 6);
    const ring3Mat = new THREE.MeshBasicMaterial({
      color: 0xa855f7,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.45,
    });
    const ring3 = new THREE.Mesh(ring3Geom, ring3Mat);
    ring3.rotation.x = Math.PI / 2.2;
    rootGroup.add(ring3);
    rings.push({ mesh: ring3, rx: 0.005, ry: -0.015, rz: 0.008 });

    // 4c. Particle Constellation Cloud (Cyber Dust)
    const particleCount = 280;
    const particlePositions = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);
    const pColor1 = new THREE.Color(0x6366f1);
    const pColor2 = new THREE.Color(0x06b6d4);

    for (let i = 0; i < particleCount; i++) {
      const radius = 2.0 + Math.random() * 2.2;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      particlePositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      particlePositions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      particlePositions[i * 3 + 2] = radius * Math.cos(phi);

      const mixed = pColor1.clone().lerp(pColor2, Math.random());
      particleColors[i * 3] = mixed.r;
      particleColors[i * 3 + 1] = mixed.g;
      particleColors[i * 3 + 2] = mixed.b;
    }

    const particleGeom = new THREE.BufferGeometry();
    particleGeom.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    particleGeom.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 0.075,
      vertexColors: true,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(particleGeom, particleMat);
    rootGroup.add(particles);

    // 4d. Scanning Laser Plane Mesh
    const laserGeom = new THREE.PlaneGeometry(5.5, 0.06);
    const laserMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.0,
      blending: THREE.AdditiveBlending,
    });
    const laserPlane = new THREE.Mesh(laserGeom, laserMat);
    rootGroup.add(laserPlane);

    // 5. Mouse Parallax Handler
    const handleMouseMove = (e) => {
      const rect = container.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      mouseRef.current.targetX = x * 1.5;
      mouseRef.current.targetY = y * 1.5;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // 6. Animation Loop
    let animId;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // Smooth mouse lerping
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.05;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.05;

      rootGroup.rotation.y = mouseRef.current.x * 0.8 + elapsed * 0.2;
      rootGroup.rotation.x = -mouseRef.current.y * 0.8;

      // Base rotations
      innerCore.rotation.x += delta * 0.4;
      innerCore.rotation.y += delta * 0.6;
      outerCage.rotation.x -= delta * 0.25;
      outerCage.rotation.y -= delta * 0.35;
      particles.rotation.y -= delta * 0.12;

      // Rotate orbital rings
      rings.forEach((r) => {
        const speedMultiplier = scanning ? 3.5 : 1.0;
        r.mesh.rotation.x += r.rx * speedMultiplier;
        r.mesh.rotation.y += r.ry * speedMultiplier;
        r.mesh.rotation.z += r.rz * speedMultiplier;
      });

      // State-specific behavior & Colors
      if (scanning) {
        // Scanning acceleration & laser sweep
        innerCore.rotation.x += delta * 2.5;
        innerCore.rotation.y += delta * 3.5;
        laserMat.opacity = 0.85;
        laserPlane.position.y = Math.sin(elapsed * 6) * 1.8;
        laserPlane.rotation.z = Math.sin(elapsed * 3) * 0.2;

        innerMat.color.setHex(0x38bdf8);
        innerMat.emissive.setHex(0x0284c7);
        coreLight.color.setHex(0x38bdf8);
        cageMat.color.setHex(0x7dd3fc);
      } else if (isThreat === true) {
        // Threat alert state (Crimson hazard red)
        laserMat.opacity = 0;
        const pulse = Math.sin(elapsed * 8) * 0.15 + 1.0;
        innerCore.scale.set(pulse, pulse, pulse);
        nucleus.scale.set(pulse * 1.2, pulse * 1.2, pulse * 1.2);

        innerMat.color.setHex(0xf43f5e);
        innerMat.emissive.setHex(0xbe123c);
        coreLight.color.setHex(0xf43f5e);
        cageMat.color.setHex(0xfb7185);
        nucleusMat.color.setHex(0xffffff);

        ring1Mat.color.setHex(0xf43f5e);
        ring2Mat.color.setHex(0xe11d48);
      } else if (isThreat === false) {
        // Verified clean state (Emerald green)
        laserMat.opacity = 0;
        const pulse = Math.sin(elapsed * 2.5) * 0.05 + 1.0;
        innerCore.scale.set(pulse, pulse, pulse);
        nucleus.scale.set(pulse, pulse, pulse);

        innerMat.color.setHex(0x10b981);
        innerMat.emissive.setHex(0x047857);
        coreLight.color.setHex(0x10b981);
        cageMat.color.setHex(0x34d399);
        nucleusMat.color.setHex(0xffffff);

        ring1Mat.color.setHex(0x10b981);
        ring2Mat.color.setHex(0x059669);
      } else {
        // Idle state (Deep indigo & cyan)
        laserMat.opacity = 0;
        innerCore.scale.set(1, 1, 1);
        nucleus.scale.set(1, 1, 1);

        innerMat.color.setHex(0x4f46e5);
        innerMat.emissive.setHex(0x312e81);
        coreLight.color.setHex(0x8b5cf6);
        cageMat.color.setHex(0x818cf8);
        nucleusMat.color.setHex(0xffffff);

        ring1Mat.color.setHex(0x6366f1);
        ring2Mat.color.setHex(0x06b6d4);
      }

      renderer.render(scene, camera);
    };

    animate();

    // 7. Responsive Resize Observer
    const handleResize = () => {
      if (!container) return;
      const newW = container.clientWidth;
      const newH = container.clientHeight;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    // 8. Cleanup
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', handleMouseMove);
      resizeObserver.disconnect();
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      innerGeom.dispose();
      innerMat.dispose();
      cageGeom.dispose();
      cageMat.dispose();
      nucleusGeom.dispose();
      nucleusMat.dispose();
      ring1Geom.dispose();
      ring1Mat.dispose();
      ring2Geom.dispose();
      ring2Mat.dispose();
      ring3Geom.dispose();
      ring3Mat.dispose();
      particleGeom.dispose();
      particleMat.dispose();
      laserGeom.dispose();
      laserMat.dispose();
    };
  }, [scanning, isThreat]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-[320px] flex items-center justify-center pointer-events-none select-none ${className}`}
    />
  );
}
