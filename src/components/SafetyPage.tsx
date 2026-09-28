import { useEffect, useState } from 'react'
import { askGemini } from '../services/aiService'
import { getCurrentUserLocation } from '../services/locationService'
import { getRegionalDisasterData } from '../services/regionalDisasterService'
import { getCollectorDirectivePdfUrl } from '../services/disasterBackendService'
import { useLanguage } from '../context/LanguageContext'

type MemberStatus = 'SAFE' | 'EVACUATING' | 'NEED ASSISTANCE'

const FAMILY: { name: string; relation: string; phone: string; avatar: string; status: MemberStatus }[] = [
  { name: 'Priya Patil',      relation: 'Spouse',  phone: '98765 43210', avatar: 'P', status: 'SAFE' },
  { name: 'Arun Patil',       relation: 'Father',  phone: '98765 43211', avatar: 'A', status: 'EVACUATING' },
  { name: 'Sunita Kulkarni',  relation: 'Mother',  phone: '98765 43212', avatar: 'S', status: 'NEED ASSISTANCE' },
]

const STATUS_STYLE: Record<MemberStatus, { bg: string; border: string; text: string; dot: string }> = {
  'SAFE':             { bg: '#F0FDF4', border: '#BBF7D0', text: '#16A34A', dot: '#16A34A' },
  'EVACUATING':       { bg: '#FFFBEB', border: '#FDE68A', text: '#D97706', dot: '#D97706' },
  'NEED ASSISTANCE':  { bg: '#FFF1F2', border: '#FECDD3', text: '#E11D48', dot: '#E11D48' },
}

const CHAT_SEED = [
  { role: 'user', text: 'How do I purify flood water?' },
  { role: 'bot',  text: 'Boil vigorously for 1 minute, then filter through clean cloth. If boiling isn\'t possible, add 2 drops of chlorine bleach per litre and let settle 30 min before drinking.' },
  { role: 'user', text: 'What should be in my emergency bag?' },
  { role: 'bot',  text: 'Pack: 3-day water (3L/person), non-perishable food, first-aid kit, torch + batteries, waterproof document pouch, power bank, whistle, warm clothing, and chronic-condition medicines.' },
]

