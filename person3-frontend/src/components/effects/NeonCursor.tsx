import React, { useEffect, useRef, useCallback } from 'react';
import { useSettings } from '../../context/SettingsContext';

/**
 * NeonCursor — Smooth, premium, custom animated cyber pointer.
 *
 * Visual & Interactive Features:
 * - Precision laser core dot with subtle inner halo
 * - Smooth magnetic outer ring with organic lerp physics (lag-free, ultra-responsive)
 * - Dynamic scaling and hover state transformations on buttons, links, cards, and nav items
 * - Contextual micro-labels ("SCAN", "VIEW", "CLICK", "SELECT", "INPUT")
 * - Laser I-beam morphing over text inputs and textareas
 * - Velocity-based neon spark particle trail
 * - Click shockwave energy ring
 * - Accessibility: respects prefers-reduced-motion (disables lag & particles)
 * - Touch device detection: auto-disables on touchscreens (Android/iOS) to restore native touch
 * - Non-blocking: pointer-events: none and high z-index ensuring zero click/scroll interference
 */
export const NeonCursor: React.FC = () => {
  const { currentColor } = useSettings();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Position state (refs for smooth 60/120fps render loop)
  const mouse = useRef({ x: -200, y: -200 });
  const ring = useRef({ x: -200, y: -200 });
  const isVisible = useRef(false);
  const isHovering = useRef(false);
  const isInput = useRef(false);
  const isClicking = useRef(false);
  const hoverLabel = useRef<string>('');
  const clickRipple = useRef({ x: 0, y: 0, t: 0, active: false });
  const trail = useRef<{ x: number; y: number; vx: number; vy: number; age: number; maxAge: number; size: number }[]>([]);
  const rafId = useRef<number>(0);
  const isTouchDevice = useRef(false);
  const prefersReducedMotion = useRef(false);

  // Theme RGB: neon-green #00E676 default
  const rgbParts = (currentColor?.rgb || '0, 230, 118').split(',').map((v) => parseInt(v.trim(), 10));
  const r = rgbParts[0] !== undefined ? rgbParts[0] : 0;
  const g = rgbParts[1] !== undefined ? rgbParts[1] : 230;
  const b = rgbParts[2] !== undefined ? rgbParts[2] : 118;

  const RING_BASE_RADIUS = 16;
  const RING_HOVER_RADIUS = 28;
  const DOT_RADIUS = 3.5;
  const EASE = 0.2; // Smooth responsive lerp

  const resize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
  }, []);

  useEffect(() => {
    // Check for prefers-reduced-motion
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    prefersReducedMotion.current = motionQuery.matches;
    const handleMotionChange = (e: MediaQueryListEvent) => {
      prefersReducedMotion.current = e.matches;
    };
    motionQuery.addEventListener('change', handleMotionChange);

    // Check for touch / coarse pointer
    const touchQuery = window.matchMedia('(pointer: coarse)');
    if (touchQuery.matches && !window.matchMedia('(pointer: fine)').matches) {
      isTouchDevice.current = true;
      return; // Do not initialize canvas cursor on pure touch device
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    resize();

    // Inject CSS to hide system cursor only on fine pointer devices when reduced motion is not forced
    const styleEl = document.createElement('style');
    styleEl.id = 'smart-recycle-cyber-cursor-style';
    styleEl.textContent = `
      @media (pointer: fine) {
        body, a, button, [role="button"], label, select, summary {
          cursor: none !important;
        }
      }
    `;
    document.head.appendChild(styleEl);

    let prevX = -200;
    let prevY = -200;

    const handleMouseMove = (e: MouseEvent) => {
      isVisible.current = true;
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;

      if (ring.current.x < 0) {
        ring.current.x = e.clientX;
        ring.current.y = e.clientY;
      }

      // Add velocity particle sparks (only if motion is enabled)
      if (!prefersReducedMotion.current) {
        const vx = (e.clientX - prevX) * 0.12;
        const vy = (e.clientY - prevY) * 0.12;
        prevX = e.clientX;
        prevY = e.clientY;

        if (Math.abs(vx) + Math.abs(vy) > 0.4) {
          trail.current.push({
            x: e.clientX,
            y: e.clientY,
            vx: (Math.random() - 0.5) * 1.2 - vx * 0.25,
            vy: (Math.random() - 0.5) * 1.2 - vy * 0.25,
            age: 0,
            maxAge: 18 + Math.random() * 8,
            size: 1.5 + Math.random() * 2
          });
          if (trail.current.length > 20) {
            trail.current.shift();
          }
        }
      }
    };

    const handleMouseEnter = () => {
      isVisible.current = true;
    };

    const handleMouseLeave = () => {
      isVisible.current = false;
    };

    const handleMouseDown = () => {
      isClicking.current = true;
      clickRipple.current = {
        x: mouse.current.x,
        y: mouse.current.y,
        t: 0,
        active: true
      };
    };

    const handleMouseUp = () => {
      isClicking.current = false;
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const isTextField =
        target.tagName === 'INPUT' && (target as HTMLInputElement).type !== 'checkbox' && (target as HTMLInputElement).type !== 'radio' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable;

      isInput.current = isTextField;

      const interactive = target.closest(
        'button, a, [role="button"], input, select, textarea, label, [data-cursor], .card-premium, .hud-corner-brackets'
      );

      if (interactive) {
        isHovering.current = true;
        // Check for contextual action hints
        const cursorAttr = interactive.getAttribute('data-cursor');
        if (cursorAttr) {
          hoverLabel.current = cursorAttr.toUpperCase();
        } else if (interactive.tagName === 'BUTTON' || interactive.tagName === 'A') {
          const text = (interactive.textContent || '').trim().toLowerCase();
          if (text.includes('scan') || text.includes('camera')) hoverLabel.current = 'SCAN';
          else if (text.includes('map') || text.includes('center') || text.includes('depot')) hoverLabel.current = 'MAP';
          else if (text.includes('reward') || text.includes('wallet') || text.includes('claim')) hoverLabel.current = 'CLAIM';
          else if (text.includes('guide') || text.includes('view') || text.includes('more')) hoverLabel.current = 'VIEW';
          else hoverLabel.current = '';
        } else {
          hoverLabel.current = '';
        }
      } else {
        isHovering.current = false;
        hoverLabel.current = '';
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mouseenter', handleMouseEnter);
    window.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mouseover', handleMouseOver, { passive: true });
    window.addEventListener('resize', resize);

    // ── Ultra-smooth Canvas Render Loop ──
    const draw = () => {
      const dpr = window.devicePixelRatio || 1;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (isVisible.current && mouse.current.x > 0 && mouse.current.y > 0) {
        // Easing physics: instant if reduced motion, otherwise smooth lerp
        if (prefersReducedMotion.current) {
          ring.current.x = mouse.current.x;
          ring.current.y = mouse.current.y;
        } else {
          ring.current.x += (mouse.current.x - ring.current.x) * EASE;
          ring.current.y += (mouse.current.y - ring.current.y) * EASE;
        }

        const mx = mouse.current.x * dpr;
        const my = mouse.current.y * dpr;
        const rx = ring.current.x * dpr;
        const ry = ring.current.y * dpr;

        // 1. Particle Trail (Energy Sparks)
        if (!prefersReducedMotion.current) {
          for (let i = trail.current.length - 1; i >= 0; i--) {
            const p = trail.current[i];
            p.age += 1;
            p.x += p.vx;
            p.y += p.vy;

            const progress = p.age / p.maxAge;
            if (progress >= 1) {
              trail.current.splice(i, 1);
              continue;
            }

            const alpha = (1 - progress) * 0.45;
            const currentSize = p.size * (1 - progress * 0.5) * dpr;

            ctx.beginPath();
            ctx.arc(p.x * dpr, p.y * dpr, Math.max(currentSize, 0.5), 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
            ctx.fill();
          }
        }

        // 2. Click Shockwave Energy Burst
        if (clickRipple.current.active) {
          clickRipple.current.t += 0.055;
          const prog = clickRipple.current.t;
          if (prog >= 1) {
            clickRipple.current.active = false;
          } else {
            const rippleRadius = (prog * 60 + 12) * dpr;
            const rippleAlpha = (1 - prog) * 0.75;

            ctx.beginPath();
            ctx.arc(clickRipple.current.x * dpr, clickRipple.current.y * dpr, rippleRadius, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${rippleAlpha})`;
            ctx.lineWidth = 1.5 * dpr;
            ctx.stroke();
          }
        }

        if (isInput.current) {
          // 3. Text Input Morph: Vertical Glowing Laser Beam (I-beam)
          const beamH = 18 * dpr;
          ctx.beginPath();
          ctx.moveTo(mx, my - beamH / 2);
          ctx.lineTo(mx, my + beamH / 2);
          ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, 0.9)`;
          ctx.lineWidth = 2 * dpr;
          ctx.shadowColor = `rgba(${r}, ${g}, ${b}, 0.8)`;
          ctx.shadowBlur = 8 * dpr;
          ctx.stroke();
          ctx.shadowBlur = 0;
        } else {
          // 4. Outer Magnetic Ring
          const targetRadius = (isHovering.current ? RING_HOVER_RADIUS : RING_BASE_RADIUS) * dpr;
          const ringScale = isClicking.current ? 0.8 : 1.0;
          const currentRadius = targetRadius * ringScale;

          // Glowing Outer Circle
          ctx.beginPath();
          ctx.arc(rx, ry, currentRadius, 0, Math.PI * 2);
          ctx.strokeStyle = isHovering.current
            ? `rgba(${r}, ${g}, ${b}, 0.95)`
            : `rgba(${r}, ${g}, ${b}, 0.5)`;
          ctx.lineWidth = (isHovering.current ? 1.75 : 1.2) * dpr;
          ctx.shadowColor = `rgba(${r}, ${g}, ${b}, 0.6)`;
          ctx.shadowBlur = (isHovering.current ? 16 : 8) * dpr;
          ctx.stroke();
          ctx.shadowBlur = 0;

          // Subtle Translucent Fill when Hovering
          if (isHovering.current) {
            ctx.beginPath();
            ctx.arc(rx, ry, currentRadius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.08)`;
            ctx.fill();

            // Tactical Corner Crosshairs
            const tick = 4 * dpr;
            const gap = currentRadius + 3 * dpr;
            ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, 0.7)`;
            ctx.lineWidth = 1 * dpr;
            // Top, Bottom, Left, Right
            ctx.beginPath(); ctx.moveTo(rx, ry - gap); ctx.lineTo(rx, ry - gap - tick); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(rx, ry + gap); ctx.lineTo(rx, ry + gap + tick); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(rx - gap, ry); ctx.lineTo(rx - gap - tick, ry); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(rx + gap, ry); ctx.lineTo(rx + gap + tick, ry); ctx.stroke();
          }

          // 5. Contextual Action Label (e.g. "SCAN", "VIEW")
          if (hoverLabel.current) {
            ctx.font = `bold ${9 * dpr}px monospace`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = '#ffffff';
            ctx.fillText(hoverLabel.current, rx, ry);
          }

          // 6. Laser Core Center Dot
          ctx.beginPath();
          ctx.arc(mx, my, DOT_RADIUS * dpr, 0, Math.PI * 2);
          ctx.fillStyle = '#ffffff';
          ctx.shadowColor = `rgba(${r}, ${g}, ${b}, 1)`;
          ctx.shadowBlur = 8 * dpr;
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      }

      rafId.current = requestAnimationFrame(draw);
    };

    rafId.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafId.current);
      motionQuery.removeEventListener('change', handleMotionChange);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseenter', handleMouseEnter);
      window.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mouseover', handleMouseOver);
      window.removeEventListener('resize', resize);
      if (styleEl && styleEl.parentNode) {
        styleEl.parentNode.removeChild(styleEl);
      }
    };
  }, [r, g, b, resize]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none select-none"
      style={{
        zIndex: 999999,
        width: '100vw',
        height: '100vh',
        position: 'fixed',
        top: 0,
        left: 0
      }}
      aria-hidden="true"
    />
  );
};
