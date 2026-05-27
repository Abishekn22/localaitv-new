import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { T, ACCENT, useAppTheme, TE_LABEL_MAP } from '../../_imports.js';

function SField({ label, required, children, error }) {
  return (
    <div style={{marginBottom:14}}>
      <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,fontSize:11,letterSpacing:1.5,textTransform:'uppercase',color:T.textMuted,marginBottom:7}}>
        {label}{required&&<span style={{color:T.red,marginLeft:3}}>*</span>}
      </div>
      {children}
      {error && <div style={{color:T.red,fontSize:10,marginTop:3}}>{error}</div>}
    </div>
  );
}
function SInput({ value, onChange, placeholder, type='text', style={} }) {
  return (
    <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
      style={{width:'100%',background:T.bg3,border:`1px solid ${T.border}`,borderRadius:10,padding:'12px 14px',color:T.text,fontSize:14,boxSizing:'border-box',...style,boxShadow:T.isDark?'none':`0 2px 8px ${T.shadow}`}}/>
  );
}
function STextarea({ value, onChange, placeholder, rows=3 }) {
  return (
    <textarea value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} rows={rows}
      style={{width:'100%',background:T.bg3,border:`1px solid ${T.border}`,borderRadius:10,padding:'12px 14px',color:T.text,fontSize:13,resize:'none',lineHeight:1.6,boxSizing:'border-box',boxShadow:T.isDark?'none':`0 2px 8px ${T.shadow}`}}/>
  );
}
function SSelect({ value, onChange, options, placeholder }) {
  return (
    <select value={value} onChange={e=>onChange(e.target.value)}
      style={{width:'100%',background:T.bg3,border:`1px solid ${T.border}`,borderRadius:10,padding:'12px 14px',color:value?'white':'rgba(255,255,255,0.4)',fontSize:14,boxSizing:'border-box',boxShadow:T.isDark?'none':`0 2px 8px ${T.shadow}`}}>
      <option value="" style={{background:T.bg2}}>{placeholder}</option>
      {options.map(o=><option key={o} value={o} style={{background:T.bg2}}>{o}</option>)}
    </select>
  );
}
function Label({ children }) {
  return (
    <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,fontSize:11,letterSpacing:2,textTransform:'uppercase',color:T.textMuted,marginBottom:8}}>
      {children}
    </div>
  );
}
function FormField({ label, value, onChange, placeholder, type='text', required, rows, children }) {
  const { T } = useAppTheme();
  if (rows) {
    return (
      <div style={{marginBottom:14}}>
        <div style={{fontSize:11,color:T.textMuted,marginBottom:6,fontWeight:600,letterSpacing:0.3}}>{label}{required && <span style={{color:T.red}}> *</span>}</div>
        <textarea value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} rows={rows} style={{width:'100%',background:T.bg3,border:`1px solid ${T.border}`,borderRadius:10,padding:'10px 12px',color:T.text,fontSize:13,resize:'vertical',fontFamily:'inherit',boxShadow:T.isDark?'none':`0 2px 8px ${T.shadow}`}} />
      </div>
    );
  }
  if (children) {
    return (
      <div style={{marginBottom:14}}>
        <div style={{fontSize:11,color:T.textMuted,marginBottom:6,fontWeight:600,letterSpacing:0.3}}>{label}{required && <span style={{color:T.red}}> *</span>}</div>
        {children}
      </div>
    );
  }
  return (
    <div style={{marginBottom:14}}>
      <div style={{fontSize:11,color:T.textMuted,marginBottom:6,fontWeight:600,letterSpacing:0.3}}>{label}{required && <span style={{color:T.red}}> *</span>}</div>
      <input value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} type={type} style={{width:'100%',background:T.bg3,border:`1px solid ${T.border}`,borderRadius:10,padding:'12px',color:T.text,fontSize:13,fontFamily:'inherit',boxShadow:T.isDark?'none':`0 2px 8px ${T.shadow}`}} />
    </div>
  );
}

function FormCheckbox({ checked, onChange, children }) {
  return (
    <label style={{display:'flex',alignItems:'flex-start',gap:10,cursor:'pointer',padding:'10px 0',userSelect:'none'}}>
      <input type="checkbox" checked={checked} onChange={e=>onChange(e.target.checked)} style={{marginTop:2,minWidth:16,width:16,height:16,accentColor:T.red,cursor:'pointer'}}/>
      <span style={{fontSize:12,color:T.textMuted,lineHeight:1.5}}>{children}</span>
    </label>
  );
}