export default function SafetyPage() {
  const { lang, t } = useLanguage()
  const [chatInput, setChatInput] = useState('')
  const [messages, setMessages] = useState(CHAT_SEED)
  const [loading, setLoading] = useState(false)
  const [districtFilter, setDistrictFilter] = useState('')
  const [downloading, setDownloading] = useState<string | null>(null)
  const [downloaded, setDownloaded] = useState<Set<string>>(new Set(['Pune District', 'Pimpri-Chinchwad Metro']))
  const [allPacks, setAllPacks] = useState<{ district: string; state: string; size: string; downloaded: boolean; updated: string }[]>([])

  useEffect(() => {
    getCurrentUserLocation().then(loc => {
      const reg = getRegionalDisasterData(loc.lat, loc.lng, loc.cityName)
      setAllPacks(reg.offlinePacks)
    })
  }, [])

  const filteredPacks = allPacks.filter(p =>
    p.district.toLowerCase().includes(districtFilter.toLowerCase()) ||
    p.state.toLowerCase().includes(districtFilter.toLowerCase())
  )

  async function sendChat() {
    if (!chatInput.trim() || loading) return
    const q = chatInput.trim()
    setChatInput('')
    setMessages(prev => [...prev, { role: 'user', text: q }])
    setLoading(true)

    try {
      const reply = await askGemini(q)
      setMessages(prev => [...prev, { role: 'bot', text: reply }])
    } catch {
      setMessages(prev => [...prev, { role: 'bot', text: 'Stay alert and proceed to designated relief camps or call 112 for immediate evacuation assistance.' }])
    } finally {
      setLoading(false)
    }
  }

  function startDownload(district: string) {
    setDownloading(district)
    setTimeout(() => {
      setDownloaded(prev => new Set([...prev, district]))
      setDownloading(null)
    }, 1200)
  }

  return (
    <div className="px-4 py-3 space-y-3">
      {/* ── Medical ID card ── */}
      <div
        className="rounded-2xl overflow-hidden border border-[#BAE6FD] shadow-sm"
        style={{ background: 'linear-gradient(135deg, #E0F2FE 0%, #BAE6FD 50%, #E0F2FE 100%)' }}
      >
        <div className="px-4 py-3 flex items-center justify-between border-b border-[#BAE6FD]">
          <div className="flex items-center gap-2">
            <span className="text-lg">🏥</span>
            <div>
              <div className="text-[7px] text-slate-600 font-bold tracking-widest">DIGITAL EMERGENCY</div>
              <div className="text-[11px] font-black text-slate-900">MEDICAL ID CARD</div>
            </div>
          </div>
          <span
            className="text-[8px] font-bold rounded-full px-2 py-0.5 border shadow-xs"
            style={{ color: '#0284C7', background: '#FFFFFF', borderColor: '#BAE6FD' }}
          >
            ICE CARD
          </span>
        </div>

        <div className="px-4 py-3">
          <div className="flex items-center gap-3 mb-3">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-2xl border bg-white shadow-xs"
              style={{ borderColor: '#BAE6FD' }}
            >
              👤
            </div>
            <div>
              <div className="text-[13px] font-bold text-slate-900">Ramesh Patil</div>
              <div className="text-[9px] text-slate-600 font-medium">DOB: 15 Mar 1985 • Male</div>
              <div className="text-[9px] text-slate-500 font-mono-data">Aadhar: •••• •••• 3421</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div
              className="rounded-xl p-2.5 border bg-white shadow-xs"
              style={{ borderColor: '#FECDD3' }}
            >
              <div className="text-[7px] text-slate-500 font-bold tracking-widest mb-0.5">BLOOD GROUP</div>
              <div className="text-2xl font-black text-[#E11D48]">B+</div>
            </div>
            <div className="bg-white rounded-xl p-2.5 border border-slate-200/80 shadow-xs">
              <div className="text-[7px] text-slate-500 font-bold tracking-widest mb-0.5">ALLERGIES</div>
              <div className="text-[11px] font-bold text-[#D97706]">Penicillin</div>
              <div className="text-[9px] text-slate-500">Sulfa drugs</div>
            </div>
            <div className="bg-white rounded-xl p-2.5 border border-slate-200/80 shadow-xs col-span-2">
              <div className="text-[7px] text-slate-500 font-bold tracking-widest mb-0.5">CHRONIC CONDITIONS</div>
              <div className="text-[10px] text-slate-700 font-medium">Type 2 Diabetes • Hypertension (140/90)</div>
            </div>
            <div className="bg-white rounded-xl p-2.5 border border-slate-200/80 shadow-xs col-span-2">
              <div className="text-[7px] text-slate-500 font-bold tracking-widest mb-1.5">ICE CONTACT</div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-bold text-slate-800">Priya Patil (Spouse)</div>
                  <div className="text-[10px] font-mono-data font-bold text-[#0284C7]">📞 98765 43210</div>
                </div>
                <button
                  className="w-9 h-9 rounded-xl flex items-center justify-center border text-lg shadow-xs"
                  style={{ background: '#E0F2FE', borderColor: '#BAE6FD' }}
                >
                  📞
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Family check-in ── */}
      <div className="rounded-2xl bg-[#F0F6FC] border border-[#BAE6FD] p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-base">👨‍👩‍👧‍👦</span>
          <div className="text-[11px] font-bold text-slate-800">Family Check-In Status</div>
          <div className="ml-auto text-[8px] text-slate-500 font-mono-data font-medium">{FAMILY.length} contacts</div>
        </div>
        <div className="space-y-2">
          {FAMILY.map((f, i) => {
            const c = STATUS_STYLE[f.status]
            return (
              <div
                key={i}
                className="flex items-center gap-3 rounded-xl p-2.5 border shadow-xs"
                style={{ background: c.bg, borderColor: c.border }}
              >
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border shadow-xs"
                  style={{ background: '#FFFFFF', borderColor: c.border, color: c.text }}
                >
                  {f.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] font-bold text-slate-800">{f.name}</div>
                  <div className="text-[8px] text-slate-500">{f.relation} • {f.phone}</div>
                </div>
                <div
                  className="flex items-center gap-1 text-[7px] font-black rounded-full px-2 py-1 border shadow-xs bg-white"
                  style={{ color: c.text, borderColor: c.border }}
                >
                  <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: c.dot }} />
                  <span className="whitespace-nowrap">{f.status}</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Offline RAG chatbot ── */}
      <div className="rounded-2xl bg-[#F0F6FC] border border-[#BAE6FD] shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-200/80 bg-white/60 flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-sm border bg-white shadow-xs"
            style={{ borderColor: '#BAE6FD' }}
          >
            🤖
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-800">TERRA-AI Assistant</div>
            <div className="text-[8px] font-semibold text-[#0284C7]">● Offline RAG Model Active</div>
          </div>
        </div>

        <div className="px-3 py-3 space-y-2 max-h-44 overflow-y-auto scrollbar-hide">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className="max-w-[82%] rounded-2xl px-3 py-2 text-[10px] leading-relaxed shadow-xs"
                style={{
                  background: m.role === 'user' ? '#0284C7' : '#FFFFFF',
                  color: m.role === 'user' ? '#FFFFFF' : '#1E293B',
                  borderRadius: m.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                  border: m.role === 'bot' ? '1px solid #E2E8F0' : 'none',
                }}
              >
                {m.text}
              </div>
            </div>
          ))}
        </div>

        <div className="px-3 pb-3 flex gap-2">
          <input
            value={chatInput}
            onChange={e => setChatInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendChat()}
            placeholder="Ask about emergency procedures…"
            className="flex-1 rounded-xl px-3 py-2 text-[10px] text-slate-800 placeholder-slate-400 outline-none border bg-white shadow-xs"
            style={{
              borderColor: '#CBD5E1',
            }}
            onFocus={e => { (e.target as HTMLInputElement).style.borderColor = '#0284C7' }}
            onBlur={e => { (e.target as HTMLInputElement).style.borderColor = '#CBD5E1' }}
          />
          <button
            onClick={sendChat}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm shadow-sm transition-transform active:scale-95"
            style={{ background: '#0284C7' }}
          >
            ▶
          </button>
        </div>
      </div>

      {/* ── Offline map packs with District Search Filter ── */}
      <div className="rounded-2xl bg-[#F0F6FC] border border-[#BAE6FD] p-4 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <div className="text-[11px] font-bold text-slate-800">📥 {t('safety.map_packs')}</div>
          <span className="text-[8px] font-bold text-[#0284C7] bg-[#E0F2FE] px-2 py-0.5 rounded-full border border-[#BAE6FD]">
            {downloaded.size} Cached
          </span>
        </div>

        {/* District Filter Input */}
        <div className="relative mb-3">
          <input
            type="text"
            value={districtFilter}
            onChange={e => setDistrictFilter(e.target.value)}
            placeholder={lang === 'hi' ? '🔍 जिला खोजें (उदा. पुणे, पिंपरी, सातारा, वायनाड...)' : '🔍 Search district (e.g. Pune, Pimpri, Wayanad...)'}
            className="w-full rounded-xl px-3 py-1.5 text-[9.5px] bg-white border border-slate-200 text-slate-800 placeholder-slate-400 outline-none shadow-xs"
          />
          {districtFilter && (
            <button
              onClick={() => setDistrictFilter('')}
              className="absolute right-2.5 top-1.5 text-xs text-slate-400 hover:text-slate-600"
            >
              ×
            </button>
          )}
        </div>

        <div className="space-y-2 max-h-56 overflow-y-auto scrollbar-hide">
          {filteredPacks.map((p, i) => {
            const isDL = downloaded.has(p.district)
            const isSyncing = downloading === p.district
            return (
              <div key={i} className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 border border-slate-200/80 bg-white shadow-xs">
                <span className="text-lg leading-none flex-shrink-0">🗺️</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10.5px] font-bold text-slate-800 truncate">{p.district}</span>
                    <span className="text-[7.5px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">{p.state}</span>
                  </div>
                  <div className="text-[7px] text-slate-500 font-mono-data mt-0.5">{p.size} • Updated {p.updated}</div>
                </div>
                <button
                  onClick={() => !isDL && !isSyncing && startDownload(p.district)}
                  className="flex-shrink-0 text-[8.5px] font-bold rounded-lg px-2.5 py-1.5 border shadow-xs transition-all active:scale-95"
                  style={
                    isDL
                      ? { background: '#F0FDF4', borderColor: '#BBF7D0', color: '#16A34A' }
                      : isSyncing
                      ? { background: '#E0F2FE', borderColor: '#BAE6FD', color: '#0284C7' }
                      : { background: '#F1F5F9', borderColor: '#E2E8F0', color: '#475569' }
                  }
                >
                  {isDL ? '✓ Ready' : isSyncing ? '↓ Syncing…' : '↓ Download'}
                </button>
              </div>
            )
          })}
          {filteredPacks.length === 0 && (
            <div className="text-center py-4 text-[9px] text-slate-400">
              No matching district found. Try searching another district name.
            </div>
          )}
        </div>
      </div>

      {/* ── Export directive ── */}
      <div className="pb-2">
        <button
          onClick={() => {
            const url = getCollectorDirectivePdfUrl(userLocation?.lat || 18.6298, userLocation?.lon || 73.7997)
            window.open(url, '_blank')
          }}
          className="w-full flex items-center gap-3 rounded-2xl p-4 border shadow-sm transition-all active:scale-[0.98] cursor-pointer"
          style={{
            background: 'linear-gradient(135deg, #E0F2FE 0%, #BAE6FD 100%)',
            borderColor: '#7DD3FC',
          }}
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-xl border flex-shrink-0 bg-white shadow-xs"
            style={{ borderColor: '#BAE6FD' }}
          >
            📋
          </div>
          <div className="text-left flex-1">
            <div className="text-[12px] font-bold text-slate-900">{t('safety.export')}</div>
            <div className="text-[8px] text-slate-600 font-medium mt-0.5">
              {lang === 'hi' ? 'आधिकारिक हस्ताक्षरित पीडीएफ • जिला मजिस्ट्रेट आदेश' : "Official signed PDF • Collector's Office authorization"}
            </div>
          </div>
          <span className="text-[#0284C7] text-lg font-bold">↓</span>
        </button>
      </div>
    </div>
  )
}
