import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { T, ACCENT, SEC, OTT, getNewsAccent, useAppTheme, API_BASE, YT_CHANNEL, APP_VERSION, apiCall, API, useAPI, useReveal, Reveal, AP_CONSTITUENCIES, TG_CONSTITUENCIES, NEWS_ITEMS, NEWS_CATS, REPORTERS, BULLETIN_SEGS, CLASSIFIEDS, CL_CATS, CL_CAT_EMOJI, CL_CAT_IMG, CL_BADGE_COLOR, NO_CALL_CATS, CL_SUBCATS, CONTACT_CATS, CHANNELS_AP, CHANNELS_TG, TICKER_TEXT, getChannelName, YT_CHANNEL_ID, YT_LIVE_KURNOOL, YT_LIVE_GUNTUR, YT_LIVE_NELLORE, YT_LIVE_KAKINADA, YT_LIVE_TIRUPATI, YT_LIVE_KHAMMAM, YT_LIVE_KARIMNAGAR, YT_LIVE_WARANGAL, YT_LIVE_NALGONDA, YT_LIVE_VIDEO, YT_LIVE_KNR, YT_LIVE_GTV, YT_LIVE_FALLBACK, CHANNEL_VIDEO, LIVE_CHANNELS, BULLETINS, PROGRAM_TYPES, PROGRAM_COLORS, SHORT_NEWS, CONSTITUENCY_DISTRICT, WISH_TYPES, CONTENT_TYPES, TE_LABEL_MAP, VEG_LIST, VEG_LIST_TE, AP_DISTRICTS, TG_DISTRICTS, css } from '../_imports.js';

import { SField, SInput, STextarea, SSelect } from './Form/FormElements.jsx';

