import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

/**
 * InfiniteCube3D - Resend Black Velvet 3D Infinite Nested Tesseract Cube
 * 
 * Features:
 * - 4 concentric nested cubes (Main outer cube -> Mid cube -> Inner cube -> Micro singularity core)
 * - Tesseract hypercube vertex connecting rays between nested dimensions
 * - Smooth gyroscopic animation with differential rotational speeds
 * - Interactive mouse orbital drag / hover parallax
 * - Threat-reactive color states (Iris Violet idle, Alarm Red threat, Pulse Green safe)
 */
export default function InfiniteCube3D({
  scanning = false,
  isThreat = null, // null: idle, true: threat detected, false: safe
  className = '',
}) {
  const containerRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 380;
    const height = container.clientHeight || 380;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 8.5);

    // 2. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // 3. Lighting (Subtle, sculptural)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const violetLight = new THREE.PointLight(0x9281f7, 2.5, 30);
    violetLight.position.set(6, 6, 6);
    scene.add(violetLight);

    const backLight = new THREE.PointLight(0x3b9eff, 1.2, 30);
    backLight.position.set(-6, -6, -4);
    scene.add(backLight);

    // 4. Master 3D Pivot Group
    const rootGroup = new THREE.Group();
    scene.add(rootGroup);

    // Colors mapping to Resend theme
    const COLOR_GRAPHITE = 0x292d30;
    const COLOR_VIOLET = 0x9281f7;
    const COLOR_VIOLET_GLOW = 0xbaa7ff;
    const COLOR_ALARM_RED = 0xff9592;
    const COLOR_SAFE_GREEN = 0x3ad389;

    // Helpers to create a wireframe cube with semi-transparent dark faces
    const createNestedCube = (size, edgeColor, faceOpacity = 0.08, lineWidth = 1) => {
      const group = new THREE.Group();

      // Hairline Edges
      const boxGeom = new THREE.BoxGeometry(size, size, size);
      const edgesGeom = new THREE.EdgesGeometry(boxGeom);
      const edgeMat = new THREE.LineBasicMaterial({
        color: edgeColor,
        transparent: true,
        opacity: 0.85,
        linewidth: lineWidth,
      });
      const wireframe = new THREE.LineSegments(edgesGeom, edgeMat);
      group.add(wireframe);

      // Matte dark glass faces
      const faceMat = new THREE.MeshPhysicalMaterial({
        color: 0x050505,
        roughness: 0.2,
        metalness: 0.8,
        transparent: true,
        opacity: faceOpacity,
        depthWrite: false,
      });
      const mesh = new THREE.Mesh(boxGeom, faceMat);
      group.add(mesh);

      // Corner vertex dots
      const sphereGeom = new THREE.SphereGeometry(size * 0.022, 12, 12);
      const dotMat = new THREE.MeshBasicMaterial({
        color: edgeColor,
        transparent: true,
        opacity: 0.9,
      });

      const half = size / 2;
      const cornerOffsets = [
        [-half, -half, -half], [half, -half, -half], [half, half, -half], [-half, half, -half],
        [-half, -half, half], [half, -half, half], [half, half, half], [-half, half, half],
      ];

      cornerOffsets.forEach(([x, y, z]) => {
        const dot = new THREE.Mesh(sphereGeom, dotMat);
        dot.position.set(x, y, z);
        group.add(dot);
      });

      return { group, edgeMat, faceMat, dotMat, size, wireframe };
    };

    // Construct 4 Concentric Nested Cubes (Infinite Recursive Tesseract)
    const cube0 = createNestedCube(3.4, COLOR_GRAPHITE, 0.06, 1.2); // Outer Main Cube
    const cube1 = createNestedCube(2.4, COLOR_VIOLET, 0.08, 1.0);   // Mid Nested Cube 1
    const cube2 = createNestedCube(1.5, COLOR_VIOLET_GLOW, 0.12, 1.0); // Inner Nested Cube 2
    const cube3 = createNestedCube(0.8, 0xffffff, 0.18, 1.0);       // Deep Core Cube 3

    rootGroup.add(cube0.group);
    rootGroup.add(cube1.group);
    rootGroup.add(cube2.group);
    rootGroup.add(cube3.group);

    // Glowing Central Singularity Micro-Cube
    const microGeom = new THREE.BoxGeometry(0.3, 0.3, 0.3);
    const microMat = new THREE.MeshBasicMaterial({
      color: COLOR_VIOLET,
      wireframe: true,
      transparent: true,
      opacity: 0.95,
    });
    const microCube = new THREE.Mesh(microGeom, microMat);
    rootGroup.add(microCube);

    // 5. Tesseract Hypercube Connectors (Outer vertices connected to Inner vertices)
    const tesseractLineGeom = new THREE.BufferGeometry();
    const tesseractLinePositions = new Float32Array(8 * 2 * 3); // 8 rays * 2 points * 3 coords
    const tesseractMat = new THREE.LineBasicMaterial({
      color: COLOR_VIOLET,
      transparent: true,
      opacity: 0.35,
    });
    const tesseractLines = new THREE.LineSegments(tesseractLineGeom, tesseractMat);
    rootGroup.add(tesseractLines);

    // Function to calculate connecting rays between cube 0 and cube 1
    const updateTesseractLines = () => {
      const half0 = cube0.size / 2;
      const half1 = cube1.size / 2;
      const corners = [
        [-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1],
        [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1],
      ];

      let idx = 0;
      corners.forEach(([cx, cy, cz]) => {
        // Point on Outer Cube
        tesseractLinePositions[idx++] = cx * half0;
        tesseractLinePositions[idx++] = cy * half0;
        tesseractLinePositions[idx++] = cz * half0;

        // Point on Inner Cube (accounting for differential rotation in local space)
        tesseractLinePositions[idx++] = cx * half1;
        tesseractLinePositions[idx++] = cy * half1;
        tesseractLinePositions[idx++] = cz * half1;
      });

      tesseractLineGeom.setAttribute('position', new THREE.BufferAttribute(tesseractLinePositions, 3));
      tesseractLineGeom.attributes.position.needsUpdate = true;
    };
    updateTesseractLines();

    // 6. Interactive Mouse Drag & Orbital Mechanics
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };
    let targetRotationX = 0.45;
    let targetRotationY = 0.55;

    const onMouseDown = (e) => {
      isDragging = true;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e) => {
      if (!isDragging) return;
      const deltaX = e.clientX - previousMousePosition.x;
      const deltaY = e.clientY - previousMousePosition.y;

      targetRotationY += deltaX * 0.008;
      targetRotationX += deltaY * 0.008;

      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    container.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    // 7. Animation Loop
    let animId;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Smooth damping toward target mouse rotation
      rootGroup.rotation.x += (targetRotationX - rootGroup.rotation.x) * 0.06;
      rootGroup.rotation.y += (targetRotationY - rootGroup.rotation.y) * 0.06;

      // Base Gyroscopic Continuous Spin
      if (!isDragging) {
        targetRotationY += 0.004;
        targetRotationX = 0.35 + Math.sin(elapsed * 0.5) * 0.15;
      }

      // Infinite Nested Cube Differential Rotations (The "Infinite Inward Dimension" effect)
      cube0.group.rotation.y = elapsed * 0.15;
      cube0.group.rotation.x = Math.sin(elapsed * 0.2) * 0.1;

      cube1.group.rotation.y = -elapsed * 0.28;
      cube1.group.rotation.z = elapsed * 0.18;

      cube2.group.rotation.x = elapsed * 0.35;
      cube2.group.rotation.y = elapsed * 0.25;

      cube3.group.rotation.z = -elapsed * 0.55;
      cube3.group.rotation.x = -elapsed * 0.35;

      microCube.rotation.x = elapsed * 1.2;
      microCube.rotation.y = elapsed * 1.5;

      // Sinusoidal Breathing / Floating Levitation
      const hoverFloat = Math.sin(elapsed * 1.6) * 0.12;
      rootGroup.position.y = hoverFloat;

      // Scanning Pulse Effect
      if (scanning) {
        const pulse = 1 + Math.sin(elapsed * 8) * 0.06;
        cube1.group.scale.set(pulse, pulse, pulse);
        cube2.group.scale.set(1 / pulse, 1 / pulse, 1 / pulse);
      } else {
        cube1.group.scale.set(1, 1, 1);
        cube2.group.scale.set(1, 1, 1);
      }

      // Threat Reactive State Updates
      let activeColor = COLOR_VIOLET;
      let activeGlow = COLOR_VIOLET_GLOW;

      if (isThreat === true) {
        activeColor = COLOR_ALARM_RED;
        activeGlow = COLOR_ALARM_RED;
      } else if (isThreat === false) {
        activeColor = COLOR_SAFE_GREEN;
        activeGlow = COLOR_SAFE_GREEN;
      }

      cube1.edgeMat.color.setHex(activeColor);
      cube1.dotMat.color.setHex(activeColor);
      cube2.edgeMat.color.setHex(activeGlow);
      cube2.dotMat.color.setHex(activeGlow);
      microMat.color.setHex(activeColor);
      tesseractMat.color.setHex(activeColor);
      violetLight.color.setHex(activeColor);

      renderer.render(scene, camera);
    };

    animate();

    // 8. Resize Handler
    const onResize = () => {
      const w = container.clientWidth || 380;
      const h = container.clientHeight || 380;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', onResize);

    // 9. Cleanup
    return () => {
      container.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('resize', onResize);
      cancelAnimationFrame(animId);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [scanning, isThreat]);

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative w-full h-[360px] md:h-[400px] flex items-center justify-center cursor-grab active:cursor-grabbing select-none ${className}`}
    >
      {/* Visual Telemetry HUD overlay */}
      <div className="absolute top-3 left-4 flex items-center space-x-2 font-mono text-[11px] text-[#a1a4a5] pointer-events-none">
        <span className="w-1.5 h-1.5 rounded-full bg-[#9281f7] animate-pulse" />
        <span className="text-[#f0f0f0] font-semibold">TESSERACT // LEVEL 4</span>
        <span className="text-[#464a4d]">|</span>
        <span className="text-[#9281f7]">60 FPS</span>
      </div>

      <div className="absolute bottom-3 right-4 font-mono text-[10px] text-[#464a4d] pointer-events-none">
        {isHovered ? 'DRAG TO ORBIT / ROTATE 3D MATRIX' : 'INTERACTIVE INFINITE CUBE'}
      </div>
    </div>
  );
}