function FormSuccess({ icon='✅', title, message, refId, onBack }) {
  return (
    <div style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'32px 24px',textAlign:'center'}}>
      <div style={{fontSize:60,marginBottom:16}}>{icon}</div>
      <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:22,color:T.text,marginBottom:8}}>{title}</div>
      <div style={{fontSize:13,color:T.textMuted,lineHeight:1.7,marginBottom:18,maxWidth:300}}>{message}</div>
      {refId && (
        <div style={{background:'rgba(255,184,0,0.1)',border:'1px solid rgba(255,184,0,0.25)',borderRadius:10,padding:'10px 16px',marginBottom:24}}>
          <div style={{fontSize:9,color:T.gold,letterSpacing:1,marginBottom:3}}>YOUR REFERENCE ID</div>
          <div style={{fontSize:13,fontWeight:700,color:T.text,letterSpacing:0.5,fontFamily:'monospace'}}>{refId}</div>
          <div style={{fontSize:9,color:T.textMuted,marginTop:4}}>Please save this ID for follow-up</div>
        </div>
      )}
      <button onClick={onBack} style={{background:T.red,color:'white',border:'none',borderRadius:14,padding:'12px 32px',fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,fontSize:14,letterSpacing:1.5,cursor:'pointer'}}>BACK TO HOME</button>
    </div>
  );
}

