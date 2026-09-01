import React, { useEffect, useRef } from 'react';

export const InteractiveDotGrid: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Mouse coordinates with smoothing
    const mouse = {
      x: -1000,
      y: -1000,
      targetX: -1000,
      targetY: -1000,
      radius: 180,
    };

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches[0]) {
        mouse.targetX = e.touches[0].clientX;
        mouse.targetY = e.touches[0].clientY;
      }
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove);

    const spacing = 32; // distance between dots
    const baseRadius = 1.35; // base dot size
    const activeRadius = 3.8; // enlarged illuminated dot size

    const render = () => {
      // Smooth lerp mouse position
      mouse.x += (mouse.targetX - mouse.x) * 0.15;
      mouse.y += (mouse.targetY - mouse.y) * 0.15;

      ctx.clearRect(0, 0, width, height);

      // Draw interactive dots
      for (let x = spacing / 2; x < width; x += spacing) {
        for (let y = spacing / 2; y < height; y += spacing) {
          const dx = mouse.x - x;
          const dy = mouse.y - y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < mouse.radius) {
            // Illuminated active zone
            const intensity = 1 - dist / mouse.radius;
            const radius = baseRadius + (activeRadius - baseRadius) * (intensity * intensity);

            // Glow gradient
            ctx.beginPath();
            ctx.arc(x, y, radius + 2, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(245, 197, 66, ${0.35 * intensity})`;
            ctx.fill();

            // Core dot
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(212, 175, 55, ${0.5 + 0.5 * intensity})`;
            ctx.fill();
          } else {
            // Subtle standard yellow-gold dot on white
            ctx.beginPath();
            ctx.arc(x, y, baseRadius, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(212, 175, 55, 0.22)';
            ctx.fill();
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ background: '#FFFFFF' }}
    />
  );
};
