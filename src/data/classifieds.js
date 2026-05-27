// Classifieds & related taxonomy (categories, badges, no-call list, sub-categories).
// ── CLASSIFIEDS DATA ──────────────────────────────────────────
const CLASSIFIEDS = [
  // ═══════════════════════════════════════════════════════════
  // HOUSE RENTS
  // ═══════════════════════════════════════════════════════════
  { id:1, orientation:'horizontal', cat:'House Rents', type:'rent', badge:'RENT ₹8,500/mo',
    title:'2BHK ఫ్లాట్ అద్దెకు — కర్నూలు మెయిన్ రోడ్',
    desc:'సెమీ ఫర్నిష్డ్, 2వ అంతస్థు, 24 గం. నీళ్లు, బస్ స్టాండ్ దగ్గర. కుటుంబాలకు ప్రాధాన్యత. 2 బాత్‌రూమ్‌లు, పార్కింగ్ సౌకర్యం. మెట్రో వాటర్ కనెక్షన్ ఉన్నది. నెలవారీ మెయింటెనెన్స్ ₹500 మాత్రమే.',
    images:['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&q=80','https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80','https://images.unsplash.com/photo-1484154218962-a197022b5858?w=600&q=80'],
    phone:'98765 43210', location:'కర్నూలు, మెయిన్ రోడ్', time:'8:30 AM', date:'మే 10, 2026',
    uploadedAt:'2026-05-10T08:30:00', uploaderName:'రాజు కె', uploaderPhoto:'https://i.pravatar.cc/80?img=1' },

  { id:2, orientation:'horizontal', cat:'House Rents', type:'sale', badge:'SALE ₹45 లక్షలు',
    title:'ఇండిపెండెంట్ హౌస్ — 200 చ.గజాలు, నందయాల్ రోడ్',
    desc:'3 BHK, మంచి లొకేషన్, పాఠశాల దగ్గర. వెంటనే అమ్మకం. గ్రౌండ్ + 1st ఫ్లోర్. బోరుబావి, UDS పత్రాలు రెడీ. చర్చ చేయవచ్చు. సీరియస్ కొనుగోలుదారులు మాత్రమే సంప్రదించండి.',
    images:['https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=600&q=80','https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&q=80','https://images.unsplash.com/photo-1494526585095-c41746248156?w=600&q=80'],
    phone:'87654 32109', location:'కర్నూలు, నందయాల్ రోడ్', time:'9:15 AM', date:'మే 8, 2026',
    uploadedAt:'2026-05-08T09:15:00', uploaderName:'సురేష్ కుమార్', uploaderPhoto:'https://i.pravatar.cc/80?img=3' },

  { id:3, orientation:'horizontal', cat:'House Rents', type:'rent', badge:'SHOP RENT ₹12,000',
    title:'కమర్షియల్ షాప్ అద్దెకు — మెయిన్ రోడ్, గ్రౌండ్ ఫ్లోర్',
    desc:'500 చ.అ., మెయిన్ రోడ్ ఫ్రంటేజ్, ఏ వ్యాపారానికైనా అనువైనది. విద్యుత్ కనెక్షన్, వాటర్ సౌకర్యం. 3 నెలల అడ్వాన్స్. పార్కింగ్ స్పేస్ అందుబాటులో ఉన్నది.',
    images:['https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&q=80','https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&q=80'],
    phone:'76543 21098', location:'నందయాల్, వార్డ్ 5', time:'10:00 AM', date:'మే 9, 2026',
    uploadedAt:'2026-05-09T10:00:00', uploaderName:'ప్రసాద్ రెడ్డి', uploaderPhoto:'https://i.pravatar.cc/80?img=5' },

  // ═══════════════════════════════════════════════════════════
  // CAR SALES
  // ═══════════════════════════════════════════════════════════
  { id:4, orientation:'horizontal', cat:'Car Sales', type:'vehicle', badge:'₹5.2 లక్షలు',
    title:'Maruti Swift Dzire 2020 — Petrol, First Owner',
    desc:'48,000 కి.మీ. మాత్రమే. ఫస్ట్ ఓనర్. ఇన్సూరెన్స్ డిసెంబర్ వరకు వాలిడ్. AC పర్ఫెక్ట్ కూలింగ్. సర్వీస్ హిస్టరీ మారుతి డీలర్ వద్ద. కొత్త టైర్లు. ఏ రిపేరు లేదు. పోలీషింగ్ చేశారు.',
    images:['https://images.unsplash.com/photo-1550355291-bbee04a92027?w=600&q=80','https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=600&q=80','https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=600&q=80'],
    phone:'98760 12345', location:'కర్నూలు', time:'7:45 AM', date:'మే 10, 2026',
    uploadedAt:'2026-05-10T07:45:00', uploaderName:'వెంకటేశ్', uploaderPhoto:'https://i.pravatar.cc/80?img=7' },

  { id:5, orientation:'horizontal', cat:'Car Sales', type:'vehicle', badge:'₹62,000',
    title:'Honda Activa 6G 2022 — Silver, Single Owner',
    desc:'12,000 కి.మీ. మాత్రమే. సిల్వర్ కలర్. అన్ని పేపర్లు క్లియర్. నూతన టైర్లు. ఒకే ఓనర్. గ్యారేజ్ పార్కింగ్. ఏ స్క్రాచ్ లేదు. ఇన్సూరెన్స్ 2027 వరకు. ఒరిజినల్ రశీదులు సహా.',
    images:['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80','https://images.unsplash.com/photo-1449426468159-d96dbf08f19f?w=600&q=80'],
    phone:'87651 23456', location:'కర్నూలు', time:'11:20 AM', date:'మే 9, 2026',
    uploadedAt:'2026-05-09T11:20:00', uploaderName:'మహేష్', uploaderPhoto:'https://i.pravatar.cc/80?img=11' },

  { id:6, orientation:'horizontal', cat:'Car Sales', type:'vehicle', badge:'₹12.5 లక్షలు',
    title:'Tata Nexon EV Max 2023 — 437km Range, Top Variant',
    desc:'28,000 కి.మీ. ఎలక్ట్రిక్. టాప్ వేరియంట్. ఫాస్ట్ చార్జర్ సహా. వారంటీ జనవరి 2027 వరకు. 6 ఎయిర్‌బ్యాగ్‌లు. సన్‌రూఫ్. కనెక్టెడ్ కార్ టెక్నాలజీ. సింగిల్ ఓనర్.',
    images:['https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=600&q=80','https://images.unsplash.com/photo-1593941707874-ef25b8b4a92b?w=600&q=80','https://images.unsplash.com/photo-1617469767053-d3b523a0b982?w=600&q=80'],
    phone:'76542 34567', location:'కర్నూలు', time:'2:00 PM', date:'మే 7, 2026',
    uploadedAt:'2026-05-07T14:00:00', uploaderName:'రాహుల్ శర్మ', uploaderPhoto:'https://i.pravatar.cc/80?img=13' },

  // ═══════════════════════════════════════════════════════════
  // JOBS
  // ═══════════════════════════════════════════════════════════
  { id:7, orientation:'horizontal', cat:'Jobs', type:'job', badge:'URGENT HIRING',
    title:'Staff Nurses కావాలి — నారాయణ హాస్పిటల్ కర్నూలు',
    desc:'GNM/ANM నర్సులు, B.Sc నర్సింగ్ అర్హులు. ICU, వార్డ్, OT అనుభవం. వేతనం ₹18,000-25,000. వసతి, ఆహారం, యూనిఫాం సంస్థ ఇస్తుంది. PF, ESI సౌకర్యాలు. ఫ్రెషర్స్ కూడా వర్తిస్తుంది.',
    images:['https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=600&q=80','https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&q=80'],
    phone:'87653 67890', location:'కర్నూలు', time:'9:00 AM', date:'మే 10, 2026',
    uploadedAt:'2026-05-10T09:00:00', uploaderName:'HR నారాయణ హాస్పిటల్', uploaderPhoto:'https://i.pravatar.cc/80?img=15' },

  { id:8, orientation:'horizontal', cat:'Jobs', type:'job', badge:'HIRING',
    title:'కంప్యూటర్ ఆపరేటర్ కావాలి — శ్రీ రాజు ట్రావెల్స్',
    desc:'MS Office, Tally నైపుణ్యం ఉన్న వారు. 12వ తరగతి లేదా డిగ్రీ. జీతం ₹12,000-15,000. ఉదయం 9 - సాయంత్రం 6. ఆదివారం సెలవు. ప్రభుత్వ సెలవు దినాలు సెలవు. వెంటనే జాయిన్ అవ్వవచ్చు.',
    images:['https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&q=80','https://images.unsplash.com/photo-1542744095-fcf48d80b0fd?w=600&q=80'],
    phone:'98762 56789', location:'కర్నూలు', time:'10:30 AM', date:'మే 10, 2026',
    uploadedAt:'2026-05-10T10:30:00', uploaderName:'శ్రీ రాజు ట్రావెల్స్', uploaderPhoto:'https://i.pravatar.cc/80?img=17' },

  { id:9, orientation:'horizontal', cat:'Jobs', type:'job', badge:'PART TIME',
    title:'Swiggy/Zomato డెలివరీ పార్టనర్ కావాలి',
    desc:'బైక్ ఉన్న వారు. స్మార్ట్‌ఫోన్ ఉండాలి. వయసు 18-35. రోజు సంపాదన ₹600-1000+. ఫ్లెక్సిబుల్ టైమింగ్స్. పెట్రోల్ అలవెన్స్ అదనంగా. వారానికి పేమెంట్. ఇన్సూరెన్స్ కవరేజ్. వెంటనే ప్రారంభించవచ్చు.',
    images:['https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=600&q=80'],
    phone:'76541 78901', location:'కర్నూలు', time:'11:00 AM', date:'మే 10, 2026',
    uploadedAt:'2026-05-10T11:00:00', uploaderName:'Swiggy కర్నూలు', uploaderPhoto:'https://i.pravatar.cc/80?img=19' },

  // ═══════════════════════════════════════════════════════════
  // BIRTHDAYS
  // ═══════════════════════════════════════════════════════════
  { id:10, orientation:'horizontal', cat:'Birthdays', type:'birthday', badge:'🎂 పుట్టినరోజు',
    title:'శ్రీమతి లక్ష్మీదేవి గారికి 60వ పుట్టినరోజు శుభాకాంక్షలు!',
    desc:'మా అమ్మ శ్రీమతి వెంకట లక్ష్మీదేవి గారికి 60వ పుట్టినరోజు శుభాకాంక్షలు! ఆమె ప్రేమ, ఆప్యాయత, త్యాగాలు మాకు నిత్యం స్ఫూర్తి. మీకు దీర్ఘాయుష్షు, ఆరోగ్యం, ఆనందం కలగాలని మా హృదయపూర్వక ప్రార్థనలు. 💐\n\n— మీ పిల్లలు, మనవళ్లు, మనవరాళ్లు',
    images:['https://images.unsplash.com/photo-1558636508-e0969431e745?w=600&q=80','https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=600&q=80'],
    phone:null, location:'కర్నూలు', time:'8:00 AM', date:'మే 10, 2026',
    uploadedAt:'2026-05-10T08:00:00', uploaderName:'కుమారులు & కుమార్తెలు', uploaderPhoto:'https://i.pravatar.cc/80?img=21' },

  { id:11, orientation:'horizontal', cat:'Birthdays', type:'birthday', badge:'🎂 జన్మదినం',
    title:'శ్రీ రామకృష్ణారావు గారి 75వ జన్మదినోత్సవం',
    desc:'75 సంవత్సరాల పరిపూర్ణమైన జీవితం. ఒక ఉపాధ్యాయుడిగా వేలాది విద్యార్థులను తీర్చిదిద్దిన మహానుభావుడు. మీ ఆశీర్వాదాలే మా బలం. పుట్టినరోజు శుభాకాంక్షలు నాన్నగారూ!\n\n— మీ కుమారులు రాజు, శ్రీను, కుమార్తె లత',
    images:['https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600&q=80','https://images.unsplash.com/photo-1513151233558-d860c5398176?w=600&q=80'],
    phone:null, location:'నందయాల్', time:'7:30 AM', date:'మే 10, 2026',
    uploadedAt:'2026-05-10T07:30:00', uploaderName:'పిల్లలు & మనవళ్లు', uploaderPhoto:'https://i.pravatar.cc/80?img=23' },

  { id:12, orientation:'horizontal', cat:'Birthdays', type:'birthday', badge:'🎂 Happy Birthday',
    title:'కుమారుడు శ్రేయాంశ్ కు 7వ పుట్టినరోజు శుభాకాంక్షలు',
    desc:'మా ముద్దుల బాబు శ్రేయాంశ్‌కు 7వ పుట్టినరోజు శుభాకాంక్షలు! నీ నవ్వు మా ఇంటికి వెలుతురు. నీ భవిష్యత్తు బంగారు బాట కావాలని ఆశిస్తున్నాం. Happy Birthday బేటా! 🎉🎁\n\n— అమ్మ, నాన్న',
    images:['https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=600&q=80','https://images.unsplash.com/photo-1558636508-e0969431e745?w=600&q=80'],
    phone:null, location:'కర్నూలు', time:'9:00 AM', date:'మే 10, 2026',
    uploadedAt:'2026-05-10T09:00:00', uploaderName:'ప్రేమతో తల్లిదండ్రులు', uploaderPhoto:'https://i.pravatar.cc/80?img=25' },

  // ═══════════════════════════════════════════════════════════
  // MARRIAGES
  // ═══════════════════════════════════════════════════════════
  { id:13, orientation:'horizontal', cat:'Marriages', type:'marriage', badge:'💒 వివాహ ఆహ్వానం',
    title:'వివాహ శుభలేఖ — శ్రీ రాజేశ్వర్ & కుమారి సుమిత్ర',
    desc:'తమ ప్రియపుత్రుడు శ్రీ రాజేశ్వర్ కు తమ ప్రియ పుత్రిక కుమారి సుమిత్రతో మే 25, 2026న వివాహం జరుగుతోంది.\n\n📅 తేదీ: మే 25, 2026 ఆదివారం\n⏰ సమయం: సాయంత్రం 7:00 గంటలు\n📍 వేదిక: శ్రీ లక్ష్మీ కల్యాణ మండపం, కర్నూలు\n\nమీ సాదర ఆహ్వానం.',
    images:['https://images.unsplash.com/photo-1519741497674-611481863552?w=600&q=80','https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=600&q=80','https://images.unsplash.com/photo-1606800052052-a08af7148866?w=600&q=80'],
    phone:null, location:'కర్నూలు', time:'10:00 AM', date:'మే 8, 2026',
    uploadedAt:'2026-05-08T10:00:00', uploaderName:'వివాహ కుటుంబాలు', uploaderPhoto:'https://i.pravatar.cc/80?img=27' },

  // ═══════════════════════════════════════════════════════════
  // MARRIAGE DAYS (Anniversaries)
  // ═══════════════════════════════════════════════════════════
  { id:14, orientation:'horizontal', cat:'Marriage Anniversary', type:'anniversary', badge:'💍 రజత జయంతి',
    title:'శ్రీ & శ్రీమతి వెంకటేశ్వర రావు — 25వ వివాహ వార్షికోత్సవం',
    desc:'25 సంవత్సరాల అన్యోన్య దాంపత్య జీవితం. ప్రేమ, నమ్మకం, త్యాగం — ఈ మూడింటితో ఈ అందమైన ప్రయాణం కొనసాగింది. ఈ రజత జయంతి సందర్భంగా మీకు అభినందనలు!\n\n— పిల్లలు, బంధువులు, మిత్రులు',
    images:['https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=600&q=80','https://images.unsplash.com/photo-1606800052052-a08af7148866?w=600&q=80'],
    phone:null, location:'కర్నూలు', time:'8:30 AM', date:'మే 10, 2026',
    uploadedAt:'2026-05-10T08:30:00', uploaderName:'ప్రేమతో పిల్లలు', uploaderPhoto:'https://i.pravatar.cc/80?img=29' },

  { id:'14a', orientation:'horizontal', cat:'Marriage Anniversary', type:'anniversary', badge:'💍 1వ వార్షికోత్సవం',
    title:'శ్రీ రఘు & శ్రీమతి దీప్తి — మొదటి వివాహ వార్షికోత్సవం',
    desc:'మా బాబాయి అత్తలకు మొదటి వివాహ వార్షికోత్సవం శుభాకాంక్షలు! మీ ప్రేమ ఎప్పటికీ ఇలాగే ఉండాలి. — మేనల్లుళ్లు & మేనకోడళ్లు',
    images:['https://images.unsplash.com/photo-1519741497674-611481863552?w=600&q=80','https://images.unsplash.com/photo-1529636798458-92182e662485?w=600&q=80'],
    phone:null, location:'కర్నూలు', time:'10:00 AM', date:'మే 18, 2026',
    uploadedAt:'2026-05-18T10:00:00', uploaderName:'మేనల్లుళ్లు & మేనకోడళ్లు', uploaderPhoto:'https://i.pravatar.cc/80?img=47' },

  { id:'14b', orientation:'horizontal', cat:'Marriage Anniversary', type:'anniversary', badge:'💍 50వ సువర్ణ జయంతి',
    title:'శ్రీ & శ్రీమతి నారాయణ రెడ్డి — 50వ వివాహ వార్షికోత్సవం',
    desc:'మా తాతయ్య నాయనమ్మకు 50 సంవత్సరాల వివాహ వార్షికోత్సవం — సువర్ణ జయంతి శుభాకాంక్షలు! మా కుటుంబంలో మీరే మా శక్తి. — మనవళ్లు, మనవరాళ్లు',
    images:['https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=600&q=80'],
    phone:null, location:'కర్నూలు', time:'9:00 AM', date:'మే 20, 2026',
    uploadedAt:'2026-05-20T09:00:00', uploaderName:'మనవళ్లు & మనవరాళ్లు', uploaderPhoto:'https://i.pravatar.cc/80?img=58' },

  // ═══════════════════════════════════════════════════════════
  // WHO IS WHO (Prominent People of Kurnool)
  // ═══════════════════════════════════════════════════════════
  { id:'ww1', orientation:'horizontal', cat:'Who is Who', type:'whoiswho', badge:'🌟 MLA',
    title:'శ్రీ టి. జి. భరత్ గారు — కర్నూలు MLA',
    desc:'కర్నూలు నియోజకవర్గ శాసనసభ్యులు. స్థానిక అభివృద్ధి, రహదారులు, విద్య, ఆరోగ్య రంగాలలో అనేక కార్యక్రమాలు. ప్రజల సేవలో నిరంతరం.\n\n📍 కర్నూలు · 📞 సంప్రదించండి',
    images:['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80'],
    phone:'9491234567', location:'కర్నూలు', time:'10:00 AM', date:'మే 22, 2026',
    uploadedAt:'2026-05-22T10:00:00', uploaderName:'కర్నూలు పౌర సంఘం', uploaderPhoto:'https://i.pravatar.cc/80?img=12' },

  { id:'ww2', orientation:'horizontal', cat:'Who is Who', type:'whoiswho', badge:'🌟 జిల్లా కలెక్టర్',
    title:'శ్రీమతి P. రంజిత్ బాషా IAS — కర్నూలు జిల్లా కలెక్టర్',
    desc:'కర్నూలు జిల్లా అధికారిక ముఖ్యకార్యనిర్వాహకుడు. స్వచ్ఛ భారత్, మిషన్ భగీరథ, విద్యాశాఖ సంస్కరణలు. ప్రజలకు అందుబాటులో ఉండే అధికారి.\n\n📍 కలెక్టరేట్, కర్నూలు',
    images:['https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=600&q=80'],
    phone:'9849876543', location:'కలెక్టరేట్, కర్నూలు', time:'9:30 AM', date:'మే 21, 2026',
    uploadedAt:'2026-05-21T09:30:00', uploaderName:'జిల్లా పౌర సంఘం', uploaderPhoto:'https://i.pravatar.cc/80?img=44' },

  { id:'ww3', orientation:'horizontal', cat:'Who is Who', type:'whoiswho', badge:'🌟 ప్రముఖ వైద్యులు',
    title:'డాక్టర్ K. వెంకట రామయ్య — సీనియర్ కార్డియాలజిస్ట్',
    desc:'30+ సంవత్సరాల అనుభవం. కర్నూలు ప్రాంతీయ ఆసుపత్రిలో సీనియర్ హృద్రోగ నిపుణులు. వేలాది మంది రోగులకు ఉచిత చికిత్స అందించారు.\n\n📍 ప్రభుత్వ ఆసుపత్రి, కర్నూలు',
    images:['https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=600&q=80'],
    phone:'9866543210', location:'ప్రభుత్వ ఆసుపత్రి, కర్నూలు', time:'8:00 AM', date:'మే 20, 2026',
    uploadedAt:'2026-05-20T08:00:00', uploaderName:'ఆరోగ్య సేవా సంఘం', uploaderPhoto:'https://i.pravatar.cc/80?img=33' },

  // ═══════════════════════════════════════════════════════════
  // TALENT SHOW (Local Public Talent)
  // ═══════════════════════════════════════════════════════════
  { id:'ts1', orientation:'horizontal', cat:'Talent Show', type:'talentshow', badge:'🎤 సంగీతం · Singing',
    title:'సాయి కిషోర్ — మనస్సుని కదిలించే తెలుగు పాట',
    desc:'శ్రీ సాయి కిషోర్ గారి గాత్రంలో సోలో సాంగ్ పెర్ఫార్మెన్స్. కర్నూలు మ్యూజిక్ ఫెస్టివల్ — 2026. ఎంతో ప్రేక్షకులు మెచ్చుకున్నారు.\n\n📍 కర్నూలు · 🎤 Singing Competition',
    images:['https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&q=80'],
    phone:null, location:'కర్నూలు', time:'7:30 PM', date:'మే 22, 2026',
    uploadedAt:'2026-05-22T19:30:00', uploaderName:'సాయి కిషోర్', uploaderPhoto:'https://i.pravatar.cc/80?img=11' },

  { id:'ts2', orientation:'horizontal', cat:'Talent Show', type:'talentshow', badge:'🎤 నృత్యం · Dance',
    title:'భరతనాట్యం — శ్రీకన్య · స్కూల్ ఫంక్షన్',
    desc:'జిల్లా పాఠశాల వార్షికోత్సవంలో శ్రీకన్య చిన్నారి భరతనాట్యం. చప్పట్లతో హాలు గూడుదిగిపోయింది! కర్నూలు యువతరానికి స్ఫూర్తి.\n\n📍 కర్నూలు · 🎤 School Function',
    images:['https://images.unsplash.com/photo-1547153760-18fc86324498?w=600&q=80'],
    phone:null, location:'కర్నూలు', time:'5:00 PM', date:'మే 21, 2026',
    uploadedAt:'2026-05-21T17:00:00', uploaderName:'శ్రీకన్య', uploaderPhoto:'https://i.pravatar.cc/80?img=24' },

  { id:'ts3', orientation:'horizontal', cat:'Talent Show', type:'talentshow', badge:'🎤 హాస్యం · Comedy',
    title:'రాజు అన్నయ్య — మిమిక్రీ & స్టాండ్‌అప్ కామెడీ',
    desc:'కర్నూలు లోకల్ స్టేజ్‌లో రాజు అన్నయ్య మిమిక్రీ షో. తెలుగు సినిమా హీరోల voice imitation. నవ్వులే నవ్వులు!\n\n📍 కర్నూలు టౌన్ హాల్ · 🎤 Public Show',
    images:['https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=600&q=80'],
    phone:null, location:'టౌన్ హాల్, కర్నూలు', time:'8:00 PM', date:'మే 20, 2026',
    uploadedAt:'2026-05-20T20:00:00', uploaderName:'రాజు అన్నయ్య', uploaderPhoto:'https://i.pravatar.cc/80?img=51' },

  // ═══════════════════════════════════════════════════════════
  // PUBLIC VOICE (Local Issues Reported by Citizens)
  // ═══════════════════════════════════════════════════════════
  // ── PUBLIC VOICE — VIDEO-ONLY UPLOADS ──
  // Per the upload form spec, Public Voice items are videos (uploaded by
  // citizens reporting civic issues). The ytId + orientation pair drives
  // the shorts-style viewer at route 'publicvoicefeed'. Mix of vertical
  // and horizontal test videos so both orientation paths can be reviewed.
  // TEMPORARY: ytId values reuse known-good IDs from SHORT_NEWS for
  // testing — replace with real uploaded video IDs once the upload
  // pipeline is wired up.
  { id:'pv1', orientation:'vertical',   ytId:'vLQ32b7rMAs', cat:'Public Voice', type:'publicvoice', badge:'📢 రోడ్డు సమస్య · Road',
    title:'గాంధీ నగర్‌లో రోడ్డు పగుళ్లు — వాహన చోదకులకు ఇబ్బంది',
    desc:'మా కాలనీలో ప్రధాన రోడ్డు పూర్తిగా దెబ్బతిన్నది. వర్షాల తర్వాత గుంతలు ఎక్కువయ్యాయి. స్కూటర్లు, బైక్‌లు నడపడం కష్టంగా ఉంది. దయచేసి సంబంధిత అధికారులు దృష్టి సారించాలి.\n\n📍 గాంధీ నగర్, కర్నూలు · 📞 9701234567',
    images:['https://images.unsplash.com/photo-1591622180929-4d4f5b3f8b25?w=600&q=80'],
    phone:'9701234567', location:'గాంధీ నగర్, కర్నూలు', time:'6:45 PM', date:'మే 22, 2026',
    uploadedAt:'2026-05-22T18:45:00', uploaderName:'రామకృష్ణ', uploaderPhoto:'https://i.pravatar.cc/80?img=14' },

  { id:'pv2', orientation:'horizontal', ytId:'ahb4disXmOU', cat:'Public Voice', type:'publicvoice', badge:'📢 డ్రైనేజ్ సమస్య · Drainage',
    title:'తొడుపునూరు రోడ్డులో డ్రైనేజ్ ఓవర్‌ఫ్లో — దుర్వాసన',
    desc:'మా ఏరియాలో డ్రైనేజ్ పైపులు పూర్తిగా బ్లాక్ అయ్యాయి. ప్రతిరోజు మురికి నీరు రోడ్డుపై ప్రవహిస్తోంది. దోమలు, దుర్వాసన పెరిగాయి. మున్సిపల్ అధికారులు తక్షణం స్పందించాలని విజ్ఞప్తి.\n\n📍 తొడుపునూరు రోడ్డు, కర్నూలు · 📞 9866554433',
    images:['https://images.unsplash.com/photo-1532375810709-75b1da00537c?w=600&q=80'],
    phone:'9866554433', location:'తొడుపునూరు రోడ్డు, కర్నూలు', time:'8:00 AM', date:'మే 22, 2026',
    uploadedAt:'2026-05-22T08:00:00', uploaderName:'శ్రీనివాస్', uploaderPhoto:'https://i.pravatar.cc/80?img=27' },

  { id:'pv3', orientation:'vertical',   ytId:'x96ywTWbe1A', cat:'Public Voice', type:'publicvoice', badge:'📢 కరెంటు సమస్య · Electricity',
    title:'భగత్ సింగ్ నగర్‌లో రోజూ 4 గంటలు పవర్ కట్',
    desc:'గత వారం రోజులుగా మా కాలనీలో ప్రతిరోజు మధ్యాహ్నం 12 నుండి 4 గంటల వరకు కరెంటు పోతోంది. పిల్లల పరీక్షలు దగ్గరికి వస్తున్నాయి. APEPDCL అధికారులు దయచేసి స్పందించాలి.\n\n📍 భగత్ సింగ్ నగర్, కర్నూలు · 📞 9491234567',
    images:['https://images.unsplash.com/photo-1473308822086-710304d7d30c?w=600&q=80'],
    phone:'9491234567', location:'భగత్ సింగ్ నగర్, కర్నూలు', time:'1:30 PM', date:'మే 21, 2026',
    uploadedAt:'2026-05-21T13:30:00', uploaderName:'వెంకటేశ్వరి', uploaderPhoto:'https://i.pravatar.cc/80?img=36' },

  { id:'pv4', orientation:'horizontal', ytId:'x-dpyE25wgM', cat:'Public Voice', type:'publicvoice', badge:'📢 నీటి సరఫరా · Water Supply',
    title:'వెంగమాంబ కాలనీలో 5 రోజులుగా నీళ్ల సరఫరా బంద్',
    desc:'మా కాలనీలో ఇంటి ట్యాంకులు ఖాళీ అయ్యాయి. ట్యాంకర్ నీళ్లు కొనుక్కోవలసి వస్తోంది. ముఖ్యంగా వృద్ధులు, పిల్లలు ఇబ్బందిపడుతున్నారు. మున్సిపల్ అధికారులు దయచేసి త్వరగా స్పందించాలి.\n\n📍 వెంగమాంబ కాలనీ, కర్నూలు · 📞 9700112233',
    images:['https://images.unsplash.com/photo-1581244277943-fe4a9c777189?w=600&q=80'],
    phone:'9700112233', location:'వెంగమాంబ కాలనీ, కర్నూలు', time:'7:15 AM', date:'మే 22, 2026',
    uploadedAt:'2026-05-22T07:15:00', uploaderName:'రామా దేవి', uploaderPhoto:'https://i.pravatar.cc/80?img=41' },

  { id:'pv5', orientation:'vertical',   ytId:'m8fqXHzUIC4', cat:'Public Voice', type:'publicvoice', badge:'📢 చెత్త సమస్య · Garbage',
    title:'ఆర్‌టీసీ బస్ స్టాండ్ వెనుక చెత్త కుప్పలు — దుర్వాసన',
    desc:'వారం రోజులుగా చెత్త కుప్పలు పేరుకుపోయాయి. మిగతా రోడ్లపై కూడా మాదిరిగానే మ్యానేజ్‌మెంట్ లేదు. వ్యాధులు వ్యాపించే అవకాశం ఉంది. స్వచ్ఛ భారత్ నినాదానికి అనుగుణంగా ఈ సమస్యను పరిష్కరించాలి.\n\n📍 RTC బస్ స్టాండ్, కర్నూలు · 📞 9885567788',
    images:['https://images.unsplash.com/photo-1604187351574-c75ca79f5807?w=600&q=80'],
    phone:'9885567788', location:'RTC బస్ స్టాండ్, కర్నూలు', time:'9:00 AM', date:'మే 22, 2026',
    uploadedAt:'2026-05-22T09:00:00', uploaderName:'కిషోర్ కుమార్', uploaderPhoto:'https://i.pravatar.cc/80?img=53' },

  { id:'pv6', orientation:'horizontal', ytId:'H_9fAXotXOo', cat:'Public Voice', type:'publicvoice', badge:'📢 దోమల సమస్య · Mosquitoes',
    title:'రామకృష్ణ నగర్‌లో డెంగ్యూ ప్రమాదం — దోమలు పెరిగాయి',
    desc:'మా ఏరియాలో డ్రైనేజ్ నీళ్లు నిల్వ ఉండడం వల్ల దోమలు ఎక్కువయ్యాయి. డెంగ్యూ, మలేరియా కేసులు పెరుగుతున్నాయి. ఫాగింగ్ నెలల తరబడి జరగట్లేదు. ఆరోగ్య శాఖ తక్షణం స్పందించాలని విజ్ఞప్తి.\n\n📍 రామకృష్ణ నగర్, కర్నూలు · 📞 9494005566',
    images:['https://images.unsplash.com/photo-1568215534-95b5d2af3df8?w=600&q=80'],
    phone:'9494005566', location:'రామకృష్ణ నగర్, కర్నూలు', time:'6:00 PM', date:'మే 21, 2026',
    uploadedAt:'2026-05-21T18:00:00', uploaderName:'మహేష్', uploaderPhoto:'https://i.pravatar.cc/80?img=8' },

  { id:'pv7', orientation:'vertical',   ytId:'H4ZG2BWqFs0', cat:'Public Voice', type:'publicvoice', badge:'📢 వీధి కుక్కలు · Stray Dogs',
    title:'జెల్ల వీధిలో వీధి కుక్కల గుంపు — పిల్లలకు ప్రమాదం',
    desc:'వీధి కుక్కల గుంపు తరచూ స్కూలుకు వెళ్లే పిల్లలను భయపెడుతోంది. ఇద్దరికి కాట్లు కూడా పడ్డాయి. మున్సిపల్ యానిమల్ బర్త్ కంట్రోల్ టీం రావాలని కోరుతున్నాం.\n\n📍 జెల్ల వీధి, కర్నూలు · 📞 9866101212',
    images:['https://images.unsplash.com/photo-1561037404-61cd46aa615b?w=600&q=80'],
    phone:'9866101212', location:'జెల్ల వీధి, కర్నూలు', time:'10:45 AM', date:'మే 22, 2026',
    uploadedAt:'2026-05-22T10:45:00', uploaderName:'సుధాకర్', uploaderPhoto:'https://i.pravatar.cc/80?img=19' },

  { id:'pv8', orientation:'horizontal', ytId:'9_I6Y38gSHc', cat:'Public Voice', type:'publicvoice', badge:'📢 వీధి దీపాలు · Streetlights',
    title:'NTR నగర్‌లో నెలగా వీధి దీపాలు బంద్ — రాత్రి చీకటి',
    desc:'మా కాలనీలో సెకండ్ క్రాస్ నుండి థర్డ్ క్రాస్ వరకు వీధి దీపాలన్నీ పనిచేయడం లేదు. రాత్రి పూట మహిళలు, విద్యార్థులు బయటకి వెళ్లాలంటే భయం. మున్సిపల్ వారు చాలా సార్లు రిపోర్ట్ చేశాం.\n\n📍 NTR నగర్, కర్నూలు · 📞 9701884455',
    images:['https://images.unsplash.com/photo-1444930694458-01babe71870c?w=600&q=80'],
    phone:'9701884455', location:'NTR నగర్, కర్నూలు', time:'9:20 PM', date:'మే 20, 2026',
    uploadedAt:'2026-05-20T21:20:00', uploaderName:'రాజేంద్ర', uploaderPhoto:'https://i.pravatar.cc/80?img=22' },

  // ═══════════════════════════════════════════════════════════
  // EVENTS
  // ═══════════════════════════════════════════════════════════
  { id:15, orientation:'horizontal', cat:'Events', type:'event', badge:'🎉 ఈవెంట్',
    title:'కర్నూలు ట్రేడ్ ఫేర్ 2026 — మే 15-20',
    desc:'కర్నూలు జిల్లా వ్యాపారుల సంఘం నిర్వహిస్తున్న వార్షిక ట్రేడ్ ఫేర్!\n\n🗓️ తేదీ: మే 15-20, 2026\n📍 వేదిక: కర్నూలు ఎగ్జిబిషన్ గ్రౌండ్స్\n⏰ సమయం: ఉదయం 10 - రాత్రి 9\n\n200+ స్టాల్స్ | ఉచిత ప్రవేశం | సాంస్కృతిక కార్యక్రమాలు | ఫుడ్ కోర్ట్ | లైవ్ మ్యూజిక్ ప్రతి రాత్రి.',
    images:['https://images.unsplash.com/photo-1501386761578-eaa54b8b8f04?w=600&q=80','https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600&q=80','https://images.unsplash.com/photo-1505236858219-8359eb29e329?w=600&q=80'],
    phone:null, location:'కర్నూలు ఎగ్జిబిషన్ గ్రౌండ్స్', time:'9:00 AM', date:'మే 10, 2026',
    uploadedAt:'2026-05-10T09:00:00', uploaderName:'కర్నూలు వ్యాపారుల సంఘం', uploaderPhoto:'https://i.pravatar.cc/80?img=31' },

  { id:16, orientation:'horizontal', cat:'Events', type:'event', badge:'🎭 సాంస్కృతిక కార్యక్రమం',
    title:'కర్నూలు సాహిత్య సభ — తెలుగు కవి సమ్మేళనం',
    desc:'ప్రముఖ తెలుగు కవులు, రచయితలు పాల్గొనే కవి సమ్మేళనం!\n\n📅 తేదీ: మే 18, 2026\n⏰ సమయం: సాయంత్రం 5:00 గంటలు\n📍 వేదిక: జిల్లా గ్రంథాలయం, కర్నూలు\n\nఉచిత ప్రవేశం. అందరికీ ఆహ్వానం.',
    images:['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80','https://images.unsplash.com/photo-1519671282429-b44660ead0a7?w=600&q=80'],
    phone:null, location:'కర్నూలు జిల్లా గ్రంథాలయం', time:'11:00 AM', date:'మే 9, 2026',
    uploadedAt:'2026-05-09T11:00:00', uploaderName:'కర్నూలు సాహిత్య సభ', uploaderPhoto:'https://i.pravatar.cc/80?img=33' },

  // ═══════════════════════════════════════════════════════════
  // SHOPPING (Local shop advertisements)
  // ═══════════════════════════════════════════════════════════
  { id:17, orientation:'horizontal', cat:'Shopping', type:'shop', badge:'🛍️ గ్రాండ్ ఆఫర్',
    title:'శ్రీ లక్ష్మి టెక్స్‌టైల్స్ — వేసవి సేల్ 50% వరకు తగ్గింపు',
    desc:'కొత్త వేసవి కలెక్షన్! చీరలు, డ్రెస్‌లు, పిల్లల దుస్తులపై 50% వరకు తగ్గింపు.\n\n📍 ప్రధాన బజారు రోడ్, కర్నూలు\n⏰ ఉదయం 10 - రాత్రి 9\n🎁 ₹2000పైన కొనుగోలుపై బహుమతి',
    images:['https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=600&q=80','https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&q=80'],
    phone:'9876543210', location:'ప్రధాన బజారు, కర్నూలు', time:'10:00 AM', date:'మే 11, 2026',
    uploadedAt:'2026-05-11T10:00:00', uploaderName:'శ్రీ లక్ష్మి టెక్స్‌టైల్స్', uploaderPhoto:'https://i.pravatar.cc/80?img=12' },

  { id:18, orientation:'horizontal', cat:'Shopping', type:'shop', badge:'📱 న్యూ స్టాక్',
    title:'రాజేష్ మొబైల్స్ — అన్ని బ్రాండ్ స్మార్ట్‌ఫోన్‌లు EMI పై',
    desc:'లేటెస్ట్ స్మార్ట్‌ఫోన్‌లు, యాక్సెసరీలు అన్నీ ఒకే చోట. జీరో డౌన్‌పేమెంట్ EMI సదుపాయం. ఎక్స్‌ఛేంజ్ ఆఫర్ అందుబాటులో.\n\n📍 గాంధీ నగర్, కర్నూలు',
    images:['https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&q=80','https://images.unsplash.com/photo-1556656793-08538906a9f8?w=600&q=80'],
    phone:'9701234567', location:'గాంధీ నగర్, కర్నూలు', time:'11:30 AM', date:'మే 11, 2026',
    uploadedAt:'2026-05-11T11:30:00', uploaderName:'రాజేష్ మొబైల్స్', uploaderPhoto:'https://i.pravatar.cc/80?img=15' },

  { id:19, orientation:'horizontal', cat:'Shopping', type:'shop', badge:'🛒 వారం స్పెషల్',
    title:'అన్నపూర్ణ సూపర్ మార్కెట్ — కిరాణా సరుకులపై వారం ఆఫర్లు',
    desc:'నిత్యావసర సరుకులు, కిరాణా, ఇంటి అవసరాలపై ప్రత్యేక ధరలు. హోమ్ డెలివరీ అందుబాటులో.\n\n📍 కర్నూలు సిటీ సెంటర్\n🚚 ₹500పైన ఉచిత డెలివరీ',
    images:['https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&q=80','https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=600&q=80'],
    phone:'9966554433', location:'సిటీ సెంటర్, కర్నూలు', time:'9:00 AM', date:'మే 10, 2026',
    uploadedAt:'2026-05-10T09:00:00', uploaderName:'అన్నపూర్ణ సూపర్ మార్కెట్', uploaderPhoto:'https://i.pravatar.cc/80?img=18' },
];

