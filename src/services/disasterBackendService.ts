const BACKEND_BASE_URL = (import.meta.env.VITE_BACKEND_URL as string) || 'http://127.0.0.1:8000'

export interface RedZoneFeatureCollection {
  type: 'FeatureCollection'
  metadata: {
    engine: string
    live_rainfall_mm: number
    threshold: number
    total_red_zones: number
  }
  features: any[]
}

export interface SafeParcelsFeatureCollection {
  type: 'FeatureCollection'
  metadata: {
    engine: string
    total_safe_parcels: number
    total_carrying_capacity: number
  }
  features: any[]
}

export interface RelocationOptimizationResponse {
  optimization: {
    status: string
    solver: string
    total_persons_relocated: number
    total_families_relocated: number
    assignments: {
      habitation_id: string
      habitation_name: string
      risk_level: string
      population: number
      families: number
      assigned_safe_site_id: string
      assigned_site_name: string
      relocation_distance_km: number
      priority: string
    }[]
    evacuation_corridors_geojson: {
      type: 'FeatureCollection'
      features: any[]
    }
  }
  safe_parcels: SafeParcelsFeatureCollection
  red_zones: RedZoneFeatureCollection
}

export async function fetchDynamicRedZones(lat: number, lon: number, radiusKm: number = 8.0): Promise<RedZoneFeatureCollection | null> {
  try {
    const res = await fetch(`${BACKEND_BASE_URL}/api/hazard/red-zones?lat=${lat}&lon=${lon}&radius_km=${radiusKm}`)
    if (res.ok) {
      return await res.json()
    }
  } catch (err) {
    console.warn('Backend API connecting fallback:', err)
  }
  return null
}

export async function fetchSafeParcels(lat: number, lon: number, radiusKm: number = 8.0): Promise<SafeParcelsFeatureCollection | null> {
  try {
    const res = await fetch(`${BACKEND_BASE_URL}/api/carrying-capacity/safe-parcels?lat=${lat}&lon=${lon}&radius_km=${radiusKm}`)
    if (res.ok) {
      return await res.json()
    }
  } catch (err) {
    console.warn('Backend API connecting fallback:', err)
  }
  return null
}

export async function fetchRelocationOptimization(lat: number, lon: number, radiusKm: number = 8.0): Promise<RelocationOptimizationResponse | null> {
  try {
    const res = await fetch(`${BACKEND_BASE_URL}/api/relocation/optimize?lat=${lat}&lon=${lon}&radius_km=${radiusKm}`)
    if (res.ok) {
      return await res.json()
    }
  } catch (err) {
    console.warn('Backend API connecting fallback:', err)
  }
  return null
}

export function getCollectorDirectivePdfUrl(lat: number, lon: number, district: string = 'District Disaster Authority'): string {
  return `${BACKEND_BASE_URL}/api/reports/collector-directive-pdf?lat=${lat}&lon=${lon}&district=${encodeURIComponent(district)}`
}
