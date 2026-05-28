// Bulletins are fetched from /api/bulletins. The static list is empty;
// `mapBulletin` adapts the API response into the shape consumed by the
// rail card and BulletinPlayerScreen.
const BULLETINS = [];

export { BULLETINS };

// Match bulletins to the selected location. Priority:
//   1. location_id — authoritative, but only when the bulletin actually carries
//      a real one (> 0). Today the backend returns location_id: 0 for every
//      bulletin, so this branch is skipped until that data is populated.
//   2. name — fallback for items with no usable id. The location lives in the
//      Telugu title ("వరంగల్ వార్త బులెటిన్స్ | …") and the English video_url
//      path (".../bulletins/Warangal/…").
// `loc` = { id: numeric locations.id, name: Telugu, nameEn: English }.
export function filterBulletinsByLocation(items, loc = {}) {
  if (!Array.isArray(items)) return items;
  const id = loc.id != null && loc.id !== '' ? Number(loc.id) : null;
  const te = String(loc.name || '').trim();
  const en = String(loc.nameEn || '').trim().toLowerCase();
  if (id == null && !te && !en) return items;
  return items.filter(b => {
    // Priority 1 — trust a real numeric id when the bulletin has one.
    const bid = Number(b?.location_id);
    if (Number.isFinite(bid) && bid > 0) {
      return id != null && bid === id;
    }
    // Priority 2 — id is 0 / missing, so match by name instead.
    const title = String(b?.title || b?.titleTe || b?.titleEn || '');
    const url   = String(b?.video_url || b?.videoUrl || '').toLowerCase();
    if (te && title.includes(te)) return true;
    if (en && url.includes(en)) return true;
    return false;
  });
}

// "9:30 PM" / "10:45 AM" from an ISO timestamp
export function formatBulletinTime(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d)) return '';
  return d.toLocaleTimeString('en-US', { hour:'numeric', minute:'2-digit', hour12:true });
}

// Adapt an /api/bulletins item to the legacy bulletin shape used by
// BulletinCard, BulletinPlayerScreen, and the homepage rail.
// API field reference (see backend/README.md):
//   id, title, content, timestamp, priority_level, image_url, audio_url, video_url, created_at, updated_at
// Pass-through if the item already has `ytId` (legacy/demo data).
export function mapBulletin(b) {
  if (!b) return null;
  if (b.ytId) return b;

  // Titles arrive as "ఖమ్మం వార్త బులెటిన్స్ | 🕒 5:00 PM" — peel off the
  // time suffix so the rail can show a clean title + broadcastTime separately.
  const raw = String(b.title || '');
  const [titlePart, ...rest] = raw.split('|').map(s => s.trim());
  const timeFromTitle = rest.join(' ').replace(/[🕒🕐⏰🕘]/g, '').trim();
  const broadcastTime = timeFromTitle || formatBulletinTime(b.timestamp);

  // First token of the title is usually the city ("ఖమ్మం", "Kurnool"); fall
  // back to the priority pill if we can't find one.
  const inferredChannel = (titlePart || '').split(/\s+/)[0]
    || (b.priority_level ? b.priority_level.toUpperCase() : 'BULLETIN');

  return {
    id:            b.id,
    titleTe:       titlePart || raw,
    titleEn:       titlePart || raw,
    broadcastTime,
    channel:       inferredChannel,
    thumbnail:     b.image_url || '',
    ytId:          null,
    videoUrl:      b.video_url || '',
    audioUrl:      b.audio_url || '',
    desc:          b.content || '',
    priorityLevel: b.priority_level || null,
    uploadedAt:    b.timestamp || b.created_at || null,
  };
}

// Program type config
const PROGRAM_TYPES = [
  { id:'All',          label:'అన్నీ',        emoji:'📺', color:'#2B7FFF' },
  { id:'News Bulletin',label:'వార్తలు',       emoji:'📰', color:'#D0021B' },
  { id:'Special Story',label:'ప్రత్యేకం',     emoji:'🎬', color:'#7B1FA2' },
  { id:'Debate',       label:'చర్చ',          emoji:'🎙️', color:'#E65100' },
  { id:'Hot Topic',    label:'హాట్ టాపిక్',   emoji:'🔥', color:'#B71C1C' },
  { id:'District News',label:'జిల్లా వార్తలు', emoji:'🗺️', color:'#1B5E20' },
  { id:'Interview',    label:'ఇంటర్వ్యూ',     emoji:'🎤', color:'#0D47A1' },
  { id:'Feature',      label:'ఫీచర్',         emoji:'🌟', color:'#F57F17' },
];

export const PROGRAM_COLORS = {};
export { PROGRAM_TYPES };
export default PROGRAM_TYPES;
