import { useEffect, useState } from 'react'
import { fetchLiveWeather, type LiveWeatherData } from '../services/weatherService'
import { getCurrentUserLocation, type UserLocation } from '../services/locationService'
import { getNearestRiverData, type RiverBasinData } from '../services/hydrologyService'
import { useLanguage } from '../context/LanguageContext'

const STATIONS = [
  { id: 0, nameEn: 'Live GPS Station', nameHi: 'लाइव जीपीएस स्टेशन', lat: 18.6298, lon: 73.7997 },
  { id: 1, nameEn: 'Western Ghats AWS', nameHi: 'पश्चिमी घाट एडब्ल्यूएस', lat: 18.7500, lon: 73.4000 },
  { id: 2, nameEn: 'Regional Reservoir Dam', nameHi: 'क्षेत्रीय जलाशय बांध', lat: 18.4184, lon: 73.5961 },
]

const FORECAST = [
  { d: 'Sun', dt: '31', icon: '⛈', hi: 24, lo: 19, rain: 95 },
  { d: 'Mon', dt: '01', icon: '🌧', hi: 25, lo: 20, rain: 88 },
  { d: 'Tue', dt: '02', icon: '🌧', hi: 26, lo: 19, rain: 75 },
  { d: 'Wed', dt: '03', icon: '🌦', hi: 28, lo: 20, rain: 55 },
  { d: 'Thu', dt: '04', icon: '⛅', hi: 30, lo: 21, rain: 30 },
  { d: 'Fri', dt: '05', icon: '🌤', hi: 31, lo: 22, rain: 15 },
  { d: 'Sat', dt: '06', icon: '☀️', hi: 32, lo: 22, rain: 5  },
]

function Gauge({
  label, value, max, warn, danger, unit, color,
}: {
  label: string; value: number; max: number; warn: number; danger: number; unit: string; color: string
}) {
  const pct = Math.min((value / max) * 100, 100)
  const isDanger = value >= danger
  const isWarn = value >= warn
  const barColor = isDanger ? '#E11D48' : isWarn ? '#D97706' : color
  return (
    <div className="bg-white rounded-xl p-2.5 border border-slate-200/80 shadow-xs">
      <div className="flex items-end justify-between mb-1.5">
        <div className="text-[7px] text-slate-500 font-bold tracking-widest uppercase">{label}</div>
        <div className="text-right">
          <div className="text-sm font-black font-mono-data leading-none" style={{ color: barColor }}>{value}</div>
          <div className="text-[7px] text-slate-400 font-mono-data mt-0.5">{unit}</div>
        </div>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: '#E2E8F0' }}>
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: barColor }} />
      </div>
      {(isWarn || isDanger) && (
        <div className="text-[7px] mt-1 font-bold" style={{ color: barColor }}>
          {isDanger ? '⚠ DANGER' : '⚡ WARNING'}
        </div>
      )}
    </div>
  )
}

