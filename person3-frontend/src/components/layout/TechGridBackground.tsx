import React, { useMemo } from 'react';

/**
 * TechGridBackground
 * 
 * Renders a fixed, full-viewport cinematic tech-atmosphere background:
 * - Ultra-thin cyan + gray grid overlay
 * - Diagonal neon geometric accent lines
 * - Interconnected vector dot-network with hub nodes
 * - SVG connector lines between nearby dots
 * - Edge vignette for cinematic depth
 * 
 * Everything is pointer-events: none so dashboard UI sits cleanly on top.
 */

interface DotNode {
  x: number;   // percentage 0-100
  y: number;   // percentage 0-100
  isHub: boolean;
}

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return s / 2147483647;
  };
}

export const TechGridBackground: React.FC = () => {
  // Deterministic dot placement so layout doesn't shift on re-render
  const { dots, connections } = useMemo(() => {
    const rand = seededRandom(42);
    const DOT_COUNT = 55;
    const HUB_EVERY = 7;
    const MAX_CONNECT_DIST = 22; // percentage units
    const MAX_CONNECTIONS = 40;

    const nodes: DotNode[] = [];
    for (let i = 0; i < DOT_COUNT; i++) {
      nodes.push({
        x: rand() * 96 + 2,   // 2% - 98%
        y: rand() * 96 + 2,
        isHub: i % HUB_EVERY === 0
      });
    }

    // Build connections between nearby dots
    const conns: { x1: number; y1: number; x2: number; y2: number }[] = [];
    for (let i = 0; i < nodes.length && conns.length < MAX_CONNECTIONS; i++) {
      for (let j = i + 1; j < nodes.length && conns.length < MAX_CONNECTIONS; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MAX_CONNECT_DIST) {
          conns.push({
            x1: nodes[i].x,
            y1: nodes[i].y,
            x2: nodes[j].x,
            y2: nodes[j].y
          });
        }
      }
    }

    return { dots: nodes, connections: conns };
  }, []);

  return (
    <div className="tech-grid-bg" aria-hidden="true">
      {/* Diagonal geometric accent lines */}
      <div className="tech-geo-lines">
        <span /><span /><span /><span /><span />
      </div>

      {/* SVG connector lines */}
      <svg
        className="tech-connectors"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        width="100%"
        height="100%"
      >
        {connections.map((c, i) => (
          <line
            key={i}
            x1={`${c.x1}%`}
            y1={`${c.y1}%`}
            x2={`${c.x2}%`}
            y2={`${c.y2}%`}
          />
        ))}
      </svg>

      {/* Vector dot nodes */}
      <div className="tech-dots-layer">
        {dots.map((dot, i) => (
          <div
            key={i}
            className={`tech-dot${dot.isHub ? ' hub' : ''}`}
            style={{ left: `${dot.x}%`, top: `${dot.y}%` }}
          />
        ))}
      </div>

      {/* Edge vignette for cinematic depth */}
      <div className="tech-vignette" />
    </div>
  );
};
