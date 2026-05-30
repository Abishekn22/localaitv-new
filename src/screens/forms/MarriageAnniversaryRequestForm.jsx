import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { T, ACCENT, SEC, OTT, getNewsAccent, useAppTheme, API_BASE, YT_CHANNEL, APP_VERSION, apiCall, API, useAPI, useReveal, Reveal, AP_CONSTITUENCIES, TG_CONSTITUENCIES, NEWS_ITEMS, NEWS_CATS, REPORTERS, BULLETIN_SEGS, CLASSIFIEDS, CL_CATS, CL_CAT_EMOJI, CL_CAT_IMG, CL_BADGE_COLOR, NO_CALL_CATS, CL_SUBCATS, CONTACT_CATS, CHANNELS_AP, CHANNELS_TG, TICKER_TEXT, getChannelName, YT_CHANNEL_ID, YT_LIVE_KURNOOL, YT_LIVE_GUNTUR, YT_LIVE_NELLORE, YT_LIVE_KAKINADA, YT_LIVE_TIRUPATI, YT_LIVE_KHAMMAM, YT_LIVE_KARIMNAGAR, YT_LIVE_WARANGAL, YT_LIVE_NALGONDA, YT_LIVE_VIDEO, YT_LIVE_KNR, YT_LIVE_GTV, YT_LIVE_FALLBACK, CHANNEL_VIDEO, LIVE_CHANNELS, BULLETINS, PROGRAM_TYPES, PROGRAM_COLORS, SHORT_NEWS, CONSTITUENCY_DISTRICT, WISH_TYPES, CONTENT_TYPES, TE_LABEL_MAP, VEG_LIST, VEG_LIST_TE, AP_DISTRICTS, TG_DISTRICTS, css, genId, uploadPhotos, getUserLocationId } from '../../_imports.js';

import { SuccessScreen, FormHeader, FCard, FLabel, FInput } from './../../components/Form/FormElements.jsx';

