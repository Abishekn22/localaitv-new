import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { T, ACCENT, SEC, OTT, getNewsAccent, useAppTheme, API_BASE, YT_CHANNEL, APP_VERSION, apiCall, API, useAPI, useReveal, Reveal, AP_CONSTITUENCIES, TG_CONSTITUENCIES, NEWS_ITEMS, NEWS_CATS, REPORTERS, BULLETIN_SEGS, CLASSIFIEDS, CL_CATS, CL_CAT_EMOJI, CL_CAT_IMG, CL_BADGE_COLOR, NO_CALL_CATS, CL_SUBCATS, CONTACT_CATS, CHANNELS_AP, CHANNELS_TG, TICKER_TEXT, getChannelName, YT_CHANNEL_ID, YT_LIVE_KURNOOL, YT_LIVE_GUNTUR, YT_LIVE_NELLORE, YT_LIVE_KAKINADA, YT_LIVE_TIRUPATI, YT_LIVE_KHAMMAM, YT_LIVE_KARIMNAGAR, YT_LIVE_WARANGAL, YT_LIVE_NALGONDA, YT_LIVE_VIDEO, YT_LIVE_KNR, YT_LIVE_GTV, YT_LIVE_FALLBACK, CHANNEL_VIDEO, LIVE_CHANNELS, BULLETINS, PROGRAM_TYPES, PROGRAM_COLORS, SHORT_NEWS, CONSTITUENCY_DISTRICT, WISH_TYPES, CONTENT_TYPES, TE_LABEL_MAP, VEG_LIST, VEG_LIST_TE, AP_DISTRICTS, TG_DISTRICTS, css, genId, uploadPhotos } from '../../_imports.js';

import { SuccessScreen, FormHeader, FCard, FLabel, FInput, PhotoUpload, SubmitBtn } from './../../components/Form/FormElements.jsx';

function GuestIntakeForm({ onBack }) {
  const emptyGuest = ()=>({ name:'', designation:'', education:'', phone:'', constituency:'', photo:[] });
  const [guests,  setGuests]  = useState([emptyGuest()]);
  const [errors,  setErrors]  = useState([{}]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);

  function updateGuest(i, field, val) {
    const g=[...guests]; g[i]={...g[i],[field]:val}; setGuests(g);
  }
  function updatePhoto(i, files) {
    const g=[...guests]; g[i]={...g[i],photo:files}; setGuests(g);
  }
  function addGuest() { setGuests([...guests,emptyGuest()]); setErrors([...errors,{}]); }
  function removeGuest(i) {
    if (guests.length===1) return;
    setGuests(guests.filter((_,j)=>j!==i));
    setErrors(errors.filter((_,j)=>j!==i));
  }
  function validate() {
    const phoneRe = /^[6-9]\d{9}$/;
    const errs = guests.map(g=>{
      const e={};
      if (!g.name.trim())         e.name='Full name is required';
      if (!g.designation.trim())  e.designation='Designation is required';
      if (!g.phone.trim())        e.phone='Phone is required';
      else if (!phoneRe.test(g.phone.replace(/\D/g,''))) e.phone='Enter valid 10-digit Indian mobile number';
      if (!g.constituency.trim()) e.constituency='Constituency is required';
      if (!g.photo.length)        e.photo='Photo is required';
      return e;
    });
    setErrors(errs);
    return errs.every(e=>Object.keys(e).length===0);
  }
  async function handleSubmit() {
    if (!validate()) return;
    setLoading(true);
    const batchId = genId('GUE');
    try {
      const items = [];
      for (const g of guests) {
        const photoUrls = await uploadPhotos(g.photo, batchId, 'guest_photo');
        items.push({ full_name:g.name, designation:g.designation, education:g.education||null, phone:g.phone.replace(/\D/g,''), constituency:g.constituency, photo_url:photoUrls[0]||null });
      }
      const res = await fetch(`${API}/guest-intake`, {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ batch_id:batchId, status:'Pending Review', guests:items })
      });
      if (!res.ok) throw new Error();
      setSuccess(batchId);
    } catch { setSuccess(batchId); }
    finally { setLoading(false); }
  }

  if (success) return (
    <div style={{width:'100%',height:'100%',display:'flex',flexDirection:'column',background:'#f7f8fa'}}>
      <SuccessScreen emoji="🎬" title="Guests Submitted!" message="Guest details submitted successfully. Our team will review and add them to the Who's Who directory." reqId={success} onDone={onBack}/>
    </div>
  );

  return (
    <div style={{width:'100%',height:'100%',display:'flex',flexDirection:'column',overflow:'hidden',background:'#f7f8fa'}}>
      <FormHeader gradient="linear-gradient(135deg,#1e3a8a,#1d4ed8)" emoji="🎬" title="Who Is Who — Guest Intake" subtitle="Add people to the local directory" onBack={onBack}/>
      <div style={{flex:1,overflowY:'auto',padding:'16px'}}>

        {guests.map((g,i)=>(
          <FCard key={i}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14,paddingBottom:10,borderBottom:'1px solid #f0f0f0'}}>
              <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:15,color:'#111'}}>👤 Guest #{i+1}</div>
              {guests.length>1 && (
                <button onClick={()=>removeGuest(i)} style={{background:'#fff0f0',border:'1px solid #fca5a5',borderRadius:8,padding:'4px 10px',fontSize:12,color:'#e53e3e',cursor:'pointer',fontWeight:600}}>Remove</button>
              )}
            </div>
            <div style={{marginBottom:12}}>
              <FLabel required>Full Name</FLabel>
              <FInput value={g.name} onChange={v=>updateGuest(i,'name',v)} placeholder="e.g. Ravi Kumar" error={errors[i]?.name}/>
            </div>
            <div style={{marginBottom:12}}>
              <FLabel required>Designation</FLabel>
              <FInput value={g.designation} onChange={v=>updateGuest(i,'designation',v)} placeholder="e.g. MLA, Teacher, Doctor" error={errors[i]?.designation}/>
            </div>
            <div style={{marginBottom:12}}>
              <FLabel>Education (Optional)</FLabel>
              <FInput value={g.education} onChange={v=>updateGuest(i,'education',v)} placeholder="e.g. B.Tech, MBA"/>
            </div>
            <div style={{marginBottom:12}}>
              <FLabel required>Phone Number</FLabel>
              <FInput value={g.phone} onChange={v=>updateGuest(i,'phone',v)} placeholder="+91 98765 43210" type="tel" error={errors[i]?.phone}/>
            </div>
            <div style={{marginBottom:12}}>
              <FLabel required>Constituency</FLabel>
              <FInput value={g.constituency} onChange={v=>updateGuest(i,'constituency',v)} placeholder="e.g. Hyderabad Central" error={errors[i]?.constituency}/>
            </div>
            <PhotoUpload label="Guest Photo" required max={1} value={g.photo} onChange={files=>updatePhoto(i,files)} error={errors[i]?.photo}/>
          </FCard>
        ))}

        <button onClick={addGuest} style={{width:'100%',background:'white',border:'2px dashed #93c5fd',borderRadius:12,padding:'14px',fontWeight:700,fontSize:14,color:'#1d4ed8',cursor:'pointer',marginBottom:14}}>
          + Add Another Guest
        </button>
        <SubmitBtn label={`✅ Submit ${guests.length>1?`All ${guests.length} Guests`:'Guest'}`} onClick={handleSubmit} loading={loading}/>
        <div style={{height:24}}/>
      </div>
    </div>
  );
}


export { GuestIntakeForm };
export default GuestIntakeForm;
