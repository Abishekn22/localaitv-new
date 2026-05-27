import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { T, ACCENT, SEC, OTT, getNewsAccent, useAppTheme, API_BASE, YT_CHANNEL, APP_VERSION, apiCall, API, useAPI, useReveal, Reveal, AP_CONSTITUENCIES, TG_CONSTITUENCIES, NEWS_ITEMS, NEWS_CATS, REPORTERS, BULLETIN_SEGS, CLASSIFIEDS, CL_CATS, CL_CAT_EMOJI, CL_CAT_IMG, CL_BADGE_COLOR, NO_CALL_CATS, CL_SUBCATS, CONTACT_CATS, CHANNELS_AP, CHANNELS_TG, TICKER_TEXT, getChannelName, YT_CHANNEL_ID, YT_LIVE_KURNOOL, YT_LIVE_GUNTUR, YT_LIVE_NELLORE, YT_LIVE_KAKINADA, YT_LIVE_TIRUPATI, YT_LIVE_KHAMMAM, YT_LIVE_KARIMNAGAR, YT_LIVE_WARANGAL, YT_LIVE_NALGONDA, YT_LIVE_VIDEO, YT_LIVE_KNR, YT_LIVE_GTV, YT_LIVE_FALLBACK, CHANNEL_VIDEO, LIVE_CHANNELS, BULLETINS, PROGRAM_TYPES, PROGRAM_COLORS, SHORT_NEWS, CONSTITUENCY_DISTRICT, WISH_TYPES, CONTENT_TYPES, TE_LABEL_MAP, VEG_LIST, VEG_LIST_TE, AP_DISTRICTS, TG_DISTRICTS, css } from '../../_imports.js';

import LegalDocScreen from './LegalDocScreen.jsx';

