import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { T, ACCENT, SEC, OTT, getNewsAccent, useAppTheme, API_BASE, YT_CHANNEL, APP_VERSION, apiCall, API, useAPI, useReveal, Reveal, AP_CONSTITUENCIES, TG_CONSTITUENCIES, NEWS_ITEMS, NEWS_CATS, REPORTERS, BULLETIN_SEGS, CLASSIFIEDS, CL_CATS, CL_CAT_EMOJI, CL_CAT_IMG, CL_BADGE_COLOR, NO_CALL_CATS, CL_SUBCATS, CONTACT_CATS, CHANNELS_AP, CHANNELS_TG, TICKER_TEXT, getChannelName, YT_CHANNEL_ID, YT_LIVE_KURNOOL, YT_LIVE_GUNTUR, YT_LIVE_NELLORE, YT_LIVE_KAKINADA, YT_LIVE_TIRUPATI, YT_LIVE_KHAMMAM, YT_LIVE_KARIMNAGAR, YT_LIVE_WARANGAL, YT_LIVE_NALGONDA, YT_LIVE_VIDEO, YT_LIVE_KNR, YT_LIVE_GTV, YT_LIVE_FALLBACK, CHANNEL_VIDEO, LIVE_CHANNELS, BULLETINS, PROGRAM_TYPES, PROGRAM_COLORS, SHORT_NEWS, CONSTITUENCY_DISTRICT, WISH_TYPES, CONTENT_TYPES, TE_LABEL_MAP, VEG_LIST, VEG_LIST_TE, AP_DISTRICTS, TG_DISTRICTS, css, genId, getUserLocationId } from '../../_imports.js';

import { SuccessScreen, FormHeader, FSection, FLabel, FCard, SubmitBtn } from './../../components/Form/FormElements.jsx';

