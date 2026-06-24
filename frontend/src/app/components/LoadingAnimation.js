"use client";

import { useEffect, useRef } from "react";
import { animate, stagger } from "animejs";

export default function LoadingAnimation() {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // A 5x5 grid of industrial processing blocks
    const animation = animate(containerRef.current.querySelectorAll('.processing-block'), {
      scale: [
        { value: .1, easing: 'easeOutSine', duration: 500 },
        { value: 1, easing: 'easeInOutQuad', duration: 1200 }
      ],
      opacity: [
        { value: 0.1, easing: 'easeOutSine', duration: 500 },
        { value: 1, easing: 'easeInOutQuad', duration: 1200 }
      ],
      delay: stagger(200, {grid: [5, 5], from: 'center'}),
      loop: true,
      direction: 'alternate'
    });

    return () => animation.pause();
  }, []);

  return (
    <div className="panel p-12 flex flex-col items-center justify-center text-center">
      <h3 className="text-xs font-bold text-[var(--foreground)] uppercase tracking-widest mb-6">
        Processing Topology
      </h3>
      
      <div 
        ref={containerRef} 
        className="grid grid-cols-5 gap-2 w-32 h-32 mx-auto"
      >
        {Array.from({ length: 25 }).map((_, i) => (
          <div 
            key={i} 
            className="processing-block bg-[var(--foreground)] w-full h-full opacity-10 scale-50"
          />
        ))}
      </div>
      
      <p className="text-[10px] text-[var(--foreground-muted)] font-mono uppercase mt-6 tracking-widest">
        Running Graph Algorithms...
      </p>
    </div>
  );
}
