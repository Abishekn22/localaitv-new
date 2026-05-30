import React, { useRef, useState, useEffect, useLayoutEffect, useCallback } from 'react';
import { getLoopIdx } from './UnifiedFeedViewer.jsx';

// Infinite, native-scroll-snap vertical shorts scroller.
//
// Why a 3-slide window: native CSS scroll-snap gives the smooth, momentum-based
// "one swipe = one short" feel, but it only works on a finite list. To keep the
// feed looping 360° in both directions we render just THREE slides — prev,
// current, next — and silently recenter the scroll position back to the middle
// slide after each settle. The user always sees an endless feed while the DOM
// never holds more than three full-screen items.
//
// Props:
//   total         number of items in the (looping) feed
//   initialIdx    logical index to open on
//   resetKey      when this changes, the feed jumps back to index 0 (e.g. on
//                 category switch)
//   renderItem    (itemIndex, isActive) => ReactNode
//   onIndexChange optional — called with the live looped item index
function SnapShortsScroller({ total, initialIdx = 0, resetKey, renderItem, onIndexChange }) {
  const containerRef = useRef(null);
  const [idx, setIdx] = useState(initialIdx);     // logical (unbounded) index
  const settleTimer = useRef(null);
  const lockScroll  = useRef(false);              // ignore scroll events during a programmatic recenter

  const slideH = useCallback(() => {
    const el = containerRef.current;
    return el ? el.clientHeight : (typeof window !== 'undefined' ? window.innerHeight : 0);
  }, []);

  // Recenter to the middle slide whenever the logical index (or category) changes,
  // and on first mount. Runs before paint so the swap is seamless — content shifts
  // by one slide while scrollTop jumps back by one slide at the same time.
  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    lockScroll.current = true;
    el.scrollTop = slideH();
    // Release the lock once the programmatic scroll has flushed.
    const raf = requestAnimationFrame(() => { lockScroll.current = false; });
    if (onIndexChange && total > 0) onIndexChange(getLoopIdx(idx, total));
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx, resetKey, total]);

  // Category (resetKey) change → back to the top of the new list. Skip the
  // initial mount, otherwise this would clobber `initialIdx` and always snap
  // the feed to item 0 (which made a tapped clip open on the first video).
  const didMountReset = useRef(false);
  useEffect(() => {
    if (!didMountReset.current) { didMountReset.current = true; return; }
    setIdx(0);
  }, [resetKey]);

  // Detect when a scroll has settled on a snapped slide, then advance the
  // logical index and recenter. scroll-snap guarantees we land on a boundary,
  // so rounding scrollTop / slideHeight gives 0 (prev), 1 (stay) or 2 (next).
  const onScroll = useCallback(() => {
    if (lockScroll.current) return;
    if (settleTimer.current) clearTimeout(settleTimer.current);
    settleTimer.current = setTimeout(() => {
      const el = containerRef.current;
      if (!el) return;
      const h = slideH();
      if (!h) return;
      const pos = Math.round(el.scrollTop / h);
      if (pos <= 0)      setIdx(i => i - 1);
      else if (pos >= 2) setIdx(i => i + 1);
      // pos === 1 → user stayed on the current slide, nothing to do.
    }, 90);
  }, [slideH]);

  useEffect(() => () => { if (settleTimer.current) clearTimeout(settleTimer.current); }, []);

  // Keyboard: ↑ / ↓ scroll exactly one slide (smooth), which then snaps + settles.
  useEffect(() => {
    const onKey = (e) => {
      const el = containerRef.current;
      if (!el) return;
      if (e.key === 'ArrowDown') { e.preventDefault(); el.scrollBy({ top:  slideH(), behavior: 'smooth' }); }
      if (e.key === 'ArrowUp')   { e.preventDefault(); el.scrollBy({ top: -slideH(), behavior: 'smooth' }); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [slideH]);

  return (
    <div
      ref={containerRef}
      onScroll={onScroll}
      style={{
        width: '100%',
        height: '100%',
        overflowY: 'scroll',
        overflowX: 'hidden',
        scrollSnapType: 'y mandatory',
        WebkitOverflowScrolling: 'touch',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
        overscrollBehavior: 'contain',
      }}
    >
      {[-1, 0, 1].map((o) => {
        const itemIndex = total > 0 ? getLoopIdx(idx + o, total) : 0;
        return (
          <div
            key={o}
            style={{
              width: '100%',
              height: '100%',
              flexShrink: 0,
              scrollSnapAlign: 'start',
              scrollSnapStop: 'always',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {renderItem(itemIndex, o === 0)}
          </div>
        );
      })}
    </div>
  );
}

export default SnapShortsScroller;