function VegPriceForm({ onBack }) {
  const today = new Date().toISOString().split('T')[0];
  const [state,    setState]   = useState('');
  const [district, setDistrict]= useState('');
  const [date,     setDate]    = useState(today);
  const [rows,     setRows]    = useState(VEG_LIST.map(v=>({ veg:v, price:'', market:'', notes:'' })));
  const [errors,   setErrors]  = useState({});
  const [loading,  setLoading] = useState(false);
  const [success,  setSuccess] = useState(null);
  const [apiError, setApiError] = useState('');

  const districts = state==='AP' ? AP_DISTRICTS : state==='TG' ? TG_DISTRICTS : [];

  function updateRow(i, field, val) {
    const r=[...rows]; r[i]={...r[i],[field]:val}; setRows(r);
  }
  function validate() {
    const e={};
    if (!state)    e.state='Please select a state';
    if (!district) e.district='Please select a district';
    if (!date)     e.date='Date is required';
    const hasPrice = rows.some(r=>r.price.trim());
    if (!hasPrice) e.prices='Enter at least one vegetable price';
    setErrors(e);
    return Object.keys(e).length===0;
  }
  async function handleSubmit() {
    if (!validate()) return;
    setLoading(true);
    setApiError('');
    const reqId = genId('VEG');
    try {
      const items = rows.filter(r=>r.price.trim()).map(r=>({ vegetable_name:r.veg, price_per_kg:parseFloat(r.price), market_name:r.market, notes:r.notes }));
      const res = await fetch(`${API}/price-entries`, {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ request_id:reqId, location_id: getUserLocationId(), state, district, entry_date:date, status:'Submitted', items })
      });
      const _d = await res.json().catch(() => null);
      if (!res.ok) throw new Error((_d && (_d.message || _d.error)) || ('Submission failed (' + res.status + ')'));
      setSuccess((_d && _d.request_id) || reqId);
    } catch (e) { setApiError(e.message || 'Submission failed. Please check your connection and try again.'); }
    finally { setLoading(false); }
  }

  if (success) return (
    <div style={{width:'100%',height:'100%',display:'flex',flexDirection:'column',background:'#f7f8fa'}}>
      <SuccessScreen emoji="🥦" title="Price Entry Submitted!" message="Vegetable price entry submitted successfully. Thank you for helping the community!" reqId={success} onDone={onBack}/>
    </div>
  );

  return (
    <div style={{width:'100%',height:'100%',display:'flex',flexDirection:'column',overflow:'hidden',background:'#f7f8fa'}}>
      <FormHeader gradient="linear-gradient(135deg,#166534,#16a34a)" emoji="🥦" title="కూరగాయల ధరలు" subtitle="Vegetable Price Entry Form" onBack={onBack}/>
      <div style={{flex:1,overflowY:'auto',padding:'16px'}}>

        <FSection title="📍 Location & Date">
          <div style={{marginBottom:12}}>
            <FLabel required>State · రాష్ట్రం</FLabel>
            <select value={state} onChange={e=>{ setState(e.target.value); setDistrict(''); }}
              style={{width:'100%',border:`1.5px solid ${errors.state?'#e53e3e':'#ddd'}`,borderRadius:10,padding:'12px 14px',fontSize:14,background:'#fafafa',boxSizing:'border-box'}}>
              <option value="">-- రాష్ట్రం ఎంచుకోండి --</option>
              <option value="AP">Andhra Pradesh (AP)</option>
              <option value="TG">Telangana (TG)</option>
            </select>
            {errors.state && <div style={{color:'#e53e3e',fontSize:11,marginTop:3}}>{errors.state}</div>}
          </div>
          <div style={{marginBottom:12}}>
            <FLabel required>District · జిల్లా</FLabel>
            <select value={district} onChange={e=>setDistrict(e.target.value)} disabled={!state}
              style={{width:'100%',border:`1.5px solid ${errors.district?'#e53e3e':'#ddd'}`,borderRadius:10,padding:'12px 14px',fontSize:14,background:state?'#fafafa':'#f0f0f0',boxSizing:'border-box'}}>
              <option value="">-- జిల్లా ఎంచుకోండి --</option>
              {districts.map(d=><option key={d} value={d}>{d}</option>)}
            </select>
            {errors.district && <div style={{color:'#e53e3e',fontSize:11,marginTop:3}}>{errors.district}</div>}
          </div>
          <div>
            <FLabel required>Date · తేదీ</FLabel>
            <input type="date" value={date} onChange={e=>setDate(e.target.value)}
              style={{width:'100%',border:`1.5px solid ${errors.date?'#e53e3e':'#ddd'}`,borderRadius:10,padding:'12px 14px',fontSize:14,background:'#fafafa',boxSizing:'border-box'}}/>
            {errors.date && <div style={{color:'#e53e3e',fontSize:11,marginTop:3}}>{errors.date}</div>}
          </div>
        </FSection>

        {(state && district) && (
          <FCard>
            <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:15,color:'#111',marginBottom:4}}>🛒 Vegetable Prices</div>
            <div style={{fontSize:11,color:'#888',marginBottom:12}}>{district}, {state} · {date} · Enter prices you know</div>
            {errors.prices && <div style={{color:'#e53e3e',fontSize:12,marginBottom:10,background:'#fff5f5',padding:'8px 10px',borderRadius:8}}>{errors.prices}</div>}
            {rows.map((r,i)=>(
              <div key={i} style={{marginBottom:14,paddingBottom:14,borderBottom:i<rows.length-1?'1px solid #f0f0f0':'none'}}>
                <div style={{fontWeight:700,fontSize:13,color:'#1a5c2a',marginBottom:8}}>
                  {VEG_LIST_TE[i]} — {r.veg}
                </div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:6}}>
                  <div>
                    <div style={{fontSize:11,color:'#666',marginBottom:4}}>Price per kg (₹)</div>
                    <input type="number" value={r.price} onChange={e=>updateRow(i,'price',e.target.value)} placeholder="e.g. 28"
                      style={{width:'100%',border:'1.5px solid #ddd',borderRadius:8,padding:'10px 12px',fontSize:14,background:'#fafafa',boxSizing:'border-box'}}/>
                  </div>
                  <div>
                    <div style={{fontSize:11,color:'#666',marginBottom:4}}>Market Name</div>
                    <input value={r.market} onChange={e=>updateRow(i,'market',e.target.value)} placeholder="e.g. APMC Yard"
                      style={{width:'100%',border:'1.5px solid #ddd',borderRadius:8,padding:'10px 12px',fontSize:14,background:'#fafafa',boxSizing:'border-box'}}/>
                  </div>
                </div>
                <input value={r.notes} onChange={e=>updateRow(i,'notes',e.target.value)} placeholder="Optional notes…"
                  style={{width:'100%',border:'1.5px solid #eee',borderRadius:8,padding:'9px 12px',fontSize:12,color:'#555',background:'#fafafa',boxSizing:'border-box'}}/>
              </div>
            ))}
          </FCard>
        )}

        {apiError && <div style={{background:'rgba(208,2,27,0.08)',border:'1px solid rgba(208,2,27,0.25)',borderRadius:10,padding:'10px 14px',marginBottom:12,fontSize:12,color:'#D0021B',fontWeight:600}}>⚠️ {apiError}</div>}
        <SubmitBtn label="✅ Submit Price Entry" onClick={handleSubmit} loading={loading}/>
        <div style={{height:24}}/>
      </div>
    </div>
  );
}


export { VegPriceForm };
export default VegPriceForm;
