// Live YouTube stream IDs per district + LIVE_CHANNELS list + CHANNEL_VIDEO map.
// ── SCREEN: HOME — TV9 Style with Live Channel as Hero ────────
const YT_CHANNEL_ID  = 'UClB3scGwKSfe3CmLYYFkDoQ'; // @localaitv
// Live stream IDs. Original Kurnool/Karimnagar/Guntur streams kept first;
// `jfKfPfyJRdk` (stable public 24/7) used as a fallback when YouTube blocks the embed.
// Per-channel YouTube live video IDs — one for each of the 9 channels (updated 2026-05-13).
const YT_LIVE_KURNOOL    = 'xoU4MZlsXus';   // Kurnool TV live (updated 2026-05-26 from Mohan)
const YT_LIVE_GUNTUR     = '1I-ESGwy9fQ';   // Guntur TV live (updated 2026-05-25 from Mohan's URL file)
const YT_LIVE_NELLORE    = '5n_aru8yQe0';   // Nellore TV live (updated 2026-05-28 from Mohan)
const YT_LIVE_KAKINADA   = '7qRrHTKP1zk';   // Kakinada TV live
const YT_LIVE_TIRUPATI   = '0WBJVDnz_fc';   // Tirupati TV live (updated 2026-05-25 from Mohan)
const YT_LIVE_KHAMMAM    = 'FWilVnvR0Es';   // Khammam TV live
const YT_LIVE_KARIMNAGAR = 't7OrzwZW-ss';   // Karimnagar TV live
const YT_LIVE_WARANGAL   = 'tXihAvdcML0';   // Warangal TV live (updated 2026-05-25 from Mohan's URL file)
const YT_LIVE_NALGONDA   = 'y5POhOUUX54';   // Nalgonda TV live (updated 2026-05-25 from Mohan's URL file)

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
