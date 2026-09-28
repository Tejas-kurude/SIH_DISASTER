import { useEffect, useState } from 'react'
import { fetchLiveWeather, type LiveWeatherData } from '../services/weatherService'
import { getCurrentUserLocation, type UserLocation } from '../services/locationService'
import { getRegionalDisasterData, type RegionalData } from '../services/regionalDisasterService'
import { fetchLiveSeismicEvents, type SeismicEvent } from '../services/seismicService'
import { useLanguage } from '../context/LanguageContext'

function RadialRisk({ value, levelText }: { value: number; levelText?: string }) {
  const r = 38
  const circ = 2 * Math.PI * r
  const offset = circ - (value / 100) * circ
  return (
    <svg className="w-28 h-28" viewBox="0 0 100 100">
      {/* Glow layer */}
      <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(225,29,72,0.12)" strokeWidth="16" />
      {/* Track */}
      <circle cx="50" cy="50" r={r} fill="none" stroke="#FECDD3" strokeWidth="7" />
      {/* Progress */}
      <circle
        cx="50" cy="50" r={r}
        fill="none"
        stroke="url(#riskGrad)"
        strokeWidth="7"
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        transform="rotate(-90 50 50)"
      />
      <defs>
        <linearGradient id="riskGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#E85D04" />
          <stop offset="100%" stopColor="#E11D48" />
        </linearGradient>
      </defs>
      <text x="50" y="44" textAnchor="middle" fill="#0F172A"
        style={{ fontSize: '17px', fontWeight: 800, fontFamily: 'Plus Jakarta Sans' }}>
        {value}%
      </text>
      <text x="50" y="57" textAnchor="middle" fill="#E11D48"
        style={{ fontSize: '6.5px', fontWeight: 700, fontFamily: 'Plus Jakarta Sans', letterSpacing: '0.08em' }}>
        {levelText || 'CRITICAL'}
      </text>
    </svg>
  )
}

