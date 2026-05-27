import Logo from './../components/Logo.jsx';
// Smaller lookup maps + miscellaneous tabular data extracted from the legacy
// single-file App.jsx so it can be reused across components.

// Constituency → District (Telugu) for title display in news viewers.
const CONSTITUENCY_DISTRICT = {
  Kurnool:'కర్నూలు', Nandyal:'నంద్యాల', Adoni:'కర్నూలు', Alur:'కర్నూలు',
  Guntur:'గుంటూరు', Narasaraopet:'గుంటూరు', Ponnur:'గుంటూరు',
  Nellore:'నెల్లూరు', Kavali:'నెల్లూరు', Atmakur:'నెల్లూరు',
  Kakinada:'కాకినాడ', Pithapuram:'కాకినాడ', Prathipadu:'కాకినాడ',
  Tirupati:'తిరుపతి', Chittoor:'చిత్తూరు', Srikalahasti:'తిరుపతి',
  Khammam:'ఖమ్మం', Kothagudem:'ఖమ్మం', Palvancha:'ఖమ్మం',
  Karimnagar:'కరీంనగర్', Huzurabad:'కరీంనగర్', Sircilla:'కరీంనగర్',
  Warangal:'వరంగల్', Parkal:'వరంగల్', Bhupalpally:'వరంగల్',
  Nalgonda:'నల్గొండ', Miryalaguda:'నల్గొండ', Suryapet:'నల్గొండ',
};

export { CONSTITUENCY_DISTRICT };

// Wish & content taxonomy used by the upload screen.
const WISH_TYPES = [
  { id:'birthday', icon:'🎂', label:'Birthday Wish', desc:'30-sec video in bulletin AD slot' },
  { id:'marriage', icon:'💒', label:'Marriage Wish', desc:'Special 1-min bulletin segment' },
  { id:'shop', icon:'🏪', label:'Shop Opening', desc:'Grand opening announcement' },
  { id:'festival', icon:'🎉', label:'Festival Greet', desc:'Festival wishes with photo' },
  { id:'anniversary', icon:'💍', label:'Anniversary', desc:'Couple celebration video' },
  { id:'condolence', icon:'🕊️', label:'Condolence', desc:'Respectful same-day announcement' },
];

const CONTENT_TYPES = [
  { id:'News',        icon:'📰', color:'#D0021B', label:'News'              },
  { id:'Civic Issue', icon:'🏛️', color:'#7c3aed', label:'Civic Issue'       },
  { id:'Event',       icon:'🎉', color:'#d97706', label:'Event'             },
  { id:'Deals',       icon:'🏷️', color:'#059669', label:'Deals'             },
  { id:'Wish',        icon:'🎂', color:'#f59e0b', label:'Wish'              },
  { id:'Devotional',  icon:'🙏', color:'#dc2626', label:'Devotional'        },
  { id:'Job',         icon:'💼', color:'#2563eb', label:'Job Posting'       },
  { id:'Property',    icon:'🏠', color:'#7c3aed', label:'Property Ad'       },
  { id:'Vehicle',     icon:'🚗', color:'#0891b2', label:'Vehicle Sale'      },
  { id:'Business',    icon:'🏪', color:'#ea580c', label:'Business Promo'    },
  { id:'Obituary',    icon:'⚰️', color:'#374151', label:'Obituary'          },
  { id:'Education',   icon:'🎓', color:'#4f46e5', label:'Education'         },
  { id:'Political',   icon:'🗳️', color:'#be123c', label:'Political Ad'      },
  { id:'Missing',     icon:'🚨', color:'#dc2626', label:'Missing Person'    },
];

export { WISH_TYPES, CONTENT_TYPES };