function MarriageAnniversaryRequestForm({ onBack }) {
  const { T } = useAppTheme();
  const ACCENT = '#9B5DE5';
  const [coupleName,    setCoupleName]    = useState('');
  const [marriageDate,  setMarriageDate]  = useState('');
  const [mainPhotos,    setMainPhotos]    = useState([]); // File[] (max 3)
  const [mainPreviews,  setMainPreviews]  = useState([]);
  // Up to 2 wishers, each with name, relation, up to 2 photos
  const [wishers, setWishers] = useState([{ name:'', relation:'', photos:[], previews:[] }]);
  const [errors,   setErrors]   = useState({});
  const [loading,  setLoading]  = useState(false);
  const [success,  setSuccess]  = useState(null);
  const [apiError, setApiError] = useState('');

  // Years of marriage (auto-calculated from marriage date)
  const years = marriageDate
    ? Math.floor((Date.now() - new Date(marriageDate)) / (365.25*24*3600*1000))
    : null;

  function updateWisher(i, field, val) {
    setWishers(w => { const n=[...w]; n[i]={...n[i],[field]:val}; return n; });
  }
  function addWisher() {
    setWishers(w => w.length < 2 ? [...w, { name:'', relation:'', photos:[], previews:[] }] : w);
  }
  function removeWisher(i) {
    setWishers(w => w.filter((_,j)=>j!==i));
  }
  function addWisherPhoto(i, file) {
    setWishers(w => {
      const n=[...w]; const cur=n[i];
      if (cur.photos.length >= 2) { alert('Maximum 2 photos per wisher.'); return w; }
      n[i] = { ...cur, photos:[...cur.photos,file], previews:[...cur.previews,URL.createObjectURL(file)] };
      return n;
    });
  }
  function removeWisherPhoto(i, j) {
    setWishers(w => {
      const n=[...w]; const cur=n[i];
      n[i] = { ...cur, photos:cur.photos.filter((_,k)=>k!==j), previews:cur.previews.filter((_,k)=>k!==j) };
      return n;
    });
  }

  function validate() {
    const e = {};
    if (!coupleName.trim()) e.coupleName = 'Couple name is required';
    if (!marriageDate)      e.marriageDate = 'Marriage date is required';
    wishers.forEach((w,i)=>{
      if (!w.name.trim())     e[`wname${i}`]     = 'Name is required';
      if (!w.relation.trim()) e[`wrelation${i}`] = 'Relation is required';
    });
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;
    setLoading(true);
    const reqId = genId('ANN');
    try {
      // Upload the couple's main photos.
      const couplePhotoUrls = mainPhotos.length
        ? await uploadPhotos(mainPhotos, reqId, 'anniversary') : [];

      // Upload each wisher's photos individually so each wisher row in the
      // backend keeps its own photo_uris list.
      const wishersOut = [];
      for (const w of wishers) {
        const wisherUrls = w.photos.length
          ? await uploadPhotos(w.photos, reqId, 'anniversary') : [];
        wishersOut.push({
          name: w.name,
          relation: w.relation,
          photo_count: w.photos.length,
          photo_uris: wisherUrls,
        });
      }

      const res = await fetch(`${API}/anniversary-requests`, {
        method:'POST', headers:{ 'Content-Type':'application/json' },
        body: JSON.stringify({
          request_id: reqId, location_id: getUserLocationId(),
          couple_name: coupleName,
          marriage_date: marriageDate,
          years_completed: years,
          wishers: wishersOut,
          scheduled_by_anniversary: true,
          status:'Pending Review',
          photo_uris: couplePhotoUrls,
        }),
      });
      const _d = await res.json().catch(() => null);
      if (!res.ok) throw new Error((_d && (_d.message || _d.error)) || ('Submission failed (' + res.status + ')'));
      setSuccess((_d && _d.request_id) || reqId);
    } catch (e) {
      setApiError(e.message || 'Submission failed. Please check your connection and try again.');
    }
    setLoading(false);
  }

  if (success) return (
    <div style={{width:'100%',height:'100%',background:'#f7f8fa'}}>
      <SuccessScreen emoji="💍" title="Anniversary Wishes Submitted!"
        message="Your marriage anniversary wishes have been submitted. They will be broadcast on the anniversary date automatically."
        reqId={success} onDone={onBack}/>
    </div>
  );

  // ── Reusable photo-tile buttons (Photo / Video / Library) for main photos ──
  const mainBtnDisabled = mainPreviews.length >= 3;
  return (
    <div style={{width:'100%',height:'100%',display:'flex',flexDirection:'column',overflow:'hidden',background:T.bg}}>
      <FormHeader gradient={`linear-gradient(135deg,${ACCENT},#6D28D9)`} emoji="💍"
        title="Marriage Anniversary" subtitle="వివాహ వార్షికోత్సవం" onBack={onBack}/>

      <div style={{flex:1,overflowY:'auto',padding:'16px 16px 140px'}}>

        {/* ── Anniversary Details ── */}
        <FCard>
          <div style={{marginBottom:14}}>
            <div style={{fontFamily:"'Noto Sans Telugu','Barlow',sans-serif",fontWeight:900,fontSize:18,color:ACCENT,lineHeight:1.3}}>💍 వివాహ వార్షికోత్సవ వివరాలు</div>
            <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:600,fontSize:13,color:ACCENT,letterSpacing:0.4}}>Marriage Anniversary Details</div>
          </div>

          <FLabel required>Couple Name (Husband &amp; Wife)</FLabel>
          <FInput value={coupleName} onChange={setCoupleName}
            placeholder="e.g. వెంకటేశ్వర రావు & లక్ష్మి (Venkateswara Rao & Lakshmi)"
            error={errors.coupleName}/>

          <div style={{marginTop:12}}>
            <FLabel required>పెళ్లి రోజు · Marriage Date</FLabel>
            <input type="date" value={marriageDate} onChange={e=>setMarriageDate(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              style={{width:'100%',border:`1.5px solid ${errors.marriageDate?T.red:T.inputBorder}`,
                borderRadius:10,padding:'12px 14px',fontSize:14,color:T.text,
                background:T.inputBg,boxSizing:'border-box'}}/>
            {errors.marriageDate && <div style={{color:T.red,fontSize:10,marginTop:3}}>{errors.marriageDate}</div>}
          </div>

          {/* Auto-calculated years */}
          {years !== null && years >= 0 && (
            <div style={{marginTop:10,background:`${ACCENT}14`,border:`1px solid ${ACCENT}33`,
              borderRadius:10,padding:'10px 14px',display:'flex',alignItems:'center',gap:8}}>
              <span style={{fontSize:20}}>🎊</span>
              <div>
                <div style={{fontWeight:700,fontSize:13,color:ACCENT}}>{years} years of marriage</div>
                <div style={{fontSize:10,color:T.textMuted}}>Auto-calculated from marriage date</div>
              </div>
            </div>
          )}

          {/* Marriage day photos / videos — Photo + Video + Library (max 3) */}
          <div style={{marginTop:14}}>
            <div style={{display:'flex',alignItems:'baseline',gap:8,marginBottom:10}}>
              <FLabel>పెళ్లి రోజు ఫోటోలు / వీడియోలు · Marriage Day Photos / Videos</FLabel>
              <span style={{fontSize:11,color:T.textMuted}}>(Maximum up to 3 files)</span>
            </div>
            <div style={{display:'flex',gap:8,marginBottom:10}}>
              <button type="button" disabled={mainBtnDisabled}
                onClick={()=>document.getElementById('anniv-main-camera')?.click()}
                style={{flex:1,aspectRatio:'1',borderRadius:12,cursor:mainBtnDisabled?'not-allowed':'pointer',border:'none',
                  background:`linear-gradient(160deg,${ACCENT} 0%,#6D28D9 100%)`,
                  boxShadow:`0 3px 12px ${ACCENT}55`,
                  display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:4,padding:'8px 4px',
                  opacity: mainBtnDisabled ? 0.55 : 1}}>
                <div style={{width:30,height:30,borderRadius:'50%',background:'rgba(255,255,255,0.22)',display:'flex',alignItems:'center',justifyContent:'center'}}>
                  <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>
                </div>
                <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:13,color:'white',fontWeight:900,lineHeight:1,letterSpacing:0.3,marginTop:1}}>Photo</span>
                <span style={{fontSize:8,color:'rgba(255,255,255,0.85)',fontWeight:500,lineHeight:1.1,textAlign:'center'}}>Take a picture</span>
              </button>

              <button type="button" disabled={mainBtnDisabled}
                onClick={()=>document.getElementById('anniv-main-video')?.click()}
                style={{flex:1,aspectRatio:'1',borderRadius:12,cursor:mainBtnDisabled?'not-allowed':'pointer',border:'none',
                  background:`linear-gradient(160deg,${ACCENT} 0%,#6D28D9 100%)`,
                  boxShadow:`0 3px 12px ${ACCENT}55`,
                  display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:4,padding:'8px 4px',
                  opacity: mainBtnDisabled ? 0.55 : 1}}>
                <div style={{width:30,height:30,borderRadius:'50%',background:'rgba(255,255,255,0.22)',display:'flex',alignItems:'center',justifyContent:'center'}}>
                  <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
                </div>
                <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:13,color:'white',fontWeight:900,lineHeight:1,letterSpacing:0.3,marginTop:1}}>Video</span>
                <span style={{fontSize:8,color:'rgba(255,255,255,0.85)',fontWeight:500,lineHeight:1.1,textAlign:'center'}}>Record a clip</span>
              </button>

              <button type="button" disabled={mainBtnDisabled}
                onClick={()=>document.getElementById('anniv-main-lib')?.click()}
                style={{flex:1,aspectRatio:'1',borderRadius:12,cursor:mainBtnDisabled?'not-allowed':'pointer',
                  border:`2px solid ${ACCENT}`,
                  background:T.isDark?T.bg3:'#FFFFFF',
                  display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:4,padding:'8px 4px',
                  opacity: mainBtnDisabled ? 0.55 : 1}}>
                <div style={{width:30,height:30,borderRadius:'50%',background:`${ACCENT}26`,display:'flex',alignItems:'center',justifyContent:'center'}}>
                  <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                </div>
                <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:13,color:ACCENT,fontWeight:900,lineHeight:1,letterSpacing:0.3,marginTop:1}}>Library</span>
                <span style={{fontSize:8,color:ACCENT,fontWeight:600,lineHeight:1.1,textAlign:'center'}}>Files &amp; Gallery</span>
              </button>
            </div>
            <input id="anniv-main-camera" type="file" accept="image/*" capture="environment" style={{display:'none'}}
              onChange={e=>{ const f=e.target.files?.[0]; if(!f)return;
                if(mainPreviews.length>=3){e.target.value='';alert('Maximum allowed is 3 files.');return;}
                setMainPhotos(p=>[...p,f]); setMainPreviews(p=>[...p,URL.createObjectURL(f)]); e.target.value=''; }}/>
            <input id="anniv-main-video" type="file" accept="video/*" capture="environment" style={{display:'none'}}
              onChange={e=>{ const f=e.target.files?.[0]; if(!f)return;
                if(mainPreviews.length>=3){e.target.value='';alert('Maximum allowed is 3 files.');return;}
                setMainPhotos(p=>[...p,f]); setMainPreviews(p=>[...p,URL.createObjectURL(f)]); e.target.value=''; }}/>
            <input id="anniv-main-lib" type="file" accept="image/*,video/*" style={{display:'none'}}
              onChange={e=>{ const f=e.target.files?.[0]; if(!f)return;
                if(mainPreviews.length>=3){e.target.value='';alert('Maximum allowed is 3 files.');return;}
                setMainPhotos(p=>[...p,f]); setMainPreviews(p=>[...p,URL.createObjectURL(f)]); e.target.value=''; }}/>

            {mainPreviews.length > 0 && (
              <div style={{display:'flex',gap:8}}>
                {mainPreviews.map((src,i)=>{
                  const file = mainPhotos[i];
                  const isVideo = file && file.type && file.type.startsWith('video/');
                  return (
                    <div key={i} style={{flex:1,aspectRatio:'1',position:'relative',borderRadius:12,overflow:'hidden',
                      border:`1.5px solid ${T.border}`,background:'#000',display:'flex',flexDirection:'column'}}>
                      <div style={{flex:1,position:'relative',overflow:'hidden',background:'#000'}}>
                        {isVideo ? (
                          <>
                            <video src={src} preload="metadata" muted style={{width:'100%',height:'100%',objectFit:'cover',display:'block'}}/>
                            <div style={{position:'absolute',top:'50%',left:'50%',transform:'translate(-50%,-50%)',width:30,height:30,borderRadius:'50%',background:'rgba(255,255,255,0.92)',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 2px 6px rgba(0,0,0,0.4)',pointerEvents:'none'}}>
                              <svg width={12} height={12} viewBox="0 0 24 24" fill={ACCENT}><polygon points="5,3 19,12 5,21"/></svg>
                            </div>
                          </>
                        ) : (
                          <img src={src} alt="" style={{width:'100%',height:'100%',objectFit:'cover',display:'block'}}/>
                        )}
                      </div>
                      <button type="button" onClick={()=>{
                        setMainPhotos(p=>p.filter((_,j)=>j!==i));
                        setMainPreviews(p=>p.filter((_,j)=>j!==i));
                      }} style={{
                        width:'100%',padding:'5px 0',background:`${ACCENT}E6`,border:'none',
                        color:'white',fontSize:10,fontWeight:700,letterSpacing:0.5,cursor:'pointer',flexShrink:0,
                      }}>Delete</button>
                    </div>
                  );
                })}
                {Array.from({length: 3 - mainPreviews.length}).map((_,i)=>(
                  <div key={`s${i}`} style={{flex:1,aspectRatio:'1'}}/>
                ))}
              </div>
            )}
          </div>
        </FCard>

        {/* ── Wishers (up to 2) ── */}
        {wishers.map((w, i) => (
          <FCard key={`wisher-${i}`}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:14}}>
              <div>
                <div style={{fontFamily:"'Noto Sans Telugu','Barlow',sans-serif",fontWeight:900,fontSize:18,color:ACCENT,lineHeight:1.3}}>
                  💌 {i===0 ? 'పెళ్లి రోజు శుభాకాంక్షలు తెలియచేయువారు' : `శుభాకాంక్షలు తెలియచేయువారు #${i+1}`}
                </div>
                <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:600,fontSize:13,color:ACCENT,letterSpacing:0.4}}>Wishes from {i+1}</div>
              </div>
              {wishers.length > 1 && (
                <button type="button" onClick={()=>removeWisher(i)}
                  style={{background:'transparent',border:'none',color:T.red,fontSize:12,fontWeight:700,cursor:'pointer'}}>
                  ✕ Remove
                </button>
              )}
            </div>

            <div style={{marginBottom:10}}>
              <FLabel required>Name</FLabel>
              <FInput value={w.name} onChange={v=>updateWisher(i,'name',v)}
                placeholder="e.g. పిల్లలు · అన్నయ్య · మనవళ్లు" error={errors[`wname${i}`]}/>
            </div>
            <div style={{marginBottom:14}}>
              <FLabel required>Relation</FLabel>
              <FInput value={w.relation} onChange={v=>updateWisher(i,'relation',v)}
                placeholder="e.g. Children · Brother · Grandchildren" error={errors[`wrelation${i}`]}/>
            </div>

            {/* Per-wisher photos (max 2) */}
            <div style={{display:'flex',alignItems:'baseline',gap:8,marginBottom:10}}>
              <FLabel>శుభాకాంక్షలు అందించేవారి ఫోటోలు · Wisher Photos</FLabel>
              <span style={{fontSize:11,color:T.textMuted}}>(Maximum 2)</span>
            </div>
            <div style={{display:'flex',gap:8,marginBottom:10}}>
              <button type="button" disabled={w.previews.length>=2}
                onClick={()=>document.getElementById(`anniv-w${i}-camera`)?.click()}
                style={{flex:1,aspectRatio:'2/1',borderRadius:12,cursor:w.previews.length>=2?'not-allowed':'pointer',border:'none',
                  background:`linear-gradient(160deg,${ACCENT} 0%,#6D28D9 100%)`,
                  boxShadow:`0 3px 12px ${ACCENT}55`,
                  display:'flex',alignItems:'center',justifyContent:'center',gap:8,
                  opacity: w.previews.length>=2 ? 0.55 : 1}}>
                <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>
                <div style={{display:'flex',flexDirection:'column',alignItems:'flex-start'}}>
                  <span style={{fontSize:13,color:'white',fontWeight:800,lineHeight:1}}>Photo</span>
                  <span style={{fontSize:9,color:'rgba(255,255,255,0.85)',marginTop:2}}>Take a picture</span>
                </div>
              </button>
              <button type="button" disabled={w.previews.length>=2}
                onClick={()=>document.getElementById(`anniv-w${i}-lib`)?.click()}
                style={{flex:1,aspectRatio:'2/1',borderRadius:12,cursor:w.previews.length>=2?'not-allowed':'pointer',
                  border:`2px solid ${ACCENT}`,
                  background:T.isDark?T.bg3:'#FFFFFF',
                  display:'flex',alignItems:'center',justifyContent:'center',gap:8,
                  opacity: w.previews.length>=2 ? 0.55 : 1}}>
                <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                <div style={{display:'flex',flexDirection:'column',alignItems:'flex-start'}}>
                  <span style={{fontSize:13,color:ACCENT,fontWeight:800,lineHeight:1}}>Library</span>
                  <span style={{fontSize:9,color:ACCENT,marginTop:2}}>From gallery</span>
                </div>
              </button>
            </div>
            <input id={`anniv-w${i}-camera`} type="file" accept="image/*" capture="environment" style={{display:'none'}}
              onChange={e=>{ const f=e.target.files?.[0]; if(!f)return; addWisherPhoto(i,f); e.target.value=''; }}/>
            <input id={`anniv-w${i}-lib`} type="file" accept="image/*" style={{display:'none'}}
              onChange={e=>{ const f=e.target.files?.[0]; if(!f)return; addWisherPhoto(i,f); e.target.value=''; }}/>

            {w.previews.length > 0 && (
              <div style={{display:'flex',gap:8}}>
                {w.previews.map((src,j)=>(
                  <div key={j} style={{flex:1,aspectRatio:'1',position:'relative',borderRadius:12,overflow:'hidden',
                    border:`1.5px solid ${T.border}`,background:'#000',display:'flex',flexDirection:'column'}}>
                    <img src={src} alt="" style={{width:'100%',height:'100%',objectFit:'cover',display:'block'}}/>
                    <button type="button" onClick={()=>removeWisherPhoto(i,j)} style={{
                      width:'100%',padding:'5px 0',background:`${ACCENT}E6`,border:'none',
                      color:'white',fontSize:10,fontWeight:700,letterSpacing:0.5,cursor:'pointer',flexShrink:0,
                    }}>Delete</button>
                  </div>
                ))}
                {Array.from({length: 2 - w.previews.length}).map((_,k)=>(
                  <div key={`s${k}`} style={{flex:1,aspectRatio:'1'}}/>
                ))}
              </div>
            )}
          </FCard>
        ))}

        {/* Add Another Wisher button (max 2) */}
        {wishers.length < 2 && (
          <button type="button" onClick={addWisher}
            style={{width:'100%',padding:'12px',borderRadius:12,cursor:'pointer',
              border:`2px dashed ${ACCENT}`, background:'transparent',
              color:ACCENT,fontWeight:800,fontSize:14,marginBottom:14}}>
            ＋ Add Another Wisher (max 2)
          </button>
        )}

        {apiError && (
          <div style={{background:'#FEE',border:'1px solid #FCC',borderRadius:10,padding:'10px 12px',color:T.red,fontSize:12,marginBottom:14}}>
            {apiError}
          </div>
        )}
      </div>

      {/* Submit bar (sticky bottom) */}
      <div style={{flexShrink:0,padding:'12px 16px 18px',background:T.bg,borderTop:`1px solid ${T.border}`}}>
        <button type="button" onClick={handleSubmit} disabled={loading}
          style={{width:'100%',padding:'14px 16px',borderRadius:12,border:'none',cursor:loading?'wait':'pointer',
            background:`linear-gradient(135deg,${ACCENT},#6D28D9)`,
            color:'white',fontWeight:900,fontSize:15,letterSpacing:0.3,
            boxShadow:`0 4px 16px ${ACCENT}66`,opacity:loading?0.7:1,
            fontFamily:"'Noto Sans Telugu','Barlow',sans-serif"}}>
          {loading ? 'Sending…' : '💍 వివాహ వార్షికోత్సవ శుభాకాంక్షలు పంపండి'}
        </button>
      </div>
    </div>
  );
}


export { MarriageAnniversaryRequestForm };
export default MarriageAnniversaryRequestForm;