const CL_CATS = ['All','Birthdays','Marriage Anniversary','Marriages','Who is Who','Talent Show','Public Voice','Jobs','Car Sales','Events','House Rents','Shopping'];
const CL_CAT_EMOJI = { All:'📋', Birthdays:'🎂', 'Marriage Anniversary':'💍', Marriages:'💒', 'Who is Who':'🌟', 'Talent Show':'🎤', 'Public Voice':'📢', Jobs:'💼', 'Car Sales':'🚗', Events:'🎉', 'House Rents':'🏠', Shopping:'🛍️' };
const CL_CATS_TE   = { All:'అన్నీ', Birthdays:'పుట్టినరోజులు', 'Marriage Anniversary':'వివాహ వార్షికోత్సవం', Marriages:'వివాహాలు', 'Who is Who':'పట్టణ ప్రముఖులు', 'Talent Show':'టాలెంట్ షో', 'Public Voice':'పబ్లిక్ వాయిస్', Jobs:'ఉద్యోగాలు', 'Car Sales':'కార్లు', Events:'కార్యక్రమాలు', 'House Rents':'ఇళ్లు', Shopping:'షాపింగ్' };
// Thumbnail images per category — shown on cards
const CL_CAT_IMG = {
  Birthdays:      'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=400&q=75',
  'Marriage Anniversary':'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=400&q=75',
  Marriages:      'https://images.unsplash.com/photo-1606800052052-a08af7148866?w=400&q=75',
  'Who is Who':   'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=75',
  'Talent Show':  'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&q=75',
  'Public Voice': 'https://images.unsplash.com/photo-1591622180929-4d4f5b3f8b25?w=400&q=75',
  Jobs:           'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&q=75',
  'Car Sales':    'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=400&q=75',
  Events:         'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&q=75',
  'House Rents':  'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=400&q=75',
};
const CL_BADGE_COLOR = { RENT:'#2563eb', SALE:'#dc2626', PG:'#7c3aed', HIRING:'#059669', SERVICE:'#0891b2', TUTOR:'#7c3aed', LEASE:'#16a34a', AGRI:'#15803d', EVENT:'#d97706', WEDDING:'#be185d', ANNIV:'#ec4899', BDAY:'#9333ea', OPENING:'#ea580c', COURSE:'#0284c7', ADMISSIONS:'#7c3aed', PETS:'#0891b2' };

