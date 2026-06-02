import React from 'react';
import ReactDOM from 'react-dom/client';
import AppRoot from './App.jsx';
import './index.css';
import { initAudioUnlock } from './utils/audioUnlock.js';

// Unmute all primary video/Live-TV players on the user's first interaction.
// (Browsers block autoplay-with-sound until then — see utils/audioUnlock.js.)
initAudioUnlock();

// Global image safety net — if any <img> fails to load (dead CDN link, 404,
// network error), swap it once to a same-origin placeholder. A local asset can
// never 404-to-HTML, so this also prevents the browser's Cross-Origin Read
// Blocking (CORB) console flood that dead cross-origin image URLs trigger.
// Capture phase is required because image 'error' events do not bubble.
window.addEventListener(
  'error',
  (e) => {
    const el = e.target;
    if (el && el.tagName === 'IMG' && !el.dataset.fallbackApplied) {
      el.dataset.fallbackApplied = '1';
      el.src = '/placeholder.svg';
    }
  },
  true
);

ReactDOM.createRoot(document.getElementById('root')).render(<AppRoot />);
