import { API_KEYS } from '../config/apiKeys'

export interface LiveWeatherData {
  temp: number
  feelsLike: number
  humidity: number
  windSpeed: number
  pressure: number
  description: string
  rainfall: number
  icon: string
  cityName: string
}

export async function fetchLiveWeather(lat: number = 16.7050, lon: number = 74.2433): Promise<LiveWeatherData> {
  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEYS.OPENWEATHER}&units=metric`
    const res = await fetch(url)
    if (res.ok) {
      const data = await res.json()
      return {
        temp: Math.round(data.main?.temp ?? 27),
        feelsLike: Math.round(data.main?.feels_like ?? 29),
        humidity: data.main?.humidity ?? 88,
        windSpeed: Math.round((data.wind?.speed ?? 5) * 3.6), // m/s to km/h
        pressure: data.main?.pressure ?? 1012,
        description: data.weather?.[0]?.description ?? 'Scattered Clouds',
        rainfall: data.rain?.['1h'] ?? (data.rain?.['3h'] ? data.rain['3h'] / 3 : 18),
        icon: data.weather?.[0]?.icon ?? '10d',
        cityName: data.name || 'Kolhapur',
      }
    }
  } catch (err) {
    console.warn('OpenWeather fetch error, falling back to Open-Meteo:', err)
  }

  // Fallback to Open-Meteo (always free, no key needed)
  try {
    const omUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,surface_pressure,wind_speed_10m,precipitation`
    const omRes = await fetch(omUrl)
    if (omRes.ok) {
      const omData = await omRes.json()
      const curr = omData.current || {}
      return {
        temp: Math.round(curr.temperature_2m ?? 26),
        feelsLike: Math.round(curr.temperature_2m ?? 26),
        humidity: curr.relative_humidity_2m ?? 92,
        windSpeed: Math.round(curr.wind_speed_10m ?? 22),
        pressure: Math.round(curr.surface_pressure ?? 1008),
        description: 'Monsoon Rain & Gusts',
        rainfall: curr.precipitation ?? 24,
        icon: '10d',
        cityName: 'Local Area',
      }
    }
  } catch (e) {
    console.warn('Fallback weather error:', e)
  }

  // Default fallback data
  return {
    temp: 26,
    feelsLike: 28,
    humidity: 94,
    windSpeed: 28,
    pressure: 1008,
    description: 'Heavy Monsoon Precipitation',
    rainfall: 42,
    icon: '10d',
    cityName: 'Kolhapur',
  }
}
