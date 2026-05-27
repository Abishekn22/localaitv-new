import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { T, ACCENT, SEC, OTT, getNewsAccent, useAppTheme, API_BASE, YT_CHANNEL, APP_VERSION, apiCall, API, useAPI, useReveal, Reveal, AP_CONSTITUENCIES, TG_CONSTITUENCIES, NEWS_ITEMS, NEWS_CATS, REPORTERS, BULLETIN_SEGS, CLASSIFIEDS, CL_CATS, CL_CAT_EMOJI, CL_CAT_IMG, CL_BADGE_COLOR, NO_CALL_CATS, CL_SUBCATS, CONTACT_CATS, CHANNELS_AP, CHANNELS_TG, TICKER_TEXT, getChannelName, YT_CHANNEL_ID, YT_LIVE_KURNOOL, YT_LIVE_GUNTUR, YT_LIVE_NELLORE, YT_LIVE_KAKINADA, YT_LIVE_TIRUPATI, YT_LIVE_KHAMMAM, YT_LIVE_KARIMNAGAR, YT_LIVE_WARANGAL, YT_LIVE_NALGONDA, YT_LIVE_VIDEO, YT_LIVE_KNR, YT_LIVE_GTV, YT_LIVE_FALLBACK, CHANNEL_VIDEO, LIVE_CHANNELS, BULLETINS, PROGRAM_TYPES, PROGRAM_COLORS, SHORT_NEWS, CONSTITUENCY_DISTRICT, WISH_TYPES, CONTENT_TYPES, TE_LABEL_MAP, VEG_LIST, VEG_LIST_TE, AP_DISTRICTS, TG_DISTRICTS, css } from '../_imports.js';

import BulletinPlayerScreen from './BulletinPlayerScreen.jsx';
import DistrictNewsFeedScreen from './DistrictNewsFeedScreen.jsx';

function NewsDetailScreen({ news, onBack, onReport }) {
  // Delegates everything to DistrictNewsFeedScreen so the user gets the
  // BulletinPlayerScreen-style viewer (sticky-top player + scrolling list +
  // bottom category strip) when tapping a news item from the home page.
  // We pre-compute the starting category from the clicked item and find its
  // index inside that category's newest-first list, so the right video is
  // already pinned at the top when the screen opens.
  const startCat = news?.cat || 'All';
  const itemsInCat = useMemo(() => {
    const items = startCat === 'All' ? NEWS_ITEMS : NEWS_ITEMS.filter(n => n.cat === startCat);
    return [...items].sort((a, b) =>
      new Date(b.uploadedAt || b.id * -1) - new Date(a.uploadedAt || a.id * -1)
    );
  }, [startCat]);
  const startIdx = useMemo(() => {
    if (!news || !news.id) return 0;
    const i = itemsInCat.findIndex(n => n.id === news.id);
    return i >= 0 ? i : 0;
  }, [itemsInCat, news]);

  return (
    <DistrictNewsFeedScreen
      onClose={onBack}
      startCat={startCat}
      startIdx={startIdx}
    />
  );
}

export { NewsDetailScreen };
export default NewsDetailScreen;
