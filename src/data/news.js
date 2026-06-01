// News items are fetched live from the backend (incidents / bulletins feeds);
// there is no bundled mock content. NEWS_ITEMS is kept as an empty array so the
// few screens that still reference it render their empty states instead of
// fake articles.
const NEWS_ITEMS = [];

export { NEWS_ITEMS };


// Category config for news
const NEWS_CATS = [
  { id:'All',        label:'అన్నీ',       emoji:'📋', color:'#2B7FFF' },
  { id:'District',   label:'జిల్లా',      emoji:'📍', color:'#D0021B' },
  { id:'State',      label:'రాష్ట్రం',    emoji:'🏛️', color:'#7B1FA2' },
  { id:'National',   label:'జాతీయం',     emoji:'🇮🇳', color:'#1B5E20' },
  { id:'World',      label:'ప్రపంచం',     emoji:'🌍', color:'#0D47A1' },
  { id:'Sports',     label:'క్రీడలు',     emoji:'🏏', color:'#E65100' },
  { id:'Agriculture',label:'వ్యవసాయం',   emoji:'🌾', color:'#2E7D32' },
  { id:'Health',     label:'ఆరోగ్యం',    emoji:'🏥', color:'#00838F' },
  { id:'Business',   label:'వ్యాపారం',   emoji:'💼', color:'#4527A0' },
  { id:'Education',  label:'విద్య',       emoji:'🎓', color:'#AD1457' },
  { id:'Devotional', label:'భక్తి',       emoji:'🙏', color:'#F57F17' },
  { id:'Crime',      label:'నేరాలు',      emoji:'🚔', color:'#37474F' },
  { id:'Weather',    label:'వాతావరణం',   emoji:'🌦️', color:'#0277BD' },
];


export { NEWS_CATS };

// Reporter metadata previously came bundled with the mock NEWS_ITEMS. Real
// reporter info now arrives on the live feed items; kept empty (no consumers).
const REPORTERS = {};

const BULLETIN_SEGS = [
  { label:'LOCAL',    labelTe:'స్థానికం',  color:'#D0021B', mins:7  },
  { label:'DISTRICT', labelTe:'జిల్లా',    color:'#FF6B00', mins:2  },
  { label:'STATE',    labelTe:'రాష్ట్రం',  color:'#FFB800', mins:2  },
  { label:'NATIONAL', labelTe:'జాతీయం',   color:'#00C6B8', mins:2  },
  { label:'ADS',      labelTe:'ప్రకటనలు', color:'#7C3AED', mins:2  },
];

export { REPORTERS, BULLETIN_SEGS };
