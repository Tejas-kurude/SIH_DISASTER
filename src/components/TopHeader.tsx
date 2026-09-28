import { useEffect, useState } from 'react'
import { getCurrentUserLocation, type UserLocation } from '../services/locationService'
import { useLanguage } from '../context/LanguageContext'

const PRESET_LOCATIONS: { name: string; state: string; lat: number; lng: number }[] = [
  { name: 'Pimpri-Chinchwad', state: 'Maharashtra', lat: 18.6298, lng: 73.7997 },
  { name: 'Pune City', state: 'Maharashtra', lat: 18.5204, lng: 73.8567 },
  { name: 'Kolhapur District', state: 'Maharashtra', lat: 16.7050, lng: 74.2433 },
  { name: 'Satara / Karad', state: 'Maharashtra', lat: 17.6805, lng: 74.0183 },
  { name: 'Wayanad District', state: 'Kerala', lat: 11.6854, lng: 76.1320 },
  { name: 'Chamoli / Joshimath', state: 'Uttarakhand', lat: 30.5583, lng: 79.5658 },
  { name: 'Mumbai Suburban', state: 'Maharashtra', lat: 19.0760, lng: 72.8777 },
]

export default function TopHeader() {
  const [loc, setLoc] = useState<UserLocation | null>(null)
  const { lang, toggleLang, t } = useLanguage()
  const [sosActive, setSosActive] = useState(false)
  const [selectorOpen, setSelectorOpen] = useState(false)

  useEffect(() => {
    getCurrentUserLocation().then(setLoc)
  }, [])

  function handleSelectLocation(preset: { name: string; state: string; lat: number; lng: number }) {
    const updated: UserLocation = {
      lat: preset.lat,
      lng: preset.lng,
      cityName: preset.name,
      stateName: preset.state,
      isLive: true,
    }
    setLoc(updated)
    localStorage.setItem('user_selected_loc', JSON.stringify(updated))
    setSelectorOpen(false)
    window.location.reload()
  }

  async function handleAutoDetectGPS() {
    localStorage.removeItem('user_selected_loc')
    const liveLoc = await getCurrentUserLocation()
    setLoc(liveLoc)
    setSelectorOpen(false)
    window.location.reload()
  }

  return (
    <>
      <div className="flex-shrink-0 h-14 bg-[#E0F2FE] flex items-center justify-between px-2 gap-1.5 border-b border-[#BAE6FD] w-full overflow-hidden">
        {/* District pill with Live Location Dropdown */}
        <button
          onClick={() => setSelectorOpen(true)}
          className="flex items-center gap-1 bg-white/95 shadow-xs rounded-full pl-2 pr-2.5 py-1 border border-[#BAE6FD] min-w-0 max-w-[130px] flex-shrink active:scale-95 transition-transform cursor-pointer"
          title="Switch Location or Auto-Detect GPS"
        >
          <span className="text-xs leading-none flex-shrink-0">📍</span>
          <div className="text-left min-w-0 flex-1 overflow-hidden">
            <div className="text-[10.5px] font-bold text-slate-800 leading-tight truncate">
              {loc?.cityName || 'Pimpri-Chinchwad'}
            </div>
            <div className="text-[7.5px] font-black text-[#E11D48] tracking-wider blink-critical leading-none truncate">
              {loc?.isLive ? t('header.gps_live') : t('header.red_surge')}
            </div>
          </div>
          <span className="text-slate-400 text-[10px] ml-0.5 flex-shrink-0">▾</span>
        </button>

        {/* Offline badge */}
        <div className="flex items-center gap-1 bg-white/95 shadow-xs rounded-full px-2 py-1 border border-[#BAE6FD] flex-shrink-0">
          <span className="text-[#0284C7] text-xs leading-none">⚡</span>
          <div>
            <div className="text-[7.5px] font-black text-[#0284C7] tracking-wider leading-tight whitespace-nowrap">
              {t('header.offline')}
            </div>
            <div className="text-[6.5px] text-slate-500 font-mono-data leading-tight">8.4 MB</div>
          </div>
        </div>

        {/* Working Multilingual Switcher */}
        <button
          onClick={toggleLang}
          className="flex items-center justify-center bg-white/95 shadow-xs rounded-full px-2 py-1 border border-slate-200 text-[9.5px] font-bold flex-shrink-0 active:scale-95 transition-all cursor-pointer"
          title="Switch Language / भाषा बदलें"
        >
          <span className={lang === 'hi' ? 'text-[#0284C7] font-black' : 'text-slate-500'}>हिं</span>
          <span className="text-slate-300 mx-0.5">|</span>
          <span className={lang === 'en' ? 'text-[#0284C7] font-black' : 'text-slate-500'}>EN</span>
        </button>

        {/* SOS Button */}
        <button
          onClick={() => setSosActive(true)}
          className="sos-btn flex items-center gap-1 bg-[#E85D04] hover:bg-[#D9480F] rounded-full px-2.5 py-1.5 flex-shrink-0 shadow-md active:scale-90 transition-transform cursor-pointer"
        >
          <span className="text-xs leading-none">🆘</span>
          <span className="text-white text-[10px] font-black tracking-wider leading-none">
            {t('header.sos')}
          </span>
        </button>
      </div>

      {/* Location Selector Modal */}
      {selectorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 slide-up">
          <div className="bg-white rounded-3xl p-4 max-w-xs w-full shadow-2xl border border-sky-200">
            <div className="flex items-center justify-between mb-3">
              <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <span>📍</span>
                <span>{lang === 'hi' ? 'स्थान चुनें / लाइव जीपीएस' : 'Select District / Live GPS'}</span>
              </div>
              <button
                onClick={() => setSelectorOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg leading-none"
              >
                ×
              </button>
            </div>

            {/* Auto GPS Option */}
            <button
              onClick={handleAutoDetectGPS}
              className="w-full py-2.5 px-3 mb-2 rounded-2xl bg-[#E0F2FE] border border-[#BAE6FD] text-[#0284C7] text-left flex items-center justify-between font-bold text-[10.5px] active:scale-95 transition-transform"
            >
              <div className="flex items-center gap-2">
                <span className="animate-pulse text-xs">🎯</span>
                <span>Auto-Detect My GPS Coordinates</span>
              </div>
              <span className="text-[7.5px] bg-[#0284C7] text-white px-2 py-0.5 rounded-full font-mono-data">LIVE</span>
            </button>

            <div className="text-[7.5px] text-slate-400 font-bold uppercase tracking-wider mb-1.5 px-1">
              Active Disaster Monitoring Hubs
            </div>

            <div className="space-y-1.5 max-h-56 overflow-y-auto scrollbar-hide">
              {PRESET_LOCATIONS.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => handleSelectLocation(preset)}
                  className="w-full py-2 px-3 rounded-xl border border-slate-200/80 bg-slate-50 hover:bg-white text-left flex items-center justify-between text-[10px] text-slate-800 transition-colors"
                >
                  <div>
                    <div className="font-bold">{preset.name}</div>
                    <div className="text-[7.5px] text-slate-500 font-mono-data">{preset.state}</div>
                  </div>
                  <span className="text-xs text-slate-400">➔</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SOS Modal */}
      {sosActive && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 slide-up">
          <div className="bg-white rounded-3xl p-5 max-w-xs w-full shadow-2xl border-2 border-rose-500 text-center">
            <div className="text-4xl mb-2 animate-bounce">🆘</div>
            <div className="text-base font-black text-rose-600 mb-1">
              {lang === 'hi' ? 'आपातकालीन सहायता (SOS)' : 'EMERGENCY DISTRESS (SOS)'}
            </div>
            <p className="text-[11px] text-slate-600 mb-4 leading-relaxed">
              {lang === 'hi'
                ? 'क्या आप तुरंत 112 राष्ट्रीय आपदा नियंत्रण कक्ष से जुड़ना चाहते हैं?'
                : 'Connect directly to National Disaster Helpline 112 & local rescue teams?'}
            </p>
            <div className="space-y-2">
              <a
                href="tel:112"
                className="w-full py-3 bg-rose-600 text-white rounded-2xl font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-rose-500/30 active:scale-95"
              >
                📞 {lang === 'hi' ? '112 पर कॉल करें' : 'Call 112 Emergency'}
              </a>
              <a
                href="tel:1077"
                className="w-full py-2.5 bg-orange-500 text-white rounded-2xl font-black text-xs flex items-center justify-center gap-2 shadow-md active:scale-95"
              >
                🏛️ {lang === 'hi' ? '1077 आपदा नियंत्रण कक्ष' : 'Call 1077 Disaster Control'}
              </a>
              <button
                onClick={() => setSosActive(false)}
                className="w-full py-2 text-slate-500 font-bold text-xs cursor-pointer"
              >
                {lang === 'hi' ? 'रद्द करें' : 'Dismiss'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