function TermsScreen({ onBack, onNavigate }) {
  const { T } = useAppTheme();
  return <LegalDocScreen
    onBack={onBack}
    onNavigate={onNavigate}
    icon="📜"
    title="Terms & Conditions"
    subtitle="నిబంధనలు మరియు షరతులు"
    topActions={[
      { icon:'🔒', label:'Read Privacy Policy', action:'privacy' },
      { icon:'📣', label:'Submit Grievance', action:'complaint' },
    ]}
    sections={[
      { body: "Please read these Terms & Conditions carefully before using LocalAI. By accessing, browsing, uploading, or using this platform, you agree to follow these Terms." },
      { heading: "1. ACCEPTANCE OF TERMS", body: "By using LocalAI / AI News Network, you agree to these Terms & Conditions. If you do not agree with these Terms, please do not use the platform.\n\nThese Terms apply to all users, visitors, citizen reporters, contributors, partners, advertisers, channel partners, and registered users who access or use the platform." },
      { heading: "2. USER ELIGIBILITY", body: "Users must provide accurate and truthful information while using the platform.\n\nUsers must use the platform only for lawful and genuine purposes.\n\nUsers must not misuse the platform for fake news, false complaints, impersonation, harassment, defamation, privacy violations, copyright violations, or any illegal activity." },
      { heading: "3. NATURE OF THE PLATFORM", body: "The platform enables users, including citizen reporters, to upload local news content such as photos, videos, text, audio, links, documents, and supporting proof.\n\nUploaded content may be processed, edited, categorized, translated, summarized, formatted, moderated, verified, and published using AI systems and/or manual editorial review.\n\nLocalAI does not guarantee the accuracy, completeness, reliability, or truthfulness of user-generated content unless it has been reviewed and approved by the authorized editorial/admin team.\n\nThe platform may choose not to publish, may delay publication, or may remove content if verification is incomplete or if the content violates platform rules or applicable law." },
      { heading: "4. USER RESPONSIBILITIES", body: "Users agree that they will NOT upload, publish, or share content that:",
        bullets: [
          "Is false, misleading, fake, or defamatory",
          "Violates any law or regulation",
          "Infringes copyright, trademark, privacy, publicity, or other rights",
          "Contains hate speech, abuse, harassment, threats, or offensive material",
          "Invades someone's privacy or exposes private personal information without consent",
          "Promotes violence, self-harm, illegal activities, fraud, or public disorder",
          "Contains obscene, sexually explicit, exploitative, or unlawful material",
          "Impersonates another person, organization, public official, journalist, or authority",
          "Manipulates media in a deceptive way",
          "Creates panic, communal tension, public harm, or misinformation",
        ]
      },
      { body: "Users are solely responsible for the content they upload. False submissions, fake complaints, or misuse of the platform may lead to content removal, account suspension, legal reporting, or other action." },
      { heading: "5. CONTENT OWNERSHIP & LICENSE", body: "Users retain ownership of the original content they submit, subject to applicable laws and third-party rights.\n\nBy uploading content to LocalAI, users grant LocalAI a non-exclusive, worldwide, royalty-free, transferable, and sublicensable license to use, reproduce, edit, modify, translate, summarize, verify, format, publish, display, distribute, archive, and promote the uploaded content for platform, news, moderation, verification, and operational purposes.\n\nThis license includes permission to display the content on the app, website, TV, social media, partner platforms, and other LocalAI distribution channels.\n\nThis also includes AI-based processing such as transcription, translation, summarization, categorization, voice processing, video trimming, formatting, content enhancement, and moderation support.\n\nUsers must only upload content that they own or have the legal right to submit." },
      { heading: "6. AI PROCESSING & EDITORIAL RIGHTS", body: "Uploaded content may be automatically processed using AI systems.\n\nAI may be used for transcription, translation, summarization, categorization, headline generation, content formatting, news workflow automation, moderation support, duplicate detection, quality checks, and verification assistance.\n\nAI-generated outputs may not always be accurate, complete, or error-free.\n\nLocalAI reserves the right to review, edit, modify, reject, remove, hide, delay, or reformat submitted content for clarity, quality, safety, policy compliance, editorial standards, or legal reasons.\n\nFinal publishing, moderation, or grievance decisions may be handled by authorized admin/editorial teams." },
      { heading: "7. CONTENT MODERATION & REMOVAL", body: "LocalAI may remove, hide, disable access to, restrict, or reject content that:",
        bullets: [
          "Violates these Terms",
          "Violates Upload Rules or Community Guidelines",
          "Is reported through grievance or abuse-report mechanisms",
          "Is found to be false, misleading, defamatory, private, unlawful, or harmful",
          "Infringes intellectual property or privacy rights",
          "Is required to be removed under applicable law, court order, government direction, or platform policy",
          "Creates public safety, legal, ethical, or reputational risk",
        ]
      },
      { body: "LocalAI may use both automated systems and human review for content moderation. Users may report objectionable or unlawful content through the Report option or Grievance Redressal page." },
      { heading: "8. PAYMENTS & MONETIZATION", body: "Any revenue sharing, payment, incentive, reward, commission, or partnership arrangement with reporters, contributors, vendors, freelancers, agencies, channel partners, advertisers, or partners will be governed by separate written agreements.\n\nThe platform is not responsible for payment disputes between third parties, contributors, reporters, advertisers, agencies, partners, or external service providers.\n\nUnless clearly agreed in writing, uploading content does not automatically create a right to payment, employment, partnership, commission, or revenue share.\n\nLocalAI may introduce, modify, suspend, or discontinue monetization features at any time, subject to applicable law and platform policy." },
      { heading: "9. LIMITATION OF LIABILITY", body: "LocalAI is not responsible for:",
        bullets: [
          "Accuracy of user-generated content",
          "Any loss, damage, harm, claim, dispute, or consequence caused by reliance on user-generated content",
          "Content uploaded by users, contributors, citizen reporters, or third parties",
          "Third-party links, websites, services, advertisements, or external platforms",
          "Temporary app downtime, errors, delays, technical issues, or service interruptions",
          "AI-generated errors, incomplete summaries, incorrect categorization, or moderation limitations",
        ]
      },
      { body: "The platform is provided on an \"as is\" and \"as available\" basis. Users should independently verify important information before relying on it." },
      { heading: "10. SUSPENSION & TERMINATION", body: "LocalAI reserves the right to suspend, restrict, block, or terminate user accounts if users violate these Terms; upload false, illegal, harmful, defamatory, or misleading content; abuse the complaint or grievance system; impersonate another person or organization; violate privacy, copyright, trademark, or other legal rights; try to manipulate the platform, moderation system, or news workflow; engage in harassment, hate speech, threats, spam, or unlawful activity; or create safety, legal, or reputational risk for the platform or public.\n\nLocalAI may also block access to the platform, remove submitted content, or report unlawful activity to appropriate authorities where required." },
      { heading: "11. PRIVACY", body: "Use of the platform is also governed by our Privacy Policy. The Privacy Policy explains how LocalAI collects, uses, stores, processes, shares, and protects user information." },
      { heading: "12. GRIEVANCE REDRESSAL", body: "Users can report content, complaints, legal concerns, privacy issues, copyright concerns, fake news, defamatory content, impersonation, or platform misuse through the Grievance Redressal Policy page.\n\nGrievance Officer:\nName: Bommena Prashanth\nDesignation: Grievance Officer\nEmail: support@localaitv.com\nPhone: +91 7569684979" },
      { heading: "13. COMPLIANCE WITH LAWS", body: "Users agree to comply with:",
        bullets: [
          "Information Technology Act, 2000",
          "Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021",
          "Applicable Indian laws and regulations",
          "Copyright, trademark, privacy, defamation, and media-related laws",
          "Any lawful orders, notices, or directions issued by competent authorities",
        ]
      },
      { body: "Users must not use the platform for any unlawful, harmful, fraudulent, abusive, or misleading purpose." },
      { heading: "14. INTELLECTUAL PROPERTY", body: "The LocalAI platform, including its design, logo, brand name, software, layout, user interface, graphics, database, workflows, AI systems, and company-created content, is owned by the company or its licensors.\n\nUnauthorized copying, reproduction, distribution, scraping, reverse engineering, modification, commercial exploitation, or misuse of the platform is strictly prohibited.\n\nUsers must not use the LocalAI name, logo, branding, or content without written permission." },
      { heading: "15. CHANGES TO TERMS", body: "LocalAI may update, modify, or replace these Terms from time to time.\n\nUpdated Terms may be posted within the app or website.\n\nContinued use of the platform after updates means the user accepts the updated Terms.\n\nUsers are encouraged to review the Terms periodically." },
      { heading: "16. GOVERNING LAW & JURISDICTION", body: "These Terms shall be governed by the laws of India.\n\nAny disputes shall be subject to the jurisdiction of courts in Hyderabad, Telangana, India." },
      { body: "This information is provided for platform compliance and user guidance and does not constitute legal advice." },
    ]}
  />;
}


export { TermsScreen };
export default TermsScreen;
