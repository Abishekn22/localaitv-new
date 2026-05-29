import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  T, useAppTheme, ThemeProvider,
  SHORT_NEWS, CLASSIFIEDS, LIVE_CHANNELS,
  apiCall, useAPI,
} from './_imports.js';

import { publicVoiceToShortShape } from './components/Sections/ShortNewsSection.jsx';
import { mapIncidentToShort } from './data/incidents.js';
import { getLocationIdFromName } from './data/regions.js';

// Screens
import SplashScreen           from './screens/SplashScreen.jsx';
import IntroScreen            from './screens/IntroScreen.jsx';
import OfflineScreen          from './components/OfflineScreen.jsx';
import HomeScreen             from './screens/HomeScreen.jsx';
import ChannelsScreen         from './screens/ChannelsScreen.jsx';
import ChannelDetailScreen    from './screens/ChannelDetailScreen.jsx';
import NewsDetailScreen       from './screens/NewsDetailScreen.jsx';
import DistrictNewsFeedScreen from './screens/DistrictNewsFeedScreen.jsx';
import KurnoolShortsScreen    from './screens/KurnoolShortsScreen.jsx';
import ClassifiedsScreen      from './screens/ClassifiedsScreen.jsx';
import ClassifiedsFeedScreen  from './screens/ClassifiedsFeedScreen.jsx';
import BulletinPlayerScreen   from './screens/BulletinPlayerScreen.jsx';
import ScheduleScreen         from './screens/ScheduleScreen.jsx';
import PanchangamScreen       from './screens/PanchangamScreen.jsx';
import ElectionScreen         from './screens/ElectionScreen.jsx';
import LeaderboardScreen      from './screens/LeaderboardScreen.jsx';
import ProgressScreen         from './screens/ProgressScreen.jsx';
import EmergencyScreen        from './screens/EmergencyScreen.jsx';
import QRCodeScreen           from './screens/QRCodeScreen.jsx';
import LocationPickerScreen   from './screens/LocationPickerScreen.jsx';
import RegisterScreen         from './screens/RegisterScreen.jsx';
import UploadScreen           from './screens/UploadScreen.jsx';
import UploadRegistrationScreen from './screens/UploadRegistrationScreen.jsx';
import ProfileScreen          from './screens/ProfileScreen.jsx';
import AdminDashboardScreen   from './screens/AdminDashboardScreen.jsx';
import DashboardScreen        from './screens/DashboardScreen.jsx';
import SettingsScreen         from './screens/SettingsScreen.jsx';
import LocalScreen            from './screens/LocalScreen.jsx';
import WhosWhoScreen          from './screens/WhosWhoScreen.jsx';
import UtilityScreen          from './screens/UtilityScreen.jsx';
import DevotionalScreen       from './screens/DevotionalScreen.jsx';
import EarningsScreen         from './screens/EarningsScreen.jsx';
import ChannelPartnerScreen   from './screens/ChannelPartnerScreen.jsx';
import GrievanceScreen        from './screens/GrievanceScreen.jsx';

// Legal
import AboutScreen            from './screens/legal/AboutScreen.jsx';
import PrivacyScreen          from './screens/legal/PrivacyScreen.jsx';
import TermsScreen            from './screens/legal/TermsScreen.jsx';
import CopyrightScreen        from './screens/legal/CopyrightScreen.jsx';
import ContactScreen          from './screens/legal/ContactScreen.jsx';
import AdvertiseScreen        from './screens/legal/AdvertiseScreen.jsx';
import AccountDeletionScreen  from './screens/legal/AccountDeletionScreen.jsx';

// Compliance
import ComplaintForm           from './screens/compliance/ComplaintForm.jsx';
import TakedownForm            from './screens/compliance/TakedownForm.jsx';
import CounterNotificationForm from './screens/compliance/CounterNotificationForm.jsx';
import ReportContentForm       from './screens/compliance/ReportContentForm.jsx';

