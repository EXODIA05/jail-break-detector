import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * CyberBackground3D - Minimalist Emerald Constellation Background
 * Deep black space with subtle green particle depth and smooth parallax.
 */
export default function CyberBackground3D() {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const width = window.innerWidth;
    const height = window.innerHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, width / height, 1, 1000);
    camera.position.z = 400;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    mount.appendChild(renderer.domElement);

    // Particle constellation in Resend Iris Violet & Ash
    const count = 280;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    const c1 = new THREE.Color(0x9281f7); // Iris Violet
    const c2 = new THREE.Color(0xbaa7ff); // Iris Glow
    const c3 = new THREE.Color(0x464a4d); // Charcoal/Graphite

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 1400;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 1100;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 900;

      const pick = Math.random();
      const col = pick < 0.4 ? c1 : pick < 0.65 ? c2 : c3;
      colors[i * 3] = col.r;
      colors[i * 3 + 1] = col.g;
      colors[i * 3 + 2] = col.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 2.8,
      vertexColors: true,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending,
    });

    const pointCloud = new THREE.Points(geometry, material);
    scene.add(pointCloud);

    // Subtle mouse parallax
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const onMouseMove = (e) => {
      targetX = (e.clientX - width / 2) * 0.05;
      targetY = (e.clientY - height / 2) * 0.05;
    };

    window.addEventListener('mousemove', onMouseMove);

    let animId;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      mouseX += (targetX - mouseX) * 0.03;
      mouseY += (targetY - mouseY) * 0.03;

      pointCloud.rotation.y = elapsed * 0.02 + mouseX * 0.001;
      pointCloud.rotation.x = mouseY * 0.001;

      renderer.render(scene, camera);
    };

    animate();

    const onResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', onResize);
      cancelAnimationFrame(animId);
      if (mount && renderer.domElement) {
        mount.removeChild(renderer.domElement);
      }
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []);

  return <div ref={mountRef} className="fixed inset-0 pointer-events-none z-0 opacity-80" />;
}
