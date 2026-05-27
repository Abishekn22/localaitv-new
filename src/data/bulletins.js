import BulletinCard from './../components/Feed/BulletinCard.jsx';
import BulletinPlayerScreen from './../screens/BulletinPlayerScreen.jsx';

// Bulletin video data shown in the home rail + BulletinPlayerScreen.
// ── REAL BULLETINS from @localaitv YouTube channel ───────────
const BULLETINS = [
  // ── NEWS BULLETINS ──────────────────────────────────────────
  { id:1,  ytId:'vLQ32b7rMAs', orientation:'vertical', programType:'వార్తా బులెటిన్',
    titleTe:'కర్నూలు జిల్లా ప్రాథమిక వార్తలు — మే 10, 2026',
    titleEn:'Kurnool District Primary News Bulletin — May 10',
    broadcastTime:'11:00 AM', duration:'28:45', views:'12.4K',
    thumbnail:'https://img.youtube.com/vi/vLQ32b7rMAs/maxresdefault.jpg',
    uploadedAt:'2026-05-10T11:00:00', channel:'కర్నూలు TV',
    desc:'కర్నూలు జిల్లా నుండి ఈరోజు మే 10, 2026 ఉదయం 11 గంటల ప్రధాన వార్తా బులెటిన్. జిల్లాలో జరిగిన ముఖ్య పరిణామాలు, ప్రభుత్వ నిర్ణయాలు, అభివృద్ధి వార్తలు, రాజకీయ పరిణామాలు మరియు స్థానిక వార్తలు ఈ బులెటిన్‌లో చూడవచ్చు.' },

  { id:2,  ytId:'x96ywTWbe1A', orientation:'vertical', programType:'వార్తా బులెటిన్',
    titleTe:'ముఖ్య వార్తా బులెటిన్ — ఉదయం 10:45',
    titleEn:'Prime News Bulletin — 10:45 AM',
    broadcastTime:'10:45 AM', duration:'22:30', views:'8.2K',
    thumbnail:'https://img.youtube.com/vi/x96ywTWbe1A/maxresdefault.jpg',
    uploadedAt:'2026-05-10T10:45:00', channel:'కర్నూలు TV',
    desc:'AP ప్రభుత్వ తాజా నిర్ణయాలు, రాష్ట్ర రాజకీయ పరిణామాలు, వ్యవసాయ వార్తలు మరియు స్థానిక ముఖ్య వార్తలతో ఉదయం 10:45 వార్తా బులెటిన్.' },

  { id:3,  ytId:'m8fqXHzUIC4', orientation:'vertical', programType:'వార్తా బులెటిన్',
    titleTe:'ప్రభాత వార్తలు — 8:00 AM బులెటిన్',
    titleEn:'Morning News Bulletin — 8:00 AM',
    broadcastTime:'8:00 AM', duration:'18:15', views:'6.7K',
    thumbnail:'https://img.youtube.com/vi/m8fqXHzUIC4/maxresdefault.jpg',
    uploadedAt:'2026-05-10T08:00:00', channel:'కర్నూలు TV',
    desc:'ప్రభాత వార్తా బులెటిన్ 8:00 AM. నిన్న రాత్రి జరిగిన వార్తలు, నేటి ముఖ్య కార్యక్రమాలు, వాతావరణ అంచనా మరియు ట్రాఫిక్ అప్‌డేట్లు.' },

  { id:4,  ytId:'H4ZG2BWqFs0', orientation:'vertical', programType:'వార్తా బులెటిన్',
    titleTe:'రాత్రి వార్తలు — 9:00 PM బులెటిన్',
    titleEn:'Night News Bulletin — 9:00 PM',
    broadcastTime:'9:00 PM', duration:'32:10', views:'18.9K',
    thumbnail:'https://img.youtube.com/vi/H4ZG2BWqFs0/maxresdefault.jpg',
    uploadedAt:'2026-05-09T21:00:00', channel:'కర్నూలు TV',
    desc:'రాత్రి 9 గంటల సమగ్ర వార్తా బులెటిన్. రోజంతా జరిగిన ముఖ్య పరిణామాలు, రాజకీయ వార్తలు, జాతీయ వార్తలు మరియు క్రీడా వార్తలు.' },

  // ── SPECIAL STORIES ──────────────────────────────────────────
  { id:5,  ytId:'vLQ32b7rMAs', orientation:'vertical', programType:'ప్రత్యేక కథనం',
    titleTe:'అహోబిలం నారసింహ స్వామి ఆలయ ప్రత్యేక కథనం',
    titleEn:'Ahobilam Narasimha Temple Special Story',
    broadcastTime:'2:00 PM', duration:'45:20', views:'31.2K',
    thumbnail:'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=600&q=80',
    uploadedAt:'2026-05-10T14:00:00', channel:'కర్నూలు TV',
    desc:'కర్నూలు జిల్లాలోని అహోబిలం నారసింహ స్వామి ఆలయ చరిత్ర, ప్రాముఖ్యత మరియు భక్తుల అనుభవాలపై ప్రత్యేక కథనం. నవ నారసింహ క్షేత్రాలు, ప్రత్యేక పూజలు మరియు ఉత్సవాల గురించి వివరంగా తెలుసుకోండి.' },

  { id:6,  ytId:'x96ywTWbe1A', orientation:'vertical', programType:'ప్రత్యేక కథనం',
    titleTe:'కర్నూలు కోట — చారిత్రక ప్రత్యేక కథనం',
    titleEn:'Kurnool Fort — Historical Special Story',
    broadcastTime:'4:00 PM', duration:'38:45', views:'14.6K',
    thumbnail:'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=600&q=80',
    uploadedAt:'2026-05-09T16:00:00', channel:'కర్నూలు TV',
    desc:'కర్నూలు కోటను 17వ శతాబ్దంలో నిర్మించారు. ఈ కోట యొక్క చారిత్రక ప్రాముఖ్యత, నిర్మాణ శైలి మరియు పర్యాటక అభివృద్ధిపై ప్రత్యేక కథనం.' },

  { id:7,  ytId:'m8fqXHzUIC4', orientation:'vertical', programType:'ప్రత్యేక కథనం',
    titleTe:'కర్నూలు రైతుల వ్యవసాయ విజయగాథ',
    titleEn:'Kurnool Farmers Success Story',
    broadcastTime:'3:30 PM', duration:'41:00', views:'22.8K',
    thumbnail:'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=600&q=80',
    uploadedAt:'2026-05-08T15:30:00', channel:'కర్నూలు TV',
    desc:'కర్నూలు జిల్లాలో ఆధునిక వ్యవసాయ పద్ధతులు అవలంభించి విజయం సాధించిన రైతుల ప్రేరణాత్మక కథలు. డ్రిప్ ఇరిగేషన్, ఆర్గానిక్ ఫార్మింగ్, టెక్నాలజీ వినియోగం.' },

  // ── DEBATES ──────────────────────────────────────────────────
  { id:8,  ytId:'H4ZG2BWqFs0', orientation:'vertical', programType:'రాజకీయ చర్చ',
    titleTe:'జగన్ vs చంద్రబాబు — AP అభివృద్ధి చర్చ',
    titleEn:'Jagan vs Chandrababu — AP Development Debate',
    broadcastTime:'8:00 PM', duration:'52:30', views:'87.4K',
    thumbnail:'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=600&q=80',
    uploadedAt:'2026-05-10T20:00:00', channel:'కర్నూలు TV',
    desc:'AP మాజీ ముఖ్యమంత్రి వైఎస్ జగన్మోహన్ రెడ్డి మరియు ప్రస్తుత ముఖ్యమంత్రి చంద్రబాబు నాయుడు మధ్య AP అభివృద్ధిపై వాదోపవాదాలు. ఇరు పక్షాల నాయకులు తమ అభిప్రాయాలు వ్యక్తం చేసిన వేడి చర్చ.' },

  { id:9,  ytId:'vLQ32b7rMAs', orientation:'vertical', programType:'చర్చ కార్యక్రమం',
    titleTe:'AP విభజన తర్వాత అభివృద్ధి — నిపుణుల చర్చ',
    titleEn:'AP Post-Bifurcation Development — Expert Debate',
    broadcastTime:'7:30 PM', duration:'48:15', views:'34.1K',
    thumbnail:'https://images.unsplash.com/photo-1573496799652-408c2ac9fe98?w=600&q=80',
    uploadedAt:'2026-05-09T19:30:00', channel:'కర్నూలు TV',
    desc:'AP విభజన జరిగి 12 సంవత్సరాలు అయింది. ఈ కాలంలో రాష్ట్రం ఎంత అభివృద్ధి చెందింది? నిపుణులు, మాజీ ఐఏఎస్ అధికారులు మరియు ఆర్థిక నిపుణులతో లోతైన చర్చ.' },

  // ── HOT TOPICS ───────────────────────────────────────────────
  { id:10, ytId:'x96ywTWbe1A', orientation:'vertical', programType:'హాట్ టాపిక్',
    titleTe:'TVK విజయ్ రాజకీయ ప్రవేశం — తెలుగు రాష్ట్రాలపై ప్రభావం',
    titleEn:'TVK Vijay Political Entry — Impact on Telugu States',
    broadcastTime:'6:00 PM', duration:'35:40', views:'1.2L',
    thumbnail:'https://images.unsplash.com/photo-1573496799652-408c2ac9fe98?w=600&q=80',
    uploadedAt:'2026-05-10T18:00:00', channel:'కర్నూలు TV',
    desc:'తమిళ సినీ స్టార్ విజయ్ రాజకీయ ప్రవేశం తెలుగు రాష్ట్రాల రాజకీయాలపై ఎలాంటి ప్రభావం చూపుతుంది? AP, TG నాయకులు, రాజకీయ విశ్లేషకుల అభిప్రాయాలు.' },

  { id:11, ytId:'m8fqXHzUIC4', orientation:'vertical', programType:'హాట్ టాపిక్',
    titleTe:'పెట్రోలు ధరలు మళ్ళీ పెరిగాయి — ప్రభావం ఏమిటి?',
    titleEn:'Petrol Prices Rise Again — What is the Impact?',
    broadcastTime:'5:00 PM', duration:'28:20', views:'45.8K',
    thumbnail:'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600&q=80',
    uploadedAt:'2026-05-10T17:00:00', channel:'కర్నూలు TV',
    desc:'పెట్రోలు, డీజిల్ ధరలు మళ్ళీ పెరిగాయి. కర్నూలు జిల్లాలో ట్రాన్స్‌పోర్ట్ వ్యాపారులు, రైతులు, ఆటో డ్రైవర్లపై ప్రభావం ఏమిటి? నిపుణుల అభిప్రాయాలు.' },

  // ── DISTRICT PROGRAMS ────────────────────────────────────────
  { id:12, ytId:'H4ZG2BWqFs0', orientation:'vertical', programType:'జిల్లా వార్తలు',
    titleTe:'కర్నూలు జిల్లా సమగ్ర వార్తా నివేదిక',
    titleEn:'Kurnool District Comprehensive News Report',
    broadcastTime:'12:00 PM', duration:'42:00', views:'19.3K',
    thumbnail:'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=600&q=80',
    uploadedAt:'2026-05-10T12:00:00', channel:'కర్నూలు TV',
    desc:'కర్నూలు జిల్లా 9 నియోజకవర్గాల నుండి సమగ్ర వార్తా నివేదిక. అభివృద్ధి పనులు, ప్రజా సమస్యలు, ప్రభుత్వ పథకాల అమలు స్థితి.' },

  { id:13, ytId:'vLQ32b7rMAs', orientation:'vertical', programType:'జిల్లా వార్తలు',
    titleTe:'నందయాల్ జిల్లా ప్రత్యేక వార్తా కవరేజ్',
    titleEn:'Nandyal District Special News Coverage',
    broadcastTime:'1:00 PM', duration:'38:30', views:'11.7K',
    thumbnail:'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=600&q=80',
    uploadedAt:'2026-05-09T13:00:00', channel:'కర్నూలు TV',
    desc:'నందయాల్ జిల్లాలో కొత్తగా ప్రారంభమైన అభివృద్ధి ప్రాజెక్టులు, జల జీవన్ మిషన్ పనులు, రోడ్డు నిర్మాణాలు మరియు స్థానిక రాజకీయ పరిణామాలు.' },

  // ── INTERVIEWS ───────────────────────────────────────────────
  { id:14, ytId:'x96ywTWbe1A', orientation:'vertical', programType:'ఇంటర్వ్యూ',
    titleTe:'కర్నూలు MLA ప్రత్యేక ఇంటర్వ్యూ — అభివృద్ధి ప్రణాళికలు',
    titleEn:'Kurnool MLA Special Interview — Development Plans',
    broadcastTime:'10:00 AM', duration:'35:00', views:'28.4K',
    thumbnail:'https://images.unsplash.com/photo-1573496799652-408c2ac9fe98?w=600&q=80',
    uploadedAt:'2026-05-10T10:00:00', channel:'కర్నూలు TV',
    desc:'కర్నూలు నియోజకవర్గ MLA తో ప్రత్యేక ఇంటర్వ్యూ. జిల్లా అభివృద్ధి ప్రణాళికలు, కేంద్ర పథకాల అమలు, రాబోయే 5 సంవత్సరాల లక్ష్యాలు.' },

  { id:15, ytId:'m8fqXHzUIC4', orientation:'vertical', programType:'ఇంటర్వ్యూ',
    titleTe:'కర్నూలు కలెక్టర్ ఇంటర్వ్యూ — ప్రభుత్వ పథకాలు',
    titleEn:'Kurnool Collector Interview — Government Schemes',
    broadcastTime:'11:30 AM', duration:'30:15', views:'16.9K',
    thumbnail:'https://images.unsplash.com/photo-1573496799652-408c2ac9fe98?w=600&q=80',
    uploadedAt:'2026-05-09T11:30:00', channel:'కర్నూలు TV',
    desc:'కర్నూలు జిల్లా కలెక్టర్ తో ముఖాముఖి. PM ఆవాస్ యోజన, జల జీవన్ మిషన్, మహాత్మా గాంధీ నరేగా అమలు స్థితి, ప్రజా సమస్యల పరిష్కారం.' },

  // ── FEATURE PROGRAMS ─────────────────────────────────────────
  { id:16, ytId:'H4ZG2BWqFs0', orientation:'vertical', programType:'ఫీచర్ ప్రోగ్రాం',
    titleTe:'కర్నూలు వ్యాపార కేంద్రం — ఆర్థిక సమీక్ష',
    titleEn:'Kurnool Business Hub — Economic Review',
    broadcastTime:'3:00 PM', duration:'44:00', views:'9.8K',
    thumbnail:'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=600&q=80',
    uploadedAt:'2026-05-10T15:00:00', channel:'కర్నూలు TV',
    desc:'కర్నూలు జిల్లాలో వ్యాపార వాతావరణం, MSME పరిశ్రమలు, నూతన పెట్టుబడులు మరియు ఆర్థిక వృద్ధిపై సమగ్ర ఫీచర్ కార్యక్రమం.' },

  { id:17, ytId:'vLQ32b7rMAs', orientation:'vertical', programType:'ఫీచర్ ప్రోగ్రాం',
    titleTe:'కర్నూలు విద్యా వ్యవస్థ — మార్పులు మరియు సవాళ్లు',
    titleEn:'Kurnool Education System — Changes and Challenges',
    broadcastTime:'4:30 PM', duration:'39:20', views:'13.2K',
    thumbnail:'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=600&q=80',
    uploadedAt:'2026-05-08T16:30:00', channel:'కర్నూలు TV',
    desc:'కర్నూలు జిల్లాలో ప్రభుత్వ మరియు ప్రైవేట్ పాఠశాలలు, డిజిటల్ విద్య, మధ్యాహ్న భోజన పథకం మరియు విద్యా నాణ్యతపై ప్రత్యేక కార్యక్రమం.' },

  // ── POLITICAL DISCUSSIONS ────────────────────────────────────
  { id:18, ytId:'x96ywTWbe1A', orientation:'vertical', programType:'రాజకీయ విశ్లేషణ',
    titleTe:'AP 2024 ఎన్నికల విశ్లేషణ — ఫలితాల తర్వాత',
    titleEn:'AP 2024 Elections Analysis — Post Results',
    broadcastTime:'7:00 PM', duration:'55:10', views:'67.3K',
    thumbnail:'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=600&q=80',
    uploadedAt:'2026-05-07T19:00:00', channel:'కర్నూలు TV',
    desc:'AP 2024 అసెంబ్లీ ఎన్నికల ఫలితాల లోతైన విశ్లేషణ. కర్నూలు జిల్లా నియోజకవర్గాల్లో ఓటు వేటు పోకడలు, గెలిచిన, ఓడిన అభ్యర్థుల నేపధ్యాలు.' },

  { id:19, ytId:'m8fqXHzUIC4', orientation:'vertical', programType:'రాజకీయ విశ్లేషణ',
    titleTe:'TDP-BJP కూటమి — భవిష్యత్తు ఏమిటి?',
    titleEn:'TDP-BJP Alliance — What is the Future?',
    broadcastTime:'6:30 PM', duration:'42:45', views:'38.9K',
    thumbnail:'https://images.unsplash.com/photo-1573496799652-408c2ac9fe98?w=600&q=80',
    uploadedAt:'2026-05-09T18:30:00', channel:'కర్నూలు TV',
    desc:'TDP-BJP జాతీయ కూటమి మరియు AP రాజకీయాలు. కేంద్ర-రాష్ట్ర సంబంధాలు, AP ప్రత్యేక హోదా, నిధుల కేటాయింపులపై రాజకీయ విశ్లేషకుల అభిప్రాయాలు.' },

  { id:20, ytId:'H4ZG2BWqFs0', orientation:'vertical', programType:'వ్యవసాయ కార్యక్రమం',
    titleTe:'కర్నూలు రైతు కార్యక్రమం — ఖరీఫ్ సీజన్ 2026',
    titleEn:'Kurnool Farmer Program — Kharif Season 2026',
    broadcastTime:'7:00 AM', duration:'35:00', views:'24.6K',
    thumbnail:'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=600&q=80',
    uploadedAt:'2026-05-10T07:00:00', channel:'కర్నూలు TV',
    desc:'ఖరీఫ్ 2026 సీజన్‌కు రైతులు సిద్ధం కావాల్సిన పంటలు, విత్తన ఎంపిక, ఎరువుల వాడకం, వాతావరణ అంచనా మరియు మార్కెట్ ధరల గురించి నిపుణుల సలహాలు.' },
];

export { BULLETINS };
// Program type config
const PROGRAM_TYPES = [
  { id:'All',          label:'అన్నీ',        emoji:'📺', color:'#2B7FFF' },
  { id:'News Bulletin',label:'వార్తలు',       emoji:'📰', color:'#D0021B' },
  { id:'Special Story',label:'ప్రత్యేకం',     emoji:'🎬', color:'#7B1FA2' },
  { id:'Debate',       label:'చర్చ',          emoji:'🎙️', color:'#E65100' },
  { id:'Hot Topic',    label:'హాట్ టాపిక్',   emoji:'🔥', color:'#B71C1C' },
  { id:'District News',label:'జిల్లా వార్తలు', emoji:'🗺️', color:'#1B5E20' },
  { id:'Interview',    label:'ఇంటర్వ్యూ',     emoji:'🎤', color:'#0D47A1' },
  { id:'Feature',      label:'ఫీచర్',         emoji:'🌟', color:'#F57F17' },
];

// PROGRAM_COLORS was referenced by BulletinCard in the legacy file but never
// declared — original code crashed on access. Safety stub lets the fallback
// branch in BulletinCard fire instead.
export const PROGRAM_COLORS = {};
export { PROGRAM_TYPES };
export default PROGRAM_TYPES;