// Forms
import NewsUploadFormScreen           from './screens/forms/NewsUploadFormScreen.jsx';
import BirthdayRequestForm            from './screens/forms/BirthdayRequestForm.jsx';
import MarriageAnniversaryRequestForm from './screens/forms/MarriageAnniversaryRequestForm.jsx';
import WhoIsWhoRequestForm            from './screens/forms/WhoIsWhoRequestForm.jsx';
import TalentShowRequestForm          from './screens/forms/TalentShowRequestForm.jsx';
import PublicVoiceRequestForm         from './screens/forms/PublicVoiceRequestForm.jsx';
import EventsForm                     from './screens/forms/EventsForm.jsx';
import UpcomingMarriageForm           from './screens/forms/UpcomingMarriageForm.jsx';
import ShoppingAdForm                 from './screens/forms/ShoppingAdForm.jsx';
import JobsForm                       from './screens/forms/JobsForm.jsx';
import CarSalesForm                   from './screens/forms/CarSalesForm.jsx';
import RentalForm                     from './screens/forms/RentalForm.jsx';
import VegPriceForm                   from './screens/forms/VegPriceForm.jsx';
import GuestIntakeForm                from './screens/forms/GuestIntakeForm.jsx';

// Sheets / overlays
import ReportSheet     from './components/sheets/ReportSheet.jsx';
import PermissionSheet from './components/sheets/PermissionSheet.jsx';
import Toast           from './components/Toast.jsx';

import { AuthProvider, useAuth } from './contexts/AuthContext.jsx';

// Lazy wrapper for the 'shortsfeed' route. Mounting this fires the
// /api/incidents fetch; the fetch never runs when the user isn't on
// the route. KurnoolShortsScreen now handles an empty feed with a
// bilingual placeholder so a slow / empty API response no longer crashes.
function ShortsFeedRoute({ onClose, locationId = null }) {
  const locParam = locationId != null ? `&location_id=${locationId}` : '';
  const { data: liveIncidents } = useAPI(
    () => apiCall(`/incidents?page=1&limit=20${locParam}`).then(d => d.items || d),
    [],
    [locationId]
  );
  const items = useMemo(
    () => (Array.isArray(liveIncidents) ? liveIncidents.map(mapIncidentToShort) : []),
    [liveIncidents]
  );
  return <KurnoolShortsScreen rawItems={items} initialIdx={0} onClose={onClose} />;
}

