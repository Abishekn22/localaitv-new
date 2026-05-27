import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { T, ACCENT, SEC, OTT, getNewsAccent, useAppTheme, API_BASE, YT_CHANNEL, APP_VERSION, apiCall, API, useAPI, useReveal, Reveal, AP_CONSTITUENCIES, TG_CONSTITUENCIES, NEWS_ITEMS, NEWS_CATS, REPORTERS, BULLETIN_SEGS, CLASSIFIEDS, CL_CATS, CL_CAT_EMOJI, CL_CAT_IMG, CL_BADGE_COLOR, NO_CALL_CATS, CL_SUBCATS, CONTACT_CATS, CHANNELS_AP, CHANNELS_TG, TICKER_TEXT, getChannelName, YT_CHANNEL_ID, YT_LIVE_KURNOOL, YT_LIVE_GUNTUR, YT_LIVE_NELLORE, YT_LIVE_KAKINADA, YT_LIVE_TIRUPATI, YT_LIVE_KHAMMAM, YT_LIVE_KARIMNAGAR, YT_LIVE_WARANGAL, YT_LIVE_NALGONDA, YT_LIVE_VIDEO, YT_LIVE_KNR, YT_LIVE_GTV, YT_LIVE_FALLBACK, CHANNEL_VIDEO, LIVE_CHANNELS, BULLETINS, PROGRAM_TYPES, PROGRAM_COLORS, SHORT_NEWS, CONSTITUENCY_DISTRICT, WISH_TYPES, CONTENT_TYPES, TE_LABEL_MAP, VEG_LIST, VEG_LIST_TE, AP_DISTRICTS, TG_DISTRICTS, css } from '../../_imports.js';

import LegalDocScreen from './LegalDocScreen.jsx';

function AboutScreen({ onBack, onNavigate }) {
  const { T } = useAppTheme();
  return <LegalDocScreen
    onBack={onBack}
    onNavigate={onNavigate}
    icon="ℹ️"
    title="About Us"
    subtitle="మా గురించి"
    topActions={[
      { icon:'📞', label:'Contact Us', action:'contact' },
    ]}
    sections={[
      { heading: "WHO WE ARE", body: "LocalAI / AI News Network is an AI-powered hyperlocal news platform built by LocalAI Media Network Pvt Ltd. We aim to deliver district-level and constituency-level news from Andhra Pradesh and Telangana to mobile, Smart TV, and YouTube — in Telugu and English." },
      { heading: "OUR MISSION", body: "To make hyperlocal news accessible to every Telugu household. By combining citizen reporters with AI-assisted news workflows, we deliver faster, more local, and more relevant news experiences." },
      { heading: "WHAT MAKES US DIFFERENT",
        bullets: [
          "AI-assisted news production for faster turnaround",
          "Hyperlocal focus — news from your constituency, not just state-level",
          "Citizen reporter network — local people, local news",
          "Telugu-first interface and content",
          "Free for end users",
          "Editorial review and moderation before publication where applicable",
        ]
      },
      { heading: "OUR REACH", body: "Currently active across multiple districts in Andhra Pradesh and Telangana, with plans to expand coverage across all 294 assembly constituencies in both states, subject to operational availability." },
      { heading: "COMPANY", body: "LocalAI Media Network Pvt Ltd\nHeadquartered in Hyderabad, Telangana\nA team of AI engineers, content moderators, citizen reporters, and editorial professionals." },
    ]}
  />;
}


export { AboutScreen };
export default AboutScreen;
