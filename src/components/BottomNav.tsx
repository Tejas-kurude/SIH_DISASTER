import type { Tab } from '../App'
import { useLanguage } from '../context/LanguageContext'

export default function BottomNav({
  activeTab,
  onTabChange,
}: {
  activeTab: Tab
  onTabChange: (t: Tab) => void
}) {
  const { t } = useLanguage()

  const tabs: { id: Tab; emoji: string; labelKey: string }[] = [
    { id: 'home', emoji: '🏠', labelKey: 'nav.home' },
    { id: 'alerts', emoji: '🔔', labelKey: 'nav.alerts' },
    { id: 'map', emoji: '', labelKey: 'nav.map' },
    { id: 'weather', emoji: '🌦', labelKey: 'nav.weather' },
    { id: 'safety', emoji: '👤', labelKey: 'nav.safety' },
  ]

  return (
    <div className="flex-shrink-0 bg-[#FAF7F2] border-t border-slate-200/80 flex items-end pb-2 pt-1 relative z-10 shadow-[0_-4px_12px_rgba(0,0,0,0.03)]">
      {tabs.map((tab) => {
        const active = activeTab === tab.id
        if (tab.id === 'map') {
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className="flex-1 flex flex-col items-center"
              style={{ marginTop: '-18px' }}
            >
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg border-2 transition-all duration-200"
                style={{
                  background: active ? '#0284C7' : '#E0F2FE',
                  borderColor: active ? '#38BDF8' : '#BAE6FD',
                  boxShadow: active
                    ? '0 0 16px rgba(2,132,199,0.4), 0 4px 12px rgba(2,132,199,0.25)'
                    : '0 2px 8px rgba(0,0,0,0.06)',
                }}
              >
                <svg
                  className="w-6 h-6 transition-colors"
                  style={{ color: active ? '#FFFFFF' : '#0284C7' }}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/>
                  <line x1="9" y1="3" x2="9" y2="18"/>
                  <line x1="15" y1="6" x2="15" y2="21"/>
                </svg>
              </div>
              <span
                className="text-[8.5px] font-bold mt-0.5 font-devanagari transition-colors"
                style={{ color: active ? '#0284C7' : '#64748B' }}
              >
                {t(tab.labelKey)}
              </span>
            </button>
          )
        }
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className="flex-1 flex flex-col items-center gap-0.5 py-1"
          >
            <span
              className="text-xl transition-all duration-150"
              style={{ opacity: active ? 1 : 0.45, transform: active ? 'scale(1.1)' : 'scale(1)' }}
            >
              {tab.emoji}
            </span>
            <span
              className="text-[8.5px] font-bold font-devanagari transition-colors"
              style={{ color: active ? '#0284C7' : '#64748B' }}
            >
              {t(tab.labelKey)}
            </span>
            {active && (
              <div className="w-1 h-1 rounded-full bg-[#0284C7] mt-0.5" />
            )}
          </button>
        )
      })}
    </div>
  )
}
