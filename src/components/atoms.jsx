import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { T, ACCENT, SEC, OTT, useAppTheme, useReveal, Reveal } from '../_imports.js';

// ── LOCATION PIN — 3D red map pin SVG (module-level, used everywhere) ──
// Matches the uploaded red glossy pin image. Single definition — no duplicates.
function LocationPin({ size = 28, glow = false, gold = false }) {
  const mainColor  = gold ? '#FFB800' : '#D0021B';
  const lightColor = gold ? '#FFD700' : '#FF4444';
  const darkColor  = gold ? '#996600' : '#7A0010';
  const uid = gold ? 'locpinG' : 'locpinR'; // stable IDs per variant
  return (
    <svg width={size} height={Math.round(size * 1.3)} viewBox="0 0 100 130" fill="none"
      style={{display:'block',flexShrink:0}} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id={uid+'Body'} cx="38%" cy="28%" r="68%">
          <stop offset="0%"   stopColor={lightColor}/>
          <stop offset="40%"  stopColor={mainColor}/>
          <stop offset="100%" stopColor={darkColor}/>
        </radialGradient>
        <radialGradient id={uid+'Shine'} cx="32%" cy="22%" r="45%">
          <stop offset="0%"   stopColor="rgba(255,255,255,0.52)"/>
          <stop offset="100%" stopColor="rgba(255,255,255,0)"/>
        </radialGradient>
      </defs>
      {/* Drop shadow ellipse */}
      {glow && <ellipse cx="50" cy="126" rx="18" ry="4" fill={`rgba(${gold?'200,140,0':'208,2,27'},0.3)`}/>}
      {/* Pin teardrop body */}
      <path d="M50 5 C22 5 5 26 5 47 C5 74 50 125 50 125 C50 125 95 74 95 47 C95 26 78 5 50 5Z"
        fill={`url(#${uid}Body)`}/>
      {/* Hole */}
      <circle cx="50" cy="45" r="20" fill="white"/>
      {/* Ring around hole */}
      <circle cx="50" cy="45" r="21" fill="none" stroke="rgba(255,255,255,0.28)" strokeWidth="1.5"/>
      {/* Glossy shine overlay */}
      <path d="M50 5 C22 5 5 26 5 47 C5 74 50 125 50 125 C50 125 95 74 95 47 C95 26 78 5 50 5Z"
        fill={`url(#${uid}Shine)`}/>
    </svg>
  );
}


// ── SkeletonBox — themed wrapper around react-loading-skeleton ──
// Keeps the original API (a single `style` prop carrying width/height/
// borderRadius/margins/paddingBottom) so every existing call site upgrades to
// the library animation with no changes. The caller's `style` sizes an outer
// box (so aspect-ratio boxes using height:0 + paddingBottom still work) and a
// react-loading-skeleton fills it, inheriting the rounded corners.
function SkeletonBox({ style = {} }) {
  const { T } = useAppTheme();
  const base = T.isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)';
  const high = T.isDark ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.65)';
  const radius = style.borderRadius != null ? style.borderRadius : 8;
  return (
    <SkeletonTheme baseColor={base} highlightColor={high}>
      <div style={{ position:'relative', overflow:'hidden', ...style, borderRadius:radius, background:'transparent' }}>
        <Skeleton
          containerClassName="skbox-fill"
          style={{ position:'absolute', inset:0, width:'100%', height:'100%', borderRadius:'inherit', lineHeight:1, transform:'none' }}
        />
      </div>
    </SkeletonTheme>
  );
}

function LiveDot({ size=6 }) {
  return <span style={{display:'inline-block',width:size,height:size,borderRadius:'50%',background:T.red,animation:'blink 1s infinite',flexShrink:0}} />;
}

// Footer link button — used on home page bottom for legal/contact/business links
function FooterLink({ label, sub, onClick, highlight }) {
  const { T } = useAppTheme();
  return (
    <button onClick={onClick} style={{
      background: highlight
        ? `linear-gradient(135deg,rgba(208,2,27,0.1),rgba(0,198,184,0.06))`
        : T.bg2,
      border: `1px solid ${highlight ? 'rgba(208,2,27,0.2)' : T.border}`,
      borderRadius: 10,
      padding: '10px 10px',
      cursor: 'pointer',
      textAlign: 'left',
      transition: 'all 0.15s',
      display: 'flex',
      flexDirection: 'column',
      gap: 3,
      boxShadow: T.isDark ? 'none' : `0 1px 4px ${T.shadow}`,
    }}>
      <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,fontSize:11,color:highlight?T.red:T.text,letterSpacing:0.3,lineHeight:1.2}}>{label}</span>
      <span style={{fontFamily:"'Noto Sans Telugu',sans-serif",fontSize:10,fontWeight:700,color:T.textMuted,lineHeight:1.6}}>{sub}</span>
    </button>
  );
}

