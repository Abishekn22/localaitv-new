import React, { useState, useEffect, useRef } from 'react';
import { useAppTheme } from '../_imports.js';

// Live camera capture — works on desktop AND mobile via getUserMedia (the HTML
// `capture` attribute is ignored by desktop browsers, so a file input alone
// can't open a webcam there). Two modes:
//   • 'photo' → live preview + shutter → JPEG File
//   • 'video' → live preview + record/stop (MediaRecorder) → webm/mp4 File
// On error / denied permission it calls onFallback() so the caller can open a
// plain file input instead.
function MediaCaptureModal({ mode = 'photo', onClose, onCapture, onFallback }) {
  const { T } = useAppTheme();
  const videoRef    = useRef(null);
  const streamRef   = useRef(null);
  const recorderRef = useRef(null);
  const chunksRef   = useRef([]);
  const timerRef    = useRef(null);
  const [error,     setError]     = useState('');
  const [ready,     setReady]     = useState(false);
  const [recording, setRecording] = useState(false);
  const [secs,      setSecs]      = useState(0);

  const isVideo = mode === 'video';

  useEffect(() => {
    let cancelled = false;
    async function start() {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setError('Camera is not available in this browser.');
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
          audio: isVideo,
        });
        if (cancelled) { stream.getTracks().forEach(t => t.stop()); return; }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.muted = true;
          videoRef.current.play().catch(() => {});
        }
        setReady(true);
      } catch (e) {
        setError(e && e.name === 'NotAllowedError'
          ? 'Camera/microphone permission denied. Allow access, or pick a file instead.'
          : 'Could not open the camera. Pick a file instead.');
      }
    }
    start();
    return () => { cancelled = true; cleanup(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  function cleanup() {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    try { if (recorderRef.current && recorderRef.current.state === 'recording') recorderRef.current.stop(); } catch (e) {}
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
  }

  function capturePhoto() {
    const v = videoRef.current;
    if (!v) return;
    const w = v.videoWidth || 720;
    const h = v.videoHeight || 1280;
    const canvas = document.createElement('canvas');
    canvas.width = w; canvas.height = h;
    canvas.getContext('2d').drawImage(v, 0, 0, w, h);
    canvas.toBlob((blob) => {
      if (!blob) return;
      const file = new File([blob], `news-photo-${Date.now()}.jpg`, { type: 'image/jpeg' });
      cleanup();
      onCapture(file);
    }, 'image/jpeg', 0.9);
  }

  function startRecording() {
    const stream = streamRef.current;
    if (!stream || typeof MediaRecorder === 'undefined') {
      setError('Video recording is not supported here. Pick a file instead.');
      return;
    }
    chunksRef.current = [];
    const candidates = ['video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm', 'video/mp4'];
    const mimeType = candidates.find(t => MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(t)) || '';
    let mr;
    try { mr = new MediaRecorder(stream, mimeType ? { mimeType } : undefined); }
    catch (e) { setError('Video recording is not supported here. Pick a file instead.'); return; }
    mr.ondataavailable = (e) => { if (e.data && e.data.size) chunksRef.current.push(e.data); };
    mr.onstop = () => {
      const type = mr.mimeType || mimeType || 'video/webm';
      const blob = new Blob(chunksRef.current, { type });
      const ext = type.includes('mp4') ? 'mp4' : 'webm';
      const file = new File([blob], `news-video-${Date.now()}.${ext}`, { type });
      cleanup();
      onCapture(file);
    };
    recorderRef.current = mr;
    mr.start();
    setRecording(true);
    setSecs(0);
    timerRef.current = setInterval(() => setSecs(s => s + 1), 1000);
  }

  function stopRecording() {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    try { recorderRef.current && recorderRef.current.stop(); } catch (e) {}
    setRecording(false);
  }

  const mmss = `${String(Math.floor(secs / 60)).padStart(2, '0')}:${String(secs % 60).padStart(2, '0')}`;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 3000, background: 'rgba(0,0,0,0.94)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <button type="button" onClick={() => { cleanup(); onClose(); }}
        style={{ position: 'absolute', top: 16, right: 16, width: 40, height: 40, borderRadius: '50%', border: 'none', background: 'rgba(255,255,255,0.15)', color: 'white', fontSize: 20, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>

      <div style={{ fontFamily: "'Noto Sans Telugu','Barlow',sans-serif", fontWeight: 800, fontSize: 15, color: 'white', marginBottom: 14 }}>
        {isVideo ? 'వీడియో రికార్డ్ చేయండి · Record a Video' : 'ఫోటో తీయండి · Take a Photo'}
      </div>

      {error ? (
        <div style={{ maxWidth: 340, textAlign: 'center' }}>
          <div style={{ fontSize: 13, color: '#FFD2D2', background: 'rgba(208,2,27,0.18)', border: '1px solid rgba(208,2,27,0.4)', borderRadius: 12, padding: '14px 16px', lineHeight: 1.5, marginBottom: 16 }}>
            {error}
          </div>
          <button type="button" onClick={() => { cleanup(); onFallback(); }}
            style={{ background: 'linear-gradient(135deg,#E8001E,#B0001A)', color: 'white', border: 'none', borderRadius: 12, padding: '12px 20px', fontSize: 13, fontWeight: 800, cursor: 'pointer' }}>
            Choose from Files
          </button>
        </div>
      ) : (
        <>
          <div style={{ width: '100%', maxWidth: 360, aspectRatio: '3 / 4', borderRadius: 16, overflow: 'hidden', background: '#000', border: '2px solid rgba(255,255,255,0.18)', position: 'relative' }}>
            <video ref={videoRef} playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            {!ready && (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>Starting camera…</div>
            )}
            {recording && (
              <div style={{ position: 'absolute', top: 10, left: 10, display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(0,0,0,0.55)', borderRadius: 20, padding: '4px 10px' }}>
                <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#FF1A35', animation: 'blink 1s infinite' }} />
                <span style={{ color: 'white', fontWeight: 800, fontSize: 12, fontFamily: "'Barlow Condensed',sans-serif", letterSpacing: 1 }}>REC {mmss}</span>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: 18, marginTop: 20, alignItems: 'center' }}>
            <button type="button" onClick={() => { cleanup(); onFallback(); }}
              style={{ background: 'rgba(255,255,255,0.12)', color: 'white', border: '1px solid rgba(255,255,255,0.25)', borderRadius: 12, padding: '12px 18px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
              Files
            </button>

            {!isVideo && (
              <button type="button" onClick={capturePhoto} disabled={!ready} aria-label="Capture photo"
                style={{ width: 68, height: 68, borderRadius: '50%', border: '4px solid rgba(255,255,255,0.85)', background: ready ? '#E8001E' : '#888', cursor: ready ? 'pointer' : 'not-allowed', boxShadow: '0 4px 16px rgba(208,2,27,0.5)' }} />
            )}

            {isVideo && !recording && (
              <button type="button" onClick={startRecording} disabled={!ready} aria-label="Start recording"
                style={{ width: 68, height: 68, borderRadius: '50%', border: '4px solid rgba(255,255,255,0.85)', background: ready ? '#E8001E' : '#888', cursor: ready ? 'pointer' : 'not-allowed', boxShadow: '0 4px 16px rgba(208,2,27,0.5)' }} />
            )}
            {isVideo && recording && (
              <button type="button" onClick={stopRecording} aria-label="Stop recording"
                style={{ width: 68, height: 68, borderRadius: '50%', border: '4px solid rgba(255,255,255,0.85)', background: '#111', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(0,0,0,0.5)' }}>
                <span style={{ width: 24, height: 24, borderRadius: 5, background: '#FF1A35' }} />
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export { MediaCaptureModal };
export default MediaCaptureModal;