// Categories where Call Now button should NOT show (these are wishes/announcements, not commercial listings)
const NO_CALL_CATS = ['Wishes','Marriage'];



export { CLASSIFIEDS, CL_CATS, CL_CATS_TE, CL_CAT_EMOJI, CL_CAT_IMG, CL_BADGE_COLOR, NO_CALL_CATS };
const CL_SUBCATS = [
  { id:'All',          label:'అన్నీ',           emoji:'📋' },
  { id:'Birthdays',    label:'పుట్టినరోజులు',    emoji:'🎂' },
  { id:'Marriage Anniversary',label:'వివాహ వార్షికోత్సవం',     emoji:'💍' },
  { id:'Marriages',    label:'వివాహాలు',         emoji:'💒' },
  { id:'Who is Who',   label:'పట్టణ ప్రముఖులు',   emoji:'🌟' },
  { id:'Talent Show',  label:'టాలెంట్ షో',         emoji:'🎤' },
  { id:'Public Voice', label:'పబ్లిక్ వాయిస్',       emoji:'📢' },
  { id:'Jobs',         label:'ఉద్యోగాలు',        emoji:'💼' },
  { id:'Car Sales',    label:'వాహనాలు',          emoji:'🚗' },
  { id:'House Rents',  label:'ఇళ్లు / షాప్‌లు', emoji:'🏠' },
  { id:'Events',       label:'కార్యక్రమాలు',     emoji:'🎉' },
  { id:'Shopping',     label:'షాపింగ్',          emoji:'🛍️' },
];

// Categories that show Call + WhatsApp buttons
const CONTACT_CATS = ['Jobs', 'Car Sales', 'House Rents', 'Room Rents', 'Shopping'];


export { CL_SUBCATS, CONTACT_CATS };