function App() {
  // ── Read current theme (set by ThemeProvider in AppRoot) ────
  // Phase 1: T is still the global dark object. Phase 2+ will
  // destructure T from here so components pick up light values.
  const { isDark: appIsDark } = useAppTheme();
  // Auth gate — logged-in users go straight to the upload page; guests are
  // routed to the registration / login screen first.
  const { isAuthenticated, isVerified } = useAuth();

  // Upload + every upload sub-form require a VERIFIED account.
  const VERIFIED_ONLY_SCREENS = [
    'upload', 'newsupload', 'birthdayform', 'anniversaryform', 'whoiswhoform',
    'talentshowform', 'publicvoiceform', 'eventsform', 'upcomingmarriage',
    'shopping', 'jobs', 'carsales', 'rentalform', 'vegpriceform', 'guestintake',
  ];

  // ── Onboarding persistence ──────────────────────────────────
  // First launch: no localaitv_device_id → mint a UUID, store it, and
  // run the full splash → intro → location-picker flow.
  // Returning launch: device ID + previously-picked constituency both
  // present → skip splash and location, land on home immediately.
  // Partial returning state (device ID exists but no constituency saved,
  // e.g. user closed the app mid-onboarding) falls back to the full flow.
  const __init = (() => {
    if (typeof window === 'undefined' || !window.localStorage) {
      return { isReturning:false, constituency:null, state:null, lastScreen:null, lastNav:null };
    }
    try {
      let id = window.localStorage.getItem('localaitv_device_id');
      const isReturning = !!id;
      if (!id) {
        id = (window.crypto && window.crypto.randomUUID)
          ? window.crypto.randomUUID()
          : ('d_' + Date.now() + '_' + Math.random().toString(36).slice(2, 10));
        window.localStorage.setItem('localaitv_device_id', id);
      }
      return {
        isReturning,
        constituency: window.localStorage.getItem('localaitv_constituency'),
        state:        window.localStorage.getItem('localaitv_state'),
        lastScreen:   window.localStorage.getItem('localaitv_screen'),
        lastNav:      window.localStorage.getItem('localaitv_nav'),
      };
    } catch (e) {
      return { isReturning:false, constituency:null, state:null, lastScreen:null, lastNav:null };
    }
  })();

  // Screens that belong to the onboarding flow — never restored on reload.
  const ONBOARDING_SCREENS = ['splash', 'intro', 'location'];

  // On reload, restore the page the user was on (returning users only); fall
  // back to home. First-time / mid-onboarding users still get the full flow.
  const [screen, setScreen]             = useState(() => {
    if (!(__init.isReturning && __init.constituency)) return 'splash';
    const last = __init.lastScreen;
    return (last && !ONBOARDING_SCREENS.includes(last)) ? last : 'home';
  });
  const [navActive, setNavActive]       = useState(__init.lastNav || 'home');
  const [selectedNews, setSelectedNews] = useState(null);
  const [selectedChannel, setSelectedChannel] = useState(null);
  // When the bulletin player is opened from a channel's detail page, remember
  // that channel so closing the player returns to it (and the player filters
  // to that channel's district rather than the user's chosen location).
  const [bulletinReturnChannel, setBulletinReturnChannel] = useState(null);
  const [isOffline, setIsOffline]       = useState(false);
  const [reportTarget, setReportTarget] = useState(null);
  const [permSheet, setPermSheet]       = useState(null);
  const [toast, setToast]               = useState('');
  const [logoTaps, setLogoTaps]         = useState(0);
  const logoTapTimer                    = useRef(null);
  // Location state — user's chosen constituency, restored from localStorage on mount.
  const [userConstituency, setUserConstituency] = useState(__init.constituency || null);
  const [classifiedsCat, setClassifiedsCat] = useState('All'); // initial category for ClassifiedsScreen
  const [userState,        setUserState]        = useState(__init.state || null);

  // Selected constituency → backend numeric locations.id. Passed to the
  // standalone shorts route (incidents carry a real location_id).
  const activeLocationId = getLocationIdFromName(userConstituency, userState);
  // Bulletins carry location_id: 0, so the bulletin player filters by name
  // instead — pass both the Telugu (channel.name) and English (nameEn) labels.
  const __activeChannelObj = LIVE_CHANNELS.find(c => c.nameEn === userConstituency) || null;
  const activeLocation = { id: activeLocationId, name: __activeChannelObj?.name || '', nameEn: userConstituency || '' };

  // Write helper — every place that updates the chosen location must also
  // persist it, so the next launch can skip the picker.
  function persistLocation(c, s) {
    try {
      if (c) window.localStorage.setItem('localaitv_constituency', c);
      if (s) window.localStorage.setItem('localaitv_state', s);
    } catch (e) {}
  }

  // Registration state — required to upload news (citizen reporter accountability)
  const [isRegistered, setIsRegistered] = useState(() => {
    try {
      return window.localStorage?.getItem('localaitv_registered') === '1';
    } catch (e) {
      return false;
    }
  });
  const [userProfile, setUserProfile] = useState(() => {
    try {
      const saved = window.localStorage?.getItem('localaitv_user_profile');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  function completeRegistration(profile) {
    try {
      window.localStorage.setItem('localaitv_registered', '1');
      window.localStorage.setItem('localaitv_user_profile', JSON.stringify(profile));
    } catch (e) {}
    setIsRegistered(true);
    setUserProfile(profile);
  }

  function showToast(m) { setToast(m); setTimeout(() => setToast(''), 2500); }

  // Request push notification permission on first open
  useEffect(() => {
    const asked = localStorage.getItem('localaitv_notif_asked');
    if (!asked && 'Notification' in window) {
      setTimeout(() => {
        localStorage.setItem('localaitv_notif_asked', '1');
        Notification.requestPermission();
      }, 3000);
    }
  }, []);

  // Remember the current page so a reload restores it (not home). Onboarding
  // screens are excluded so the splash/intro/location flow isn't re-pinned.
  useEffect(() => {
    if (typeof window === 'undefined' || !window.localStorage) return;
    try {
      if (!ONBOARDING_SCREENS.includes(screen)) {
        window.localStorage.setItem('localaitv_screen', screen);
        window.localStorage.setItem('localaitv_nav', navActive);
      }
    } catch (e) {}
  }, [screen, navActive]);

  // Offline detection
  useEffect(() => {
    function handleOffline() { setIsOffline(true); }
    function handleOnline()  { setIsOffline(false); }
    window.addEventListener('offline', handleOffline);
    window.addEventListener('online',  handleOnline);
    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online',  handleOnline);
    };
  }, []);

  // Secret admin tap — tap logo 5× to open admin
  function handleLogoTap() {
    const next = logoTaps + 1;
        setLogoTaps(next);
    if (logoTapTimer.current) clearTimeout(logoTapTimer.current);
    logoTapTimer.current = setTimeout(() => setLogoTaps(0), 2000);
  }

  function navigate(to) {
    // Any explicit navigation cancels a pending "return to channel" hand-off.
    setBulletinReturnChannel(null);
    // Upload requires a signed-in user. Guests tapping Upload (bottom nav or
    // sidebar) are sent to the registration / login screen; signed-in users go
    // straight to the upload page.
    if (to === 'upload' && !isAuthenticated) {
      setNavActive('upload');
      setSelectedNews(null);
      setSelectedChannel(null);
      setScreen('uploadregister');
      return;
    }
    // Signed in but not yet verified → block upload / all upload forms and send
    // the user to their Profile (where verification status is polled live).
    if (isAuthenticated && !isVerified && VERIFIED_ONLY_SCREENS.includes(to)) {
      showToast('Your account is pending verification — uploads unlock once verified.');
      setNavActive('profile');
      setSelectedNews(null);
      setSelectedChannel(null);
      setScreen('profile');
      return;
    }
    setNavActive(to);
    setSelectedNews(null);
    setSelectedChannel(null);
    setScreen(to);
  }

  function renderScreen() {
    // Offline wall
    if (isOffline) return <OfflineScreen onRetry={() => window.location.reload()} />;

    // Detail screens
    if (selectedNews) return (
      <div className="screen-in" style={{position:'relative',width:'100%',height:'100%'}}>
        <NewsDetailScreen
          news={selectedNews}
          onBack={() => setSelectedNews(null)}
          onReport={(n) => setReportTarget(n)}
        />
        <ReportSheet
          show={!!reportTarget}
          onClose={() => setReportTarget(null)}
          contentTitle={reportTarget?.title}
        />
        <PermissionSheet
          show={!!permSheet}
          type={permSheet}
          onClose={() => setPermSheet(null)}
          onAllow={() => { showToast('Permission granted'); setPermSheet(null); }}
        />
        <Toast msg={toast}/>
      </div>
    );

    if (selectedChannel) return (
      <ChannelDetailScreen
        channel={selectedChannel}
        onBack={() => setSelectedChannel(null)}
        onOpenNews={(n) => { setSelectedChannel(null); setSelectedNews(n); }}
        onOpenBulletin={(bulletinId) => {
          if (typeof window !== 'undefined') window.__bulletinStartId = bulletinId;
          setBulletinReturnChannel(selectedChannel);
          setSelectedChannel(null);
          setScreen('bulletinsfeed');
        }}
      />
    );

    switch (screen) {
      case 'splash':     return <SplashScreen onDone={() => {
        // Show intro only on first launch
        const hasSeenIntro = (typeof window !== 'undefined' && window.localStorage)
          ? window.localStorage.getItem('localaitv_seen_intro')
          : null;
        if (hasSeenIntro) {
          // Returning user — skip intro
          setScreen(userConstituency ? 'home' : 'location');
        } else {
          // First-time user — show intro and mark as seen
          try { window.localStorage.setItem('localaitv_seen_intro', '1'); } catch(e) {}
          setScreen('intro');
        }
      }} />;
      case 'intro':      return <IntroScreen onDone={() => setScreen(userConstituency?'home':'location')} />;
      case 'location':   return <LocationPickerScreen onDone={(c,s)=>{ setUserConstituency(c); setUserState(s); persistLocation(c,s); setScreen('home'); setNavActive('home'); }} />;
      case 'home':       return (
        <div style={{position:'relative',width:'100%',height:'100%'}}>
          <HomeScreen
            onNavigate={navigate}
            onOpenNews={setSelectedNews}
            onReport={(n) => setReportTarget(n)}
            onLogoTap={handleLogoTap}
            userConstituency={userConstituency}
            userState={userState}
            onChangeLocation={() => setScreen('location')}
            onSelectLocation={(c, s) => { setUserConstituency(c); if (s) setUserState(s); persistLocation(c, s); }}
          />
          <ReportSheet
            show={!!reportTarget}
            onClose={() => setReportTarget(null)}
            contentTitle={reportTarget?.title}
          />
          <Toast msg={toast}/>
        </div>
      );
      case 'channels':   return <ChannelsScreen onNavigate={navigate} onOpenChannel={setSelectedChannel} />;
      case 'uploadregister': return (
        <UploadRegistrationScreen
          onNavigate={navigate}
          userProfile={userProfile}
          userConstituency={userConstituency}
          userState={userState}
          onSubmitDone={(data)=>{
            // Save anything the user provided (all fields are optional)
            if (data?.constituency) setUserConstituency(data.constituency);
            if (data?.state) setUserState(data.state);
            // Persist so the next launch can skip the location picker.
            if (data?.constituency || data?.state) persistLocation(data.constituency, data.state);
            if (data?.name || data?.mobile || data?.photo) {
              setUserProfile(prev => ({ ...prev,
                ...(data.name && { name: data.name }),
                ...(data.mobile && { mobile: data.mobile }),
                ...(data.photo && { photo: URL.createObjectURL(data.photo) }),
              }));
            }
            // Navigate directly to upload home bypassing the registration gate
            setNavActive('upload');
            setSelectedNews(null);
            setSelectedChannel(null);
            setScreen('upload');
          }}
        />
      );
      case 'upload':     return (
        <div style={{position:'relative',width:'100%',height:'100%'}}>
          <UploadScreen
            onNavigate={navigate}
            userProfile={userProfile}
            userConstituency={userConstituency}
            onRequestCamera={() => setPermSheet('camera')}
            onRequestLocation={() => setPermSheet('location')}
          />
          <PermissionSheet
            show={!!permSheet}
            type={permSheet}
            onClose={() => setPermSheet(null)}
            onAllow={() => { showToast('Permission granted'); setPermSheet(null); }}
          />
        </div>
      );
      case 'local':      return <LocalScreen onNavigate={navigate} constituency={userConstituency||'Kurnool'} onOpenCat={(c)=>{setClassifiedsCat(c); navigate('classifiedsfeed');}} />;
      case 'shortsfeed':      return <ShortsFeedRoute onClose={()=>navigate('home')} locationId={activeLocationId} />;
      case 'publicvoicefeed': {
        // Public Voice opens in the Mana Kurnool Shorts viewer with
        // pv-items mapped to the SHORT_NEWS shape. ONLY uploaded form
        // data flows through the mapper — no static demo branding.
        const pvRaw = CLASSIFIEDS.filter(c => c.cat === 'Public Voice' && c.ytId);
        const pvItems = pvRaw.map(publicVoiceToShortShape);
        let startIdx = 0;
        if (typeof window !== 'undefined' && window.__publicVoiceStartId) {
          const ix = pvRaw.findIndex(c => c.id === window.__publicVoiceStartId);
          if (ix >= 0) startIdx = ix;
          window.__publicVoiceStartId = null;
        }
        return <KurnoolShortsScreen rawItems={pvItems} initialIdx={startIdx} onClose={()=>navigate('home')}/>;
      }
      case 'classifiedsfeed': {
        // Allow other rails (e.g. ClassifiedsSection thumbnails) to
        // pre-select a category + a specific start item by setting
        // one-shot window flags before navigating.
        let preset      = classifiedsCat;
        let startItemId = null;
        if (typeof window !== 'undefined') {
          if (window.__classifiedsStartCat) {
            preset = window.__classifiedsStartCat;
            window.__classifiedsStartCat = null;
          }
          if (window.__classifiedsStartItemId) {
            startItemId = window.__classifiedsStartItemId;
            window.__classifiedsStartItemId = null;
          }
        }
        // Compute startIdx by replicating ClassifiedsFeedScreen's own
        // filter + sort (newest-first by uploadedAt) so the screen
        // opens at the exact tapped item.
        let startIdx = 0;
        if (startItemId) {
          const catName = preset || 'All';
          const pool = catName === 'All'
            ? CLASSIFIEDS
            : CLASSIFIEDS.filter(c => c.cat === catName);
          const sorted = [...pool].sort((a,b) =>
            new Date(b.uploadedAt || 0) - new Date(a.uploadedAt || 0)
          );
          const ix = sorted.findIndex(c => c.id === startItemId);
          if (ix >= 0) startIdx = ix;
        }
        return <ClassifiedsFeedScreen onClose={()=>navigate('home')} startIdx={startIdx} startCat={preset || 'All'}/>;
      }
      case 'bulletinsfeed': {
        // When opened from a channel detail page, filter to that channel's
        // district and return there on close; otherwise use the user's chosen
        // location and close to home (the home-rail behavior).
        const fromChannel = bulletinReturnChannel;
        const bulletinLoc = fromChannel
          ? { id: fromChannel.location_id, name: fromChannel.name, nameEn: fromChannel.nameEn }
          : activeLocation;
        return <BulletinPlayerScreen
          startIdx={0}
          location={bulletinLoc}
          onClose={()=>{
            if (fromChannel) {
              setBulletinReturnChannel(null);
              setScreen('channels');
              setSelectedChannel(fromChannel);
            } else {
              navigate('home');
            }
          }}
        />;
      }
      case 'newsfeed':        return <DistrictNewsFeedScreen onClose={()=>navigate('home')} startCat='All' startIdx={0}/>;  
      case 'whoswho':    return <WhosWhoScreen onBack={()=>navigate('local')} onNavigate={navigate} constituency={userConstituency||'Kurnool'} />;
      case 'utility':    return <UtilityScreen onBack={()=>navigate('local')} onNavigate={navigate} constituency={userConstituency||'Kurnool'} />;
      case 'trains':     return <UtilityScreen onBack={()=>navigate('local')} onNavigate={navigate} constituency={userConstituency||'Kurnool'} initialTab="train" />;
      case 'weather':    return <UtilityScreen onBack={()=>navigate('local')} onNavigate={navigate} constituency={userConstituency||'Kurnool'} initialTab="weather" />;
      case 'bullion':    return <UtilityScreen onBack={()=>navigate('local')} onNavigate={navigate} constituency={userConstituency||'Kurnool'} initialTab="bullion" />;
      case 'devotional':   return <DevotionalScreen onBack={()=>navigate('local')} />;
      case 'register':     return <RegisterScreen
                                    onComplete={completeRegistration}
                                    onDone={() => navigate('upload')}
                                  />;
      case 'earnings':     return <EarningsScreen onBack={()=>navigate('profile')} />;
      case 'schedule':     return <ScheduleScreen    onBack={()=>navigate('local')} constituency={userConstituency||'Kurnool'} />;
      case 'panchangam':   return <PanchangamScreen   onBack={()=>navigate('local')} />;
      case 'election':     return <ElectionScreen     onBack={()=>navigate('local')} constituency={userConstituency||'Kurnool'} />;
      case 'leaderboard':  return <LeaderboardScreen  onBack={()=>navigate('local')} constituency={userConstituency||'Kurnool'} />;
      case 'progress':     return <ProgressScreen     onBack={()=>navigate('local')} constituency={userConstituency||'Kurnool'} />;
      case 'emergency':    return <EmergencyScreen    onBack={()=>navigate('local')} constituency={userConstituency||'Kurnool'} />;
      case 'qrcode':       return <QRCodeScreen       onBack={()=>navigate('home')}  constituency={userConstituency||'Kurnool'} />;
      case 'grievance':     return <GrievanceScreen onBack={()=>navigate('home')} />;
      case 'channelpartner': return <ChannelPartnerScreen onBack={()=>navigate('home')} />;
      case 'about':         return <AboutScreen      onBack={()=>navigate('home')} onNavigate={navigate} />;
      case 'privacy':       return <PrivacyScreen    onBack={()=>navigate('home')} onNavigate={navigate} />;
      case 'terms':         return <TermsScreen      onBack={()=>navigate('home')} onNavigate={navigate} />;
      case 'copyright':     return <CopyrightScreen  onBack={()=>navigate('home')} onNavigate={navigate} />;
      case 'contact':       return <ContactScreen    onBack={()=>navigate('home')} />;
      case 'advertise':     return <AdvertiseScreen  onBack={()=>navigate('home')} />;
      // ── Compliance forms (per IT Rules 2021 / App Store policies) ──
      case 'complaint':     return <ComplaintForm    onBack={()=>navigate('home')} />;
      case 'takedown':      return <TakedownForm     onBack={()=>navigate('home')} />;
      case 'counternotification': return <CounterNotificationForm onBack={()=>navigate('home')} />;
      case 'deleteaccount': return <AccountDeletionScreen onBack={()=>navigate('profile')} />;
      case 'reportcontent': return <ReportContentForm onBack={()=>navigate('home')} contentId={selectedNews?.id} contentUrl={selectedNews?.link} />;
      case 'classifieds':  return <ClassifiedsScreen onBack={()=>navigate('local')} constituency={userConstituency||'Kurnool'} initialCat={classifiedsCat} />;
      case 'newsupload':      return <NewsUploadFormScreen  onBack={()=>navigate('upload')} onNavigate={navigate} constituency={userConstituency||'Kurnool'} />;
      case 'birthdayform':    return <BirthdayRequestForm   onBack={()=>navigate('upload')} />;
      case 'anniversaryform': return <MarriageAnniversaryRequestForm onBack={()=>navigate('upload')} />;
      case 'whoiswhoform':    return <WhoIsWhoRequestForm     onBack={()=>navigate('upload')} />;
      case 'talentshowform':  return <TalentShowRequestForm   onBack={()=>navigate('upload')} />;
      case 'publicvoiceform': return <PublicVoiceRequestForm  onBack={()=>navigate('upload')} />;
      case 'eventsform':      return <EventsForm            onBack={()=>navigate('upload')} onNavigate={navigate} />;
      case 'upcomingmarriage':return <UpcomingMarriageForm  onBack={()=>navigate('upload')} />;
      case 'shopping':        return <ShoppingAdForm        onBack={()=>navigate('upload')} />;
      case 'jobs':            return <JobsForm              onBack={()=>navigate('upload')} />;
      case 'carsales':        return <CarSalesForm          onBack={()=>navigate('upload')} />;
      case 'rentalform':      return <RentalForm            onBack={()=>navigate('upload')} />;
      case 'vegpriceform': return <VegPriceForm onBack={()=>navigate('utility')} />;
      case 'guestintake':  return <GuestIntakeForm onBack={()=>navigate('whoswho')} />;
      case 'profile':    return <ProfileScreen onNavigate={navigate} />;
      case 'admindashboard': return <AdminDashboardScreen onBack={()=>navigate('profile')} />;
      case 'dashboard':  return <DashboardScreen onNavigate={navigate} onBack={()=>navigate('home')} />;
      case 'settings':   return <SettingsScreen onBack={() => navigate('profile')} onNavigate={navigate} />;
      default:           return <HomeScreen onNavigate={navigate} onOpenNews={setSelectedNews} onReport={(n) => setReportTarget(n)} onLogoTap={handleLogoTap} />;
    }
  }

  return (
    <>
      
      <div style={{width:'100%',height:'100%',background:T.bg}}>
        <div style={{
          width:  '100%',
          height: '100%',
          background: T.bg,
          borderRadius: 0,
          overflow:'hidden',
          position:'relative',
          boxShadow: 'none',
          transition:'background 0.3s ease',
        }}>
          {/* screen key forces remount + animation on every route change */}
          <div key={screen} className="screen-in" style={{width:'100%',height:'100%'}}>
            {renderScreen()}
          </div>
        </div>
      </div>
    </>
  );
}

// ── ROOT EXPORT — wraps App in ThemeProvider ──────────────────
function AppRoot() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default AppRoot;
