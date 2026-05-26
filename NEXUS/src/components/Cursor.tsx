// src/components/Cursor.tsx
import { useEffect, useRef } from 'react';

export default function Cursor() {
  const ringRef = useRef<HTMLDivElement>(null);
  const dotRef  = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let mouseX = -200, mouseY = -200;
    let ringX  = -200, ringY  = -200;
    let raf: number;

    const moveDot = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
      }
    };

    const detectHover = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      const hoverable = !!(t.closest('button, a, input, [data-hover], [role="button"]'));
      ringRef.current?.classList.toggle('ring-hover', hoverable);
    };

    const onDown = () => dotRef.current?.classList.add('dot-click');
    const onUp   = () => dotRef.current?.classList.remove('dot-click');

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
    const loop = () => {
      ringX = lerp(ringX, mouseX, 0.12);
      ringY = lerp(ringY, mouseY, 0.12);
      if (ringRef.current) {
        ringRef.current.style.transform = `translate(${ringX}px, ${ringY}px)`;
      }
      raf = requestAnimationFrame(loop);
    };

    document.addEventListener('mousemove', moveDot,     { passive: true });
    document.addEventListener('mousemove', detectHover, { passive: true });
    document.addEventListener('mousedown', onDown);
    document.addEventListener('mouseup',   onUp);
    raf = requestAnimationFrame(loop);

    return () => {
      document.removeEventListener('mousemove', moveDot);
      document.removeEventListener('mousemove', detectHover);
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('mouseup',   onUp);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      <div ref={dotRef} style={{
        position: 'fixed', top: 0, left: 0,
        width: 6, height: 6, borderRadius: '50%',
        background: 'var(--accent)',
        pointerEvents: 'none', zIndex: 999999,
        marginLeft: -3, marginTop: -3,
        willChange: 'transform',
      }} className="nx-cursor-dot" />

      <div ref={ringRef} style={{
        position: 'fixed', top: 0, left: 0,
        width: 28, height: 28, borderRadius: '50%',
        border: '1.5px solid rgba(232,103,60,0.45)',
        pointerEvents: 'none', zIndex: 999998,
        marginLeft: -14, marginTop: -14,
        willChange: 'transform',
        transition: 'width 0.2s ease, height 0.2s ease, margin 0.2s ease, border-color 0.2s ease',
      }} className="nx-cursor-ring" />

      <style>{`
        .nx-cursor-dot.dot-click { background: #fff !important; }
        .nx-cursor-ring.ring-hover {
          width: 40px !important; height: 40px !important;
          margin-left: -20px !important; margin-top: -20px !important;
          border-color: rgba(232,103,60,0.8) !important;
        }
      `}</style>
    </>
  );
}
