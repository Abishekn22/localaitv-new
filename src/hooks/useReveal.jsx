import React from 'react';

// ── OTT useReveal hook — fade-and-rise once in view ─────────
// Returns { ref, className }. Apply both to a wrapper element and the
// section glides into place on first scroll-into-view. Honours
// prefers-reduced-motion via the .ott-reveal CSS rules above.
function useReveal({ rootMargin='0px 0px -8% 0px', threshold=0.08 } = {}) {
  const ref = React.useRef(null);
  const [shown, setShown] = React.useState(false);
  React.useEffect(() => {
    const el = ref.current; if (!el || shown) return;
    if (typeof IntersectionObserver === 'undefined') { setShown(true); return; }
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { setShown(true); io.disconnect(); } });
    }, { root:null, rootMargin, threshold });
    io.observe(el);
    return () => io.disconnect();
  }, [shown, rootMargin, threshold]);
  return { ref, className: `ott-reveal${shown?' is-in':''}` };
}

// Light wrapper — drop around any section to give it a reveal-on-scroll.
// Optional `delay` lets you stagger consecutive sections (in seconds).
function Reveal({ children, delay=0, as:Tag='div', style }) {
  const { ref, className } = useReveal();
  const finalStyle = delay ? { ...style, animationDelay:`${delay}s` } : style;
  return <Tag ref={ref} className={className} style={finalStyle}>{children}</Tag>;
}

export { useReveal, Reveal };
