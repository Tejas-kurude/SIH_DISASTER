export interface RiverBasinData {
  riverNameEn: string
  riverNameHi: string
  stationName: string
  currentLevel: number
  warnLevel: number
  dangerLevel: number
  maxLevel: number
  unit: string
  status: 'NORMAL' | 'WARNING' | 'DANGER'
  overThresholdTextEn: string
  overThresholdTextHi: string
  atRiskAreasEn: string
  atRiskAreasHi: string
  fillPercentage: number
}

export function getNearestRiverData(lat: number, lon: number, rainfallMm: number = 42): RiverBasinData {
  // 1. Pune / Pimpri-Chinchwad / Maval
  if (lat >= 18.3 && lat <= 18.9 && lon >= 73.5 && lon <= 74.2) {
    const danger = 44.0
    const warn = 41.5
    const max = 50.0
    const current = Math.min(max, 41.0 + (rainfallMm / 15.0))
    const isDanger = current >= danger
    const isWarn = current >= warn
    const over = current - (isDanger ? danger : warn)

    return {
      riverNameEn: 'Pavana & Mula-Mutha River',
      riverNameHi: 'पवना एवं मुला-मुठा नदी',
      stationName: 'Dapodi Bridge AWS',
      currentLevel: parseFloat(current.toFixed(1)),
      warnLevel: warn,
      dangerLevel: danger,
      maxLevel: max,
      unit: 'ft',
      status: isDanger ? 'DANGER' : isWarn ? 'WARNING' : 'NORMAL',
      overThresholdTextEn: isDanger ? `+${over.toFixed(1)} ft ABOVE DANGER MARK` : isWarn ? `+${over.toFixed(1)} ft above warn mark` : 'Within safe discharge limits',
      overThresholdTextHi: isDanger ? `+${over.toFixed(1)} फीट खतरे के निशान से ऊपर` : isWarn ? `+${over.toFixed(1)} फीट चेतावनी स्तर से ऊपर` : 'सुरक्षित जलस्तर सीमा में',
      atRiskAreasEn: 'Sangvi, Dapodi Lowlands, Pimpri Gaon',
      atRiskAreasHi: 'सांगवी, दापोडी निचला क्षेत्र, पिंपरी गांव',
      fillPercentage: Math.min(100, Math.max(10, (current / max) * 100)),
    }
  }

  // 2. Kolhapur / Karvir / Panchaganga
  if (lat >= 16.0 && lat <= 17.2 && lon >= 73.8 && lon <= 74.8) {
    const danger = 45.0
    const warn = 43.0
    const max = 52.0
    const current = Math.min(max, 43.5 + (rainfallMm / 12.0))
    const isDanger = current >= danger
    const isWarn = current >= warn
    const over = current - (isDanger ? danger : warn)

    return {
      riverNameEn: 'Panchaganga River',
      riverNameHi: 'पंचगंगा नदी',
      stationName: 'Rajaram Barrage Gauge',
      currentLevel: parseFloat(current.toFixed(1)),
      warnLevel: warn,
      dangerLevel: danger,
      maxLevel: max,
      unit: 'ft',
      status: isDanger ? 'DANGER' : isWarn ? 'WARNING' : 'NORMAL',
      overThresholdTextEn: isDanger ? `+${over.toFixed(1)} ft ABOVE DANGER MARK` : isWarn ? `+${over.toFixed(1)} ft above warn mark` : 'Within safe discharge limits',
      overThresholdTextHi: isDanger ? `+${over.toFixed(1)} फीट खतरे के निशान से ऊपर` : isWarn ? `+${over.toFixed(1)} फीट चेतावनी स्तर से ऊपर` : 'सुरक्षित जलस्तर सीमा में',
      atRiskAreasEn: 'Irrigation Colony, Rajaram Nagar, Bhavani Mandap',
      atRiskAreasHi: 'इरिगेशन कॉलोनी, राजाराम नगर, भवानी मंडप',
      fillPercentage: Math.min(100, Math.max(10, (current / max) * 100)),
    }
  }

  // 3. Wayanad / Kerala (Kabini & Chaliyar)
  if (lat >= 11.2 && lat <= 12.2 && lon >= 75.6 && lon <= 76.8) {
    const danger = 21.5
    const warn = 18.0
    const max = 26.0
    const current = Math.min(max, 17.5 + (rainfallMm / 20.0))
    const isDanger = current >= danger
    const isWarn = current >= warn
    const over = current - (isDanger ? danger : warn)

    return {
      riverNameEn: 'Kabini & Chaliyar River',
      riverNameHi: 'कबिनी एवं चालियार नदी',
      stationName: 'Meppadi Chooralmala AWS',
      currentLevel: parseFloat(current.toFixed(1)),
      warnLevel: warn,
      dangerLevel: danger,
      maxLevel: max,
      unit: 'm',
      status: isDanger ? 'DANGER' : isWarn ? 'WARNING' : 'NORMAL',
      overThresholdTextEn: isDanger ? `+${over.toFixed(1)} m ABOVE DANGER MARK` : isWarn ? `+${over.toFixed(1)} m above warn mark` : 'Normal river flow',
      overThresholdTextHi: isDanger ? `+${over.toFixed(1)} मी. खतरे के निशान से ऊपर` : isWarn ? `+${over.toFixed(1)} मी. चेतावनी स्तर से ऊपर` : 'सामान्य नदी प्रवाह',
      atRiskAreasEn: 'Chooralmala, Mundakkai, Attamala',
      atRiskAreasHi: 'चूरलमाला, मुंडक्कई, अट्टमाला',
      fillPercentage: Math.min(100, Math.max(10, (current / max) * 100)),
    }
  }

  // 4. Uttarakhand / Chamoli / Kedarnath (Alaknanda & Mandakini)
  if (lat >= 29.5 && lat <= 31.5 && lon >= 78.5 && lon <= 80.5) {
    const danger = 538.0
    const warn = 535.0
    const max = 545.0
    const current = Math.min(max, 534.0 + (rainfallMm / 10.0))
    const isDanger = current >= danger
    const isWarn = current >= warn
    const over = current - (isDanger ? danger : warn)

    return {
      riverNameEn: 'Alaknanda River Basin',
      riverNameHi: 'अलकनंदा नदी बेसिन',
      stationName: 'Joshimath Sangam Gauge',
      currentLevel: parseFloat(current.toFixed(1)),
      warnLevel: warn,
      dangerLevel: danger,
      maxLevel: max,
      unit: 'm',
      status: isDanger ? 'DANGER' : isWarn ? 'WARNING' : 'NORMAL',
      overThresholdTextEn: isDanger ? `+${over.toFixed(1)} m ABOVE DANGER MARK` : isWarn ? `+${over.toFixed(1)} m above warn mark` : 'Normal river flow',
      overThresholdTextHi: isDanger ? `+${over.toFixed(1)} मी. खतरे के निशान से ऊपर` : isWarn ? `+${over.toFixed(1)} मी. चेतावनी स्तर से ऊपर` : 'सामान्य नदी प्रवाह',
      atRiskAreasEn: 'Joshimath Lowlands, Pipalkoti, Karnaprayag',
      atRiskAreasHi: 'जोशीमठ निचला क्षेत्र, पीपलकोटी, कर्णप्रयाग',
      fillPercentage: Math.min(100, Math.max(10, (current / max) * 100)),
    }
  }

  // 5. Generic Regional River Fallback across India
  const danger = 45.0
  const warn = 40.0
  const max = 50.0
  const current = Math.min(max, 38.0 + (rainfallMm / 15.0))
  const isDanger = current >= danger
  const isWarn = current >= warn
  const over = current - (isDanger ? danger : warn)

  return {
    riverNameEn: 'Regional River Drainage Basin',
    riverNameHi: 'क्षेत्रीय नदी जल निकासी बेसिन',
    stationName: 'Local Catchment Gauge',
    currentLevel: parseFloat(current.toFixed(1)),
    warnLevel: warn,
    dangerLevel: danger,
    maxLevel: max,
    unit: 'ft',
    status: isDanger ? 'DANGER' : isWarn ? 'WARNING' : 'NORMAL',
    overThresholdTextEn: isDanger ? `+${over.toFixed(1)} ft ABOVE DANGER MARK` : isWarn ? `+${over.toFixed(1)} ft above warn mark` : 'River within safe flow bounds',
    overThresholdTextHi: isDanger ? `+${over.toFixed(1)} फीट खतरे के निशान से ऊपर` : isWarn ? `+${over.toFixed(1)} फीट चेतावनी स्तर से ऊपर` : 'नदी सुरक्षित प्रवाह सीमा में',
    atRiskAreasEn: 'Low-lying riparian settlement zones within 500m',
    atRiskAreasHi: '500 मीटर के भीतर निचले तटीय बस्तियां',
    fillPercentage: Math.min(100, Math.max(10, (current / max) * 100)),
  }
}
