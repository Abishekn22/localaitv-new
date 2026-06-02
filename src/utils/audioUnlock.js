// ─────────────────────────────────────────────────────────────────────────
// Global audio-unlock controller
// ─────────────────────────────────────────────────────────────────────────
// Browsers (Chrome, Safari/iOS, Android, YouTube embeds) BLOCK autoplay WITH
// sound until the user has interacted with the page at least once. There is no
// way around this — true unmuted autoplay on first paint is impossible.
//
// The best achievable UX (used by Instagram, YouTube, etc.) is:
//   1. Start every primary video MUTED so it autoplays instantly (always allowed).
//   2. On the user's FIRST interaction anywhere (tap / scroll / click / key),
//      unmute every primary player and remember it for the rest of the session.
//
// After that single gesture, all primary videos — Live TV channels, Shorts,
// Bulletins, District News, Public Voice, etc. — play with sound automatically.
//
// Opt-in markers (so feed THUMBNAIL previews stay silent — no marker = stays muted):
//   • <video data-primary-audio="1">    → HTML5 players that should carry audio
//   • <iframe data-yt-audio="1">         → YouTube embeds that should carry audio
//     (the iframe URL must include enablejsapi=1 for the unmute command to work)
// ─────────────────────────────────────────────────────────────────────────

let unlocked = false;
const subscribers = new Set();

/** True once the user has made the first gesture that unlocks audio. */
export function isAudioUnlocked() {
  return unlocked;
}

/** Subscribe to be notified when audio unlocks. Returns an unsubscribe fn. */
export function onAudioUnlock(cb) {
  if (unlocked) { try { cb(); } catch {} return () => {}; }
  subscribers.add(cb);
  return () => subscribers.delete(cb);
}

function unmuteYouTube(frame) {
  const win = frame && frame.contentWindow;
  if (!win) return;
  const post = (func, args = '') => {
    try {
      win.postMessage(JSON.stringify({ event: 'command', func, args }), '*');
    } catch {}
  };
  // A couple of retries — the embed may not be ready the instant we fire.
  [0, 350, 900].forEach((delay) => {
    setTimeout(() => { post('unMute'); post('setVolume', [100]); post('playVideo'); }, delay);
  });
}

function unmuteAllPrimary() {
  // HTML5 <video> primary players
  document.querySelectorAll('video[data-primary-audio="1"]').forEach((v) => {
    try { v.muted = false; v.volume = 1; const p = v.play(); if (p && p.catch) p.catch(() => {}); } catch {}
  });
  // YouTube primary embeds (need enablejsapi=1 in their src)
  document.querySelectorAll('iframe[data-yt-audio="1"]').forEach(unmuteYouTube);
}

function doUnlock() {
  if (unlocked) return;
  unlocked = true;
  if (typeof window !== 'undefined') window.__lvAudioUnlocked = true; // observable flag
  unmuteAllPrimary();
  subscribers.forEach((cb) => { try { cb(); } catch {} });
  subscribers.clear();
}

/** Install one-time first-gesture listeners. Safe to call more than once. */
export function initAudioUnlock() {
  if (typeof window === 'undefined' || window.__lvAudioUnlockInit) return;
  window.__lvAudioUnlockInit = true;

  const handler = () => doUnlock();
  // Capture phase + passive so we never interfere with the app's own handlers.
  // Only GENUINE user-activation gestures unlock audio — browsers don't grant
  // audio permission on scroll/wheel alone, so unmuting on those would let the
  // URL claim "unmuted" while the browser still silences it. touchstart fires on
  // the first finger-down (covers touch-scroll); click/keydown cover desktop.
  ['pointerdown', 'touchstart', 'mousedown', 'click', 'keydown'].forEach((ev) => {
    window.addEventListener(ev, handler, { capture: true, passive: true });
  });

  // Expose for manual triggering (e.g. an explicit "tap for sound" button).
  window.__lvUnlockAudio = doUnlock;
}
