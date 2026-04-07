"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function HeroAnimation() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, canvas.clientWidth / canvas.clientHeight, 0.1, 200);
    camera.position.set(0, 0, 30);

    // ── Palette Momento : nuit profonde → or chaud → terracotta ──
    const COLORS_TOP    = new THREE.Color("#0d0620"); // violet nuit
    const COLORS_MID    = new THREE.Color("#c9784c"); // terracotta
    const COLORS_BOTTOM = new THREE.Color("#f0c060"); // or chaud

    // ── Fond dégradé via shader plane ──
    const bgGeo = new THREE.PlaneGeometry(200, 200);
    const bgMat = new THREE.ShaderMaterial({
      uniforms: { uTime: { value: 0 } },
      vertexShader: `
        varying vec2 vUv;
        void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
      `,
      fragmentShader: `
        uniform float uTime;
        varying vec2 vUv;
        void main() {
          vec3 top    = vec3(0.05, 0.02, 0.13);
          vec3 mid    = vec3(0.79, 0.47, 0.30);
          vec3 bottom = vec3(0.94, 0.75, 0.38);
          float wave  = sin(vUv.x * 3.14 + uTime * 0.3) * 0.05;
          float t = clamp(vUv.y + wave, 0.0, 1.0);
          vec3 color  = mix(bottom, mix(mid, top, smoothstep(0.4, 0.9, t)), smoothstep(0.0, 0.5, t));
          gl_FragColor = vec4(color, 1.0);
        }
      `,
      depthWrite: false,
    });
    const bg = new THREE.Mesh(bgGeo, bgMat);
    bg.position.z = -20;
    scene.add(bg);

    // ── Particules flottantes ──
    const COUNT = 600;
    const positions = new Float32Array(COUNT * 3);
    const velocities: number[] = [];
    const sizes = new Float32Array(COUNT);
    const colors = new Float32Array(COUNT * 3);

    for (let i = 0; i < COUNT; i++) {
      positions[i * 3]     = (Math.random() - 0.5) * 60;
      positions[i * 3 + 1] = Math.random() * 60 - 10;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 20;
      velocities.push(-0.02 - Math.random() * 0.06, (Math.random() - 0.5) * 0.01, 0);
      sizes[i] = 0.5 + Math.random() * 2.5;

      // Couleur basée sur la position Y : haut = violet, bas = or
      const t = (positions[i * 3 + 1] + 10) / 60;
      const c = new THREE.Color().lerpColors(COLORS_BOTTOM, COLORS_TOP, t);
      colors[i * 3]     = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    geo.setAttribute("size", new THREE.BufferAttribute(sizes, 1));

    const mat = new THREE.ShaderMaterial({
      uniforms: { uTime: { value: 0 } },
      vertexShader: `
        attribute float size;
        attribute vec3 color;
        varying vec3 vColor;
        varying float vAlpha;
        uniform float uTime;
        void main() {
          vColor = color;
          vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
          float dist = length(mvPos.xyz);
          vAlpha = smoothstep(30.0, 5.0, dist) * 0.9;
          gl_PointSize = size * (400.0 / -mvPos.z);
          gl_Position = projectionMatrix * mvPos;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        varying float vAlpha;
        void main() {
          float d = length(gl_PointCoord - vec2(0.5));
          if (d > 0.5) discard;
          float glow = 1.0 - smoothstep(0.1, 0.5, d);
          gl_FragColor = vec4(vColor, glow * vAlpha);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexColors: true,
    });

    const particles = new THREE.Points(geo, mat);
    scene.add(particles);

    // ── Anneaux 3D flottants ──
    const rings: THREE.Mesh[] = [];
    for (let i = 0; i < 5; i++) {
      const rGeo = new THREE.TorusGeometry(2 + i * 1.5, 0.06, 16, 80);
      const rMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color().lerpColors(COLORS_BOTTOM, COLORS_MID, i / 5),
        transparent: true,
        opacity: 0.15 + i * 0.05,
      });
      const ring = new THREE.Mesh(rGeo, rMat);
      ring.position.set((Math.random() - 0.5) * 20, 10 - i * 8, -5 + i * 2);
      ring.rotation.x = Math.random() * Math.PI;
      ring.rotation.z = Math.random() * Math.PI;
      scene.add(ring);
      rings.push(ring);
    }

    // ── Animation ──
    let frame = 0;
    const animate = () => {
      frame++;
      const t = frame * 0.01;

      bgMat.uniforms.uTime.value = t;
      mat.uniforms.uTime.value = t;

      // Descente des particules
      const pos = geo.attributes.position.array as Float32Array;
      const col = geo.attributes.color.array as Float32Array;
      for (let i = 0; i < COUNT; i++) {
        pos[i * 3 + 1] += velocities[i * 3 + 1] - 0.04;
        pos[i * 3]     += Math.sin(t + i) * 0.005;

        // Reset en haut quand sort par le bas
        if (pos[i * 3 + 1] < -35) {
          pos[i * 3 + 1] = 30;
          pos[i * 3]     = (Math.random() - 0.5) * 60;
        }

        // Mise à jour couleur selon Y
        const y = (pos[i * 3 + 1] + 10) / 60;
        const c = new THREE.Color().lerpColors(COLORS_BOTTOM, COLORS_TOP, Math.max(0, Math.min(1, y)));
        col[i * 3]     = c.r;
        col[i * 3 + 1] = c.g;
        col[i * 3 + 2] = c.b;
      }
      geo.attributes.position.needsUpdate = true;
      geo.attributes.color.needsUpdate = true;

      // Rotation douce des anneaux
      rings.forEach((ring, i) => {
        ring.rotation.x += 0.002 + i * 0.001;
        ring.rotation.y += 0.003 - i * 0.001;
        ring.position.y -= 0.01;
        if (ring.position.y < -30) ring.position.y = 20;
      });

      renderer.render(scene, camera);
      rafId = requestAnimationFrame(animate);
    };

    let rafId = requestAnimationFrame(animate);

    // Resize
    const onResize = () => {
      if (!canvas) return;
      renderer.setSize(canvas.clientWidth, canvas.clientHeight);
      camera.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.updateProjectionMatrix();
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ display: "block" }}
    />
  );
}
