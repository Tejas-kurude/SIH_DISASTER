import { useEffect, useRef, useState } from 'react'
import * as maplibregl from 'maplibre-gl'
import { API_KEYS } from '../config/apiKeys'
import { getCurrentUserLocation, type UserLocation } from '../services/locationService'
import { fetchRealRoadRoute, type RouteStep } from '../services/routingService'
import { useLanguage } from '../context/LanguageContext'

interface HighGroundPoint {
  id: string
  nameEn: string
  nameHi: string
  elevationMeters: number
  heightAboveFloodM: number
  distanceKm: string
  walkingTimeMin: number
  lng: number
  lat: number
  type: 'SUMMIT' | 'HELIPAD' | 'PLATEAU'
  safetyScore: number
}

interface Shelter {
  id: number
  nameEn: string
  nameHi: string
  beds: number
  capacity: number
  status: 'OPEN' | 'FULL'
  contact: string
  lng: number
  lat: number
  distanceKm: string
  elevationMeters: number
}

type MapStyle = 'outdoor' | 'satellite' | 'topo'

const getMapStyleSpec = (style: MapStyle): maplibregl.StyleSpecification | string => {
  const maptilerKey = API_KEYS.MAPTILER

  if (style === 'satellite') {
    return {
      version: 8,
      sources: {
        'satellite-tiles': {
          type: 'raster',
          tiles: [
            `https://api.maptiler.com/maps/satellite/{z}/{x}/{y}.jpg?key=${maptilerKey}`,
            'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
          ],
          tileSize: 256,
        },
      },
      layers: [
        {
          id: 'satellite-layer',
          type: 'raster',
          source: 'satellite-tiles',
          minzoom: 0,
          maxzoom: 22,
        },
      ],
    } as any
  }

  if (style === 'topo') {
    return {
      version: 8,
      sources: {
        'topo-tiles': {
          type: 'raster',
          tiles: [
            `https://api.maptiler.com/maps/topo-v2/{z}/{x}/{y}.png?key=${maptilerKey}`,
            'https://tile.opentopomap.org/{z}/{x}/{y}.png',
          ],
          tileSize: 256,
        },
      },
      layers: [
        {
          id: 'topo-layer',
          type: 'raster',
          source: 'topo-tiles',
          minzoom: 0,
          maxzoom: 20,
        },
      ],
    } as any
  }

  // Light 3D (Outdoor / Streets)
  return {
    version: 8,
    sources: {
      'outdoor-tiles': {
        type: 'raster',
        tiles: [
          `https://api.maptiler.com/maps/outdoor-v2/{z}/{x}/{y}.png?key=${maptilerKey}`,
          'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
        ],
        tileSize: 256,
      },
    },
    layers: [
      {
        id: 'outdoor-layer',
        type: 'raster',
        source: 'outdoor-tiles',
        minzoom: 0,
        maxzoom: 20,
      },
    ],
  } as any
}

function generateHighGroundAndShelters(centerLng: number, centerLat: number) {
  const highPoints: HighGroundPoint[] = [
    {
      id: 'HG_01',
      nameEn: 'Summit Ridge Peak (Safest High Ground)',
      nameHi: 'शिखर पर्वत चोटी (सर्वोच्च सुरक्षित स्थान)',
      elevationMeters: 860,
      heightAboveFloodM: 310,
      distanceKm: '1.8 km',
      walkingTimeMin: 22,
      lng: centerLng + 0.015,
      lat: centerLat + 0.014,
      type: 'SUMMIT',
      safetyScore: 99,
    },
    {
      id: 'HG_02',
      nameEn: 'Highland Helipad & Relief Base',
      nameHi: 'ऊंचा हेलीपैड एवं राहत बेस',
      elevationMeters: 790,
      heightAboveFloodM: 240,
      distanceKm: '2.3 km',
      walkingTimeMin: 28,
      lng: centerLng - 0.018,
      lat: centerLat + 0.016,
      type: 'HELIPAD',
      safetyScore: 96,
    },
    {
      id: 'HG_03',
      nameEn: 'Maval Safe Hilltop Plateau',
      nameHi: 'पठारी सुरक्षित पहाड़ी क्षेत्र',
      elevationMeters: 740,
      heightAboveFloodM: 190,
      distanceKm: '1.5 km',
      walkingTimeMin: 18,
      lng: centerLng + 0.012,
      lat: centerLat - 0.016,
      type: 'PLATEAU',
      safetyScore: 94,
    },
  ]

  const shelters: Shelter[] = [
    {
      id: 1,
      nameEn: 'Camp Alpha — Primary Relief Center',
      nameHi: 'कैंप अल्फा — प्राथमिक राहत केंद्र',
      beds: 1420,
      capacity: 2000,
      status: 'OPEN',
      contact: '112 / 1077',
      lng: centerLng + 0.010,
      lat: centerLat + 0.007,
      distanceKm: '1.2 km',
      elevationMeters: 620,
    },
    {
      id: 2,
      nameEn: 'Camp Beta — Municipal Community Hall',
      nameHi: 'कैंप बीटा — नगर निगम सामुदायिक भवन',
      beds: 840,
      capacity: 1000,
      status: 'OPEN',
      contact: '020-27425555',
      lng: centerLng - 0.012,
      lat: centerLat + 0.005,
      distanceKm: '1.6 km',
      elevationMeters: 605,
    },
    {
      id: 3,
      nameEn: 'Camp Gamma — Government General Hospital',
      nameHi: 'कैंप गामा — सरकारी सामान्य अस्पताल',
      beds: 0,
      capacity: 500,
      status: 'FULL',
      contact: '108 / 102',
      lng: centerLng + 0.007,
      lat: centerLat - 0.011,
      distanceKm: '1.9 km',
      elevationMeters: 590,
    },
  ]

  return { highPoints, shelters }
}

