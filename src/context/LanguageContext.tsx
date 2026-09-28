import { createContext, useContext, useState, type ReactNode } from 'react'

export type Language = 'en' | 'hi'

interface LanguageContextType {
  lang: Language
  toggleLang: () => void
  t: (key: string) => string
}

const DICTIONARY: Record<string, Record<Language, string>> = {
  // Navigation
  'nav.home': { en: 'Home', hi: 'होम' },
  'nav.alerts': { en: 'Alerts', hi: 'अलर्ट' },
  'nav.map': { en: 'Safety 3D', hi: 'सुरक्षा 3D' },
  'nav.weather': { en: 'Weather', hi: 'मौसम' },
  'nav.safety': { en: 'Profile', hi: 'खाता' },

  // Header
  'header.offline': { en: 'OFFLINE READY', hi: 'ऑफलाइन तैयार' },
  'header.red_surge': { en: '● RED SURGE', hi: '● भारी बाढ़ चेतावनी' },
  'header.gps_live': { en: '● GPS LIVE', hi: '● लाइव जीपीएस' },
  'header.sos': { en: 'SOS', hi: 'आपात' },

  // Home Page
  'home.risk_score': { en: 'DISTRICT RISK SCORE', hi: 'जिला जोखिम स्कोर' },
  'home.critical_surge': { en: 'CRITICAL SURGE', hi: 'अत्यंत गंभीर स्थिति' },
  'home.evac_desc': { en: 'Immediate evacuation recommended for all riverside zones & low-lying areas', hi: 'नदी किनारे और निचले इलाकों को तुरंत खाली करने की सलाह दी जाती है' },
  'home.evac_guide': { en: '🚨 Evacuation Guide', hi: '🚨 सुरक्षित निकासी मार्ग' },
  'home.flood': { en: 'Flood', hi: 'बाढ़' },
  'home.landslide': { en: 'Landslide', hi: 'भूस्खलन' },
  'home.dam_risk': { en: 'Dam Risk', hi: 'बांध जोखिम' },
  'home.ai_forecast': { en: 'AI RISK FORECAST', hi: 'एआई आपदा पूर्वानुमान' },
  'home.road_disruptions': { en: 'ROAD DISRUPTIONS', hi: 'सड़क मार्ग रुकावट' },
  'home.live_incidents': { en: 'LIVE INCIDENTS', hi: 'लाइव घटना रिपोर्ट' },
  'home.helplines': { en: 'EMERGENCY HELPLINES', hi: 'आपातकालीन हेल्पलाइन' },

  // Map Page
  'map.layers': { en: '3D LAYERS', hi: '3D नक्शा लेयर्स' },
  'map.light3d': { en: 'Light 3D', hi: 'रोशनी 3D' },
  'map.satellite3d': { en: 'Satellite 3D', hi: 'सैटेलाइट 3D' },
  'map.topo3d': { en: 'Topo 3D', hi: 'पहाड़ी 3D' },
  'map.shelter_open': { en: 'Relief Camp (Open)', hi: 'राहत शिविर (खुला है)' },
  'map.flood_zone': { en: 'Red Flood Inundation Zone', hi: 'बाढ़ प्रभावित जलमग्न क्षेत्र' },
  'map.safe_route': { en: 'Safe Evacuation Route', hi: 'सुरक्षित निकासी मार्ग' },
  'map.call_camp': { en: '📞 Call Camp', hi: '📞 शिविर में कॉल करें' },
  'map.navigate': { en: '🧭 Navigate Safe Route', hi: '🧭 सुरक्षित रास्ता देखें' },
  'map.free_beds': { en: 'Free Beds', hi: 'खाली बिस्तर' },

  // Alerts Page
  'alerts.all': { en: 'All Alerts', hi: 'सभी अलर्ट' },
  'alerts.flood': { en: 'Flood Inundation', hi: 'बाढ़ जलभराव' },
  'alerts.landslide': { en: 'Landslide', hi: 'भूस्खलन' },
  'alerts.dam': { en: 'Dam Discharge', hi: 'बांध विसर्जन' },
  'alerts.action_directive': { en: 'ACTION DIRECTIVE', hi: 'तत्काल कार्रवाई निर्देश' },
  'alerts.listen': { en: 'Listen Alert', hi: 'अलर्ट सुनें' },

  // Weather Page
  'weather.live_telemetry': { en: 'Live Weather Telemetry', hi: 'लाइव मौसम डेटा' },
  'weather.rainfall': { en: 'Rainfall', hi: 'वर्षा' },
  'weather.humidity': { en: 'Humidity', hi: 'नमी' },
  'weather.pressure': { en: 'Pressure Drop', hi: 'वायुदाब गिरावट' },
  'weather.wind': { en: 'Wind Speed', hi: 'हवा की गति' },
  'weather.forecast': { en: '7-DAY WEATHER FORECAST', hi: '7 दिनों का मौसम पूर्वानुमान' },
  'weather.river_level': { en: 'River Water Level', hi: 'नदी का जलस्तर' },

  // Safety Page
  'safety.medical_id': { en: 'DIGITAL EMERGENCY MEDICAL ID', hi: 'डिजिटल आपातकालीन मेडिकल कार्ड' },
  'safety.blood_group': { en: 'BLOOD GROUP', hi: 'रक्त समूह' },
  'safety.family_status': { en: 'Family Safety Check-In', hi: 'परिवार सुरक्षा स्थिति' },
  'safety.ai_assistant': { en: 'TERRA-AI Disaster Assistant', hi: 'टेरा एआई आपदा सहायक' },
  'safety.ask_placeholder': { en: 'Ask emergency procedures in English or हिन्दी…', hi: 'आपातकालीन सहायता पूछें (हिंदी या अंग्रेजी)…' },
  'safety.map_packs': { en: 'Offline Map Packs', hi: 'ऑफलाइन मैप डाउनलोड' },
  'safety.export': { en: 'Export Relocation Directive', hi: 'निकासी प्रमाण पत्र डाउनलोड' },
}

const LanguageContext = createContext<LanguageContextType>({
  lang: 'en',
  toggleLang: () => {},
  t: (key: string) => key,
})

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Language>('en')

  function toggleLang() {
    setLang((prev) => (prev === 'en' ? 'hi' : 'en'))
  }

  function t(key: string): string {
    const entry = DICTIONARY[key]
    if (!entry) return key
    return entry[lang] || entry['en'] || key
  }

  return (
    <LanguageContext.Provider value={{ lang, toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  return useContext(LanguageContext)
}
