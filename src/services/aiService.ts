import { API_KEYS } from '../config/apiKeys'

const SYSTEM_PROMPT = `You are TERRA-AI, an expert Disaster Relief & Emergency Safety Assistant for India (NDMA/SDMA).
Provide concise, actionable, high-priority safety guidance for floods, landslides, dam water discharges, first aid, emergency kit packing, and safe evacuation. Keep answers direct, friendly, and practical (2-4 sentences max). If asked in Hindi or Marathi, respond helpfully in that language.`

export async function askGemini(prompt: string): Promise<string> {
  if (!API_KEYS.GEMINI) {
    return getOfflineEmergencyAnswer(prompt)
  }

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEYS.GEMINI}`
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: SYSTEM_PROMPT },
              { text: `User Question: ${prompt}` },
            ],
          },
        ],
        generationConfig: {
          maxOutputTokens: 250,
          temperature: 0.4,
        },
      }),
    })

    if (res.ok) {
      const data = await res.json()
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text
      if (text) return text.trim()
    }
  } catch (err) {
    console.warn('Gemini request failed, using emergency offline knowledge base:', err)
  }

  return getOfflineEmergencyAnswer(prompt)
}

function getOfflineEmergencyAnswer(prompt: string): string {
  const p = prompt.toLowerCase()
  if (p.includes('water') || p.includes('purif') || p.includes('drink') || p.includes('पानी')) {
    return '💧 Water Safety: Boil water vigorously for 1-2 minutes, then filter through clean cloth. If boiling is not possible, use water purification tablets or 2 drops of standard chlorine per litre and wait 30 minutes.'
  }
  if (p.includes('kit') || p.includes('bag') || p.includes('pack') || p.includes('सामान')) {
    return '🎒 Emergency Go-Bag: Pack 3-day non-perishable food, water (3L/person/day), waterproof document pouch (Aadhar/deeds), torch + extra batteries, first-aid kit, power bank, whistle, and prescription medicines.'
  }
  if (p.includes('flood') || p.includes('baadh') || p.includes('बाढ़')) {
    return '🌊 Flood Directive: Move immediately to higher ground. Turn off main power & gas valves. Never drive or walk through moving flood water (even 15 cm can sweep you away). Call 112 or 1077 for boat rescue.'
  }
  if (p.includes('landslide') || p.includes('ghat') || p.includes('भूस्खलन')) {
    return '⛰️ Landslide Caution: Evacuate slope paths immediately if you hear cracking trees or rumbling sounds. Avoid valley bottoms and ghat roads. Seek shelter behind sturdy structures.'
  }
  return '🚨 Emergency Safety Guidance: Stay tuned to official SDMA alerts, keep your phone charged in power saver mode, avoid submerged roads, and proceed to the nearest designated relief camp.'
}
