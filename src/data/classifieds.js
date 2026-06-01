// Classifieds & related taxonomy (categories, badges, no-call list, sub-categories).

// Same-origin fallback image (served from /public). Used wherever a remote
// image may be missing/dead — a local asset can never 404-to-HTML and so can
// never trigger Cross-Origin Read Blocking (CORB) the way a dead CDN URL does.
const PLACEHOLDER_IMG = '/placeholder.svg';

// Guard an image URL before it reaches an <img src>. Returns the same-origin
// placeholder for empty values AND for backend-broken keys that are actually
// Windows local filesystem paths (e.g. "C:\Users\…\file.jpg", usually
// percent-encoded as %3A %5C). Those keys never exist in S3 → 403/404 → CORB
// console noise. Filtering them here means the bad URL is never requested.
function safeImageUrl(u, fallback = PLACEHOLDER_IMG) {
  if (!u || typeof u !== 'string') return fallback;
  if (u.includes('\\') || u.includes('%5C') || /^[A-Za-z]:[\\/]/.test(u)) return fallback;
  return u;
}

// ── CLASSIFIEDS DATA ──────────────────────────────────────────
// Classifieds are fetched live from /api/classifieds (and the unified
// admin feeds). No bundled mock content — screens render their empty
// states when the API returns nothing.
const CLASSIFIEDS = [];

const CL_CATS = ['All','Birthdays','Marriage Anniversary','Marriages','Who is Who','Talent Show','Public Voice','Jobs','Car Sales','Events','House Rents','Shopping'];
const CL_CAT_EMOJI = { All:'📋', Birthdays:'🎂', 'Marriage Anniversary':'💍', Marriages:'💒', 'Who is Who':'🌟', 'Talent Show':'🎤', 'Public Voice':'📢', Jobs:'💼', 'Car Sales':'🚗', Events:'🎉', 'House Rents':'🏠', Shopping:'🛍️' };
const CL_CATS_TE   = { All:'అన్నీ', Birthdays:'పుట్టినరోజులు', 'Marriage Anniversary':'వివాహ వార్షికోత్సవం', Marriages:'వివాహాలు', 'Who is Who':'పట్టణ ప్రముఖులు', 'Talent Show':'టాలెంట్ షో', 'Public Voice':'పబ్లిక్ వాయిస్', Jobs:'ఉద్యోగాలు', 'Car Sales':'కార్లు', Events:'కార్యక్రమాలు', 'House Rents':'ఇళ్లు', Shopping:'షాపింగ్' };
// Thumbnail images per category — shown on cards
const CL_CAT_IMG = {
  Birthdays:      'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=400&q=75',
  'Marriage Anniversary':'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=400&q=75',
  Marriages:      'https://images.unsplash.com/photo-1606800052052-a08af7148866?w=400&q=75',
  // Portrait / public-figure stock photo (was a Lamborghini by mistake).
  'Who is Who':   'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=75',
  'Talent Show':  'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&q=75',
  'Public Voice': PLACEHOLDER_IMG,  // was a dead Unsplash URL (404 → HTML) that triggered CORB on every Public Voice card
  Jobs:           'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&q=75',
  'Car Sales':    'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=400&q=75',
  Events:         'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&q=75',
  'House Rents':  'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=400&q=75',
};
const CL_BADGE_COLOR = { RENT:'#2563eb', SALE:'#dc2626', PG:'#7c3aed', HIRING:'#059669', SERVICE:'#0891b2', TUTOR:'#7c3aed', LEASE:'#16a34a', AGRI:'#15803d', EVENT:'#d97706', WEDDING:'#be185d', ANNIV:'#ec4899', BDAY:'#9333ea', OPENING:'#ea580c', COURSE:'#0284c7', ADMISSIONS:'#7c3aed', PETS:'#0891b2' };

// Categories where Call Now button should NOT show (these are wishes/announcements, not commercial listings)
const NO_CALL_CATS = ['Wishes','Marriage'];



export { CLASSIFIEDS, CL_CATS, CL_CATS_TE, CL_CAT_EMOJI, CL_CAT_IMG, CL_BADGE_COLOR, NO_CALL_CATS, PLACEHOLDER_IMG, safeImageUrl };
const CL_SUBCATS = [
  { id:'All',          label:'అన్నీ',           emoji:'📋' },
  { id:'Birthdays',    label:'పుట్టినరోజులు',    emoji:'🎂' },
  { id:'Marriage Anniversary',label:'వివాహ వార్షికోత్సవం',     emoji:'💍' },
  { id:'Marriages',    label:'వివాహాలు',         emoji:'💒' },
  { id:'Who is Who',   label:'పట్టణ ప్రముఖులు',   emoji:'🌟' },
  { id:'Talent Show',  label:'టాలెంట్ షో',         emoji:'🎤' },
  { id:'Public Voice', label:'పబ్లిక్ వాయిస్',       emoji:'📢' },
  { id:'Jobs',         label:'ఉద్యోగాలు',        emoji:'💼' },
  { id:'Car Sales',    label:'వాహనాలు',          emoji:'🚗' },
  { id:'House Rents',  label:'ఇళ్లు / షాప్‌లు', emoji:'🏠' },
  { id:'Events',       label:'కార్యక్రమాలు',     emoji:'🎉' },
  { id:'Shopping',     label:'షాపింగ్',          emoji:'🛍️' },
];

// Categories that show Call + WhatsApp buttons
const CONTACT_CATS = ['Jobs', 'Car Sales', 'House Rents', 'Room Rents', 'Shopping'];


export { CL_SUBCATS, CONTACT_CATS };
