import { useEffect, useState } from 'react'
import { getCurrentUserLocation } from '../services/locationService'
import { getRegionalDisasterData, type RegionalData } from '../services/regionalDisasterService'
import { useLanguage } from '../context/LanguageContext'

type Filter = 'all' | 'flood' | 'landslide' | 'dam'

export default function AlertsPage() {
  const { lang, t } = useLanguage()
  const [filter, setFilter] = useState<Filter>('all')
  const [playing, setPlaying] = useState<number | null>(null)
  const [feedback, setFeedback] = useState<Record<number, 'up' | 'down'>>({})
  const [regional, setRegional] = useState<RegionalData>(getRegionalDisasterData(18.6298, 73.7997, 'Pimpri-Chinchwad'))

  useEffect(() => {
    getCurrentUserLocation().then(loc => {
      const reg = getRegionalDisasterData(loc.lat, loc.lng, loc.cityName)
      setRegional(reg)
    })
  }, [])

  const alerts = regional.alerts
  const shown = filter === 'all' ? alerts : alerts.filter(a => a.type === filter)

  const filters: { id: Filter; label: string; count: number }[] = [
    { id: 'all', label: t('alerts.all'), count: alerts.length },
    { id: 'flood', label: t('alerts.flood'), count: alerts.filter(a => a.type === 'flood').length },
    { id: 'landslide', label: t('alerts.landslide'), count: alerts.filter(a => a.type === 'landslide').length },
    { id: 'dam', label: t('alerts.dam'), count: alerts.filter(a => a.type === 'dam').length },
  ]

  return (
    <div className="px-4 py-3 space-y-3">
      {/* State context header */}
      <div className="flex items-center justify-between bg-white rounded-xl px-3 py-2 border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="text-sm">🏛️</span>
          <div className="min-w-0">
            <div className="text-[10px] font-bold text-slate-800 truncate">
              {regional.stateName} Disaster Control
            </div>
            <div className="text-[7.5px] text-slate-500 font-mono-data truncate">
              {regional.districtName} Division
            </div>
          </div>
        </div>
        <span className="text-[8px] font-black text-[#E11D48] bg-[#FFF1F2] border border-[#FECDD3] px-2 py-0.5 rounded-full">
          ● {alerts.length} Active Directives
        </span>
      </div>

      {/* Filter pills */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-1 px-1 pb-0.5">
        {filters.map(f => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className="flex-shrink-0 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-semibold border shadow-xs transition-all"
            style={{
              background: filter === f.id ? '#0284C7' : '#FFFFFF',
              borderColor: filter === f.id ? '#0284C7' : '#E2E8F0',
              color: filter === f.id ? 'white' : '#475569',
            }}
          >
            {f.label}
            <span
              className="rounded-full px-1.5 py-0.5 text-[8px] font-black"
              style={{
                background: filter === f.id ? 'rgba(255,255,255,0.25)' : '#F1F5F9',
                color: filter === f.id ? 'white' : '#64748B',
              }}
            >
              {f.count}
            </span>
          </button>
        ))}
      </div>

      {/* Alert cards */}
      <div className="space-y-3">
        {shown.map(alert => {
          const crit = alert.sev === 'critical'
          return (
            <div
              key={alert.id}
              className="rounded-2xl overflow-hidden border shadow-xs"
              style={{
                background: crit ? '#FFF1F2' : '#FFFBEB',
                borderColor: crit ? '#FECDD3' : '#FDE68A',
              }}
            >
              {/* Banner strip */}
              <div
                className="px-4 py-2 flex items-center justify-between border-b"
                style={{
                  background: crit ? '#FFE4E6' : '#FEF3C7',
                  borderColor: crit ? '#FECDD3' : '#FDE68A',
                }}
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full animate-pulse"
                    style={{ background: crit ? '#E11D48' : '#D97706' }}
                  />
                  <span
                    className="text-[9px] font-black tracking-widest"
                    style={{ color: crit ? '#BE123C' : '#92400E' }}
                  >
                    {crit ? '🔴 RED ALERT' : '🟡 CAUTION'}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-[9px] font-mono-data text-slate-600 font-semibold">{alert.time}</div>
                  <div className="text-[7px] text-slate-500">{alert.date}</div>
                </div>
              </div>

              <div className="px-4 py-3 space-y-2.5">
                {/* Title + source */}
                <div>
                  <div className="text-[13px] font-bold text-slate-900 leading-snug mb-0.5">
                    {lang === 'hi' ? alert.titleHi : alert.titleEn}
                  </div>
                  <div className="text-[9px] text-slate-500 font-mono-data">{alert.authority}</div>
                </div>

                {/* Talukas */}
                <div>
                  <div className="text-[7px] text-slate-500 font-bold tracking-widest mb-1">AFFECTED TALUKAS / WARDS</div>
                  <div className="flex flex-wrap gap-1">
                    {alert.talukas.map(t => (
                      <span key={t} className="text-[9px] bg-white/90 text-slate-700 font-medium rounded-full px-2 py-0.5 border border-slate-200/80 shadow-xs">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Action */}
                <div className="rounded-xl p-3 border border-slate-200/80 bg-white/90 shadow-xs">
                  <div className="text-[7px] text-slate-500 font-bold tracking-widest mb-1">{t('alerts.action_directive')}</div>
                  <p className="text-[10px] text-slate-800 leading-relaxed font-medium">
                    {lang === 'hi' ? alert.actionHi : alert.actionEn}
                  </p>
                </div>

                {/* Audio + feedback row */}
                <div className="flex items-center justify-between pt-0.5">
                  <button
                    onClick={() => setPlaying(playing === alert.id ? null : alert.id)}
                    className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-[10px] font-semibold border shadow-xs transition-all"
                    style={{
                      background: playing === alert.id ? '#E0F2FE' : '#FFFFFF',
                      borderColor: playing === alert.id ? '#38BDF8' : '#E2E8F0',
                      color: playing === alert.id ? '#0284C7' : '#475569',
                    }}
                  >
                    <span>{playing === alert.id ? '⏸' : '▶'}</span>
                    <span className="font-devanagari">{t('alerts.listen')}</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <span className="text-[8px] text-slate-500 font-medium">Accurate?</span>
                    {(['up', 'down'] as const).map(dir => (
                      <button
                        key={dir}
                        onClick={() => setFeedback(p => ({ ...p, [alert.id]: dir }))}
                        className="text-base leading-none transition-all"
                        style={{ opacity: feedback[alert.id] === dir ? 1 : 0.4, transform: feedback[alert.id] === dir ? 'scale(1.15)' : 'scale(1)' }}
                      >
                        {dir === 'up' ? '👍' : '👎'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
