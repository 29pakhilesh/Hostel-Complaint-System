import React, { useMemo } from 'react';

const SnowfallOverlay = () => {
  // Precompute flakes once per mount so typing / state changes don't regenerate them
  const snowflakeChars = ['❄', '❅', '❆'];
  const flakes = useMemo(
    () =>
      Array.from({ length: 75 }).map((_, i) => ({
        left: Math.random() * 100,
        delay: Math.random() * 18,
        duration: 10 + Math.random() * 10,
        size: 3 + Math.random() * 6,
        opacity: 0.5 + Math.random() * 0.5,
        char: snowflakeChars[i % snowflakeChars.length],
      })),
    []
  );

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden print:hidden" aria-hidden="true">
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
          {flake.char}
        </span>
      ))}
    </div>
  );
};

export default SnowfallOverlay;


