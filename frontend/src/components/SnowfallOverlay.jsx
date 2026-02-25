import React, { useMemo } from 'react';

const SnowfallOverlay = () => {
  // Precompute flakes once per mount so typing / state changes don't regenerate them
  const flakes = useMemo(
    () =>
      Array.from({ length: 40 }).map(() => ({
        left: Math.random() * 100,
        delay: Math.random() * 20,
        duration: 12 + Math.random() * 12,
        size: 2 + Math.random() * 4,
        opacity: 0.2 + Math.random() * 0.4,
      })),
    []
  );

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden hidden lg:block print:hidden">
      {flakes.map((flake, index) => (
        <span
          key={index}
          className="snowflake"
          style={{
            left: `${flake.left}%`,
            animationDelay: `-${flake.delay}s`,
            animationDuration: `${flake.duration}s`,
            fontSize: `${flake.size}px`,
            opacity: flake.opacity,
          }}
        >
          ✦
        </span>
      ))}
    </div>
  );
};

export default SnowfallOverlay;


