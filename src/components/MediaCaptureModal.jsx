import React, { useState, useEffect, useRef } from 'react';
import { useAppTheme } from '../_imports.js';

// Live capture — works on desktop AND mobile via getUserMedia. Three modes:
//   • 'photo' → camera preview + shutter            → JPEG File
//   • 'video' → camera preview + record/stop        → webm/mp4 File
//   • 'audio' → mic + record/stop (no video)        → webm/mp4 audio File
// After capture it shows a REVIEW step (clear preview + Retake / Use) before
// handing the File to onCapture. On error / denied permission it calls
// onFallback() so the caller can open a plain file input instead.
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
  // After a shot/recording, hold it for review (Retake / Use) before adding.
  const [captured,  setCaptured]  = useState(null); // { url, file }

  const isVideo = mode === 'video';
  const isAudio = mode === 'audio';
  const isPhoto = mode === 'photo';
  const needsRecorder = isVideo || isAudio;

  useEffect(() => {
    let cancelled = false;
    async function start() {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setError('Recording is not available in this browser.');
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia(
          isAudio ? { audio: true } : { video: { facingMode: 'environment' }, audio: isVideo }
        );
        if (cancelled) { stream.getTracks().forEach(t => t.stop()); return; }
        streamRef.current = stream;
        if (!isAudio && videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.muted = true;
          videoRef.current.play().catch(() => {});
        }
        setReady(true);
      } catch (e) {
        setError(e && e.name === 'NotAllowedError'
          ? (isAudio ? 'Microphone permission denied. Allow access, or pick a file instead.'
                     : 'Camera/microphone permission denied. Allow access, or pick a file instead.')
          : (isAudio ? 'Could not open the microphone. Pick a file instead.'
                     : 'Could not open the camera. Pick a file instead.'));
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
      setCaptured({ url: URL.createObjectURL(blob), file });
    }, 'image/jpeg', 0.9);
  }

  function startRecording() {
    const stream = streamRef.current;
    if (!stream || typeof MediaRecorder === 'undefined') {
      setError('Recording is not supported here. Pick a file instead.');
      return;
    }
    chunksRef.current = [];
    const candidates = isAudio
      ? ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg']
      : ['video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm', 'video/mp4'];
    const mimeType = candidates.find(t => MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(t)) || '';
    let mr;
    try { mr = new MediaRecorder(stream, mimeType ? { mimeType } : undefined); }
    catch (e) { setError('Recording is not supported here. Pick a file instead.'); return; }
    mr.ondataavailable = (e) => { if (e.data && e.data.size) chunksRef.current.push(e.data); };
    mr.onstop = () => {
      const type = mr.mimeType || mimeType || (isAudio ? 'audio/webm' : 'video/webm');
      const blob = new Blob(chunksRef.current, { type });
      const ext = type.includes('mp4') ? (isAudio ? 'm4a' : 'mp4') : (type.includes('ogg') ? 'ogg' : 'webm');
      const base = isAudio ? 'news-audio' : 'news-video';
      const file = new File([blob], `${base}-${Date.now()}.${ext}`, { type });
      setCaptured({ url: URL.createObjectURL(blob), file });
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

  function retake() {
    if (captured && captured.url) { try { URL.revokeObjectURL(captured.url); } catch (e) {} }
    setCaptured(null);
    setRecording(false);
    setSecs(0);
    if (!isAudio && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch(() => {});
    }
  }

  function useShot() {
    if (!captured) return;
    const file = captured.file;
    try { URL.revokeObjectURL(captured.url); } catch (e) {}
    cleanup();
    onCapture(file);
  }

  const mmss = `${String(Math.floor(secs / 60)).padStart(2, '0')}:${String(secs % 60).padStart(2, '0')}`;
  const title = captured
    ? (isAudio ? 'రివ్యూ · Review audio' : isVideo ? 'రివ్యూ · Review your video' : 'రివ్యూ · Review your photo')
    : (isAudio ? 'ఆడియో రికార్డ్ · Record Audio' : isVideo ? 'వీడియో రికార్డ్ · Record a Video' : 'ఫోటో · Take a Photo');

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 3000, background: 'rgba(0,0,0,0.94)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <button type="button" onClick={() => { cleanup(); onClose(); }}
        style={{ position: 'absolute', top: 16, right: 16, width: 40, height: 40, borderRadius: '50%', border: 'none', background: 'rgba(255,255,255,0.15)', color: 'white', fontSize: 20, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>

      <div style={{ fontFamily: "'Noto Sans Telugu','Barlow',sans-serif", fontWeight: 800, fontSize: 15, color: 'white', marginBottom: 14 }}>
        {title}
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
          {/* Preview / review surface */}
          <div style={{ width: '100%', maxWidth: 360, aspectRatio: isAudio ? '16 / 9' : '3 / 4', borderRadius: 16, overflow: 'hidden', background: '#000', border: '2px solid rgba(255,255,255,0.18)', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {/* Live camera (photo/video only, hidden while reviewing) */}
            {!isAudio && (
              <video ref={videoRef} playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover', display: captured ? 'none' : 'block' }} />
            )}

            {/* Audio idle/recording visual */}
            {isAudio && !captured && (
              <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.85)' }}>
                <div style={{ fontSize: 46, marginBottom: 8 }}>🎙️</div>
                <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 800, fontSize: 22, letterSpacing: 1 }}>
                  {recording ? mmss : (ready ? 'Ready' : 'Starting mic…')}
                </div>
              </div>
            )}

            {/* Captured review */}
            {captured && (
              isVideo ? <video src={captured.url} controls autoPlay playsInline style={{ width: '100%', height: '100%', objectFit: 'contain', background: '#000' }} />
              : isAudio ? <audio src={captured.url} controls autoPlay style={{ width: '90%' }} />
              : <img src={captured.url} alt="captured" style={{ width: '100%', height: '100%', objectFit: 'contain', background: '#000' }} />
            )}

            {!ready && !captured && !isAudio && (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>Starting camera…</div>
            )}
            {recording && !captured && !isAudio && (
              <div style={{ position: 'absolute', top: 10, left: 10, display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(0,0,0,0.55)', borderRadius: 20, padding: '4px 10px' }}>
                <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#FF1A35', animation: 'blink 1s infinite' }} />
                <span style={{ color: 'white', fontWeight: 800, fontSize: 12, fontFamily: "'Barlow Condensed',sans-serif", letterSpacing: 1 }}>REC {mmss}</span>
              </div>
            )}
          </div>

          {captured ? (
            /* Review controls — Retake / Use */
            <div style={{ display: 'flex', gap: 14, marginTop: 20, alignItems: 'center' }}>
              <button type="button" onClick={retake}
                style={{ background: 'rgba(255,255,255,0.12)', color: 'white', border: '1px solid rgba(255,255,255,0.3)', borderRadius: 12, padding: '13px 22px', fontSize: 14, fontWeight: 800, cursor: 'pointer' }}>
                ↺ Retake
              </button>
              <button type="button" onClick={useShot}
                style={{ background: 'linear-gradient(135deg,#10B981,#047857)', color: 'white', border: 'none', borderRadius: 12, padding: '13px 26px', fontSize: 14, fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 16px rgba(16,185,129,0.45)' }}>
                ✓ Use {isAudio ? 'Audio' : isVideo ? 'Video' : 'Photo'}
              </button>
            </div>
          ) : (
            /* Capture controls */
            <div style={{ display: 'flex', gap: 18, marginTop: 20, alignItems: 'center' }}>
              <button type="button" onClick={() => { cleanup(); onFallback(); }}
                style={{ background: 'rgba(255,255,255,0.12)', color: 'white', border: '1px solid rgba(255,255,255,0.25)', borderRadius: 12, padding: '12px 18px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                Files
              </button>

              {isPhoto && (
                <button type="button" onClick={capturePhoto} disabled={!ready} aria-label="Capture photo"
                  style={{ width: 68, height: 68, borderRadius: '50%', border: '4px solid rgba(255,255,255,0.85)', background: ready ? '#E8001E' : '#888', cursor: ready ? 'pointer' : 'not-allowed', boxShadow: '0 4px 16px rgba(208,2,27,0.5)' }} />
              )}

              {needsRecorder && !recording && (
                <button type="button" onClick={startRecording} disabled={!ready} aria-label="Start recording"
                  style={{ width: 68, height: 68, borderRadius: '50%', border: '4px solid rgba(255,255,255,0.85)', background: ready ? '#E8001E' : '#888', cursor: ready ? 'pointer' : 'not-allowed', boxShadow: '0 4px 16px rgba(208,2,27,0.5)' }} />
              )}
              {needsRecorder && recording && (
                <button type="button" onClick={stopRecording} aria-label="Stop recording"
                  style={{ width: 68, height: 68, borderRadius: '50%', border: '4px solid rgba(255,255,255,0.85)', background: '#111', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(0,0,0,0.5)' }}>
                  <span style={{ width: 24, height: 24, borderRadius: 5, background: '#FF1A35' }} />
                </button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export { MediaCaptureModal };
export default MediaCaptureModal;
