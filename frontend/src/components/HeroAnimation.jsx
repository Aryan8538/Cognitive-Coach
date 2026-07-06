"use client";

import { useEffect, useRef } from "react";

export default function HeroAnimation() {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId;
    let width = 0;
    let height = 0;

    // Adjust canvas resolution for high-DPI screens
    const resize = () => {
      const rect = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      width = rect.width;
      height = rect.height;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.scale(dpr, dpr);
    };

    resize();
    window.addEventListener("resize", resize);

    // 3D Sphere generation configuration
    let radius = Math.min(width, height, 420) * 0.38;
    const rings = 14;
    const sectors = 22;

    const vertices = [];
    for (let r = 0; r <= rings; r++) {
      const phi = (r * Math.PI) / rings;
      for (let s = 0; s < sectors; s++) {
        const theta = (s * 2 * Math.PI) / sectors;
        const x = Math.sin(phi) * Math.cos(theta);
        const y = Math.cos(phi);
        const z = Math.sin(phi) * Math.sin(theta);
        vertices.push({ x, y, z });
      }
    }

    // 3D Particles system setup
    const particleCount = 50;
    const particles = [];
    for (let i = 0; i < particleCount; i++) {
      const angle1 = Math.random() * Math.PI * 2;
      const angle2 = Math.random() * Math.PI;
      const distance = 1.1 + Math.random() * 0.7; // Float around outside of the sphere
      particles.push({
        x: distance * Math.sin(angle2) * Math.cos(angle1),
        y: distance * Math.cos(angle2),
        z: distance * Math.sin(angle2) * Math.sin(angle1),
        size: 1 + Math.random() * 1.5,
        speed: 0.001 + Math.random() * 0.002,
        phase: Math.random() * Math.PI * 2,
      });
    }

    let angleY = 0;
    let angleX = 0;
    const perspective = 800;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;
      
      // Update dynamic radius based on resize width
      const activeRadius = Math.min(width, height, 420) * 0.38;

      // Detect dark theme dynamically from document classList
      const isDark = typeof document !== "undefined" && document.documentElement.classList.contains("dark");
      const colorPrefix = isDark ? "212, 175, 55" : "139, 92, 246"; // Gold vs Violet
      const particleColorPrefix = isDark ? "244, 212, 114" : "139, 92, 246"; // Gold/Yellow vs Violet

      // 1. Draw smooth central ambient glow behind the sphere
      const radialGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, activeRadius * 1.8);
      if (isDark) {
        radialGlow.addColorStop(0, "rgba(212, 175, 55, 0.12)");
        radialGlow.addColorStop(0.5, "rgba(212, 175, 55, 0.03)");
        radialGlow.addColorStop(1, "rgba(212, 175, 55, 0)");
      } else {
        radialGlow.addColorStop(0, "rgba(139, 92, 246, 0.10)");
        radialGlow.addColorStop(0.5, "rgba(139, 92, 246, 0.02)");
        radialGlow.addColorStop(1, "rgba(139, 92, 246, 0)");
      }
      ctx.fillStyle = radialGlow;
      ctx.beginPath();
      ctx.arc(cx, cy, activeRadius * 1.8, 0, Math.PI * 2);
      ctx.fill();

      // Rotate angles
      angleY += 0.002;
      angleX += 0.001;

      const cosY = Math.cos(angleY);
      const sinY = Math.sin(angleY);
      const cosX = Math.cos(angleX);
      const sinX = Math.sin(angleX);

      // Projects 3D points with rotation and perspective
      const project = (point, scaleFactor = activeRadius) => {
        const sx = point.x * scaleFactor;
        const sy = point.y * scaleFactor;
        const sz = point.z * scaleFactor;

        // Rotate around Y-axis
        const x1 = sx * cosY - sz * sinY;
        const z1 = sx * sinY + sz * cosY;

        // Rotate around X-axis
        const y2 = sy * cosX - z1 * sinX;
        const z2 = sy * sinX + z1 * cosX;

        // Perspective projection
        const scale = perspective / (perspective + z2);
        const px = cx + x1 * scale;
        const py = cy + y2 * scale;

        return { x: px, y: py, z: z2 };
      };

      // Project all vertices
      const projectedVertices = vertices.map((v) => project(v));

      // Separate render objects into back side (z > 0) and front side (z <= 0)
      const backQueue = [];
      const frontQueue = [];

      // Collect horizontal segments
      for (let r = 0; r <= rings; r++) {
        for (let s = 0; s < sectors; s++) {
          const idx1 = r * sectors + s;
          const idx2 = r * sectors + ((s + 1) % sectors);

          const p1 = projectedVertices[idx1];
          const p2 = projectedVertices[idx2];
          const avgZ = (p1.z + p2.z) / 2;

          const item = { type: "line", p1, p2, z: avgZ };
          if (avgZ > 0) {
            backQueue.push(item);
          } else {
            frontQueue.push(item);
          }
        }
      }

      // Collect vertical segments
      for (let r = 0; r < rings; r++) {
        for (let s = 0; s < sectors; s++) {
          const idx1 = r * sectors + s;
          const idx2 = (r + 1) * sectors + s;

          const p1 = projectedVertices[idx1];
          const p2 = projectedVertices[idx2];
          const avgZ = (p1.z + p2.z) / 2;

          const item = { type: "line", p1, p2, z: avgZ };
          if (avgZ > 0) {
            backQueue.push(item);
          } else {
            frontQueue.push(item);
          }
        }
      }

      // Collect vertex nodes on the front-facing hemisphere for network effect
      projectedVertices.forEach((p, idx) => {
        if (p.z <= 0) {
          // Add a grid node dot at a subset of vertices
          frontQueue.push({
            type: "node",
            p,
            z: p.z,
            size: (idx % 6 === 0) ? 2.2 : (idx % 3 === 0) ? 1.2 : 0.8
          });
        }
      });

      // Collect particles
      particles.forEach((p) => {
        p.phase += p.speed;
        const proj = project({
          x: p.x + Math.sin(p.phase) * 0.05,
          y: p.y + Math.cos(p.phase) * 0.05,
          z: p.z,
        });

        const item = { type: "particle", p: proj, size: p.size, z: proj.z };
        if (proj.z > 0) {
          backQueue.push(item);
        } else {
          frontQueue.push(item);
        }
      });

      // Sort both queues from furthest (largest z) to nearest (smallest z)
      backQueue.sort((a, b) => b.z - a.z);
      frontQueue.sort((a, b) => b.z - a.z);

      const drawItem = (item) => {
        if (item.type === "line") {
          const { p1, p2, z } = item;
          const isBack = z > 0;
          // Back-side lines are much thinner and dimmer to emphasize depth
          const baseAlpha = isBack ? (isDark ? 0.12 : 0.09) : (isDark ? 0.35 : 0.28);
          const alpha = Math.max(0.015, baseAlpha - (z + activeRadius) / (activeRadius * 3.5));

          ctx.strokeStyle = `rgba(${colorPrefix}, ${alpha})`;
          ctx.lineWidth = isBack 
            ? Math.max(0.2, 0.7 - (z + activeRadius) / (activeRadius * 2))
            : Math.max(0.4, 1.2 - (z + activeRadius) / (activeRadius * 2.5));

          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        } else if (item.type === "particle") {
          const { p: proj, size, z } = item;
          const alpha = Math.max(0.1, 0.75 - (proj.z + activeRadius) / (activeRadius * 2));
          
          ctx.fillStyle = `rgba(${particleColorPrefix}, ${alpha})`;
          ctx.shadowColor = `rgba(${particleColorPrefix}, 0.5)`;
          ctx.shadowBlur = 4;
          
          ctx.beginPath();
          ctx.arc(proj.x, proj.y, size, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
        } else if (item.type === "node") {
          const { p, size } = item;
          // Grid intersections have high readability and glowing presence
          const alpha = Math.max(0.15, 0.85 - (p.z + activeRadius) / (activeRadius * 2.5));
          ctx.fillStyle = `rgba(${particleColorPrefix}, ${alpha})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
          ctx.fill();

          if (size > 2) {
            ctx.strokeStyle = `rgba(${colorPrefix}, ${alpha * 0.35})`;
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.arc(p.x, p.y, size * 2.2, 0, Math.PI * 2);
            ctx.stroke();
          }
        }
      };

      // Pass 1: Render back elements
      backQueue.forEach(drawItem);

      // Pass 2: Render 3D shaded sphere volume body (glassmorphism/diffuse shading)
      const sphereGlow = ctx.createRadialGradient(
        cx - activeRadius * 0.25, 
        cy - activeRadius * 0.25, 
        activeRadius * 0.05, 
        cx, 
        cy, 
        activeRadius
      );
      if (isDark) {
        // Dark Theme: specular gold fade into dark canvas/grid backdrop
        sphereGlow.addColorStop(0, "rgba(212, 175, 55, 0.12)");
        sphereGlow.addColorStop(0.3, "rgba(8, 8, 8, 0.48)");
        sphereGlow.addColorStop(0.7, "rgba(3, 3, 3, 0.78)");
        sphereGlow.addColorStop(1, "rgba(3, 3, 3, 0.94)");
      } else {
        // Light Theme: soft violet/indigo fade into light canvas backdrop
        sphereGlow.addColorStop(0, "rgba(139, 92, 246, 0.09)");
        sphereGlow.addColorStop(0.3, "rgba(241, 245, 249, 0.48)");
        sphereGlow.addColorStop(0.7, "rgba(248, 250, 252, 0.78)");
        sphereGlow.addColorStop(1, "rgba(248, 250, 252, 0.92)");
      }
      ctx.fillStyle = sphereGlow;
      ctx.beginPath();
      ctx.arc(cx, cy, activeRadius, 0, Math.PI * 2);
      ctx.fill();

      // Atmospheric outer rim/halo ring
      ctx.strokeStyle = isDark ? "rgba(212, 175, 55, 0.22)" : "rgba(139, 92, 246, 0.18)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(cx, cy, activeRadius, 0, Math.PI * 2);
      ctx.stroke();

      // Pass 3: Render front elements (drawn on top of the shaded sphere body)
      frontQueue.forEach(drawItem);

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <div ref={containerRef} className="w-full h-[320px] md:h-[450px] lg:h-[500px] flex items-center justify-center relative select-none pointer-events-none">
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
}
