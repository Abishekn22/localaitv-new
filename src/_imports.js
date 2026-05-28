// Foundation barrel — re-exports theme, data, hooks, and API so every
// component file can `import { T, useAppTheme, ... } from '../_imports'`
// without listing every source file individually.
//
// IMPORTANT: this file MUST NOT import from component files (which would
// create circular references). Components import `_imports` for their
// foundation and import each other directly.

export {
  T, T_DARK, T_LIGHT, ACCENT, SEC, OTT,
  getNewsAccent, getStoredTheme, setTheme,
} from './theme/tokens.js';

export { ThemeContext, useAppTheme, ThemeProvider } from './theme/ThemeProvider.jsx';

export { API_BASE, YT_CHANNEL, APP_VERSION, apiCall, API } from './api/client.js';

export { useAPI } from './hooks/useAPI.js';
export { useReveal, Reveal } from './hooks/useReveal.jsx';

export { AP_CONSTITUENCIES, TG_CONSTITUENCIES } from './data/constituencies.js';
export { NEWS_ITEMS, NEWS_CATS, REPORTERS, BULLETIN_SEGS } from './data/news.js';
export {
  CLASSIFIEDS, CL_CATS, CL_CATS_TE, CL_CAT_EMOJI, CL_CAT_IMG, CL_BADGE_COLOR,
  NO_CALL_CATS, CL_SUBCATS, CONTACT_CATS,
} from './data/classifieds.js';
export { CHANNELS_AP, CHANNELS_TG, TICKER_TEXT, getChannelName } from './data/channels.js';
export {
  YT_CHANNEL_ID,
  YT_LIVE_KURNOOL, YT_LIVE_GUNTUR, YT_LIVE_NELLORE, YT_LIVE_KAKINADA, YT_LIVE_TIRUPATI,
  YT_LIVE_KHAMMAM, YT_LIVE_KARIMNAGAR, YT_LIVE_WARANGAL, YT_LIVE_NALGONDA,
  YT_LIVE_VIDEO, YT_LIVE_KNR, YT_LIVE_GTV, YT_LIVE_FALLBACK,
  CHANNEL_VIDEO, LIVE_CHANNELS,
} from './data/liveChannels.js';
export { BULLETINS, PROGRAM_TYPES, PROGRAM_COLORS, mapBulletin, formatBulletinTime, filterBulletinsByLocation } from './data/bulletins.js';
export { SHORT_NEWS } from './data/shorts.js';
export {
  CONSTITUENCY_DISTRICT, WISH_TYPES, CONTENT_TYPES, TE_LABEL_MAP,
  VEG_LIST, VEG_LIST_TE, AP_DISTRICTS, TG_DISTRICTS,
} from './data/maps.js';
export { css } from './data/helpers.js';

export { genId, genComplianceId, uploadPhotos } from './components/Form/formHelpers.js';