function SpecialContentForm({ type, selType, onSubmit }) {
  const [done, setDone] = useState(false);
  // Common fields
  const [contact, setContact] = useState('');
  const [location, setLocation] = useState('');
  const [desc, setDesc] = useState('');
  // Type-specific fields
  const [f1,setF1] = useState(''); // title / name / company
  const [f2,setF2] = useState(''); // subtitle / salary / price
  const [f3,setF3] = useState(''); // detail 1
  const [f4,setF4] = useState(''); // detail 2
  const [f5,setF5] = useState(''); // detail 3
  const [urgent, setUrgent] = useState(false);

  function submit() {
    if (!f1.trim() || !contact.trim()) return;
    setDone(true);
    onSubmit && onSubmit();
  }

  if (done) return (
    <div style={{textAlign:'center',padding:'32px 16px'}}>
      <div style={{fontSize:56,marginBottom:12}}>{selType.icon}</div>
      <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:22,color:T.text,marginBottom:6}}>{selType.label} Submitted!</div>
      <div style={{fontSize:12,color:T.textMuted,marginBottom:16}}>Your {selType.label.toLowerCase()} will be reviewed and broadcast shortly.</div>
      <div style={{background:T.bg3,borderRadius:12,padding:'12px 16px',display:'inline-block',marginBottom:20,boxShadow:T.isDark?'none':`0 2px 8px ${T.shadow}`}}>
        <div style={{fontSize:10,color:T.textMuted,marginBottom:2}}>Reference ID</div>
        <div style={{fontFamily:'monospace',fontWeight:700,fontSize:14,color:T.gold}}>{selType.id.slice(0,3).toUpperCase()}-{Date.now().toString().slice(-6)}</div>
      </div>
    </div>
  );

  const headerColor = selType.color;

  // ── JOB POSTING ──────────────────────────────────────────────
  if (type === 'Job') return (
    <div>
      <div style={{background:`linear-gradient(135deg,${headerColor}22,${headerColor}11)`,border:`1px solid ${headerColor}44`,borderRadius:14,padding:'14px 16px',marginBottom:18,display:'flex',alignItems:'center',gap:10}}>
        <span style={{fontSize:28}}>💼</span>
        <div>
          <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:17,color:T.text}}>Job Posting</div>
          <div style={{fontSize:11,color:T.textMuted}}>Broadcast to {'{constituency}'} job seekers</div>
        </div>
      </div>
      <SField label="Job Title" required><SInput value={f1} onChange={setF1} placeholder="e.g. Computer Operator, Driver, Nurse"/></SField>
      <SField label="Company / Employer Name" required><SInput value={f2} onChange={setF2} placeholder="e.g. Sri Raju Travels, Narayana Hospital"/></SField>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
        <SField label="Salary Range"><SInput value={f3} onChange={setF3} placeholder="e.g. ₹12,000–15,000"/></SField>
        <SField label="Openings"><SInput value={f4} onChange={setF4} placeholder="e.g. 3 posts" type="number"/></SField>
      </div>
      <SField label="Requirements"><STextarea value={desc} onChange={setDesc} placeholder="Qualification, experience, age limit, skills required…"/></SField>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
        <SField label="Location" required><SInput value={location} onChange={setLocation} placeholder="e.g. Kurnool"/></SField>
        <SField label="Contact Number" required><SInput value={contact} onChange={setContact} placeholder="98765 43210" type="tel"/></SField>
      </div>
      <button onClick={submit} style={{width:'100%',background:`linear-gradient(135deg,${headerColor},${headerColor}cc)`,color:T.text,border:'none',borderRadius:12,padding:'15px',fontWeight:800,fontSize:15,cursor:'pointer',marginTop:4}}>💼 Post Job</button>
    </div>
  );

  // ── PROPERTY AD ───────────────────────────────────────────────
  if (type === 'Property') return (
    <div>
      <div style={{background:`linear-gradient(135deg,${headerColor}22,${headerColor}11)`,border:`1px solid ${headerColor}44`,borderRadius:14,padding:'14px 16px',marginBottom:18,display:'flex',alignItems:'center',gap:10}}>
        <span style={{fontSize:28}}>🏠</span>
        <div>
          <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:17,color:T.text}}>Property Ad</div>
          <div style={{fontSize:11,color:T.textMuted}}>Rent · Sale · PG · Commercial</div>
        </div>
      </div>
      <SField label="Ad Type" required>
        <SSelect value={f1} onChange={setF1} placeholder="Select type…" options={['House for Rent','House for Sale','Shop for Rent','Shop for Sale','PG / Hostel','Land for Sale','Land for Lease','Flat for Rent','Flat for Sale','Office Space']}/>
      </SField>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
        <SField label="Size / Area"><SInput value={f2} onChange={setF2} placeholder="e.g. 2BHK, 200 Sq Yd"/></SField>
        <SField label="Price / Rent" required><SInput value={f3} onChange={setF3} placeholder="e.g. ₹8,000/month"/></SField>
      </div>
      <SField label="Details"><STextarea value={desc} onChange={setDesc} placeholder="Furnishing, floor, facilities, nearby landmarks…"/></SField>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
        <SField label="Locality" required><SInput value={location} onChange={setLocation} placeholder="e.g. Kurnool Main Road"/></SField>
        <SField label="Contact" required><SInput value={contact} onChange={setContact} placeholder="98765 43210" type="tel"/></SField>
      </div>
      <button onClick={submit} style={{width:'100%',background:`linear-gradient(135deg,${headerColor},${headerColor}cc)`,color:T.text,border:'none',borderRadius:12,padding:'15px',fontWeight:800,fontSize:15,cursor:'pointer',marginTop:4}}>🏠 Post Property Ad</button>
    </div>
  );

  // ── VEHICLE SALE ─────────────────────────────────────────────
  if (type === 'Vehicle') return (
    <div>
      <div style={{background:`linear-gradient(135deg,${headerColor}22,${headerColor}11)`,border:`1px solid ${headerColor}44`,borderRadius:14,padding:'14px 16px',marginBottom:18,display:'flex',alignItems:'center',gap:10}}>
        <span style={{fontSize:28}}>🚗</span>
        <div>
          <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:17,color:T.text}}>Vehicle Sale</div>
          <div style={{fontSize:11,color:T.textMuted}}>Bike · Car · Auto · Tractor</div>
        </div>
      </div>
      <SField label="Vehicle Type" required>
        <SSelect value={f1} onChange={setF1} placeholder="Select vehicle…" options={['Motorcycle / Bike','Scooter','Car','Auto Rickshaw','Tractor','Truck / Lorry','Van','Cycle','Electric Vehicle']}/>
      </SField>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
        <SField label="Brand & Model" required><SInput value={f2} onChange={setF2} placeholder="e.g. Honda Activa 6G"/></SField>
        <SField label="Year"><SInput value={f3} onChange={setF3} placeholder="e.g. 2021" type="number"/></SField>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
        <SField label="KM Driven"><SInput value={f4} onChange={setF4} placeholder="e.g. 12,000 km"/></SField>
        <SField label="Asking Price" required><SInput value={f5} onChange={setF5} placeholder="e.g. ₹55,000"/></SField>
      </div>
      <SField label="Condition & Details"><STextarea value={desc} onChange={setDesc} placeholder="Single owner, all papers clear, no accidents, insurance valid…"/></SField>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
        <SField label="Location" required><SInput value={location} onChange={setLocation} placeholder="e.g. Kurnool"/></SField>
        <SField label="Contact" required><SInput value={contact} onChange={setContact} placeholder="98765 43210" type="tel"/></SField>
      </div>
      <button onClick={submit} style={{width:'100%',background:`linear-gradient(135deg,${headerColor},${headerColor}cc)`,color:T.text,border:'none',borderRadius:12,padding:'15px',fontWeight:800,fontSize:15,cursor:'pointer',marginTop:4}}>🚗 Post Vehicle Ad</button>
    </div>
  );

  // ── BUSINESS PROMO ───────────────────────────────────────────
  if (type === 'Business') return (
    <div>
      <div style={{background:`linear-gradient(135deg,${headerColor}22,${headerColor}11)`,border:`1px solid ${headerColor}44`,borderRadius:14,padding:'14px 16px',marginBottom:18,display:'flex',alignItems:'center',gap:10}}>
        <span style={{fontSize:28}}>🏪</span>
        <div>
          <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:17,color:T.text}}>Business Promotion</div>
          <div style={{fontSize:11,color:T.textMuted}}>Broadcast your offer to local customers</div>
        </div>
      </div>
      <SField label="Business / Shop Name" required><SInput value={f1} onChange={setF1} placeholder="e.g. Sri Sai Mobiles, Narayana Bakery"/></SField>
      <SField label="Offer / Promotion Headline" required><SInput value={f2} onChange={setF2} placeholder="e.g. 30% off on all mobiles this Diwali!"/></SField>
      <SField label="Category">
        <SSelect value={f3} onChange={setF3} placeholder="Select category…" options={['Mobile & Electronics','Grocery & Supermarket','Medical & Pharmacy','Clothing & Fashion','Hotel & Restaurant','Jewellery','Furniture','Hardware','Agriculture Supplies','Education & Coaching','Salon & Beauty','Other']}/>
      </SField>
      <SField label="Offer Details"><STextarea value={desc} onChange={setDesc} placeholder="Describe the offer, validity dates, special discounts, free gifts…"/></SField>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
        <SField label="Valid Till"><input type="date" value={f4} onChange={e=>setF4(e.target.value)} style={{width:'100%',background:T.bg3,border:`1px solid ${T.border}`,borderRadius:10,padding:'12px 14px',color:T.text,fontSize:13,boxSizing:'border-box',boxShadow:T.isDark?'none':`0 2px 8px ${T.shadow}`}}/></SField>
        <SField label="Contact" required><SInput value={contact} onChange={setContact} placeholder="98765 43210" type="tel"/></SField>
      </div>
      <SField label="Shop Address / Location" required><SInput value={location} onChange={setLocation} placeholder="e.g. Kurnool Main Bazaar, Near Bus Stand"/></SField>
      <button onClick={submit} style={{width:'100%',background:`linear-gradient(135deg,${headerColor},${headerColor}cc)`,color:T.text,border:'none',borderRadius:12,padding:'15px',fontWeight:800,fontSize:15,cursor:'pointer',marginTop:4}}>🏪 Submit Business Promo</button>
    </div>
  );

  // ── OBITUARY ──────────────────────────────────────────────────
  if (type === 'Obituary') return (
    <div>
      <div style={{background:'rgba(55,65,81,0.3)',border:`1px solid ${T.border}`,borderRadius:14,padding:'14px 16px',marginBottom:18,display:'flex',alignItems:'center',gap:10}}>
        <span style={{fontSize:28}}>⚰️</span>
        <div>
          <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:17,color:T.text}}>Obituary / Condolence</div>
          <div style={{fontSize:11,color:T.textMuted}}>Announce respectfully to the community</div>
        </div>
      </div>
      <div style={{background:'rgba(55,65,81,0.2)',borderRadius:10,padding:'10px 14px',marginBottom:16,fontSize:11,color:T.textMuted,lineHeight:1.6}}>
        🕊️ This announcement will be broadcast with full respect and dignity across {'{constituency}'} TV.
      </div>
      <SField label="Full Name of Deceased" required><SInput value={f1} onChange={setF1} placeholder="e.g. Sri Venkata Ramaiah Garu"/></SField>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
        <SField label="Age"><SInput value={f2} onChange={setF2} placeholder="e.g. 78" type="number"/></SField>
        <SField label="Date of Passing"><input type="date" value={f3} onChange={e=>setF3(e.target.value)} style={{width:'100%',background:T.bg3,border:`1px solid ${T.border}`,borderRadius:10,padding:'12px 14px',color:T.text,fontSize:13,boxSizing:'border-box',boxShadow:T.isDark?'none':`0 2px 8px ${T.shadow}`}}/></SField>
      </div>
      <SField label="Funeral / Prayer Timing"><SInput value={f4} onChange={setF4} placeholder="e.g. Tomorrow 10 AM, Sri Rama Temple, Kurnool"/></SField>
      <SField label="Message from Family"><STextarea value={desc} onChange={setDesc} placeholder="Brief condolence message, life achievements, survived by…"/></SField>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
        <SField label="Family Contact" required><SInput value={contact} onChange={setContact} placeholder="98765 43210" type="tel"/></SField>
        <SField label="Location" required><SInput value={location} onChange={setLocation} placeholder="e.g. Kurnool"/></SField>
      </div>
      <button onClick={submit} style={{width:'100%',background:'linear-gradient(135deg,#374151,#4b5563)',color:T.text,border:'none',borderRadius:12,padding:'15px',fontWeight:800,fontSize:15,cursor:'pointer',marginTop:4}}>🕊️ Submit Obituary</button>
    </div>
  );

  // ── EDUCATION / ADMISSIONS ────────────────────────────────────
  if (type === 'Education') return (
    <div>
      <div style={{background:`linear-gradient(135deg,${headerColor}22,${headerColor}11)`,border:`1px solid ${headerColor}44`,borderRadius:14,padding:'14px 16px',marginBottom:18,display:'flex',alignItems:'center',gap:10}}>
        <span style={{fontSize:28}}>🎓</span>
        <div>
          <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:17,color:T.text}}>Education / Admissions</div>
          <div style={{fontSize:11,color:T.textMuted}}>School · College · Coaching · Training</div>
        </div>
      </div>
      <SField label="Institution Name" required><SInput value={f1} onChange={setF1} placeholder="e.g. Narayana Junior College, Kurnool"/></SField>
      <SField label="Announcement Type" required>
        <SSelect value={f2} onChange={setF2} placeholder="Select type…" options={['Admissions Open','Results Announced','Scholarship Available','Free Coaching','Entrance Exam','New Batch Starting','Fee Concession','Achievement / Rank','Workshop / Seminar','Other']}/>
      </SField>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
        <SField label="Courses Offered"><SInput value={f3} onChange={setF3} placeholder="e.g. B.Tech, IIT, NEET"/></SField>
        <SField label="Last Date"><input type="date" value={f4} onChange={e=>setF4(e.target.value)} style={{width:'100%',background:T.bg3,border:`1px solid ${T.border}`,borderRadius:10,padding:'12px 14px',color:T.text,fontSize:13,boxSizing:'border-box',boxShadow:T.isDark?'none':`0 2px 8px ${T.shadow}`}}/></SField>
      </div>
      <SField label="Details"><STextarea value={desc} onChange={setDesc} placeholder="Eligibility, fees, hostel, placements, achievements…"/></SField>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
        <SField label="Location" required><SInput value={location} onChange={setLocation} placeholder="e.g. Kurnool"/></SField>
        <SField label="Contact / Helpline" required><SInput value={contact} onChange={setContact} placeholder="98765 43210" type="tel"/></SField>
      </div>
      <button onClick={submit} style={{width:'100%',background:`linear-gradient(135deg,${headerColor},${headerColor}cc)`,color:T.text,border:'none',borderRadius:12,padding:'15px',fontWeight:800,fontSize:15,cursor:'pointer',marginTop:4}}>🎓 Post Education Ad</button>
    </div>
  );

  // ── POLITICAL CAMPAIGN ────────────────────────────────────────
  if (type === 'Political') return (
    <div>
      <div style={{background:`linear-gradient(135deg,${headerColor}22,${headerColor}11)`,border:`1px solid ${headerColor}44`,borderRadius:14,padding:'14px 16px',marginBottom:14,display:'flex',alignItems:'center',gap:10}}>
        <span style={{fontSize:28}}>🗳️</span>
        <div>
          <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:17,color:T.text}}>Political Campaign</div>
          <div style={{fontSize:11,color:T.textMuted}}>Rally · Meeting · Scheme · Announcement</div>
        </div>
      </div>
      <div style={{background:'rgba(190,18,60,0.1)',border:'1px solid rgba(190,18,60,0.3)',borderRadius:10,padding:'10px 14px',marginBottom:16,fontSize:11,color:'#fca5a5',lineHeight:1.6}}>
        ⚠️ <strong>Paid Political Advertisement</strong> — This content will be clearly labelled as a paid political ad as per Election Commission guidelines. Equal opportunity for all parties.
      </div>
      <SField label="Leader / Representative Name" required><SInput value={f1} onChange={setF1} placeholder="e.g. Sri K. Ramesh Babu, MLA Candidate"/></SField>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
        <SField label="Party Name" required><SInput value={f2} onChange={setF2} placeholder="e.g. TDP, YSRCP, BJP…"/></SField>
        <SField label="Constituency" required><SInput value={f3} onChange={setF3} placeholder="e.g. Kurnool"/></SField>
      </div>
      <SField label="Announcement Type">
        <SSelect value={f4} onChange={setF4} placeholder="Select type…" options={['Public Rally','Padayatra / Road Show','Press Meet','Scheme Launch','Voter Appeal','Victory Celebration','Party Meeting','Nomination Filing','Election Campaign','Policy Announcement']}/>
      </SField>
      <SField label="Event / Message Details"><STextarea value={desc} onChange={setDesc} placeholder="Event timing, venue, key message, public invitation…"/></SField>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
        <SField label="Venue / Location" required><SInput value={location} onChange={setLocation} placeholder="e.g. Kurnool Bus Stand"/></SField>
        <SField label="Contact" required><SInput value={contact} onChange={setContact} placeholder="98765 43210" type="tel"/></SField>
      </div>
      <div style={{background:T.bg3,borderRadius:10,padding:'10px 14px',marginBottom:14,display:'flex',alignItems:'center',gap:10,boxShadow:T.isDark?'none':`0 2px 8px ${T.shadow}`}}>
        <input type="checkbox" checked={urgent} onChange={e=>setUrgent(e.target.checked)} style={{width:16,height:16,cursor:'pointer'}}/>
        <span style={{fontSize:12,color:T.textMuted}}>I confirm this is a paid political advertisement and accept responsibility for the content</span>
      </div>
      <button onClick={()=>urgent&&submit()} style={{width:'100%',background:urgent?`linear-gradient(135deg,${headerColor},${headerColor}cc)`:'rgba(255,255,255,0.1)',color:T.text,border:'none',borderRadius:12,padding:'15px',fontWeight:800,fontSize:15,cursor:urgent?'pointer':'not-allowed',marginTop:4}}>🗳️ Submit Political Ad</button>
    </div>
  );

  // ── MISSING PERSON ────────────────────────────────────────────
  if (type === 'Missing') return (
    <div>
      <div style={{background:'rgba(220,38,38,0.15)',border:'1px solid rgba(220,38,38,0.4)',borderRadius:14,padding:'14px 16px',marginBottom:14,display:'flex',alignItems:'center',gap:10}}>
        <span style={{fontSize:28}}>🚨</span>
        <div>
          <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:17,color:T.text}}>Missing Person Alert</div>
          <div style={{fontSize:11,color:'#fca5a5'}}>FREE · Urgent · Community Alert</div>
        </div>
      </div>
      <div style={{background:'rgba(220,38,38,0.1)',border:'1px solid rgba(220,38,38,0.3)',borderRadius:10,padding:'10px 14px',marginBottom:16,fontSize:11,color:'#fca5a5',lineHeight:1.6}}>
        🆓 <strong>This is a FREE service.</strong> Missing person alerts are broadcast urgently across the community at no charge. Please ensure all information is verified before submitting.
      </div>
      <SField label="Missing Person's Full Name" required><SInput value={f1} onChange={setF1} placeholder="e.g. Ravi Kumar Reddy"/></SField>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
        <SField label="Age"><SInput value={f2} onChange={setF2} placeholder="e.g. 14" type="number"/></SField>
        <SField label="Gender">
          <SSelect value={f3} onChange={setF3} placeholder="Select…" options={['Male','Female','Other']}/>
        </SField>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
        <SField label="Missing Since"><input type="date" value={f4} onChange={e=>setF4(e.target.value)} style={{width:'100%',background:T.bg3,border:`1px solid ${T.border}`,borderRadius:10,padding:'12px 14px',color:T.text,fontSize:13,boxSizing:'border-box',boxShadow:T.isDark?'none':`0 2px 8px ${T.shadow}`}}/></SField>
        <SField label="Last Seen Location" required><SInput value={location} onChange={setLocation} placeholder="e.g. Kurnool Bus Stand"/></SField>
      </div>
      <SField label="Physical Description"><STextarea value={desc} onChange={setDesc} placeholder="Height, build, complexion, what they were wearing, any identifying marks…"/></SField>
      <SField label="Contact Person / Family" required><SInput value={f5} onChange={setF5} placeholder="e.g. Suresh Kumar (Father)"/></SField>
      <SField label="Contact Number" required><SInput value={contact} onChange={setContact} placeholder="98765 43210" type="tel"/></SField>
      <div style={{background:T.bg3,borderRadius:10,padding:'10px 14px',marginBottom:14,display:'flex',alignItems:'center',gap:10,boxShadow:T.isDark?'none':`0 2px 8px ${T.shadow}`}}>
        <input type="checkbox" checked={urgent} onChange={e=>setUrgent(e.target.checked)} style={{width:16,height:16,cursor:'pointer'}}/>
        <span style={{fontSize:12,color:T.textMuted}}>I confirm this information is accurate and I am an authorised family member or representative</span>
      </div>
      <button onClick={()=>urgent&&f1&&contact&&submit()} style={{width:'100%',background:urgent?'linear-gradient(135deg,#dc2626,#991b1b)':'rgba(255,255,255,0.1)',color:T.text,border:'none',borderRadius:12,padding:'15px',fontWeight:800,fontSize:15,cursor:urgent?'pointer':'not-allowed',marginTop:4}}>🚨 Send Missing Person Alert</button>
    </div>
  );

  return null;
}

export { SpecialContentForm };
export default SpecialContentForm;
