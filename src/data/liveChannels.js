// Live YouTube stream IDs per district + LIVE_CHANNELS list + CHANNEL_VIDEO map.
// ── SCREEN: HOME — TV9 Style with Live Channel as Hero ────────
const YT_CHANNEL_ID  = 'UClB3scGwKSfe3CmLYYFkDoQ'; // @localaitv
// Live stream IDs. Original Kurnool/Karimnagar/Guntur streams kept first;
// `jfKfPfyJRdk` (stable public 24/7) used as a fallback when YouTube blocks the embed.
// Per-channel YouTube live video IDs — one for each of the 9 channels (updated 2026-05-13).
const YT_LIVE_KURNOOL    = '3h0jXaKhnrQ';   // Kurnool TV live (updated 2026-06-03 from Warangal TV.docx)
const YT_LIVE_GUNTUR     = 'oFlhjIKO08U';   // Guntur TV live (updated 2026-06-03 from Warangal TV.docx)
const YT_LIVE_NELLORE    = '1ygxEFWtb7U';   // Nellore TV live (updated 2026-06-03 from Warangal TV.docx)
const YT_LIVE_KAKINADA   = 'Q2WTdE6BCAA';   // Kakinada TV live (updated 2026-06-03 from Warangal TV.docx)
const YT_LIVE_TIRUPATI   = 'jR5cRI8rMC8';   // Tirupati TV live (updated 2026-06-03 from Warangal TV.docx)
const YT_LIVE_KHAMMAM    = '8k2jXO76S-g';   // Khammam TV live (updated 2026-06-03 from Warangal TV.docx)
const YT_LIVE_KARIMNAGAR = 'RA292sdCTAk';   // Karimnagar TV live (updated 2026-06-03 from Warangal TV.docx)
const YT_LIVE_WARANGAL   = 'xPh1XjQ5i8E';   // Warangal TV live (updated 2026-06-03 from Warangal TV.docx)
const YT_LIVE_NALGONDA   = 'L6YPRInS0Nw';   // Nalgonda TV live (updated 2026-06-03 from Warangal TV.docx)

// Legacy aliases — keep so any code that imported the old names still works
const YT_LIVE_VIDEO    = YT_LIVE_KURNOOL;     // Default/fallback
const YT_LIVE_KNR      = YT_LIVE_KARIMNAGAR;
const YT_LIVE_GTV      = YT_LIVE_GUNTUR;
const YT_LIVE_FALLBACK = 'jfKfPfyJRdk';       // Stable 24/7 fallback

// Map channel ID → its real live YouTube stream
const CHANNEL_VIDEO = {
  // AP
  kur: YT_LIVE_KURNOOL,
  gun: YT_LIVE_GUNTUR,
  nel: YT_LIVE_NELLORE,
  kak: YT_LIVE_KAKINADA,
  tpt: YT_LIVE_TIRUPATI,
  // TG
  khm: YT_LIVE_KHAMMAM,
  kar: YT_LIVE_KARIMNAGAR,
  war: YT_LIVE_WARANGAL,
  nal: YT_LIVE_NALGONDA,
};

const LIVE_CHANNELS = [
  // AP — 5 live channels (per spec)
  { id:'kur', name:'కర్నూలు',   nameEn:'Kurnool',    code:'KTV', live:true,  viewers:1842, state:'AP' },
  { id:'gun', name:'గుంటూరు',   nameEn:'Guntur',     code:'GTV', live:true,  viewers:2103, state:'AP' },
  { id:'nel', name:'నెల్లూరు',  nameEn:'Nellore',    code:'NET', live:true,  viewers:1247, state:'AP' },
  { id:'kak', name:'కాకినాడ',   nameEn:'Kakinada',   code:'KKD', live:true,  viewers:983,  state:'AP' },
  { id:'tpt', name:'తిరుపతి',   nameEn:'Tirupati',   code:'TTV', live:true,  viewers:1534, state:'AP' },
  // TG — 4 live channels (per spec)
  { id:'khm', name:'ఖమ్మం',     nameEn:'Khammam',    code:'KHM', live:true,  viewers:1621, state:'TG' },
  { id:'kar', name:'కరీంనగర్',  nameEn:'Karimnagar', code:'KNR', live:true,  viewers:1842, state:'TG' },
  { id:'war', name:'వరంగల్',    nameEn:'Warangal',   code:'WTV', live:true,  viewers:1387, state:'TG' },
  { id:'nal', name:'నల్గొండ',   nameEn:'Nalgonda',   code:'NLG', live:true,  viewers:798,  state:'TG' },
];

export {
  YT_CHANNEL_ID,
  YT_LIVE_KURNOOL, YT_LIVE_GUNTUR, YT_LIVE_NELLORE, YT_LIVE_KAKINADA, YT_LIVE_TIRUPATI,
  YT_LIVE_KHAMMAM, YT_LIVE_KARIMNAGAR, YT_LIVE_WARANGAL, YT_LIVE_NALGONDA,
  YT_LIVE_VIDEO, YT_LIVE_KNR, YT_LIVE_GTV, YT_LIVE_FALLBACK,
  CHANNEL_VIDEO, LIVE_CHANNELS
};
