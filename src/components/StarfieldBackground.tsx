import React, { useEffect, useRef } from 'react';

/**
 * StarfieldBackground: A highly optimized HTML5 Canvas starfield effect.
 * Reacts dynamically to desktop mouse movement (parallax depth) and 
 * mobile touch/scroll events (speed burst and scrolling alignment).
 */
export default function StarfieldBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Star data definitions
    const numStars = 150;
    const stars: Array<{
      x: number;
      y: number;
      z: number;
      size: number;
      color: string;
    }> = [];

    // Distinct theme-matching colors: deep amber, gold, teal, bright white, and warm ivory
    const colors = ['#f1ede2', '#dfb15b', '#879b90', '#ffffff', '#e2e8f0'];

    for (let i = 0; i < numStars; i++) {
      stars.push({
        x: (Math.random() - 0.5) * 2000,
        y: (Math.random() - 0.5) * 2000,
        z: Math.random() * 2000,
        size: Math.random() * 1.5 + 0.4,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    // Parallax & Interactive Mouse positions
    let mouseX = 0;
    let mouseY = 0;
    let targetMouseX = 0;
    let targetMouseY = 0;

    // Scroll momentum & touch alignment
    let lastScrollY = window.scrollY;
    let scrollVelocity = 0;

    const handleMouseMove = (e: MouseEvent) => {
      // Normalize mouse position relative to the viewport center (-0.5 to 0.5)
      targetMouseX = (e.clientX / window.innerWidth) - 0.5;
      targetMouseY = (e.clientY / window.innerHeight) - 0.5;
    };

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const delta = currentScrollY - lastScrollY;
      scrollVelocity += delta * 0.12; // Modulate speed dynamically based on scroll delta
      lastScrollY = currentScrollY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        targetMouseX = (touch.clientX / window.innerWidth) - 0.5;
        targetMouseY = (touch.clientY / window.innerHeight) - 0.5;
      }
    };

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    // Attach listeners
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('resize', handleResize);

    // Frame loops utilizing requestAnimationFrame
    const render = () => {
      // Create trailing alpha fade for cosmic motion speed vector
      ctx.fillStyle = 'rgba(12, 16, 14, 0.25)';
      ctx.fillRect(0, 0, width, height);

      // Smooth interpolation for mouse drift (ease-out)
      mouseX += (targetMouseX - mouseX) * 0.08;
      mouseY += (targetMouseY - mouseY) * 0.08;

      // Dissipate scroll velocity burst over time
      scrollVelocity *= 0.94;

      // Base translation speed enhanced by scroll velocity
      const speed = 2.2 + Math.min(25, Math.abs(scrollVelocity));

      for (let i = 0; i < numStars; i++) {
        const star = stars[i];

        // Decelerate distance towards screen plane
        star.z -= speed;

        // Reset if star passes viewport horizon
        if (star.z <= 0) {
          star.x = (Math.random() - 0.5) * 2000;
          star.y = (Math.random() - 0.5) * 2000;
          star.z = 2000;
        }

        // 3D coordinate projection mapping to 2D
        const scaleFactor = 380 / star.z;
        const x = (star.x + mouseX * 240) * scaleFactor + width / 2;
        const y = (star.y + mouseY * 240) * scaleFactor + height / 2;

        if (x >= 0 && x <= width && y >= 0 && y <= height) {
          // Increase size and opacity as star is closer
          const dynamicSize = star.size * (1 - star.z / 2000) * 2.2 + 0.3;
          const alpha = (1 - star.z / 2000);

          ctx.beginPath();
          ctx.arc(x, y, dynamicSize, 0, Math.PI * 2);
          ctx.fillStyle = star.color;
          ctx.globalAlpha = alpha;
          ctx.fill();
        }
      }

      ctx.globalAlpha = 1.0;
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    // Tidy up event handlers on destroy
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      id="starfield-canvas"
      className="fixed inset-0 w-full h-full pointer-events-none z-0"
      style={{ mixBlendMode: 'screen' }}
    />
  );
}
