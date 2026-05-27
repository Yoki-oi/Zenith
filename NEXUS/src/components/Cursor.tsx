// src/components/Cursor.tsx
import { useEffect, useRef } from 'react';

export default function Cursor() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia('(hover:none),(pointer:coarse)').matches) return;
    const wrap = wrapRef.current;
    const ring = ringRef.current;
    if (!wrap || !ring) return;

    let mx = -300, my = -300, rx = -300, ry = -300, raf = 0;

    const onMove = (e: MouseEvent) => {
      mx = e.clientX; my = e.clientY;
      wrap.style.transform = `translate(${mx}px,${my}px)`;
    };
    const onOver = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      const h = !!(t.closest('button')||t.closest('a')||t.closest('[data-hover]')||
                   t.closest('input')||t.closest('[role="button"]')||t.closest('select'));
      wrap.classList.toggle('is-hover', h);
    };
    const onDown = () => wrap.classList.add('is-click');
    const onUp   = () => wrap.classList.remove('is-click');

    const loop = () => {
      rx += (mx - rx) * 0.11; ry += (my - ry) * 0.11;
      ring.style.transform = `translate(${rx - mx}px,${ry - my}px)`;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    document.addEventListener('mousemove', onMove, { passive: true });
    document.addEventListener('mouseover', onOver, { passive: true });
    document.addEventListener('mousedown', onDown, { passive: true });
    document.addEventListener('mouseup',   onUp,   { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseover', onOver);
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('mouseup',   onUp);
    };
  }, []);

  return (
    <div ref={wrapRef} className="nexus-cursor" aria-hidden>
      <div className="nexus-cursor-dot" />
      <div ref={ringRef} className="nexus-cursor-ring" />
    </div>
  );
}
