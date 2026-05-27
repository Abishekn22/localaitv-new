// Theme tokens — dual dark/light token system + OTT cinematic palette.
// Components import `T` (a live ES-module binding) and read `T.red`, `T.bg`, etc.
// ThemeProvider calls `setTheme(isDark)` to swap the binding atomically.

// ══════════════════════════════════════════════════════════════
// ── PHASE 1: DUAL THEME TOKEN SYSTEM ─────────────────────────
// All existing T.xxx keys preserved — zero breaking changes.
// New semantic tokens (T.bg, T.bg2, T.bg3, T.surface, T.text,
// T.text2, T.border, T.shadow) added for Phase 2+ migration.
// ══════════════════════════════════════════════════════════════

// ── DARK theme (current — unchanged values) ───────────────────
const T_DARK = {
  // Brand accents — identical in both themes
  red:     "#D0021B",
  red2:    "#FF0A2F",
  gold:    "#FFB800",
  gold2:   "#FFC929",
  teal:    "#00C6B8",
  green:   "#00D068",
  orange:  "#FF6B00",

  // Dark backgrounds (existing names kept for compatibility)
  navy:    "#060D1F",
  navy2:   "#0D1829",
  navy3:   "#131F35",
  navy4:   "#1A2840",

  // Dark text
  white:   "#FFFFFF",
  off:     "#F0EDE6",
  gray1:   "#9BA3B2",
  gray2:   "#4A5568",
  gray3:   "#2D3748",

  // ── NEW semantic tokens (Phase 2+ usage) ─────────────────────
  bg:      "#060D1F",     // app background
  bg2:     "#0D1829",     // card/panel background
  bg3:     "#131F35",     // elevated surface
  surface: "#1A2840",     // deepest / input background
  text:    "#FFFFFF",     // primary text
  text2:   "#F0EDE6",     // secondary text
  textMuted: "#9BA3B2",   // muted/caption text
  border:  "rgba(255,255,255,0.07)", // dividers & card borders
  cardBg:  "#131F35",     // content cards
  inputBg: "rgba(255,255,255,0.05)", // form inputs
  inputBorder: "rgba(255,255,255,0.1)", // form input borders
  shadow:  "rgba(0,0,0,0.4)",  // card drop shadow
  isDark:  true,
};

// ── LIGHT theme (new — per PDF spec) ─────────────────────────
const T_LIGHT = {
  // Brand accents — same red, slightly deeper others for contrast
  red:     "#D0021B",
  red2:    "#FF0A2F",
  gold:    "#B8860B",     // darker gold for readability on white
  gold2:   "#D4A017",
  teal:    "#00897B",     // darker teal for WCAG AA on white
  green:   "#2E7D32",     // darker green for WCAG AA on white
  orange:  "#E65100",

  // Map old navy keys to light equivalents (so T.navy still works)
  navy:    "#F5F5F5",     // was darkest bg → now lightest
  navy2:   "#FFFFFF",     // was dark card → now white card
  navy3:   "#F0F0F0",     // was elevated dark → now light grey
  navy4:   "#E8E8E8",     // was deepest → now light border

  // Light text (inverted from dark)
  white:   "#111111",     // was white text → now near-black text
  off:     "#333333",     // was off-white → now dark grey
  gray1:   "#555555",     // was light muted → now medium grey
  gray2:   "#888888",     // was medium → now lighter grey
  gray3:   "#AAAAAA",     // was darkest grey → now light grey

  // ── NEW semantic tokens ────────────────────────────────────
  bg:      "#F5F5F5",     // app background (spec: #F5F5F5)
  bg2:     "#FFFFFF",     // card/panel background (spec: white cards)
  bg3:     "#F0F0F0",     // elevated surface
  surface: "#E8E8E8",     // deepest / input bg
  text:    "#111111",     // primary text (near-black)
  text2:   "#333333",     // secondary text
  textMuted: "#666666",   // muted/caption
  border:  "rgba(0,0,0,0.08)", // dividers & card borders
  cardBg:  "#FFFFFF",     // content cards (spec: white cards)
  inputBg: "#FFFFFF",     // form inputs
  inputBorder: "#D0D0D0", // form input borders
  shadow:  "rgba(0,0,0,0.08)",  // soft card shadow
  isDark:  false,
};

// ── Theme state — default DARK until Phase 2 activates light ──
// Reads from localStorage so user preference persists.
// Default: 'dark' (preserves current look, no regression).
function getStoredTheme() {
  try { return window.localStorage?.getItem('localaitv_theme') || 'light'; }
  catch (e) { return 'light'; }
}