export default function HomePage({ onNavigateToMap }: { onNavigateToMap?: () => void }) {
  const { lang, t } = useLanguage()
  const [voted, setVoted] = useState<Set<number>>(new Set())
  const [weather, setWeather] = useState<LiveWeatherData | null>(null)
  const [userLoc, setUserLoc] = useState<UserLocation | null>(null)
  const [seismicEvents, setSeismicEvents] = useState<SeismicEvent[]>([])
  const [regional, setRegional] = useState<RegionalData>(getRegionalDisasterData(18.6298, 73.7997, 'Pimpri-Chinchwad'))

  useEffect(() => {
    getCurrentUserLocation().then(loc => {
      setUserLoc(loc)
      const reg = getRegionalDisasterData(loc.lat, loc.lng, loc.cityName)
      setRegional(reg)
      fetchLiveWeather(loc.lat, loc.lng).then(setWeather)
      fetchLiveSeismicEvents(loc.lat, loc.lng).then(setSeismicEvents)
    })
  }, [])

  function vote(id: number) {
    setVoted(prev => {
      const n = new Set(prev)
      if (n.has(id)) {
        n.delete(id)
      } else {
        n.add(id)
      }
      return n
    })
  }

  return (
    <div className="px-4 py-3 space-y-4">
      {/* ── Hero risk card (Localized to user district) ── */}
      <div
        className="relative rounded-2xl overflow-hidden border border-[#FECDD3] p-4 shadow-sm"
        style={{ background: 'linear-gradient(135deg, #FFF1F2 0%, #FFE4E6 60%, #FFF1F2 100%)' }}
      >
        <div className="absolute top-3 right-3 flex items-center gap-1 text-[8px] font-black text-[#E11D48] bg-[#E11D48]/10 border border-[#E11D48]/25 rounded-full px-2 py-0.5 blink-critical">
          ● LIVE • {regional.stateName}
        </div>
        <div className="flex items-center gap-4">
          <RadialRisk value={regional.riskScore} levelText="CRITICAL" />
          <div className="flex-1 min-w-0">
            <div className="text-[8.5px] text-slate-500 font-bold tracking-widest uppercase mb-1 truncate">
              {regional.districtName}
            </div>
            <div className="text-2xl font-black text-slate-900 leading-none">{regional.riskScore}%</div>
            <div className="text-sm font-bold text-[#E11D48] mb-1.5 leading-tight">
              {lang === 'hi' ? regional.riskLevelHi : regional.riskLevelEn}
            </div>
            <p className="text-[10px] text-slate-600 leading-relaxed mb-3">
              {lang === 'hi' ? regional.riskDescHi : regional.riskDescEn}
            </p>
            <button
              onClick={() => onNavigateToMap && onNavigateToMap()}
              className="inline-flex items-center gap-1.5 bg-[#E11D48] text-white text-[10px] font-bold rounded-xl px-3 py-1.5 shadow-sm active:scale-95 transition-transform cursor-pointer"
            >
              <span>🚨</span>
              <span>{t('home.evac_guide')}</span>
            </button>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-0 mt-4 pt-3 border-t border-rose-200/80">
          {[
            { label: t('home.flood'), level: 'SEVERE', color: '#E11D48' },
            { label: t('home.landslide'), level: 'HIGH', color: '#D97706' },
            { label: t('home.dam_risk'), level: 'CRITICAL', color: '#E11D48' },
          ].map((t, i) => (
            <div key={t.label} className={`text-center ${i > 0 ? 'border-l border-rose-200/80' : ''}`}>
              <div className="text-[8px] text-slate-500 font-semibold mb-0.5">{t.label}</div>
              <div className="text-[10px] font-black" style={{ color: t.color }}>{t.level}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── AI Forecast card (Localized to user dams & basins) ── */}
      <div className="rounded-2xl bg-[#F0F6FC] border border-[#BAE6FD] p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-[8px] text-[#0284C7] font-black tracking-widest mb-0.5">{t('home.ai_forecast')}</div>
            <div className="text-xs font-bold text-slate-800">{regional.forecastMetrics.reservoirName} — PINN Model</div>
          </div>
          <span className="text-[8px] text-slate-500 font-mono-data font-semibold bg-white/80 border border-slate-200 rounded px-1.5 py-0.5">72h OUTLOOK</span>
        </div>

        {/* Sparkline */}
        <div className="mb-3">
          <svg viewBox="0 0 320 56" className="w-full h-11" preserveAspectRatio="none">
            <defs>
              <linearGradient id="precip" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0284C7" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#0284C7" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path
              d="M0 50 L40 44 L80 36 L110 22 L140 16 L170 10 L200 17 L230 29 L265 34 L295 37 L320 39"
              fill="none" stroke="#0284C7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            />
            <path
              d="M0 50 L40 44 L80 36 L110 22 L140 16 L170 10 L200 17 L230 29 L265 34 L295 37 L320 39 L320 56 L0 56Z"
              fill="url(#precip)"
            />
            <circle cx="170" cy="10" r="3.5" fill="#E11D48" />
            <text x="170" y="6" textAnchor="middle" fill="#E11D48"
              style={{ fontSize: '6px', fontWeight: 700, fontFamily: 'JetBrains Mono' }}>PEAK +32h</text>
          </svg>
          <div className="flex justify-between text-[8px] text-slate-400 font-mono-data mt-0.5">
            <span>Now</span><span>+12h</span><span>+24h</span><span>+48h</span><span>+72h</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {[
            { label: `${regional.forecastMetrics.damName} OUTFLOW`, value: regional.forecastMetrics.damOutflow, unit: regional.forecastMetrics.damUnit, color: '#E85D04' },
            { label: 'SLOPE FoS', value: regional.forecastMetrics.slopeFos, unit: 'threshold 1.0 ↓', color: '#E11D48' },
            { label: '72h PRECIPITATION', value: regional.forecastMetrics.rain72h, unit: 'mm expected', color: '#0284C7' },
            { label: `${regional.forecastMetrics.reservoirName}`, value: regional.forecastMetrics.reservoirLevel, unit: 'near capacity', color: '#D97706' },
          ].map(m => (
            <div key={m.label} className="bg-white rounded-xl p-2.5 border border-slate-200/80 shadow-xs">
              <div className="text-[7px] text-slate-500 font-bold tracking-widest mb-1 truncate">{m.label}</div>
              <div className="text-base font-black font-mono-data leading-none" style={{ color: m.color }}>{m.value}</div>
              <div className="text-[8px] text-slate-500 mt-0.5 truncate">{m.unit}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Live USGS Seismology & Tectonic Activity ── */}
      {seismicEvents.length > 0 && (
        <div className="rounded-2xl bg-[#FFFBEB] border border-[#FDE68A] p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <span className="text-sm">⚡</span>
              <div>
                <div className="text-[8px] text-[#D97706] font-black tracking-widest uppercase">LIVE USGS SEISMOLOGY FEED</div>
                <div className="text-[11px] font-bold text-slate-900 leading-tight">Regional Faultline Tremor Monitor</div>
              </div>
            </div>
            <span className="text-[8px] font-bold text-[#D97706] bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300">
              ● REAL-TIME
            </span>
          </div>

          <div className="space-y-2 mt-2">
            {seismicEvents.slice(0, 2).map((eq) => (
              <div key={eq.id} className="bg-white rounded-xl p-2.5 border border-amber-200 flex items-center justify-between shadow-xs">
                <div className="min-w-0 flex-1 pr-2">
                  <div className="text-[10px] font-bold text-slate-800 truncate">{eq.place}</div>
                  <div className="text-[7.5px] text-slate-500 font-mono-data mt-0.5">
                    Depth: {eq.depthKm} km • {eq.distanceKm} km away • {eq.timeStr}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-sm font-black font-mono-data text-[#D97706]">M {eq.magnitude}</div>
                  <div className="text-[7px] font-bold text-amber-700">{eq.severity}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── State Road Disruptions ── */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[9px] font-black text-slate-700 tracking-widest uppercase">
            {regional.stateName} {t('home.road_disruptions')}
          </span>
          <span className="text-[8px] font-bold text-[#0284C7] bg-[#E0F2FE] rounded-full px-2 py-0.5 border border-[#BAE6FD]">
            {regional.roads.length} affected
          </span>
        </div>
        <div className="flex gap-2.5 overflow-x-auto scrollbar-hide -mx-1 px-1 pb-1">
          {regional.roads.map((r, i) => (
            <div key={i} className={`flex-shrink-0 w-52 rounded-xl p-3 border shadow-xs ${
              r.sev === 'critical'
                ? 'bg-[#FFF1F2] border-[#FECDD3]'
                : 'bg-[#FFFBEB] border-[#FDE68A]'
            }`}>
              <div className="flex items-center gap-1.5 mb-2">
                <span className="text-base">⛔</span>
                <span className={`text-[8px] font-black rounded px-1.5 py-0.5 ${
                  r.sev === 'critical'
                    ? 'bg-[#E11D48]/15 text-[#E11D48]'
                    : 'bg-[#D97706]/15 text-[#D97706]'
                }`}>{r.status}</span>
              </div>
              <div className="text-[11px] font-bold text-slate-800 leading-tight mb-1">{r.route}</div>
              <div className="text-[9px] text-slate-600 leading-snug">
                {lang === 'hi' ? r.reasonHi : r.reasonEn}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Live Local Incident Feed with Interactive Voting ── */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[9px] font-black text-slate-700 tracking-widest uppercase">
            {regional.districtName} — {t('home.live_incidents')}
          </span>
          <div className="flex items-center gap-1 text-[8px] font-bold text-[#16A34A]">
            <div className="w-1.5 h-1.5 rounded-full bg-[#16A34A] animate-pulse" />
            Live Verified
          </div>
        </div>
        <div className="space-y-2">
          {regional.incidents.map((inc) => (
            <div key={inc.id} className="flex gap-3 bg-white rounded-xl p-3 border border-slate-200/80 shadow-xs">
              <span className="text-xl flex-shrink-0 leading-none mt-0.5">{inc.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                  <span className="text-[10px] font-bold text-slate-800">
                    {lang === 'hi' ? inc.typeHi : inc.typeEn}
                  </span>
                  {inc.verified && (
                    <span className="text-[7px] font-black text-[#16A34A] bg-[#DCFCE7] rounded px-1">✓ VERIFIED</span>
                  )}
                  <span className="text-[8px] text-slate-400 ml-auto font-mono-data">{inc.time}</span>
                </div>
                <p className="text-[10px] text-slate-600 leading-snug mb-1.5">
                  {lang === 'hi' ? inc.descHi : inc.descEn}
                </p>
                <div className="flex items-center gap-2 text-[9px] text-slate-500">
                  <span>📍 {inc.dist}</span>
                  <button
                    onClick={() => vote(inc.id)}
                    className={`flex items-center gap-1 font-bold px-2 py-0.5 rounded-lg border transition-all active:scale-95 ${
                      voted.has(inc.id)
                        ? 'bg-[#E0F2FE] border-[#BAE6FD] text-[#0284C7]'
                        : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    <span>▲</span>
                    <span>{inc.votes + (voted.has(inc.id) ? 1 : 0)} Votes</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Emergency Helplines ── */}
      <div className="pb-2">
        <div className="text-[9px] font-black text-slate-700 tracking-widest mb-2">{t('home.helplines')}</div>
        <div className="grid grid-cols-3 gap-2">
          {[
            { num: '112', label: 'National\nSOS', icon: '🆘', color: '#E11D48', bg: '#FFF1F2', border: '#FECDD3' },
            { num: '1077', label: 'Disaster\nControl', icon: '🏛️', color: '#E85D04', bg: '#FFF7ED', border: '#FED7AA' },
            { num: '108', label: 'Ambulance\nService', icon: '🚑', color: '#16A34A', bg: '#F0FDF4', border: '#BBF7D0' },
          ].map(h => (
            <button key={h.num}
              className="rounded-xl p-3 flex flex-col items-center gap-1 border shadow-xs transition-all active:scale-95"
              style={{ backgroundColor: h.bg, borderColor: h.border }}
            >
              <span className="text-2xl leading-none">{h.icon}</span>
              <div className="text-lg font-black font-mono-data leading-none" style={{ color: h.color }}>{h.num}</div>
              <div className="text-[7px] text-slate-600 font-medium text-center leading-tight" style={{ whiteSpace: 'pre-line' }}>{h.label}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
