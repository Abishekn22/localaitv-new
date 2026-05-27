// Shared helpers used by the request/upload forms.
import { API } from '../../_imports.js';

function genId(prefix) { return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2,7).toUpperCase()}`; }

// ── Compliance ID generator (per IT Rules 2021 spec) ───────
// Produces LAI-XXX-YYYYMMDD-RANDOMNUMBER format
// Used for: complaints (GRV), takedowns (IP), counter-notifications (CN),
// channel partners (CP), advertising (AD), content reports (RPT)
function genComplianceId(typeCode) {
  const d = new Date();
  const ymd = `${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}`;
  const rand = Math.floor(Math.random()*900000) + 100000; // 6-digit
  return `LAI-${typeCode}-${ymd}-${rand}`;
}

async function uploadPhotos(files, reqId, relatedType) {
  const urls = [];
  for (const file of files) {
    const fd = new FormData();
    fd.append('file', file);
    fd.append('broadcast_request_id', reqId);
    fd.append('related_type', relatedType);
    try {
      const r = await fetch(`${API}/upload-file`, { method:'POST', body:fd });
      const d = await r.json();
      if (d.file_url) urls.push(d.file_url);
    } catch(e) { /* continue */ }
  }
  return urls;
}

export { genId, genComplianceId, uploadPhotos };