export default function WeatherPage() {
  const { lang, t } = useLanguage()
  const [station, setStation] = useState(0)
  const [weather, setWeather] = useState<LiveWeatherData | null>(null)
  const [userLoc, setUserLoc] = useState<UserLocation | null>(null)
  const [riverData, setRiverData] = useState<RiverBasinData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      let activeLat = 18.6298
      let activeLon = 73.7997

      if (station === 0) {
        const loc = await getCurrentUserLocation()
        setUserLoc(loc)
        activeLat = loc.lat
        activeLon = loc.lng
        const data = await fetchLiveWeather(loc.lat, loc.lng)
        setWeather(data)
        const river = getNearestRiverData(loc.lat, loc.lng, data.rainfall)
        setRiverData(river)
      } else {
        const st = STATIONS[station]
        activeLat = st.lat
        activeLon = st.lon
        const data = await fetchLiveWeather(st.lat, st.lon)
        setWeather(data)
        const river = getNearestRiverData(st.lat, st.lon, data.rainfall)
        setRiverData(river)
      }
      setLoading(false)
    }
    load()
  }, [station])

  const rainfall = weather?.rainfall ?? 38
  const humidity = weather?.humidity ?? 92
  const wind = weather?.windSpeed ?? 26
  const pressure = weather?.pressure ?? 1010
  const pressureDrop = Math.max(0, 1013 - pressure)

  const isRiverDanger = riverData?.status === 'DANGER'
  const isRiverWarn = riverData?.status === 'WARNING'
  const riverColor = isRiverDanger ? '#E11D48' : isRiverWarn ? '#D97706' : '#0284C7'

  return (
    <div className="px-4 py-3 space-y-3">
      {/* Station selector */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-1 px-1 pb-0.5">
        {STATIONS.map((s, i) => (
          <button
            key={s.id}
            onClick={() => setStation(i)}
            className="flex-shrink-0 rounded-full px-3 py-1.5 text-[10px] font-semibold border shadow-xs transition-all"
            style={{
              background: station === i ? '#0284C7' : '#FFFFFF',
              borderColor: station === i ? '#0284C7' : '#E2E8F0',
              color: station === i ? 'white' : '#475569',
            }}
          >
            📡 {i === 0 && userLoc?.cityName ? `Live: ${userLoc.cityName}` : (lang === 'hi' ? s.nameHi : s.nameEn)}
          </button>
        ))}
      </div>

      {/* Telemetry matrix */}
      <div className="rounded-2xl bg-[#F0F6FC] border border-[#BAE6FD] p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#0284C7] animate-pulse" />
            <div className="text-[11px] font-bold text-slate-800">
              {weather?.cityName || (lang === 'hi' ? STATIONS[station].nameHi : STATIONS[station].nameEn)} — {t('weather.live_telemetry')}
            </div>
          </div>
          <span className="text-[8px] font-bold text-[#0284C7] bg-[#E0F2FE] px-2 py-0.5 rounded-full border border-[#BAE6FD]">
            {loading ? 'SYNCING…' : 'LIVE API'}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Gauge label={t('weather.rainfall')}     value={rainfall}     max={80}  warn={40}  danger={60}  unit="mm / hr" color="#0284C7" />
          <Gauge label={t('weather.humidity')}     value={humidity}     max={100} warn={90}  danger={97}  unit="%"       color="#0284C7" />
          <Gauge label={t('weather.pressure')} value={pressureDrop} max={30}  warn={12}  danger={20}  unit="hPa ↓"   color="#7C3AED" />
          <Gauge label={t('weather.wind')}   value={wind}         max={60}  warn={25}  danger={45}  unit="km / h"  color="#D97706" />
        </div>
      </div>

      {/* Dynamic Nearest River Gauge Card */}
      <div className="rounded-2xl bg-[#FFF8F6] border border-[#FECDD3] p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-[7.5px] font-black text-[#0284C7] tracking-widest uppercase">NEAREST RIVER BASIN</div>
            <div className="text-[12px] font-bold text-slate-900 leading-tight">
              {lang === 'hi' ? riverData?.riverNameHi : riverData?.riverNameEn}
            </div>
          </div>
          <span
            className="text-[8px] font-black px-2 py-0.5 rounded-full border"
            style={{
              color: riverColor,
              background: isRiverDanger ? '#FFE4E6' : isRiverWarn ? '#FEF3C7' : '#E0F2FE',
              borderColor: isRiverDanger ? '#FECDD3' : isRiverWarn ? '#FDE68A' : '#BAE6FD',
            }}
          >
            {riverData?.status === 'DANGER' ? '● SURGE ALERT' : riverData?.status === 'WARNING' ? '⚡ CAUTION' : '✓ NORMAL'}
          </span>
        </div>

        <div className="flex items-end gap-4">
          {/* Vertical bar gauge */}
          <div className="flex gap-2 items-end flex-shrink-0">
            <div className="relative w-8 h-40 rounded-lg overflow-hidden border border-slate-300" style={{ background: '#F1F5F9' }}>
              {/* Water fill */}
              <div
                className="absolute bottom-0 left-0 right-0 rounded-b-lg transition-all duration-1000"
                style={{
                  height: `${riverData?.fillPercentage ?? 80}%`,
                  background: isRiverDanger
                    ? 'linear-gradient(to top, #E11D48, #FB7185)'
                    : isRiverWarn
                    ? 'linear-gradient(to top, #D97706, #FBBF24)'
                    : 'linear-gradient(to top, #0284C7, #38BDF8)',
                }}
              />
              {/* Warning line */}
              <div className="absolute left-0 right-0 z-10" style={{ bottom: '46%' }}>
                <div className="h-px bg-[#D97706]" />
              </div>
              {/* Danger line */}
              <div className="absolute left-0 right-0 z-10" style={{ bottom: '36%' }}>
                <div className="h-px bg-[#E11D48]" />
              </div>
            </div>
            <div className="text-[8px] space-y-3 pb-1">
              <div className="text-slate-400 font-medium">Max</div>
              <div>
                <div className="font-mono-data font-black text-[9px] text-[#D97706]">{riverData?.warnLevel} {riverData?.unit}</div>
                <div className="text-[6px] text-[#D97706] font-bold">Warn</div>
              </div>
              <div>
                <div className="font-mono-data font-black text-[9px] text-[#E11D48]">{riverData?.dangerLevel} {riverData?.unit}</div>
                <div className="text-[6px] text-[#E11D48] font-bold">Danger</div>
              </div>
            </div>
          </div>

          <div className="flex-1 space-y-2">
            <div
              className="rounded-xl p-2.5 border bg-white shadow-xs"
              style={{ borderColor: isRiverDanger ? '#FECDD3' : '#E2E8F0' }}
            >
              <div className="text-[7px] text-slate-500 font-bold tracking-widest">CURRENT WATER LEVEL</div>
              <div className="text-xl font-black font-mono-data" style={{ color: riverColor }}>
                {riverData?.currentLevel} {riverData?.unit}
              </div>
              <div className="text-[8px] font-bold" style={{ color: riverColor }}>
                {lang === 'hi' ? riverData?.overThresholdTextHi : riverData?.overThresholdTextEn}
              </div>
              <div className="text-[7px] text-slate-500 mt-0.5">Station: {riverData?.stationName}</div>
            </div>
            <div className="bg-white rounded-xl p-2.5 border border-slate-200/80 shadow-xs">
              <div className="text-[7px] text-slate-500 font-bold tracking-widest mb-0.5">NEARBY AT-RISK ZONES</div>
              <div className="text-[10px] font-semibold text-slate-800">
                {lang === 'hi' ? riverData?.atRiskAreasHi : riverData?.atRiskAreasEn}
              </div>
              <div className="text-[7.5px] font-bold mt-0.5" style={{ color: riverColor }}>
                {isRiverDanger ? '⚠ Flash Flood Inundation within 2h' : '🌊 Normal river discharge monitoring'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* InSAR deformation */}
      <div className="rounded-2xl bg-[#F8F5FF] border border-[#DDD6FE] p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-[11px] font-bold text-slate-800">InSAR Ground Deformation</div>
            <div className="text-[8px] text-slate-500 mt-0.5">Satellite slope displacement — Sahyadri Ghats</div>
          </div>
          <span
            className="text-[8px] font-bold rounded-full px-2 py-0.5 border"
            style={{ color: '#7C3AED', background: '#EDE9FE', borderColor: '#C4B5FD' }}
          >
            ISRO SAR
          </span>
        </div>
        <svg viewBox="0 0 280 56" className="w-full h-11 mb-2" preserveAspectRatio="none">
          <defs>
            <linearGradient id="deform" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0" />
            </linearGradient>
          </defs>
          <line x1="0" y1="30" x2="280" y2="30" stroke="#E2E8F0" strokeWidth="1" />
          <path d="M0 30 L35 28 L70 26 L100 23 L120 20 L145 18 L165 22 L185 25 L210 21 L230 16 L250 11 L268 8 L280 6"
            fill="none" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round" />
          <path d="M0 30 L35 28 L70 26 L100 23 L120 20 L145 18 L165 22 L185 25 L210 21 L230 16 L250 11 L268 8 L280 6 L280 56 L0 56Z"
            fill="url(#deform)" />
          <circle cx="268" cy="8" r="3" fill="#E11D48" />
          <text x="268" y="4" textAnchor="middle" fill="#E11D48"
            style={{ fontSize: '6px', fontWeight: 700, fontFamily: 'JetBrains Mono' }}>
            −22mm
          </text>
        </svg>
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'Max Displacement', val: '−22 mm', color: '#7C3AED' },
            { label: '24h Rate',         val: '4.2 mm', color: '#E11D48'  },
            { label: 'Risk Level',       val: 'HIGH',   color: '#D97706'  },
          ].map(m => (
            <div key={m.label} className="rounded-xl p-2 text-center border border-purple-100 bg-white shadow-xs">
              <div className="text-sm font-black font-mono-data" style={{ color: m.color }}>{m.val}</div>
              <div className="text-[7px] text-slate-500 mt-0.5 font-semibold">{m.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 7-day forecast */}
      <div className="pb-2">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[9px] font-black text-slate-700 tracking-widest">{t('weather.forecast')}</span>
          <span
            className="text-[8px] font-bold rounded px-1.5 py-0.5 border"
            style={{ color: '#0284C7', background: '#E0F2FE', borderColor: '#BAE6FD' }}
          >
            OFFLINE CACHE ✓
          </span>
        </div>
        <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-1 px-1 pb-1">
          {FORECAST.map((day, i) => (
            <div
              key={day.d}
              className="flex-shrink-0 w-16 rounded-xl p-2.5 border text-center transition-all shadow-xs"
              style={{
                background: i === 0 ? '#E0F2FE' : '#FFFFFF',
                borderColor: i === 0 ? '#BAE6FD' : '#E2E8F0',
              }}
            >
              <div className="text-[9px] font-black text-slate-700">{day.d}</div>
              <div className="text-[8px] text-slate-400 mb-1 font-mono-data">{day.dt}</div>
              <div className="text-xl mb-1">{day.icon}</div>
              <div className="text-[10px] font-bold text-slate-900">{day.hi}°</div>
              <div className="text-[9px] text-slate-500">{day.lo}°</div>
              <div
                className="text-[8px] font-mono-data mt-1 font-bold"
                style={{ color: day.rain > 70 ? '#E11D48' : day.rain > 40 ? '#D97706' : '#0284C7' }}
              >
                {day.rain}%
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
