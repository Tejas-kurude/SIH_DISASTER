export interface UserLocation {
  lng: number
  lat: number
  accuracy?: number
  cityName?: string
  districtName?: string
  stateName?: string
  isLive: boolean
}

// Default fallback disaster zone coordinate (Pimpri-Chinchwad / Pune, Maharashtra)
export const DEFAULT_LOCATION: UserLocation = {
  lng: 73.7997,
  lat: 18.6298,
  cityName: 'Pimpri-Chinchwad',
  districtName: 'Pune District',
  stateName: 'Maharashtra',
  isLive: false,
}

export function getCurrentUserLocation(): Promise<UserLocation> {
  return new Promise((resolve) => {
    // 1. Check if user manually selected a preset location
    try {
      const stored = localStorage.getItem('user_selected_loc')
      if (stored) {
        const parsed = JSON.parse(stored)
        if (parsed && parsed.lat && parsed.lng) {
          resolve({
            lat: parsed.lat,
            lng: parsed.lng,
            cityName: parsed.cityName || 'Selected City',
            districtName: parsed.cityName || 'Selected District',
            stateName: parsed.stateName || 'Maharashtra',
            isLive: true,
          })
          return
        }
      }
    } catch {}

    // 2. Query Browser Geolocation
    if (!navigator.geolocation) {
      resolve(DEFAULT_LOCATION)
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { longitude, latitude, accuracy } = pos.coords
        let cityName = 'Current Location'
        let districtName = 'GPS Locked'
        let stateName = 'Maharashtra'

        try {
          // Free reverse geocoding via OpenStreetMap Nominatim
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=12&addressdetails=1`,
            { headers: { 'Accept-Language': 'en' } }
          )
          if (res.ok) {
            const data = await res.json()
            const addr = data.address || {}
            cityName = addr.city || addr.town || addr.village || addr.suburb || addr.county || 'Your City'
            districtName = addr.state_district || addr.county || cityName
            stateName = addr.state || 'India'
          }
        } catch {
          // Fallback if network blocked
        }

        resolve({
          lng: longitude,
          lat: latitude,
          accuracy,
          cityName,
          districtName,
          stateName,
          isLive: true,
        })
      },
      () => {
        resolve(DEFAULT_LOCATION)
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 10000 }
    )
  })
}
