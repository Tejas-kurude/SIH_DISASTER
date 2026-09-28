export interface RegionalData {
  districtName: string
  stateName: string
  riskScore: number
  riskLevelEn: string
  riskLevelHi: string
  riskDescEn: string
  riskDescHi: string
  forecastMetrics: {
    damName: string
    damOutflow: string
    damUnit: string
    slopeFos: string
    rain72h: string
    reservoirLevel: string
    reservoirName: string
  }
  roads: {
    route: string
    status: 'CLOSED' | 'CAUTION'
    reasonEn: string
    reasonHi: string
    sev: 'critical' | 'caution'
  }[]
  incidents: {
    id: number
    typeEn: string
    typeHi: string
    icon: string
    descEn: string
    descHi: string
    dist: string
    votes: number
    verified: boolean
    time: string
  }[]
  alerts: {
    id: number
    type: 'flood' | 'landslide' | 'dam'
    sev: 'critical' | 'caution'
    titleEn: string
    titleHi: string
    authority: string
    time: string
    date: string
    talukas: string[]
    actionEn: string
    actionHi: string
  }[]
  offlinePacks: {
    district: string
    state: string
    size: string
    downloaded: boolean
    updated: string
  }[]
}

export function getRegionalDisasterData(lat: number, lon: number, cityName?: string): RegionalData {
  // 1. Pune / Pimpri-Chinchwad / Maval
  if ((lat >= 18.2 && lat <= 19.1 && lon >= 73.4 && lon <= 74.4) || (cityName && (cityName.includes('Pune') || cityName.includes('Pimpri') || cityName.includes('Chinchwad')))) {
    return {
      districtName: 'Pune / Pimpri-Chinchwad',
      stateName: 'Maharashtra',
      riskScore: 84,
      riskLevelEn: 'HIGH SURGE ALERT',
      riskLevelHi: 'उच्च बाढ़ जोखिम चेतावनी',
      riskDescEn: 'Pavana & Mula-Mutha riverbanks on red alert. Evacuate low-lying riverbed settlements.',
      riskDescHi: 'पवना एवं मुला-मुठा नदी तट पर रेड अलर्ट। निचले क्षेत्रों को तुरंत खाली करें।',
      forecastMetrics: {
        damName: 'PAVANA & KHADAKWASLA',
        damOutflow: '38,200',
        damUnit: 'cusecs +15% ↑',
        slopeFos: '0.89',
        rain72h: '174',
        reservoirLevel: '96.4%',
        reservoirName: 'PAVANA RESERVOIR',
      },
      roads: [
        { route: 'Old Mumbai–Pune Highway NH-48', status: 'CAUTION', reasonEn: 'Waterlogging near Dapodi & Dehu Rd', reasonHi: 'दापोडी और देहू रोड के पास जलभराव', sev: 'caution' },
        { route: 'Pune–Nashik Highway NH-60', status: 'CAUTION', reasonEn: 'Heavy rain & low visibility near Chakan', reasonHi: 'चाकण के पास भारी बारिश और कम दृश्यता', sev: 'caution' },
        { route: 'Bhor–Varandha Ghat Pass', status: 'CLOSED', reasonEn: 'Active landslide and boulder collapse', reasonHi: 'भूस्खलन और चट्टान गिरने से रास्ता बंद', sev: 'critical' },
        { route: 'Lonavala–Khandala Ghat SH', status: 'CAUTION', reasonEn: 'Fog & slippery mountain turns', reasonHi: 'कोहरा और फिसलन भरा घुमावदार मार्ग', sev: 'caution' },
      ],
      incidents: [
        { id: 1, typeEn: 'Flood Inundation', typeHi: 'जलभराव', icon: '🌊', descEn: 'Pavana river overflowing near Sangvi bridge', descHi: 'सांगवी पुल के पास पवना नदी का पानी सड़क पर आया', dist: '1.1 km', votes: 52, verified: true, time: '6m ago' },
        { id: 2, typeEn: 'Submerged Bridge', typeHi: 'डूबा हुआ पुल', icon: '🌉', descEn: 'Dapodi subway submerged — avoid vehicle entry', descHi: 'दापोडी सबवे पानी में डूबा — वाहन न ले जाएं', dist: '2.4 km', votes: 38, verified: true, time: '18m ago' },
        { id: 3, typeEn: 'Tree Fall', typeHi: 'पेड़ गिरा', icon: '🌳', descEn: 'Uprooted tree blocking Chinchwad station road', descHi: 'चिंचवड़ स्टेशन मार्ग पर विशाल पेड़ गिरा', dist: '3.1 km', votes: 19, verified: false, time: '34m ago' },
      ],
      alerts: [
        { id: 1, type: 'flood', sev: 'critical', titleEn: 'Red Alert: Pavana River Flood Inundation', titleHi: 'रेड अलर्ट: पवना नदी जलभराव चेतावनी', authority: 'PCMC Disaster Management Cell / IMD', time: '07:30 IST', date: '31 Aug 2026', talukas: ['Haveli', 'Pimpri', 'Maval', 'Mulshi'], actionEn: 'Mandatory evacuation for riverside slums in Dapodi & Sangvi. Move to High Ground Summit.', actionHi: 'दापोडी और सांगवी नदी किनारे की बस्तियों को खाली करें। ऊंचे पहाड़ी क्षेत्र में जाएं।' },
        { id: 2, type: 'dam', sev: 'critical', titleEn: 'Emergency Outflow: Khadakwasla & Pavana Dam', titleHi: 'आपातकालीन विसर्जन: खड़कवासला एवं पवना बांध', authority: 'Maharashtra WRD Pune Division', time: '06:45 IST', date: '31 Aug 2026', talukas: ['Pune City', 'Khed', 'Bhor'], actionEn: 'Discharge increased to 38,200 cusecs. All downstream riverbed zones must relocate.', actionHi: 'विसर्जन 38,200 क्यूसेक किया गया। निचले नदी क्षेत्रों को खाली करें।' },
        { id: 3, type: 'landslide', sev: 'caution', titleEn: 'Landslide Warning: Maval & Lonavala Ghats', titleHi: 'भूस्खलन चेतावनी: मावल एवं लोनावाला घाट', authority: 'SDMA Maharashtra', time: '05:30 IST', date: '31 Aug 2026', talukas: ['Maval', 'Mulshi', 'Velhe'], actionEn: 'Avoid night travel on ghat roads. Debris clearing underway on NH-48.', actionHi: 'घाट सड़कों पर रात में यात्रा न करें।' },
      ],
      offlinePacks: [
        { district: 'Pune District', state: 'Maharashtra', size: '9.2 MB', downloaded: true, updated: '2026-08-31' },
        { district: 'Pimpri-Chinchwad Metro', state: 'Maharashtra', size: '5.8 MB', downloaded: true, updated: '2026-08-31' },
        { district: 'Satara District', state: 'Maharashtra', size: '7.1 MB', downloaded: false, updated: '2026-08-30' },
        { district: 'Kolhapur District', state: 'Maharashtra', size: '8.4 MB', downloaded: false, updated: '2026-08-30' },
        { district: 'Mumbai Suburban', state: 'Maharashtra', size: '11.5 MB', downloaded: false, updated: '2026-08-30' },
        { district: 'Thane District', state: 'Maharashtra', size: '8.9 MB', downloaded: false, updated: '2026-08-29' },
        { district: 'Raigad (Ghats)', state: 'Maharashtra', size: '7.6 MB', downloaded: false, updated: '2026-08-29' },
        { district: 'Wayanad District', state: 'Kerala', size: '6.4 MB', downloaded: false, updated: '2026-08-29' },
        { district: 'Chamoli District', state: 'Uttarakhand', size: '7.9 MB', downloaded: false, updated: '2026-08-28' },
      ],
    }
  }

  // 2. Kolhapur / Western Maharashtra
  if (lat >= 16.0 && lat <= 17.5 && lon >= 73.8 && lon <= 74.9) {
    return {
      districtName: 'Kolhapur District',
      stateName: 'Maharashtra',
      riskScore: 88,
      riskLevelEn: 'CRITICAL SURGE',
      riskLevelHi: 'अत्यंत गंभीर स्थिति',
      riskDescEn: 'Panchaganga river water level exceeded 48.2 ft danger mark. Immediate evacuation ordered.',
      riskDescHi: 'पंचगंगा नदी का जलस्तर 48.2 फीट खतरे के निशान को पार कर गया है।',
      forecastMetrics: {
        damName: 'KOYNA & RADHANAGARI',
        damOutflow: '42,500',
        damUnit: 'cusecs +12% ↑',
        slopeFos: '0.87',
        rain72h: '187',
        reservoirLevel: '97.3%',
        reservoirName: 'RADHANAGARI DAM',
      },
      roads: [
        { route: 'Varandha Ghat NH-66', status: 'CLOSED', reasonEn: 'Landslide debris blocking all lanes', reasonHi: 'भूस्खलन से सड़क पूरी तरह बंद', sev: 'critical' },
        { route: 'Panhala–Kolhapur SH-115', status: 'CAUTION', reasonEn: 'Waterlogging 30 cm depth', reasonHi: '30 सेमी पानी भरा हुआ है', sev: 'caution' },
        { route: 'Radhanagari Dam Access Rd', status: 'CLOSED', reasonEn: 'Dam outflow flood inundation', reasonHi: 'बांध विसर्जन से मार्ग जलमग्न', sev: 'critical' },
        { route: 'Amba Ghat NH-204', status: 'CAUTION', reasonEn: 'Reduced visibility & wet surface', reasonHi: 'कम दृश्यता और फिसलन', sev: 'caution' },
      ],
      incidents: [
        { id: 1, typeEn: 'Flood', typeHi: 'बाढ़', icon: '🌊', descEn: 'Main road submerged near Shahu Textile Mill', descHi: 'शाहू मिल के पास मुख्य सड़क डूबी', dist: '1.2 km', votes: 47, verified: true, time: '8m ago' },
        { id: 2, typeEn: 'Landslide', typeHi: 'भूस्खलन', icon: '⛰️', descEn: 'Rockfall on NH-48 near Bhor Ghat exit', descHi: 'भोर घाट के पास चट्टान गिरी', dist: '4.5 km', votes: 31, verified: true, time: '23m ago' },
        { id: 3, typeEn: 'Bridge', typeHi: 'पुल', icon: '🌉', descEn: 'Rajaram Bridge partially submerged', descHi: 'राजाराम पुल आंशिक रूप से डूबा', dist: '2.8 km', votes: 24, verified: false, time: '41m ago' },
      ],
      alerts: [
        { id: 1, type: 'flood', sev: 'critical', titleEn: 'Red Alert: Extreme Flood — Kolhapur City', titleHi: 'रेड अलर्ट: भीषण बाढ़ — कोल्हापुर शहर', authority: 'NDMA / IMD Pune', time: '07:15 IST', date: '31 Aug 2026', talukas: ['Karvir', 'Panhala', 'Shahuwadi'], actionEn: 'Immediate evacuation of all riverbank settlements. Report to nearest relief camp.', actionHi: 'नदी किनारे की सभी बस्तियों को तत्काल खाली करें।' },
        { id: 2, type: 'dam', sev: 'critical', titleEn: 'Emergency: Koyna Dam Excess Discharge', titleHi: 'आपातकालीन: कोयना बांध भारी विसर्जन', authority: 'Maharashtra WRD / MWRRA', time: '06:30 IST', date: '31 Aug 2026', talukas: ['Karad', 'Patan', 'Wai'], actionEn: 'All communities within 2 km of Koyna river must evacuate immediately.', actionHi: 'कोयना नदी से 2 किमी के भीतर की बस्तियां तुरंत खाली करें।' },
      ],
      offlinePacks: [
        { district: 'Kolhapur District', state: 'Maharashtra', size: '8.4 MB', downloaded: true, updated: '2026-08-31' },
        { district: 'Sangli District', state: 'Maharashtra', size: '6.8 MB', downloaded: false, updated: '2026-08-30' },
        { district: 'Satara District', state: 'Maharashtra', size: '7.1 MB', downloaded: false, updated: '2026-08-30' },
        { district: 'Pune District', state: 'Maharashtra', size: '9.2 MB', downloaded: false, updated: '2026-08-29' },
      ],
    }
  }

  // 3. Pan-India Fallback
  return {
    districtName: cityName || 'Regional District',
    stateName: 'India',
    riskScore: 78,
    riskLevelEn: 'REGIONAL DISASTER SURGE',
    riskLevelHi: 'क्षेत्रीय आपदा चेतावनी',
    riskDescEn: 'Heavy precipitation detected in regional drainage basin. High ground evacuation routes active.',
    riskDescHi: 'क्षेत्रीय बेसिन में भारी बारिश दर्ज। उच्च पहाड़ी निकासी मार्ग सक्रिय हैं।',
    forecastMetrics: {
      damName: 'REGIONAL BARRAGE',
      damOutflow: '28,400',
      damUnit: 'cusecs +8% ↑',
      slopeFos: '0.92',
      rain72h: '142',
      reservoirLevel: '91.8%',
      reservoirName: 'REGIONAL BASIN',
    },
    roads: [
      { route: 'Regional National Highway Corridor', status: 'CAUTION', reasonEn: 'Reduced visibility & water on road', reasonHi: 'सड़क पर पानी और कम दृश्यता', sev: 'caution' },
      { route: 'Riverbank Lowland Access Road', status: 'CLOSED', reasonEn: 'Waterlogging & flood overflow', reasonHi: 'जलभराव और बाढ़ का पानी', sev: 'critical' },
    ],
    incidents: [
      { id: 1, typeEn: 'Local Waterlogging', typeHi: 'जलभराव', icon: '🌊', descEn: 'Low-lying sector submerged near transit terminal', descHi: 'ट्रांजिट टर्मिनल के पास निचला इलाका जलमग्न', dist: '1.4 km', votes: 29, verified: true, time: '12m ago' },
      { id: 2, typeEn: 'Road Obstruction', typeHi: 'सड़क रुकावट', icon: '⛔', descEn: 'Traffic diverted due to localized flooding', descHi: 'बाढ़ के कारण यातायात परिवर्तित', dist: '2.9 km', votes: 16, verified: true, time: '28m ago' },
    ],
    alerts: [
      { id: 1, type: 'flood', sev: 'critical', titleEn: `Flood Caution: ${cityName || 'Regional Basin'}`, titleHi: `बाढ़ चेतावनी: ${cityName || 'क्षेत्रीय बेसिन'}`, authority: 'State Disaster Management Authority', time: '07:00 IST', date: '31 Aug 2026', talukas: ['Central Sub-division', 'East Ward', 'West Taluka'], actionEn: 'Avoid low-lying underpasses and riverbanks. Move to designated high ground shelters.', actionHi: 'निचले इलाकों से दूर रहें। सुरक्षित पहाड़ी शिविरों में जाएं।' },
    ],
    offlinePacks: [
      { district: cityName || 'Local District', state: 'India', size: '8.2 MB', downloaded: true, updated: '2026-08-31' },
      { district: 'Pune District', state: 'Maharashtra', size: '9.2 MB', downloaded: false, updated: '2026-08-30' },
      { district: 'Wayanad District', state: 'Kerala', size: '6.4 MB', downloaded: false, updated: '2026-08-30' },
      { district: 'Chamoli District', state: 'Uttarakhand', size: '7.9 MB', downloaded: false, updated: '2026-08-29' },
      { district: 'Mumbai Suburban', state: 'Maharashtra', size: '11.5 MB', downloaded: false, updated: '2026-08-29' },
    ],
  }
}