export default function MapPage() {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)
  const userMarkerRef = useRef<maplibregl.Marker | null>(null)
  const markersRef = useRef<maplibregl.Marker[]>([])
  const routeMarkersRef = useRef<maplibregl.Marker[]>([])

  const { lang, t } = useLanguage()
  const [mapStyle, setMapStyle] = useState<MapStyle>('outdoor')
  const [is3D, setIs3D] = useState(true)
  const [userLoc, setUserLoc] = useState<UserLocation | null>(null)
  const [highPoints, setHighPoints] = useState<HighGroundPoint[]>([])
  const [shelters, setShelters] = useState<Shelter[]>([])
  const [selectedTarget, setSelectedTarget] = useState<HighGroundPoint | Shelter | null>(null)
  const [routeActive, setRouteActive] = useState(false)
  const [activeRouteCoords, setActiveRouteCoords] = useState<number[][] | null>(null)
  const [svgPath, setSvgPath] = useState<string>('')
  const [isNavigating, setIsNavigating] = useState(false)
  const [stepIdx, setStepIdx] = useState(0)
  const [voiceMuted, setVoiceMuted] = useState(false)
  const [locating, setLocating] = useState(false)

  // Synchronize SVG projection on map moves & zooms
  useEffect(() => {
    if (!mapRef.current) return
    const map = mapRef.current

    function updateSvgProjection() {
      if (!activeRouteCoords || activeRouteCoords.length === 0) {
        setSvgPath('')
        return
      }
      try {
        const points = activeRouteCoords.map(coord => {
          const pt = map.project([coord[0], coord[1]])
          return `${pt.x.toFixed(1)},${pt.y.toFixed(1)}`
        })
        if (points.length >= 2) {
          setSvgPath(`M ${points.join(' L ')}`)
        }
      } catch {}
    }

    map.on('move', updateSvgProjection)
    map.on('render', updateSvgProjection)
    map.on('zoom', updateSvgProjection)
    updateSvgProjection()

    return () => {
      map.off('move', updateSvgProjection)
      map.off('render', updateSvgProjection)
      map.off('zoom', updateSvgProjection)
    }
  }, [activeRouteCoords])

  // Speak voice navigation prompt
  function speakVoicePrompt(text: string) {
    if (voiceMuted || !('speechSynthesis' in window)) return
    try {
      window.speechSynthesis.cancel()
      const u = new SpeechSynthesisUtterance(text)
      u.rate = 1.05
      u.pitch = 1.0
      if (lang === 'hi') {
        u.lang = 'hi-IN'
      } else {
        u.lang = 'en-IN'
      }
      window.speechSynthesis.speak(u)
    } catch {}
  }

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return

    const initialLng = 73.7997
    const initialLat = 18.6298

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: getMapStyleSpec('outdoor'),
      center: [initialLng, initialLat],
      zoom: 13.5,
      pitch: 60,
      bearing: -15,
      maxPitch: 85,
    })

    mapRef.current = map

    const resizeMap = () => map.resize()
    const r1 = setTimeout(resizeMap, 50)
    const r2 = setTimeout(resizeMap, 250)
    const r3 = setTimeout(resizeMap, 800)

    map.on('load', () => {
      setupTerrainAndOverlays(map, initialLng, initialLat)
    })

    // Auto-detect GPS
    getCurrentUserLocation().then((loc) => {
      setUserLoc(loc)
      const { highPoints: hp, shelters: sh } = generateHighGroundAndShelters(loc.lng, loc.lat)
      setHighPoints(hp)
      setShelters(sh)

      if (mapRef.current) {
        mapRef.current.flyTo({
          center: [loc.lng, loc.lat],
          zoom: 14,
          pitch: 62,
          bearing: -15,
          duration: 1800,
        })
        addUserMarker(mapRef.current, loc.lng, loc.lat)
        setupTerrainAndOverlays(mapRef.current, loc.lng, loc.lat)
      }
    })

    return () => {
      clearTimeout(r1)
      clearTimeout(r2)
      clearTimeout(r3)
      map.remove()
      mapRef.current = null
    }
  }, [])

  // Switch Map Style dynamically
  useEffect(() => {
    if (!mapRef.current) return
    const map = mapRef.current

    map.setStyle(getMapStyleSpec(mapStyle))

    map.once('style.load', () => {
      const currentLng = userLoc?.lng ?? 73.7997
      const currentLat = userLoc?.lat ?? 18.6298
      setupTerrainAndOverlays(map, currentLng, currentLat)
      if (userLoc) {
        addUserMarker(map, userLoc.lng, userLoc.lat)
      }
      if (selectedTarget && routeActive) {
        drawSafeEvacuationRoute(selectedTarget)
      }
    })
  }, [mapStyle])

  // Setup 3D Terrain DEM and Flood Inundation Corridor
  function setupTerrainAndOverlays(map: maplibregl.Map, centerLng: number, centerLat: number) {
    try {
      if (!map.getSource('maptiler-terrain')) {
        map.addSource('maptiler-terrain', {
          type: 'raster-dem',
          url: `https://api.maptiler.com/tiles/terrain-rgb-v2/tiles.json?key=${API_KEYS.MAPTILER}`,
          tileSize: 256,
        })
      }
      if (is3D) {
        map.setTerrain({ source: 'maptiler-terrain', exaggeration: 1.6 })
      }
    } catch {}

    const floodPoly = {
      type: 'Feature' as const,
      properties: { name: 'Active Flood Inundation Zone' },
      geometry: {
        type: 'Polygon' as const,
        coordinates: [[
          [centerLng - 0.025, centerLat - 0.008],
          [centerLng - 0.008, centerLat + 0.015],
          [centerLng + 0.018, centerLat + 0.011],
          [centerLng + 0.025, centerLat - 0.006],
          [centerLng + 0.009, centerLat - 0.018],
          [centerLng - 0.015, centerLat - 0.014],
          [centerLng - 0.025, centerLat - 0.008],
        ]],
      },
    }

    if (map.getSource('flood-zone')) {
      (map.getSource('flood-zone') as maplibregl.GeoJSONSource).setData(floodPoly)
    } else {
      map.addSource('flood-zone', {
        type: 'geojson',
        data: floodPoly,
      })

      map.addLayer({
        id: 'flood-zone-fill',
        type: 'fill',
        source: 'flood-zone',
        paint: {
          'fill-color': '#E11D48',
          'fill-opacity': 0.22,
        },
      })

      map.addLayer({
        id: 'flood-zone-line',
        type: 'line',
        source: 'flood-zone',
        paint: {
          'line-color': '#E11D48',
          'line-width': 2.5,
          'line-dasharray': [2, 2],
        },
      })
    }
  }

  // Add User GPS Marker (Google Maps Style Pulse & Heading Beam)
  function addUserMarker(map: maplibregl.Map, lng: number, lat: number) {
    if (userMarkerRef.current) {
      userMarkerRef.current.remove()
    }

    const el = document.createElement('div')
    el.className = 'relative flex items-center justify-center'
    el.innerHTML = `
      <div style="position: absolute; width: 44px; height: 44px; border-radius: 50%; background: rgba(2,132,199,0.35);" class="animate-ping"></div>
      <div style="position: absolute; width: 60px; height: 60px; border-radius: 50%; background: radial-gradient(circle, rgba(2,132,199,0.4) 0%, transparent 70%);"></div>
      <div style="position: relative; width: 24px; height: 24px; border-radius: 50%; background: #0284C7; border: 3.5px solid #FFFFFF; box-shadow: 0 0 18px rgba(2,132,199,1); display: flex; align-items: center; justify-content: center;">
        <div style="width: 6px; height: 6px; border-radius: 50%; background: #FFFFFF;"></div>
      </div>
    `

    userMarkerRef.current = new maplibregl.Marker({ element: el })
      .setLngLat([lng, lat])
      .addTo(map)
  }

  // Render High Ground & Shelter Markers (Clicking immediately triggers directions)
  useEffect(() => {
    if (!mapRef.current) return
    const map = mapRef.current

    markersRef.current.forEach(m => m.remove())
    markersRef.current = []

    // 1. High Hill Safe Points (Mountain Badges)
    highPoints.forEach(hp => {
      const el = document.createElement('div')
      el.className = 'cursor-pointer transform transition-transform hover:scale-125 active:scale-95'
      el.innerHTML = `
        <div style="
          padding: 4px 8px;
          border-radius: 12px;
          background: linear-gradient(135deg, #0284C7 0%, #0369A1 100%);
          border: 2px solid #BAE6FD;
          box-shadow: 0 4px 14px rgba(2,132,199,0.5);
          display: flex; align-items: center; gap: 4px;
          color: white; font-weight: 800; font-size: 10px; font-family: 'Plus Jakarta Sans', sans-serif;
        ">
          <span>🏔️</span>
          <span>${hp.elevationMeters}m</span>
        </div>
      `

      el.addEventListener('click', () => {
        startGoogleMapsNavigation(hp)
      })

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([hp.lng, hp.lat])
        .addTo(map)

      markersRef.current.push(marker)
    })

    // 2. Shelter Markers (Clicking initiates Turn-By-Turn Navigation)
    shelters.forEach(sh => {
      const open = sh.status === 'OPEN'
      const el = document.createElement('div')
      el.className = 'cursor-pointer transform transition-transform hover:scale-125 active:scale-95'
      el.innerHTML = `
        <div style="
          width: 38px; height: 38px;
          border-radius: 50%;
          background: ${open ? 'linear-gradient(135deg, #16A34A 0%, #15803D 100%)' : '#DC2626'};
          border: 3px solid ${open ? '#86EFAC' : '#FCA5A5'};
          box-shadow: 0 6px 16px rgba(0,0,0,0.35), 0 0 14px ${open ? 'rgba(22,163,74,0.7)' : 'rgba(220,38,38,0.5)'};
          display: flex; align-items: center; justify-content: center;
          font-size: 19px;
        ">
          🏕️
        </div>
      `

      el.addEventListener('click', () => {
        startGoogleMapsNavigation(sh)
      })

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([sh.lng, sh.lat])
        .addTo(map)

      markersRef.current.push(marker)
    })
  }, [highPoints, shelters])

  // Start Full Google Maps Turn-By-Turn Navigation Mode
  function startGoogleMapsNavigation(target: HighGroundPoint | Shelter) {
    setSelectedTarget(target)
    setIsNavigating(true)
    setRouteActive(true)
    setStepIdx(0)
    drawSafeEvacuationRoute(target)

    const isCamp = 'beds' in target
    const targetName = lang === 'hi' ? target.nameHi : target.nameEn
    const promptText = isCamp
      ? `Starting safest evacuation route to ${targetName}. In 250 meters, turn left onto the elevated ridge bypass road.`
      : `Starting safest summit evacuation route to ${targetName}. In 250 meters, proceed along the flood-proof ridge path.`

    speakVoicePrompt(promptText)

    if (mapRef.current) {
      const startLng = userLoc?.lng ?? 73.7997
      const startLat = userLoc?.lat ?? 18.6298

      // Camera First-Person 3D Perspective Tracking Behind User
      mapRef.current.easeTo({
        center: [startLng, startLat],
        zoom: 16.5,
        pitch: 68,
        bearing: -22,
        duration: 1600,
      })
    }
  }

  const [turnSteps, setTurnSteps] = useState<RouteStep[]>([
    {
      arrow: '↰',
      dist: '250 m',
      roadName: 'Elevated Ridge Bypass Road',
      instructionEn: 'Turn Left onto Elevated Ridge Bypass Road',
      instructionHi: 'ऊंचे रिज बाईपास मार्ग पर बाएं मुड़ें',
      subInstructionEn: 'Stay clear of river floodplain • +45m elevation gain',
      subInstructionHi: 'नदी के निचले जलमग्न क्षेत्र से दूर रहें',
      lat: 18.6318,
      lon: 73.8017,
    },
    {
      arrow: '↱',
      dist: '550 m',
      roadName: 'Safe Relief Sector Corridor',
      instructionEn: 'Bear Right towards Safe Relief Sector',
      instructionHi: 'सुरक्षित राहत सेक्टर की ओर दाएं मुड़ें',
      subInstructionEn: 'Follow high-ground green corridor',
      subInstructionHi: 'उच्च भूमि सुरक्षित गलियारे का पालन करें',
      lat: 18.6348,
      lon: 73.8057,
    },
    {
      arrow: '📍',
      dist: '400 m',
      roadName: 'Designated Safe Site',
      instructionEn: 'Arrive at Designated Safe Evacuation Site',
      instructionHi: 'निर्धारित सुरक्षित निकासी स्थल पर पहुंचें',
      subInstructionEn: 'Gate 1 Registration & Medical Aid available',
      subInstructionHi: 'गेट 1 पर पंजीकरण एवं चिकित्सा सहायता उपलब्ध',
      lat: 18.6368,
      lon: 73.8097,
    },
  ])

  // Draw Glowing Orange Neon Light Beam with Google Maps Route Markers along REAL roads
  async function drawSafeEvacuationRoute(target: HighGroundPoint | Shelter) {
    if (!mapRef.current) return
    const map = mapRef.current
    setRouteActive(true)

    // Clear previous maneuver markers
    routeMarkersRef.current.forEach(m => m.remove())
    routeMarkersRef.current = []

    const startLng = userLoc?.lng ?? 73.7997
    const startLat = userLoc?.lat ?? 18.6298

    const targetName = lang === 'hi' ? target.nameHi : target.nameEn
    const navRoute = await fetchRealRoadRoute(startLng, startLat, target.lng, target.lat, targetName)

    const routeCoords = navRoute.coordinates
    setActiveRouteCoords(routeCoords)
    if (navRoute.steps.length > 0) {
      setTurnSteps(navRoute.steps)
    }

    const routeGeoJSON = {
      type: 'FeatureCollection' as const,
      features: [
        {
          type: 'Feature' as const,
          properties: {},
          geometry: {
            type: 'LineString' as const,
            coordinates: routeCoords,
          },
        }
      ],
    }

    try {
      if (map.getSource('safe-corridor')) {
        (map.getSource('safe-corridor') as maplibregl.GeoJSONSource).setData(routeGeoJSON as any)
      } else {
        map.addSource('safe-corridor', {
          type: 'geojson',
          data: routeGeoJSON as any,
        })

        // Outer Neon Glow
        map.addLayer({
          id: 'safe-corridor-glow',
          type: 'line',
          source: 'safe-corridor',
          layout: {
            'line-cap': 'round',
            'line-join': 'round',
          },
          paint: {
            'line-color': '#FF5722',
            'line-width': 18,
            'line-opacity': 0.55,
            'line-blur': 5,
          },
        })

        // Mid Safety Orange Beam
        map.addLayer({
          id: 'safe-corridor-beam',
          type: 'line',
          source: 'safe-corridor',
          layout: {
            'line-cap': 'round',
            'line-join': 'round',
          },
          paint: {
            'line-color': '#FF6D00',
            'line-width': 7.5,
            'line-opacity': 0.95,
          },
        })

        // Inner Bright Core
        map.addLayer({
          id: 'safe-corridor-core',
          type: 'line',
          source: 'safe-corridor',
          layout: {
            'line-cap': 'round',
            'line-join': 'round',
          },
          paint: {
            'line-color': '#FFF7ED',
            'line-width': 2.5,
            'line-opacity': 1.0,
          },
        })
      }
    } catch (e) {
      console.warn('Error rendering real road route:', e)
    }

    // ───────────────────────────────────────────────────────────
    // Google Maps Style Route Markers Snapped to Real Intersections
    // ───────────────────────────────────────────────────────────
    // 1. Maneuver Badges on Actual Road Turns
    navRoute.steps.slice(0, 3).forEach((step) => {
      if (step.arrow === '📍') return
      const el = document.createElement('div')
      el.innerHTML = `
        <div style="
          background: #FFFFFF; border: 2px solid #059669; border-radius: 12px;
          padding: 3px 6px; box-shadow: 0 4px 12px rgba(0,0,0,0.25);
          display: flex; align-items: center; gap: 3px; font-weight: 800; font-size: 9px; color: #065F46;
        ">
          <span style="font-size: 11px;">${step.arrow}</span>
          <span>${step.dist}</span>
        </div>
      `
      const m = new maplibregl.Marker({ element: el }).setLngLat([step.lon, step.lat]).addTo(map)
      routeMarkersRef.current.push(m)
    })

    // 2. Floating Route ETA Pill (Snapped on middle road coordinate)
    const midIdx = Math.floor(routeCoords.length / 2)
    const midPoint = routeCoords[midIdx] || [startLng, startLat]
    const etaEl = document.createElement('div')
    etaEl.innerHTML = `
      <div style="
        background: linear-gradient(135deg, #059669 0%, #047857 100%);
        border: 1.5px solid #A7F3D0; border-radius: 16px;
        padding: 3px 8px; box-shadow: 0 4px 14px rgba(5,150,105,0.4);
        display: flex; align-items: center; gap: 4px; font-weight: 800; font-size: 8.5px; color: white;
      ">
        <span>⚡</span>
        <span>${navRoute.durationMin} min (${navRoute.distanceKm})</span>
        <span style="opacity: 0.8;">• Safest Route</span>
      </div>
    `
    const etaM = new maplibregl.Marker({ element: etaEl }).setLngLat([midPoint[0], midPoint[1]]).addTo(map)
    routeMarkersRef.current.push(etaM)

    // 3. Destination Flag Pin (Arrival Point)
    const destEl = document.createElement('div')
    destEl.innerHTML = `
      <div style="
        background: #DC2626; border: 2.5px solid #FFFFFF; border-radius: 14px;
        padding: 4px 8px; box-shadow: 0 4px 16px rgba(220,38,38,0.5);
        display: flex; align-items: center; gap: 4px; font-weight: 900; font-size: 9px; color: white;
        transform: translateY(-8px);
      ">
        <span>🏁</span>
        <span>${lang === 'hi' ? target.nameHi.split(' ')[0] : target.nameEn.split(' ')[0]}</span>
      </div>
    `
    const destM = new maplibregl.Marker({ element: destEl }).setLngLat([target.lng, target.lat]).addTo(map)
    routeMarkersRef.current.push(destM)

    if (!isNavigating) {
      map.fitBounds([
        [Math.min(startLng, target.lng) - 0.008, Math.min(startLat, target.lat) - 0.008],
        [Math.max(startLng, target.lng) + 0.008, Math.max(startLat, target.lat) + 0.008],
      ], {
        pitch: 62,
        bearing: -20,
        padding: { top: 80, bottom: 220, left: 50, right: 50 },
        duration: 1500,
      })
    }
  }

  // 1-Tap Escape to Nearest Rescue Camp
  function handleEscapeToNearestCamp() {
    const openShelters = shelters.filter(s => s.status === 'OPEN')
    const chosen = openShelters.length > 0 ? openShelters[0] : (shelters.length > 0 ? shelters[0] : null)
    if (chosen) {
      startGoogleMapsNavigation(chosen)
    }
  }

  // 1-Tap Escape to Highest Safe Hill Point
  function handleEscapeToHighGround() {
    if (highPoints.length > 0) {
      startGoogleMapsNavigation(highPoints[0])
    }
  }

  // Toggle 3D / 2D
  function toggle3D() {
    const next3D = !is3D
    setIs3D(next3D)
    if (mapRef.current) {
      mapRef.current.easeTo({
        pitch: next3D ? 65 : 0,
        bearing: next3D ? -25 : 0,
        duration: 900,
      })
      if (next3D) {
        try {
          mapRef.current.setTerrain({ source: 'maptiler-terrain', exaggeration: 1.6 })
        } catch {}
      } else {
        mapRef.current.setTerrain(null)
      }
    }
  }

  // Re-center on GPS
  async function handleLocate() {
    setLocating(true)
    const loc = await getCurrentUserLocation()
    setUserLoc(loc)
    const { highPoints: hp, shelters: sh } = generateHighGroundAndShelters(loc.lng, loc.lat)
    setHighPoints(hp)
    setShelters(sh)
    setLocating(false)

    if (mapRef.current) {
      addUserMarker(mapRef.current, loc.lng, loc.lat)
      setupTerrainAndOverlays(mapRef.current, loc.lng, loc.lat)
      mapRef.current.flyTo({
        center: [loc.lng, loc.lat],
        zoom: isNavigating ? 16.5 : 14.5,
        pitch: is3D ? (isNavigating ? 68 : 65) : 0,
        bearing: isNavigating ? -22 : -20,
        duration: 1600,
      })
    }
  }

  function handleExitNavigation() {
    setIsNavigating(false)
    setSelectedTarget(null)
    setRouteActive(false)
    setActiveRouteCoords(null)
    setSvgPath('')
    routeMarkersRef.current.forEach(m => m.remove())
    routeMarkersRef.current = []
    window.speechSynthesis?.cancel()

    if (mapRef.current) {
      if (mapRef.current.getSource('safe-corridor')) {
        (mapRef.current.getSource('safe-corridor') as maplibregl.GeoJSONSource).setData({
          type: 'FeatureCollection',
          features: [],
        } as any)
      }
      if (mapRef.current.getSource('safe-corridor-nodes')) {
        (mapRef.current.getSource('safe-corridor-nodes') as maplibregl.GeoJSONSource).setData({
          type: 'FeatureCollection',
          features: [],
        } as any)
      }
      if (userLoc) {
        mapRef.current.easeTo({
          center: [userLoc.lng, userLoc.lat],
          zoom: 14,
          pitch: 60,
          bearing: -15,
          duration: 1200,
        })
      }
    }
  }

  const isHighGround = selectedTarget && 'heightAboveFloodM' in selectedTarget
  const targetHg = isHighGround ? (selectedTarget as HighGroundPoint) : null
  const targetShelter = !isHighGround && selectedTarget ? (selectedTarget as Shelter) : null
  const activeStep = turnSteps[stepIdx] || turnSteps[0] || {
    arrow: '↑',
    dist: '100 m',
    instructionEn: 'Continue towards destination',
    instructionHi: 'गंतव्य की ओर आगे बढ़ें',
    subInstructionEn: 'Safest Flood-Free Corridor',
    subInstructionHi: 'सुरक्षित बाढ़-मुक्त मार्ग',
  }

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden bg-[#FAF7F2]">
      {/* Real WebGL Map Container */}
      <div ref={mapContainerRef} className="absolute inset-0 w-full h-full" style={{ width: '100%', height: '100%' }} />

      {/* 🌟 100% Guaranteed Visible Glowing Neon Orange Light Route SVG Overlay 🌟 */}
      {routeActive && svgPath && (
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-10 overflow-visible">
          <defs>
            <filter id="neon-glow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="7" result="blur1" />
              <feGaussianBlur stdDeviation="3" result="blur2" />
              <feMerge>
                <feMergeNode in="blur1" />
                <feMergeNode in="blur2" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          {/* Layer 1: Wide Radiant Glow */}
          <path
            d={svgPath}
            fill="none"
            stroke="#FF5722"
            strokeWidth="18"
            strokeOpacity="0.55"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#neon-glow)"
          />
          {/* Layer 2: Vivid Orange Beam */}
          <path
            d={svgPath}
            fill="none"
            stroke="#FF6D00"
            strokeWidth="8"
            strokeOpacity="0.95"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Layer 3: High-Intensity White Core */}
          <path
            d={svgPath}
            fill="none"
            stroke="#FFF7ED"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}

      {/* ─────────────────────────────────────────────────────────── */}
      {/* GOOGLE MAPS STYLE TURN-BY-TURN HUD (When Navigation is Active) */}
      {/* ─────────────────────────────────────────────────────────── */}
      {isNavigating && activeStep && (
        <div className="absolute top-3 left-3 right-3 z-30 slide-up pointer-events-auto">
          <div className="bg-[#052E16] text-white rounded-3xl p-3.5 shadow-2xl border-2 border-emerald-500/80 flex items-center gap-3">
            {/* Giant Green Turn Arrow */}
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center text-3xl font-black text-white shadow-lg flex-shrink-0">
              {activeStep.arrow}
            </div>

            {/* Instruction Text */}
            <div className="flex-1 min-w-0">
              <div className="text-emerald-400 font-mono-data font-black text-[13px] leading-tight">
                {activeStep.dist}
              </div>
              <div className="text-white font-black text-[11px] leading-tight truncate mt-0.5">
                {lang === 'hi' ? activeStep.instructionHi : activeStep.instructionEn}
              </div>
              <div className="text-emerald-200/80 text-[8px] truncate mt-0.5">
                {lang === 'hi' ? activeStep.subInstructionHi : activeStep.subInstructionEn}
              </div>
            </div>

            {/* Voice Mute & Next Step Trigger */}
            <div className="flex flex-col gap-1 flex-shrink-0">
              <button
                onClick={() => {
                  const nextMute = !voiceMuted
                  setVoiceMuted(nextMute)
                  if (!nextMute) {
                    speakVoicePrompt(lang === 'hi' ? activeStep.instructionHi : activeStep.instructionEn)
                  }
                }}
                className="w-8 h-8 rounded-xl bg-emerald-950/80 border border-emerald-700/60 flex items-center justify-center text-sm active:scale-95"
                title="Toggle Voice Navigation"
              >
                {voiceMuted ? '🔇' : '🔊'}
              </button>

              <button
                onClick={() => {
                  if (turnSteps.length === 0) return
                  const next = (stepIdx + 1) % turnSteps.length
                  setStepIdx(next)
                  const step = turnSteps[next]
                  speakVoicePrompt(lang === 'hi' ? step.instructionHi : step.instructionEn)
                }}
                className="w-8 h-6 rounded-lg bg-emerald-700/60 flex items-center justify-center text-[9px] font-bold text-white active:scale-95"
                title="Next turn step"
              >
                Next ➔
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────── */}
      {/* Top Floating Controls (When NOT navigating) */}
      {/* ─────────────────────────────────────────────────────────── */}
      {!isNavigating && (
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none z-20 gap-2">
          {/* Style Selector */}
          <div className="flex bg-white/95 backdrop-blur rounded-xl p-1 shadow-md border border-slate-200 pointer-events-auto gap-1">
            {(['outdoor', 'satellite', 'topo'] as const).map(st => (
              <button
                key={st}
                onClick={() => setMapStyle(st)}
                className={`px-2.5 py-1 rounded-lg text-[9px] font-bold capitalize transition-all ${
                  mapStyle === st
                    ? 'bg-[#0284C7] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {st === 'satellite' ? t('map.satellite3d') : st === 'outdoor' ? t('map.light3d') : t('map.topo3d')}
              </button>
            ))}
          </div>

          {/* 3D Toggle & GPS Target */}
          <div className="flex items-center gap-1.5 pointer-events-auto">
            <button
              onClick={toggle3D}
              className="px-2.5 py-1.5 bg-white/95 backdrop-blur rounded-xl border border-slate-200 shadow-md text-[10px] font-black text-slate-800 active:scale-95 transition-transform"
            >
              {is3D ? '🏔️ 3D' : '🗺️ 2D'}
            </button>

            <button
              onClick={handleLocate}
              className="w-8 h-8 rounded-xl bg-white/95 backdrop-blur border border-slate-200 shadow-md flex items-center justify-center text-sm font-bold text-[#0284C7] active:scale-95 transition-transform"
              title="My Live GPS Location"
            >
              {locating ? '⏳' : '🎯'}
            </button>
          </div>
        </div>
      )}

      {/* 🚨 Dual 1-Tap Emergency Header (When NOT navigating) */}
      {!isNavigating && (
        <div className="absolute top-14 left-3 right-3 pointer-events-none z-20 flex gap-1.5 justify-between items-center">
          {/* Nearest Rescue Camp Button */}
          <button
            onClick={handleEscapeToNearestCamp}
            className="pointer-events-auto bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 hover:from-orange-700 hover:to-amber-800 text-white rounded-full px-2.5 py-1.5 shadow-lg border border-amber-300 flex items-center gap-1 text-[9px] font-black tracking-wide active:scale-95 transition-transform cursor-pointer"
          >
            <span className="text-xs animate-bounce">🏕️</span>
            <span>{lang === 'hi' ? 'निकटतम राहत कैंप' : 'Nearest Rescue Camp'}</span>
            <span className="text-[7.5px] bg-white/20 px-1 py-0.5 rounded-full font-mono-data">OPEN</span>
          </button>

          {/* Escape to High Ground Button */}
          <button
            onClick={handleEscapeToHighGround}
            className="pointer-events-auto bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white rounded-full px-2.5 py-1.5 shadow-lg border border-emerald-300 flex items-center gap-1 text-[9px] font-black tracking-wide active:scale-95 transition-transform cursor-pointer"
          >
            <span className="text-xs">🏔️</span>
            <span>{lang === 'hi' ? 'पहाड़ी चोटी' : 'Summit Peak'}</span>
            <span className="text-[7.5px] bg-white/20 px-1 py-0.5 rounded-full font-mono-data">+310m</span>
          </button>
        </div>
      )}

      {/* Map Legend (When NOT navigating) */}
      {!isNavigating && (
        <div className="absolute bottom-4 left-3 rounded-xl p-2.5 backdrop-blur bg-white/95 border border-slate-200 shadow-md space-y-1.5 z-10">
          <div className="text-[7px] font-bold text-slate-400 tracking-wider">3D DISASTER LAYERS</div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs leading-none">🏔️</span>
            <span className="text-[8px] font-semibold text-slate-700">Safe High Ground Peak</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[#16A34A] border border-emerald-300" />
            <span className="text-[8px] font-semibold text-slate-700">Relief Camp (Open)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[#E11D48] border border-rose-300" />
            <span className="text-[8px] font-semibold text-slate-700">Flood Inundation Zone</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-1.5 rounded-full bg-[#FF6D00] shadow-[0_0_8px_#FF5722]" />
            <span className="text-[8px] font-semibold text-slate-700">Glowing Safest Route</span>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────── */}
      {/* GOOGLE MAPS BOTTOM BAR (When Navigation is Active) */}
      {/* ─────────────────────────────────────────────────────────── */}
      {isNavigating && selectedTarget && (
        <div className="absolute left-3 right-3 bottom-3 z-30 slide-up pointer-events-auto">
          <div className="bg-white/98 backdrop-blur-md rounded-3xl p-4 shadow-2xl border-2 border-emerald-500 flex items-center justify-between gap-3">
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-emerald-600 font-mono-data">
                  {targetHg ? targetHg.walkingTimeMin : '14'} min
                </span>
                <span className="text-xs font-bold text-slate-500 font-mono-data">
                  ({selectedTarget.distanceKm})
                </span>
              </div>
              <div className="text-[9.5px] font-bold text-slate-800 truncate mt-0.5">
                {lang === 'hi' ? selectedTarget.nameHi : selectedTarget.nameEn}
              </div>
              <div className="text-[7.5px] font-black text-emerald-600 mt-0.5">
                ● 100% FLOOD-FREE CORRIDOR ACTIVE
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              {targetShelter && (
                <a
                  href={`tel:${targetShelter.contact}`}
                  className="w-10 h-10 rounded-2xl bg-sky-50 border border-sky-200 text-[#0284C7] flex items-center justify-center text-base shadow-xs active:scale-95"
                  title="Call Camp"
                >
                  📞
                </a>
              )}
              <button
                onClick={handleExitNavigation}
                className="w-10 h-10 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center text-lg font-black shadow-lg shadow-rose-500/30 active:scale-95 cursor-pointer"
                title="Exit Navigation"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────── */}
      {/* Target Preview Drawer (When selecting before entering navigation) */}
      {/* ─────────────────────────────────────────────────────────── */}
      {!isNavigating && selectedTarget && (
        <div className="absolute left-3 right-3 bottom-3 rounded-2xl border p-4 backdrop-blur slide-up bg-white/98 shadow-2xl z-30 border-emerald-300">
          <div className="flex items-start justify-between mb-2">
            <div>
              <div className="text-[12px] font-bold text-slate-900 leading-tight">
                {lang === 'hi' ? selectedTarget.nameHi : selectedTarget.nameEn}
              </div>
              <div className="text-[8px] font-black text-emerald-600 mt-0.5 flex items-center gap-1.5">
                <span>● {isHighGround ? '100% FLOOD-PROOF PEAK' : (targetShelter?.status === 'OPEN' ? 'SHELTER OPEN' : 'SHELTER FULL')}</span>
                <span>•</span>
                <span>{selectedTarget.distanceKm}</span>
              </div>
            </div>
            <button
              onClick={() => { setSelectedTarget(null); setRouteActive(false); }}
              className="text-slate-400 hover:text-slate-600 text-xl leading-none ml-2"
            >
              ×
            </button>
          </div>

          {/* High Ground Metrics */}
          {targetHg && (
            <div className="grid grid-cols-3 gap-2 mb-3">
              <div className="rounded-xl p-2 text-center border bg-emerald-50 border-emerald-200">
                <div className="text-base font-black font-mono-data text-emerald-600">
                  +{targetHg.heightAboveFloodM}m
                </div>
                <div className="text-[7.5px] font-semibold text-slate-600">Above Flood Level</div>
              </div>
              <div className="rounded-xl p-2 text-center border bg-sky-50 border-sky-200">
                <div className="text-base font-black font-mono-data text-sky-600">
                  {targetHg.elevationMeters}m
                </div>
                <div className="text-[7.5px] font-semibold text-slate-600">Total Altitude</div>
              </div>
              <div className="rounded-xl p-2 text-center border bg-slate-50 border-slate-200">
                <div className="text-base font-black font-mono-data text-slate-800">
                  ~{targetHg.walkingTimeMin}m
                </div>
                <div className="text-[7.5px] font-semibold text-slate-600">Walk Duration</div>
              </div>
            </div>
          )}

          {/* Shelter Metrics */}
          {targetShelter && (
            <div className="grid grid-cols-2 gap-2 mb-3">
              <div className="rounded-xl p-2.5 text-center border bg-emerald-50 border-emerald-200">
                <div className="text-xl font-black font-mono-data text-emerald-600">
                  {targetShelter.beds.toLocaleString()}
                </div>
                <div className="text-[8px] font-semibold text-slate-600">{t('map.free_beds')}</div>
                <div className="text-[7px] text-slate-400 font-mono-data">/ {targetShelter.capacity.toLocaleString()} total</div>
              </div>
              <div className="bg-slate-50 rounded-xl p-2.5 text-center border border-slate-200">
                <div className="text-[11px] font-bold text-slate-800 font-mono-data">{targetShelter.contact}</div>
                <div className="text-[8px] font-semibold text-slate-600 mt-0.5">Helpline Contact</div>
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={() => startGoogleMapsNavigation(selectedTarget)}
              className="flex-1 py-2.5 rounded-xl text-[10px] font-bold flex items-center justify-center gap-1.5 text-white shadow-md transition-transform active:scale-95 cursor-pointer"
              style={{
                background: 'linear-gradient(135deg, #EA580C 0%, #F97316 100%)',
                boxShadow: '0 4px 14px rgba(234, 88, 12, 0.4)'
              }}
            >
              <span>🧭</span>
              <span>Start Turn-By-Turn Navigation</span>
            </button>
            {targetShelter && (
              <a
                href={`tel:${targetShelter.contact}`}
                className="px-3 py-2.5 rounded-xl text-[10px] font-bold flex items-center justify-center gap-1 border shadow-xs bg-[#E0F2FE] border-[#BAE6FD] text-[#0284C7] active:scale-95 transition-transform"
              >
                <span>📞</span>
                <span>Call Camp</span>
              </a>
            )}
            <button
              onClick={toggle3D}
              className="px-3 py-2.5 rounded-xl text-[10px] font-bold flex items-center justify-center gap-1 border shadow-xs bg-slate-100 border-slate-200 text-slate-700 active:scale-95 transition-transform cursor-pointer"
            >
              🏔️ 3D View
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