// ══════════════════════════════════════════════════════════════
// ── PHASE 3: CONTENT-TYPE ACCENT COLOURS (per PDF spec) ──────
// Per spec: Breaking=Red, Official=Blue, Community=Green, Alert=Yellow
// These are SEMANTIC — same values in both dark and light modes.
// ══════════════════════════════════════════════════════════════
const ACCENT = {
  breaking: {
    // Breaking news, LIVE items, urgent alerts
    color:   '#D0021B',
    bg:      'rgba(208,2,27,0.12)',
    border:  'rgba(208,2,27,0.25)',
    label:   '🚨 BREAKING',
  },
  official: {
    // Govt press releases, official announcements, PIB, CMO, ISRO
    color:   '#1565C0',
    bg:      'rgba(21,101,192,0.12)',
    border:  'rgba(21,101,192,0.25)',
    label:   '🏛️ OFFICIAL',
  },
  community: {
    // Citizen reporter, local, verified, hyperlocal
    color:   '#2E7D32',
    bg:      'rgba(46,125,50,0.12)',
    border:  'rgba(46,125,50,0.25)',
    label:   '📍 LOCAL',
  },
  alert: {
    // Weather alerts, emergency, civic notices
    color:   '#F57F17',
    bg:      'rgba(245,127,23,0.12)',
    border:  'rgba(245,127,23,0.25)',
    label:   '⚠️ ALERT',
  },
  sports: {
    // Sports news
    color:   '#6A1B9A',
    bg:      'rgba(106,27,154,0.12)',
    border:  'rgba(106,27,154,0.25)',
    label:   '🏆 SPORTS',
  },
  business: {
    // Business, economy, markets
    color:   '#00838F',
    bg:      'rgba(0,131,143,0.12)',
    border:  'rgba(0,131,143,0.25)',
    label:   '💼 BUSINESS',
  },
};

// Helper: get accent for a news item
function getNewsAccent(item) {
  if (!item) return ACCENT.community;
  const src = (item.source || item.channel || '').toLowerCase();
  const cat = (item.cat || '').toLowerCase();
  const isGovt = ['pib','mygov','ap cmo','tg cmo','isro','government'].some(k => src.includes(k));
  const isLocalAI = src.includes('localai') || (item.reporter || '').includes('Citizen');
  const isAlert = cat === 'weather' || cat === 'emergency' || cat === 'civic';
  const isSports = cat === 'sports';
  const isBusiness = cat === 'business';
  // Breaking label removed per spec — show category label instead
  if (isGovt)      return ACCENT.official;
  if (isAlert)     return ACCENT.alert;
  if (isSports)    return ACCENT.sports;
  if (isBusiness)  return ACCENT.business;
  if (isLocalAI)   return ACCENT.community;
  return ACCENT.community;
}

// ── Phase 3 Section spacing token ─────────────────────────────
// Per spec: "Increase whitespace and spacing between sections"
const SEC = {
  headerPadding: '12px 16px 10px',
  sectionGap:    24,   // px between major home sections
  cardRadius:    14,   // consistent card border radius
};

// Global T — starts as dark. App component swaps this via setAppTheme.
// Components read T directly (no context needed — it's module-level).
let T = T_DARK;

// ════════════════════════════════════════════════════════════════════
// OTT DESIGN SYSTEM — "Cinematic news" mood (Mohan's Phase-1 redesign)
// Premium navy / charcoal base, LocalAI red as a single strong accent,
// refined typography hierarchy, motion + elevation tokens.
// This is additive — components opt in by reading OTT.* in their styles.
// Functionality untouched throughout.
// ════════════════════════════════════════════════════════════════════
const OTT = {
  color: {
    bg0:        '#06080F',   // deepest — page background, behind glass surfaces
    bg1:        '#0B0F1A',   // primary canvas
    bg2:        '#131826',   // raised surface (cards, banners)
    bg3:        '#1A2030',   // elevated surface (hover, active)
    line:       'rgba(255,255,255,0.06)',
    lineStrong: 'rgba(255,255,255,0.12)',
    glass:      'rgba(11,15,26,0.62)',   // for floating pills over media
    glassEdge:  'rgba(255,255,255,0.10)',
    text:       '#F4F6FB',
    text2:      '#B8C0D2',
    text3:      '#7A8499',
    red:        '#E11D48',                // premium rose — slightly cooler than brand red
    redSoft:    'rgba(225,29,72,0.16)',
    redGlow:    '0 8px 28px rgba(225,29,72,0.32)',
    gold:       '#FFB800',
    success:    '#10B981',
  },
  // Subtle, cinematic shadows (no flat drop shadows)
  elev: {
    sm: '0 2px 10px rgba(0,0,0,0.35)',
    md: '0 8px 28px rgba(0,0,0,0.45)',
    lg: '0 18px 50px rgba(0,0,0,0.55)',
  },
  radius: { sm:8, md:12, lg:16, xl:20, pill:999 },
  motion: {
    fast:  '0.18s cubic-bezier(0.22,1,0.36,1)',
    base:  '0.28s cubic-bezier(0.22,1,0.36,1)',
    slow:  '0.45s cubic-bezier(0.22,1,0.36,1)',
  },
  type: {
    display: { font:"'Barlow Condensed',sans-serif",          weight:900, tracking:0.4 },
    headline:{ font:"'Barlow',sans-serif",                     weight:800, tracking:0.0 },
    body:    { font:"'Barlow',sans-serif",                     weight:500, tracking:0.0 },
    mono:    { font:"'Barlow Condensed','SF Mono',monospace",  weight:700, tracking:0.6 },
    te:      { font:"'Noto Sans Telugu','Barlow',sans-serif",  weight:800, tracking:0.2 },
  },
};

// Mutable live binding — re-assigned by setTheme(). Importers see the new value
// because ES modules export bindings, not snapshots.
export { T };
export function setTheme(isDark) {
  T = isDark ? T_DARK : T_LIGHT;
}
export { T_DARK, T_LIGHT, ACCENT, SEC, OTT, getNewsAccent, getStoredTheme };