function Badge({ children, color=T.red, bg }) {
  return (
    <span style={{
      background: bg || color+'22',
      color: color,
      border:`1px solid ${color}44`,
      borderRadius:6,
      padding:'2px 8px',
      fontSize:9,
      fontWeight:700,
      letterSpacing:'1.5px',
      textTransform:'uppercase',
      fontFamily:"'Barlow Condensed',sans-serif",
      display:'inline-flex',
      alignItems:'center',
      gap:4,
    }}>{children}</span>
  );
}
// ── GLOBE ICON — Uniform clean blue sphere ──────────────────────
function GlobeIcon({ size = 180 }) {
  const s  = size;
  const cx = s / 2;
  const cy = s / 2;
  const R  = s * 0.43;

  return (
    <div style={{
      width:s, height:s,
      display:'flex', alignItems:'center', justifyContent:'center',
      margin:'0 auto', flexShrink:0,
    }}>
      <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}
           xmlns="http://www.w3.org/2000/svg" style={{display:'block'}}>
        <defs>
          {/* Single uniform blue — centred, even all around */}
          <radialGradient id="gBase" cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor="#1a4db8"/>
            <stop offset="55%"  stopColor="#0e2d78"/>
            <stop offset="100%" stopColor="#061540"/>
          </radialGradient>

          {/* Atmosphere rim only — stays at edge */}
          <radialGradient id="gAtm" cx="50%" cy="50%" r="50%">
            <stop offset="70%"  stopColor="rgba(0,0,0,0)"/>
            <stop offset="88%"  stopColor="rgba(60,130,255,0.30)"/>
            <stop offset="95%"  stopColor="rgba(100,170,255,0.55)"/>
            <stop offset="100%" stopColor="rgba(150,205,255,0.75)"/>
          </radialGradient>

          <clipPath id="gClip">
            <circle cx={cx} cy={cy} r={R}/>
          </clipPath>

          <filter id="gBlur">
            <feGaussianBlur stdDeviation={s*0.04}/>
          </filter>

          <filter id="gGlow" x="-25%" y="-25%" width="150%" height="150%">
            <feGaussianBlur in="SourceGraphic" stdDeviation={s*0.05} result="b"/>
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>

        {/* Outer soft glow ring */}
        <circle cx={cx} cy={cy} r={R*1.12}
          fill="none"
          stroke="rgba(60,120,255,0.18)"
          strokeWidth={R*0.10}
          filter="url(#gGlow)"/>

        {/* Base sphere — single uniform gradient */}
        <circle cx={cx} cy={cy} r={R} fill="url(#gBase)"/>

        {/* Grid lines — latitude */}
        <g clipPath="url(#gClip)" fill="none"
           stroke="rgba(140,190,255,0.22)" strokeWidth="0.7">
          {[-60,-40,-20,0,20,40,60].map((lat,i)=>{
            const fy=cy+(lat/90)*R;
            const rr=Math.sqrt(Math.max(0,R*R-(fy-cy)*(fy-cy)));
            return rr>2
              ? <ellipse key={i} cx={cx} cy={fy} rx={rr} ry={rr*0.13}/>
              : null;
          })}
        </g>

        {/* Grid lines — longitude */}
        <g clipPath="url(#gClip)" fill="none"
           stroke="rgba(140,190,255,0.22)" strokeWidth="0.7">
          {[0,20,40,60,80,100,120,140,160].map((lon,i)=>{
            const a=(lon*Math.PI)/180;
            const rx=Math.abs(Math.cos(a))*R*0.88+R*0.12;
            return <ellipse key={i} cx={cx} cy={cy} rx={rx} ry={R}
              transform={`rotate(${lon} ${cx} ${cy})`}/>;
          })}
        </g>

        {/* Atmosphere rim overlay */}
        <circle cx={cx} cy={cy} r={R}
          fill="url(#gAtm)" clipPath="url(#gClip)"/>

        {/* Clean blue rim stroke */}
        <circle cx={cx} cy={cy} r={R}
          fill="none"
          stroke="rgba(100,165,255,0.55)"
          strokeWidth="2.5"/>

        {/* Drop shadow under globe */}
        <ellipse cx={cx} cy={cy+R*1.10}
          rx={R*0.52} ry={R*0.065}
          fill="rgba(0,0,0,0.35)"
          filter="url(#gBlur)"/>
      </svg>
    </div>
  );
}



export { LocationPin, SkeletonBox, LiveDot, FooterLink, Badge, GlobeIcon };
