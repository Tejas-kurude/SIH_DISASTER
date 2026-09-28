import { useState } from 'react'
import { LanguageProvider } from './context/LanguageContext'
import TopHeader from './components/TopHeader'
import BottomNav from './components/BottomNav'
import HomePage from './components/HomePage'
import AlertsPage from './components/AlertsPage'
import MapPage from './components/MapPage'
import WeatherPage from './components/WeatherPage'
import SafetyPage from './components/SafetyPage'

export type Tab = 'home' | 'alerts' | 'map' | 'weather' | 'safety'

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('home')
  const isMap = activeTab === 'map'

  return (
    <LanguageProvider>
      <div
        className="min-h-screen flex items-start sm:items-center justify-center sm:py-8"
        style={{ background: '#F5F2EB' }}
      >
      {/* Desktop wallpaper gradient behind phone */}
      <div
        className="hidden sm:block fixed inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(32,150,205,0.12) 0%, transparent 70%)',
        }}
      />

      {/* Phone shell */}
      <div
        className="relative flex flex-col overflow-hidden w-full h-screen sm:w-[390px] sm:h-[844px]"
        style={{
          background: '#FAF7F2',
          borderRadius: 'clamp(0px, calc((100vw - 389px) * 100), 44px)',
          boxShadow: '0 0 0 1px rgba(0,0,0,0.08), 0 24px 60px rgba(0,0,0,0.1), 0 0 40px rgba(32,150,205,0.08)',
        }}
      >
        {/* Status bar */}
        <div
          className="flex-shrink-0 h-11 flex items-center justify-between px-6 border-b border-black/[0.04]"
          style={{ background: '#F2EDE4' }}
        >
          <span className="text-slate-700 text-xs font-mono-data font-semibold tracking-widest">9:41</span>
          <div className="flex gap-2 items-center">
            {/* Signal bars */}
            <svg className="w-4 h-3" viewBox="0 0 20 12" fill="none">
              <rect x="0"  y="9"  width="3" height="3"  rx="0.5" fill="rgba(51,65,85,0.3)" />
              <rect x="4"  y="6"  width="3" height="6"  rx="0.5" fill="rgba(51,65,85,0.5)" />
              <rect x="8"  y="3"  width="3" height="9"  rx="0.5" fill="rgba(51,65,85,0.75)" />
              <rect x="12" y="0"  width="3" height="12" rx="0.5" fill="rgba(51,65,85,0.9)" />
            </svg>
            {/* Wifi */}
            <svg className="w-3.5 h-3" viewBox="0 0 16 12" fill="none">
              <path d="M8 9.5 L9 11H7L8 9.5Z" fill="rgba(51,65,85,0.8)" />
              <path d="M5 7Q8 4.5 11 7" fill="none" stroke="rgba(51,65,85,0.7)" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M2.5 4.5Q8 0 13.5 4.5" fill="none" stroke="rgba(51,65,85,0.4)" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            {/* Battery */}
            <svg className="w-6 h-3" viewBox="0 0 26 12" fill="none">
              <rect x="0.6" y="0.6" width="22" height="10.8" rx="2.2" stroke="rgba(51,65,85,0.5)" strokeWidth="1.2" />
              <rect x="23" y="3.5" width="2.5" height="5" rx="1.2" fill="rgba(51,65,85,0.4)" />
              <rect x="2" y="2" width="15.5" height="8" rx="1.5" fill="#16A34A" />
            </svg>
          </div>
        </div>

        {/* Utility header */}
        <TopHeader />

        {/* Tab content */}
        <div
          className={`flex-1 relative ${isMap ? 'overflow-hidden' : 'overflow-y-auto scrollbar-hide'}`}
          style={{ overscrollBehavior: 'contain' }}
        >
          {activeTab === 'home'    && <HomePage onNavigateToMap={() => setActiveTab('map')} />}
          {activeTab === 'alerts'  && <AlertsPage />}
          {activeTab === 'map'     && <MapPage />}
          {activeTab === 'weather' && <WeatherPage />}
          {activeTab === 'safety'  && <SafetyPage />}
        </div>

        {/* Bottom nav */}
        <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    </div>
    </LanguageProvider>
  )
}