// Telugu translations for common form labels.
const TE_LABEL_MAP = {
  'Name':'పేరు',
  'Full Name':'పూర్తి పేరు',
  'Date of Birth':'పుట్టిన తేదీ',
  'Phone':'ఫోన్',
  'Contact':'సంప్రదింపు',
  'Contact / Phone':'సంప్రదింపు / ఫోన్',
  'Contact / WhatsApp':'సంప్రదింపు / వాట్సాప్',
  'Location':'ప్రదేశం',
  'Location / Area':'ప్రదేశం / ఏరియా',
  'Location / Address':'ప్రదేశం / చిరునామా',
  'Description':'వివరణ',
  'Headline':'శీర్షిక',
  'Story Details':'వార్త వివరాలు',
  'Event Name':'కార్యక్రమ పేరు',
  'Event Type':'కార్యక్రమ రకం',
  'Event Date':'కార్యక్రమ తేదీ',
  'Event Time':'కార్యక్రమ సమయం',
  'Event Description':'కార్యక్రమ వివరణ',
  'Venue':'వేదిక',
  'Venue / Location':'వేదిక / ప్రదేశం',
  'Venue / Kalyana Mandapam':'వేదిక / కల్యాణ మండపం',
  'Organiser':'నిర్వాహకులు',
  'Organiser / Organisation':'నిర్వాహకులు / సంస్థ',
  'Marriage Date':'వివాహ తేదీ',
  'Marriage Time':'వివాహ సమయం',
  'Job Title':'ఉద్యోగం',
  'Job Title / Position':'ఉద్యోగం / హోదా',
  'Job Description':'ఉద్యోగ వివరణ',
  'Company':'కంపెనీ',
  'Company / Employer Name':'కంపెనీ / యజమాని',
  'Company / Shop / Establishment / Employer Name':'కంపెనీ / షాపు / సంస్థ / యజమాని పేరు',
  'Qualification (optional)':'విద్యార్హత (ఐచ్ఛికం)',
  'Experience (optional)':'అనుభవం (ఐచ్ఛికం)',
  'Salary (optional)':'జీతం (ఐచ్ఛికం)',
  'Number of Vacancies':'ఖాళీల సంఖ్య',
  'Email Address':'ఇమెయిల్',
  'Make / Brand':'తయారీ / బ్రాండ్',
  'Model':'మోడల్',
  'Year':'సంవత్సరం',
  'KM Driven':'కిలోమీటర్లు',
  'Color of the Vehicle':'వాహన రంగు',
  'Asking Price':'కోరిన ధర',
  'Additional Information':'అదనపు సమాచారం',
  'Additional Details':'అదనపు వివరాలు',
  'Property Type':'ఆస్తి రకం',
  'BHK / Size':'BHK / సైజు',
  'Available From':'అందుబాటులో',
  'Monthly Rent (₹)':'నెలవారీ అద్దె (₹)',
  'Deposit (₹)':'డిపాజిట్ (₹)',
  'Furnishing':'ఫర్నిచర్',
  'Shop Name':'షాపు పేరు',
  'Shop / Establishment Name':'షాపు / సంస్థ పేరు',
  'Advertisement Details':'ప్రకటన వివరాలు',
  'Birthday Photos':'పుట్టినరోజు ఫోటోలు',
  'Birthday Photos / Videos':'పుట్టినరోజు ఫోటోలు / వీడియోలు',
  'Wisher Photos':'శుభాకాంక్షలు అందించేవారి ఫోటోలు',
  'Photos / Videos / Logo':'ఫోటోలు / వీడియోలు / లోగో',
  'Vehicle Photos / Videos':'వాహన ఫోటోలు / వీడియోలు',
  'Property Photos / Videos':'ఆస్తి ఫోటోలు / వీడియోలు',
  'Event Poster / Photo / Video':'పోస్టర్ / ఫోటో / వీడియో',
  'Relation':'సంబంధం',
};

export { TE_LABEL_MAP };

// Vegetable list + AP/TG district lists used by the veg-price + admin forms.
const VEG_LIST = ['Tomato','Onion','Potato','Green Chilli','Brinjal','Carrot','Beans','Cabbage','Cauliflower','Bottle Gourd','Ridge Gourd','Ladies Finger','Coriander','Curry Leaves'];
const VEG_LIST_TE = ['టమాట','ఉల్లిపాయ','బంగాళాదుంప','పచ్చిమిర్చి','వంకాయ','క్యారెట్','బీన్స్','క్యాబేజీ','కాలీఫ్లవర్','సొరకాయ','బీర కాయ','బెండకాయ','కొత్తిమీర','కరివేపాకు'];
const AP_DISTRICTS = ['Anantapur','Chittoor','East Godavari','Guntur','Kadapa','Krishna','Kurnool','Nellore','Prakasam','Srikakulam','Visakhapatnam','Vizianagaram','West Godavari'];
const TG_DISTRICTS = ['Adilabad','Bhadradri Kothagudem','Hyderabad','Jagtial','Jangaon','Jayashankar','Jogulamba','Kamareddy','Karimnagar','Khammam','Komaram Bheem','Mahabubabad','Mahbubnagar','Mancherial','Medak','Medchal','Mulugu','Nagarkurnool','Nalgonda','Narayanpet','Nirmal','Nizamabad','Peddapalli','Rajanna Sircilla','Rangareddy','Sangareddy','Siddipet','Suryapet','Vikarabad','Wanaparthy','Warangal Rural','Warangal Urban','Yadadri'];

export { VEG_LIST, VEG_LIST_TE, AP_DISTRICTS, TG_DISTRICTS };
export default TE_LABEL_MAP;