function FormHeader({ gradient, emoji, title, subtitle, onBack }) {
  const { T } = useAppTheme();
  return (
    <div style={{background:gradient,padding:'48px 18px 20px',flexShrink:0,position:'relative'}}>
      <button onClick={onBack} style={{
        position:'absolute',top:52,left:14,
        background:'rgba(255,255,255,0.18)',border:'none',
        borderRadius:8,width:32,height:32,
        color:'white',fontSize:16,cursor:'pointer',
        display:'flex',alignItems:'center',justifyContent:'center',
      }}>←</button>
      <div style={{textAlign:'center'}}>
        <div style={{fontSize:40,marginBottom:6}}>{emoji}</div>
        {/* Telugu (subtitle) renders BIG on top */}
        {subtitle && <div style={{fontFamily:"'Noto Sans Telugu','Barlow',sans-serif",fontWeight:900,fontSize:26,color:'white',letterSpacing:0.3,lineHeight:1.2,textShadow:'0 1px 3px rgba(0,0,0,0.25)'}}>{subtitle}</div>}
        {/* English (title) below, smaller */}
        <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:600,fontSize:14,color:'rgba(255,255,255,0.9)',letterSpacing:0.6,marginTop:subtitle?3:0,textShadow:'0 1px 2px rgba(0,0,0,0.2)'}}>{title}</div>
      </div>
    </div>
  );
}
function FCard({ children, style={} }) {
  const { T } = useAppTheme();
  return (
    <div style={{
      background: T.bg2,
      borderRadius:14,
      padding:'16px',
      marginBottom:14,
      border:`1px solid ${T.border}`,
      boxShadow: T.isDark ? 'none' : `0 2px 8px ${T.shadow}`,
      ...style,
    }}>{children}</div>
  );
}
function FLabel({ children, required, te }) {
  const { T } = useAppTheme();
  // Auto-resolve Telugu from map if children is a plain string
  const teResolved = te !== undefined ? te
    : (typeof children === 'string' && TE_LABEL_MAP[children]) || '';
  return (
    <div style={{marginBottom:6}}>
      {teResolved && (
        <div style={{fontFamily:"'Noto Sans Telugu','Barlow',sans-serif",fontWeight:800,fontSize:14,color:T.text,marginBottom:1,lineHeight:1.3}}>
          {teResolved}{required && <span style={{color:T.red,marginLeft:2}}>*</span>}
        </div>
      )}
      <div style={{fontWeight:teResolved?500:700,fontSize:teResolved?11:13,color:teResolved?T.textMuted:T.text}}>
        {children}{!teResolved && required && <span style={{color:T.red,marginLeft:2}}>*</span>}
      </div>
    </div>
  );
}
function FInput({ value, onChange, placeholder, type='text', error }) {
  const { T } = useAppTheme();
  return (
    <>
      <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
        style={{
          width:'100%',
          border:`1.5px solid ${error ? T.red : T.inputBorder}`,
          borderRadius:10,padding:'12px 14px',fontSize:14,
          color:T.text,background:T.inputBg,
          outline:'none',boxSizing:'border-box',
          boxShadow: T.isDark ? 'none' : `0 1px 4px ${T.shadow}`,
        }}/>
      {error && <div style={{color:'#e53e3e',fontSize:11,marginTop:3}}>{error}</div>}
    </>
  );
}
function FHelper({ children }) {
  return <div style={{fontSize:11,color:'#888',marginTop:4}}>{children}</div>;
}
function FSection({ title, children }) {
  return (
    <FCard>
      <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:15,color:'#111',letterSpacing:0.8,marginBottom:14,paddingBottom:10,borderBottom:'1px solid #f0f0f0'}}>{title}</div>
      {children}
    </FCard>
  );
}
function PhotoUpload({ label, required, max, value, onChange, error }) {
  const ref = useRef();
  const remove = (i) => { const a=[...value]; a.splice(i,1); onChange(a); };
  return (
    <div style={{marginBottom:12}}>
      <FLabel required={required}>{label}</FLabel>
      <div onClick={()=>ref.current.click()} style={{border:'2px dashed #ccc',borderRadius:10,padding:'16px',textAlign:'center',cursor:'pointer',background:'#fafafa',marginBottom:8}}>
        <div style={{fontSize:24,marginBottom:4}}>📷</div>
        <div style={{fontSize:13,color:'#555',fontWeight:600}}>Tap to upload photo</div>
        <div style={{fontSize:11,color:'#999',marginTop:2}}>JPG, PNG, WEBP · Max 10MB · Up to {max} photo{max>1?'s':''}</div>
      </div>
      <input ref={ref} type="file" accept="image/jpg,image/jpeg,image/png,image/webp" multiple={max>1} style={{display:'none'}}
        onChange={e=>{
          const files=Array.from(e.target.files);
          const allowed=files.slice(0,max-value.length);
          onChange([...value,...allowed]);
          e.target.value='';
        }}/>
      {value.length>0 && (
        <div style={{display:'flex',flexWrap:'wrap',gap:8,marginTop:6}}>
          {value.map((f,i)=>(
            <div key={i} style={{position:'relative',width:72,height:72}}>
              <img src={URL.createObjectURL(f)} alt="" style={{width:72,height:72,borderRadius:8,objectFit:'cover',border:'1.5px solid #ddd'}}/>
              <button onClick={()=>remove(i)} style={{position:'absolute',top:-6,right:-6,background:'#e53e3e',border:'none',borderRadius:'50%',width:18,height:18,color:T.text,fontSize:11,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>×</button>
            </div>
          ))}
        </div>
      )}
      {error && <div style={{color:'#e53e3e',fontSize:11,marginTop:3}}>{error}</div>}
    </div>
  );
}
// ── NEWS UPLOAD FORM — with AI moderation feedback ───────────
function SuccessScreen({ emoji, title, message, reqId, onDone }) {
  return (
    <div style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'32px 24px',textAlign:'center',background:'#f7f8fa'}}>
      <div style={{fontSize:64,marginBottom:16}}>{emoji}</div>
      <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:26,color:'#111',marginBottom:8}}>{title}</div>
      <div style={{fontSize:14,color:'#555',lineHeight:1.6,marginBottom:20}}>{message}</div>
      {reqId && (
        <div style={{background:'white',border:'1.5px solid #e2e8f0',borderRadius:12,padding:'12px 20px',marginBottom:24}}>
          <div style={{fontSize:11,color:'#888',marginBottom:2}}>Request ID</div>
          <div style={{fontFamily:'monospace',fontWeight:700,fontSize:16,color:'#2d3748'}}>{reqId}</div>
          <div style={{fontSize:10,color:'#aaa',marginTop:2}}>Status: Pending Review</div>
        </div>
      )}
      <button onClick={onDone} style={{background:'linear-gradient(135deg,#38a169,#276749)',color:T.text,border:'none',borderRadius:12,padding:'14px 32px',fontWeight:800,fontSize:15,cursor:'pointer',letterSpacing:0.5}}>
        ✅ Done
      </button>
    </div>
  );
}
function SubmitBtn({ label, labelTe, onClick, loading }) {
  return (
    <button onClick={onClick} disabled={loading} style={{width:'100%',background:loading?'#aaa':'linear-gradient(135deg,#38a169,#276749)',color:'white',border:'none',borderRadius:12,padding:'14px',cursor:loading?'not-allowed':'pointer',marginTop:4,display:'flex',flexDirection:'column',alignItems:'center',gap:2}}>
      {loading ? (
        <span style={{fontWeight:800,fontSize:16,letterSpacing:0.5}}>⏳ సమర్పిస్తోంది… / Submitting…</span>
      ) : labelTe ? (
        <>
          <span style={{fontFamily:"'Noto Sans Telugu','Barlow',sans-serif",fontWeight:900,fontSize:17,lineHeight:1.2}}>{labelTe}</span>
          <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:600,fontSize:12,letterSpacing:1.2,opacity:0.92}}>{label}</span>
        </>
      ) : (
        <span style={{fontWeight:800,fontSize:16,letterSpacing:0.5}}>{label}</span>
      )}
    </button>
  );
}

export {
  SField, SInput, STextarea, SSelect, Label,
  FormField, FormCheckbox, FormSuccess,
  FormHeader, FCard, FLabel, FInput, FHelper, FSection, PhotoUpload,
  SuccessScreen, SubmitBtn,
};
