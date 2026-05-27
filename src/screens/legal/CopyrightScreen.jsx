import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { T, ACCENT, SEC, OTT, getNewsAccent, useAppTheme, API_BASE, YT_CHANNEL, APP_VERSION, apiCall, API, useAPI, useReveal, Reveal, AP_CONSTITUENCIES, TG_CONSTITUENCIES, NEWS_ITEMS, NEWS_CATS, REPORTERS, BULLETIN_SEGS, CLASSIFIEDS, CL_CATS, CL_CAT_EMOJI, CL_CAT_IMG, CL_BADGE_COLOR, NO_CALL_CATS, CL_SUBCATS, CONTACT_CATS, CHANNELS_AP, CHANNELS_TG, TICKER_TEXT, getChannelName, YT_CHANNEL_ID, YT_LIVE_KURNOOL, YT_LIVE_GUNTUR, YT_LIVE_NELLORE, YT_LIVE_KAKINADA, YT_LIVE_TIRUPATI, YT_LIVE_KHAMMAM, YT_LIVE_KARIMNAGAR, YT_LIVE_WARANGAL, YT_LIVE_NALGONDA, YT_LIVE_VIDEO, YT_LIVE_KNR, YT_LIVE_GTV, YT_LIVE_FALLBACK, CHANNEL_VIDEO, LIVE_CHANNELS, BULLETINS, PROGRAM_TYPES, PROGRAM_COLORS, SHORT_NEWS, CONSTITUENCY_DISTRICT, WISH_TYPES, CONTENT_TYPES, TE_LABEL_MAP, VEG_LIST, VEG_LIST_TE, AP_DISTRICTS, TG_DISTRICTS, css } from '../../_imports.js';

import LegalDocScreen from './LegalDocScreen.jsx';

function CopyrightScreen({ onBack, onNavigate }) {
  const { T } = useAppTheme();
  return <LegalDocScreen
    onBack={onBack}
    onNavigate={onNavigate}
    icon="©️"
    title="Copyright & Takedown Policy"
    subtitle="కాపీరైట్ మరియు తొలగింపు"
    topActions={[
      { icon:'©️', label:'Submit Takedown Request', action:'takedown', primary:true },
      { icon:'↩️', label:'Submit Counter-Notification', action:'counternotification' },
    ]}
    sections={[
      { body: "Effective Date: 09.04.2026\n\nLocalAI respects intellectual property rights and is committed to complying with applicable copyright laws in India. If you believe that any content available on our platform infringes your copyright or intellectual property rights, you may submit a takedown request through this page.\n\nTo report copyright infringement:\n📧 support@localaitv.com\n📞 +91 7569684979" },
      { heading: "1. INTRODUCTION", body: "LocalAI respects intellectual property rights and expects users, citizen reporters, contributors, advertisers, partners, and third parties to respect the rights of others.\n\nUsers must not upload or publish content that infringes copyright, trademark, privacy, publicity, or other legal rights.\n\nThis policy explains how copyright owners or authorized representatives can report allegedly infringing content and how LocalAI may review and act on such requests." },
      { heading: "2. REPORTING COPYRIGHT INFRINGEMENT", body: "If you are a copyright owner or an authorized representative, you may submit a copyright complaint with the following details:",
        bullets: [
          "Full name and contact information",
          "Email address and phone number",
          "Description of the copyrighted work",
          "Exact URL or location of the allegedly infringing content on LocalAI",
          "Proof of ownership or authorization, such as documents, links, original source, registration details, or other supporting material",
          "A statement that you believe in good faith that the disputed use is unauthorized",
          "A declaration that the information provided is true and accurate",
          "Your electronic signature or typed full name",
        ]
      },
      { body: "Incomplete, false, unclear, or unsupported complaints may be rejected or may require additional information." },
      { heading: "3. TAKEDOWN PROCEDURE", body: "Upon receiving a valid copyright complaint:",
        bullets: [
          "LocalAI may acknowledge the request within 24 hours where applicable",
          "LocalAI will review the complaint and supporting proof",
          "LocalAI may temporarily hide, restrict, disable access to, or remove the reported content during review",
          "LocalAI may contact the complainant for additional information",
          "LocalAI may contact the uploader or concerned user where appropriate",
          "LocalAI may take action within a reasonable review period depending on the nature of the complaint, proof, urgency, and legal requirements",
          "Serious, unlawful, or urgent copyright issues may be escalated to the admin/legal/moderation team",
        ]
      },
      { body: "Review timelines may vary depending on the complexity and urgency of the complaint." },
      { heading: "4. COUNTER-NOTIFICATION", body: "If a user believes that their content was wrongly removed or disabled, they may submit a counter-notification.\n\nA counter-notification should include:",
        bullets: [
          "Full name and contact information",
          "Details of the removed or disabled content",
          "A statement explaining why the user believes the content does not infringe copyright",
          "Proof of ownership, permission, license, fair use/fair dealing, or other supporting evidence",
          "A declaration that the information provided is true and accurate",
          "Electronic signature or typed full name",
        ]
      },
      { body: "LocalAI may review the counter-notification and may restore the content if the claim is found to be valid, subject to applicable law and platform policy." },
      { heading: "5. REPEAT INFRINGERS", body: "Users who repeatedly violate copyright or intellectual property rules may face action, including:",
        bullets: [
          "Warning",
          "Content removal",
          "Temporary restriction",
          "Account suspension",
          "Permanent ban from the platform",
          "Escalation to legal/admin team",
          "Reporting to appropriate authorities where required by law",
        ]
      },
      { body: "LocalAI may also restrict users who repeatedly submit false, malicious, or misleading copyright complaints." },
      { heading: "6. LIMITATION OF LIABILITY", body: "LocalAI acts as a platform that hosts, processes, and displays user-generated and third-party content.\n\nLocalAI does not guarantee that all user-generated content is owned, licensed, verified, or free from rights claims.\n\nLocalAI may not actively monitor every item of user-generated content before upload, but it may use automated systems, AI tools, user reports, admin review, and takedown requests to identify and act on possible violations.\n\nLocalAI is not responsible for user-uploaded content, third-party content, external links, or copyright disputes between users and third parties, except as required under applicable law." },
      { heading: "7. CONTACT FOR COPYRIGHT ISSUES", body: "Designated Officer / Grievance Officer:\n\nName: Bommena Prashanth\nDesignation: Grievance Officer\nEmail: support@localaitv.com\nPhone: +91 7569684979" },
      { heading: "8. LEGAL COMPLIANCE", body: "This policy is aligned with:",
        bullets: [
          "Information Technology Act, 2000",
          "Information Technology Rules, 2021, where applicable",
          "Applicable provisions of the Copyright Act, 1957, India",
          "Other applicable Indian laws, regulations, lawful orders, and platform policies",
        ]
      },
      { body: "Users must not misuse the platform for copyright infringement, piracy, impersonation, unauthorized publishing, fake ownership claims, or malicious takedown requests." },
      { heading: "9. DISCLAIMER", body: "Submitting a takedown request does not guarantee automatic removal of content.\n\nLocalAI may review the complaint, request additional proof, reject invalid complaints, remove or disable content, restore content after valid counter-notification, or take any other action permitted under applicable law and platform policy.\n\nSubmitting false, misleading, malicious, or fraudulent claims may result in account action, rejection of complaint, legal consequences, or reporting to appropriate authorities.\n\nThis policy is provided for platform compliance and user guidance and does not constitute legal advice." },
    ]}
  />;
}


export { CopyrightScreen };
export default CopyrightScreen;
