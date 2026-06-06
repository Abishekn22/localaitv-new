import React, { useState, useEffect } from 'react';
import { API, genId, getUserLocationId } from '../../_imports.js';

import { SuccessScreen, FormHeader, FSection, FLabel, FCard, SubmitBtn } from './../../components/Form/FormElements.jsx';

// ── Vegetable Price Entry Form ─────────────────────────────────────
// Mirrors the layout of the backend HTML manage form: a compact table
// with S.No | name | price input | type selector (per kg / per piece /
// కట్ట / డజను). Catalog comes from /api/v1/vegetables/location-vegetables
// and admin maintains it via the manage_form in aimodelsss.
function VegPriceForm({ onBack }) {
  const today = (() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  })();

  const locationId = getUserLocationId();
  const [date,         setDate]         = useState(today);
  const [rows,         setRows]         = useState([]);
  const [catalogLoad,  setCatalogLoad]  = useState(true);
  const [catalogError, setCatalogError] = useState('');
  const [errors,       setErrors]       = useState({});
  const [loading,      setLoading]      = useState(false);
  const [success,      setSuccess]      = useState(null);
  const [apiError,     setApiError]     = useState('');

  // The four price-type buttons shown next to every row, identical to
  // the backend form. Telugu labels are used for piece/bunch/dozen so
  // operators see exactly the same UI in both forms.
  const PRICE_TYPES = [
    { key: 'per_kg',    label: 'per kg' },
    { key: 'per_piece', label: 'per piece' },
    { key: 'per_bunch', label: 'కట్ట' },
    { key: 'per_dozen', label: 'డజను' },
  ];

  useEffect(() => {
    if (!locationId) {
      setCatalogError('Could not detect your location. Please pick a constituency first.');
      setCatalogLoad(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const r = await fetch(`${API}/v1/vegetables/location-vegetables?location_id=${locationId}`);
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const list = await r.json();
        if (cancelled) return;
        if (!Array.isArray(list) || list.length === 0) {
          setCatalogError('No vegetables configured for this location yet. Ask admin to add them via the manage form in aimodelsss.');
          setCatalogLoad(false);
          return;
        }
        setRows(list.map(v => ({
          id:          v.id,
          name_telugu: v.name_telugu || '',
          sno:         v.sno || 0,
          price:       '',
          price_type:  'per_kg', // default selection — matches backend's pre-selected button
        })));
      } catch (e) {
        if (!cancelled) setCatalogError(`Failed to load vegetable list: ${e.message}`);
      } finally {
        if (!cancelled) setCatalogLoad(false);
      }
    })();
    return () => { cancelled = true; };
  }, [locationId]);

  function updateRow(i, field, val) {
    const r = [...rows];
    r[i] = { ...r[i], [field]: val };
    setRows(r);
  }

  function validate() {
    const e = {};
    if (!date) e.date = 'Date is required';
    const hasPrice = rows.some(r => String(r.price).trim() !== '');
    if (!hasPrice) e.prices = 'Enter at least one vegetable price';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;
    setLoading(true);
    setApiError('');
    const reqId = genId('VEG');
    try {
      const items = rows
        .filter(r => String(r.price).trim() !== '')
        .map(r => ({
          sno:            r.sno,
          name_telugu:    r.name_telugu,
          vegetable_name: r.name_telugu,
          // Send the price as a RAW STRING so the backend's
          // /api/price-entries handler can detect ratio formats
          // like "6/7" (= 6 rupees for 7 pieces). parseFloat() would
          // silently drop "/7" before it reaches the server.
          price_per_kg:   String(r.price).trim(),
          price_type:     r.price_type,
        }));
      const res = await fetch(`${API}/price-entries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          request_id:  reqId,
          location_id: locationId,
          entry_date:  date,
          status:      'Submitted',
          items,
        }),
      });
      const _d = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error((_d && (_d.message || _d.detail || _d.error)) || `Submission failed (${res.status})`);
      }
      setSuccess((_d && _d.request_id) || reqId);
    } catch (e) {
      setApiError(e.message || 'Submission failed. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }

  if (success) return (
    <div style={{width:'100%',height:'100%',display:'flex',flexDirection:'column',background:'#f7f8fa'}}>
      <SuccessScreen emoji="🥦" title="Price Entry Submitted!" message="Vegetable prices saved. The bulletin video is being generated and will appear on the home feed shortly." reqId={success} onDone={onBack}/>
    </div>
  );

  return (
    <div style={{width:'100%',height:'100%',display:'flex',flexDirection:'column',overflow:'hidden',background:'#f7f8fa'}}>
      <FormHeader gradient="linear-gradient(135deg,#166534,#16a34a)" emoji="🥦" title="కూరగాయల ధరలు" subtitle="Vegetable Price Entry Form" onBack={onBack}/>
      <div style={{flex:1,overflowY:'auto',padding:'16px'}}>

        <FSection title="📅 తేదీ · Entry Date">
          <FLabel required>తేదీ · Date</FLabel>
          <input type="date" value={date} onChange={e=>setDate(e.target.value)}
            style={{width:'100%',border:`1.5px solid ${errors.date?'#e53e3e':'#ddd'}`,borderRadius:10,padding:'12px 14px',fontSize:14,background:'#fafafa',boxSizing:'border-box'}}/>
          {errors.date && <div style={{color:'#e53e3e',fontSize:11,marginTop:3}}>{errors.date}</div>}
        </FSection>

        {catalogLoad && (
          <FCard>
            <div style={{textAlign:'center',padding:'24px 12px',color:'#666',fontSize:13}}>
              Loading vegetable list…
            </div>
          </FCard>
        )}

        {!catalogLoad && catalogError && (
          <FCard>
            <div style={{padding:'14px 12px',color:'#b45309',fontSize:13,fontWeight:600,background:'#fff7ed',borderRadius:8}}>
              ⚠️ {catalogError}
            </div>
          </FCard>
        )}

        {!catalogLoad && !catalogError && rows.length > 0 && (
          <FCard>
            <div style={{fontFamily:"'Noto Sans Telugu',sans-serif",fontWeight:700,fontSize:15,color:'#111',marginBottom:8}}>
              కూరగాయల ధరలు నమోదు చేయండి
            </div>
            {errors.prices && <div style={{color:'#e53e3e',fontSize:12,marginBottom:10,background:'#fff5f5',padding:'8px 10px',borderRadius:8}}>{errors.prices}</div>}

            {/* Table — mirrors the backend HTML form's compact 4-column grid */}
            <div style={{border:'1px solid #e0ebe0',borderRadius:10,overflow:'hidden',background:'#fff'}}>
              {/* Header row */}
              <div style={{
                display:'grid',
                gridTemplateColumns:'48px 1.4fr 1fr 1.6fr',
                gap:8,
                padding:'10px 12px',
                background:'#eaf6ec',
                fontSize:12,
                fontWeight:700,
                color:'#1a5c2a',
                fontFamily:"'Noto Sans Telugu',sans-serif",
              }}>
                <div>S.No</div>
                <div>కూరగాయ పేరు</div>
                <div>ధర (Rs)</div>
                <div>రకం (Type)</div>
              </div>

              {/* Data rows */}
              {rows.map((r,i) => (
                <div key={r.id ?? i} style={{
                  display:'grid',
                  gridTemplateColumns:'48px 1.4fr 1fr 1.6fr',
                  gap:8,
                  padding:'10px 12px',
                  borderTop:'1px solid #f0f0f0',
                  alignItems:'center',
                }}>
                  {/* S.No */}
                  <div style={{fontSize:13,fontWeight:600,color:'#444'}}>{r.sno || (i+1)}</div>

                  {/* Vegetable name (Telugu) */}
                  <div style={{
                    fontSize:14,
                    fontWeight:600,
                    color:'#1a5c2a',
                    fontFamily:"'Noto Sans Telugu',sans-serif",
                    overflow:'hidden',
                    textOverflow:'ellipsis',
                  }}>
                    {r.name_telugu}
                  </div>

                  {/* Price input — type="text" + inputMode="decimal" instead
                      of type="number". The number type has hidden behaviors
                      that silently corrupt the entered value:
                        • mouse-wheel scroll on a focused input increments /
                          decrements by 1 per tick (most common cause of
                          ±2 / ±3 drift while the user scrolls the form),
                        • ↑ / ↓ arrow keys also change the value by 1,
                        • desktop browsers render tiny spinner buttons that
                          are easy to mis-click,
                        • a stray leading "-" produces negative prices.
                      Switching to type="text" with inputMode="decimal" keeps
                      the mobile numeric keypad but kills all four issues.
                      The onChange filter strips anything that isn't a digit
                      or decimal point so the value still parses as a number. */}
                  <input
                    type="text"
                    inputMode="decimal"
                    pattern="[0-9]*[./]?[0-9]*"
                    value={r.price}
                    onChange={e=>updateRow(i,'price',e.target.value.replace(/[^0-9./]/g, ''))}
                    placeholder="ఉదా: 30 లేదా 6/7"
                    style={{
                      width:'100%',
                      border:'1px solid #d4d4d8',
                      borderRadius:8,
                      padding:'7px 10px',
                      fontSize:13,
                      background:'#fafafa',
                      boxSizing:'border-box',
                      fontFamily:"'Noto Sans Telugu',sans-serif",
                    }}/>

                  {/* Type selector — 4 small buttons */}
                  <div style={{display:'flex',gap:4,flexWrap:'wrap'}}>
                    {PRICE_TYPES.map(t => {
                      const selected = r.price_type === t.key;
                      return (
                        <button
                          key={t.key}
                          type="button"
                          onClick={()=>updateRow(i,'price_type',t.key)}
                          style={{
                            border:'1px solid',
                            borderColor:selected?'#15803d':'#d4d4d8',
                            borderRadius:14,
                            padding:'4px 10px',
                            fontSize:11,
                            fontWeight:700,
                            cursor:'pointer',
                            background:selected?'#15803d':'#fff',
                            color:selected?'#fff':'#444',
                            fontFamily:"'Noto Sans Telugu',sans-serif",
                            transition:'all 0.15s ease',
                            whiteSpace:'nowrap',
                          }}>
                          {t.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </FCard>
        )}

        {apiError && <div style={{background:'rgba(208,2,27,0.08)',border:'1px solid rgba(208,2,27,0.25)',borderRadius:10,padding:'10px 14px',marginBottom:12,fontSize:12,color:'#D0021B',fontWeight:600}}>⚠️ {apiError}</div>}
        {!catalogLoad && !catalogError && rows.length > 0 && (
          <SubmitBtn label="✅ Submit Price Entry" onClick={handleSubmit} loading={loading}/>
        )}
        <div style={{height:24}}/>
      </div>
    </div>
  );
}


export { VegPriceForm };
export default VegPriceForm;
