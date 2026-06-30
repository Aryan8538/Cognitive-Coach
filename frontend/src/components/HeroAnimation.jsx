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

      // 1. Draw smooth central gold glow behind the sphere
      const radialGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, activeRadius * 1.8);
      radialGlow.addColorStop(0, "rgba(212, 175, 55, 0.16)");
      radialGlow.addColorStop(0.5, "rgba(212, 175, 55, 0.04)");
      radialGlow.addColorStop(1, "rgba(212, 175, 55, 0)");
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

      // 2. Draw wireframe grid lines
      // Draw horizontal ring segments
      for (let r = 0; r <= rings; r++) {
        for (let s = 0; s < sectors; s++) {
          const idx1 = r * sectors + s;
          const idx2 = r * sectors + ((s + 1) % sectors);

          const p1 = projectedVertices[idx1];
          const p2 = projectedVertices[idx2];

          // Calculate average depth and alpha
          const avgZ = (p1.z + p2.z) / 2;
          const alpha = Math.max(0.04, 0.35 - (avgZ + activeRadius) / (activeRadius * 2.5));

          ctx.strokeStyle = `rgba(212, 175, 55, ${alpha})`;
          ctx.lineWidth = Math.max(0.4, 1.2 - (avgZ + activeRadius) / (activeRadius * 2));
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }
      }

      // Draw vertical segment lines connecting adjacent rings
      for (let r = 0; r < rings; r++) {
        for (let s = 0; s < sectors; s++) {
          const idx1 = r * sectors + s;
          const idx2 = (r + 1) * sectors + s;

          const p1 = projectedVertices[idx1];
          const p2 = projectedVertices[idx2];

          const avgZ = (p1.z + p2.z) / 2;
          const alpha = Math.max(0.04, 0.32 - (avgZ + activeRadius) / (activeRadius * 2.5));

          ctx.strokeStyle = `rgba(212, 175, 55, ${alpha})`;
          ctx.lineWidth = Math.max(0.4, 1.0 - (avgZ + activeRadius) / (activeRadius * 2));
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }
      }

      // 3. Update and draw particles
      particles.forEach((p) => {
        // Slow particle drift and phase modulation
        p.phase += p.speed;
        
        // Project particle
        const proj = project({
          x: p.x + Math.sin(p.phase) * 0.05,
          y: p.y + Math.cos(p.phase) * 0.05,
          z: p.z,
        });

        const alpha = Math.max(0.1, 0.75 - (proj.z + activeRadius) / (activeRadius * 2));
        ctx.fillStyle = `rgba(212, 175, 55, ${alpha})`;

        // Glow behind particles
        ctx.shadowColor = "rgba(212, 175, 55, 0.4)";
        ctx.shadowBlur = 4;
        
        ctx.beginPath();
        ctx.arc(proj.x, proj.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        
        // Reset shadow
        ctx.shadowBlur = 0;
      });

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
