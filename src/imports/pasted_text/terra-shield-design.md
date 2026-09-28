Act as a Principal Full-Stack Solutions Architect and Lead Product Designer. 

Generate a complete, cohesive, 5-tab Mobile & Desktop PWA design system and frontend architecture for "TERRA-SHIELD: Spatial-AI Disaster Response & Relocation Decision Support System" (Smart India Hackathon 2026).

---
### 1. GLOBAL DESIGN TOKENS & SHELL
- Primary Palette:
  • Deep Navy Base: #084C7F (Navigation bars, sidebar containers, high-contrast badges)
  • Electric Cyan: #2096CD (Active tab states, map radar pulses, dynamic route vectors)
  • Neon Saffron / Red: #E85D04 / #E11D48 (1-Tap SOS triggers, severe danger zones, flash banners)
  • Warm Sand: #E8DEC8 (Top utility bar backdrop, offline sync badges, notification pills)
  • Slate Dark Text: #2D3748 (Primary typography, labels, table headers)
  • Neutral Canvas: #F8F9FA (Main app viewport background)
  • Semantic Alerts: Safe (#16A34A), Caution (#D97706), Critical (#DC2626)
- Typography: Plus Jakarta Sans / Inter for UI; Noto Sans Devanagari for Marathi (मराठी) & Hindi (हिंदी).
- Responsive Shell: 390x844px Mobile PWA viewport with a persistent 5-icon bottom navigation dock, mirrored by a 1440px desktop command dashboard.
- Top Utility Header: District quick-switcher pill ("📍 Kolhapur: RED SURGE ▾"), Hardware GNSS fix indicator ("⚡ OFFLINE READY 8.4MB"), Language Switcher ("हिं | EN"), and a pulsating 1-Tap SOS FAB (#E85D04).

---
### 2. TAB-BY-TAB FUNCTIONAL SPECIFICATIONS & "HOW IT WORKS"

#### TAB 1: होम (Home / Live Risk Radar - `HomePage.tsx`)
• How It Works: Ingests real-time IoT and weather feeds to compute a live threat score. Displays high-priority warnings, AI-driven surge forecasts, and verified community incidents in a single feed.
• UI Components & Logic:
  1. District Risk Hero Card: Displays live threat level (e.g., "88% CRITICAL SURGE") with radial progress ring and one-touch evacuation recommendation.
  2. AI Risk Forecasting Card (PINN + XGBoost): Shows 72-hour precipitation curves, dam outflow volumes (e.g., "Koyna: 42,500 cusecs"), and slope stability FoS values.
  3. Road Disruptions Carousel: Swipeable cards for impassable routes (e.g., "⛔ Varandha Ghat NH-66: Closed").
  4. Crowdsourced Live Incident Feed: Citizen reports with distance tags, photo thumbnails, and community upvote counts ("▲ 24 Votes • Verified").
  5. 1-Tap Emergency Helpline Grid: Direct-dial action buttons for 112 (National SOS), 1077 (Disaster Control), and 108 (Ambulance).

#### TAB 2: अलर्ट (CAP Multi-Hazard Alerts - `AlertsPage.tsx`)
• How It Works: Consumes Common Alerting Protocol (CAP) RSS/JSON endpoints from NDMA, SDMA, and IMD. Groups alerts by proximity and urgency, translating them automatically into local languages.
• UI Components & Logic:
  1. Alert Category Filter Pills: Horizontal scrollable filters ("All (14)", "Flood Inundation (6)", "Landslide Caution (5)", "Dam Discharge (3)").
  2. High-Severity Alert Banners: Red-tinted cards (#FFF1F2) detailing trigger time, authority source, affected talukas, and recommended action directives.
  3. Offline Audio Broadcast Player: "सुनें / Listen" button that plays pre-cached synthetic text-to-speech audio warnings for low-literacy citizens.
  4. Alert Feedback Mechanism: "Is this info accurate?" with quick 👍 / 👎 validation buttons to feed real-time truth metrics back to the server.

#### TAB 3: सुरक्षा मैप (Interactive 3D Safety & Shelter Map - `DisasterMapPage.tsx`)
• How It Works: Renders WebGL vector tiles (MapLibre / deck.gl) with local offline MBTiles fallbacks. Evaluates impassable nodes and computes the safest path to capacity-checked relief shelters using PostGIS network routing.
• UI Components & Logic:
  1. Elevated Floating Center Dock Button: Special glowing circular icon (#2096CD) in the bottom navigation bar.
  2. 3D Hazard Overlays: Semi-transparent red polygons displaying live flood depth and estimated population at risk.
  3. Relief Camps & Safe Havens: Green interactive markers displaying live bed availability (e.g., "Camp A: 1,420 Free Beds") and direct-call contacts.
  4. Dynamic Safe Corridor Polyline: Glowing green evacuation routes that update automatically when users encounter or report newly submerged bridges.
  5. Floating Turn-by-Turn Waypoint Drawer: Bottom sheet displaying the safest route (e.g., "Take SH-115 via Jaysingpur Bypass • 18 min ETA").

#### TAB 4: मौसम (Weather & Telemetry - `WeatherPage.tsx`)
• How It Works: Visualizes real-time automated weather station (AWS) feeds, Doppler radar reflections, and water-level gauges across state river basins.
• UI Components & Logic:
  1. Station Telemetry Matrix: Real-time gauges for rainfall intensity (mm/hr), humidity, barometric pressure, and wind speed.
  2. River Basin Water Gauge: Vertical bar illustrating current water levels against the "Warning Level" (43 ft) and "Danger Level" (45 ft).
  3. InSAR Ground Deformation Tracker: Visual displacement charts showing millimeter-scale slope strain in vulnerable hilly ghats.
  4. Offline Weather Forecast Cache: 7-day predictive weather cards stored on-device via IndexedDB / SQLite.

#### TAB 5: खाता (Safety Hub, Medical ID & RAG Bot - `SafetyPage.tsx`)
• How It Works: Provides zero-connectivity personal preparedness tools, an on-device Retrieval-Augmented Generation (RAG) assistant, and an offline medical emergency profile.
• UI Components & Logic:
  1. Digital Emergency Medical ID Card: High-contrast card showing Blood Group, Allergies, Chronic Conditions, and Emergency ICE Contacts.
  2. Family Check-In Status Board: Contact cards with live safety toggles ("SAFE", "NEED ASSISTANCE", "EVACUATING").
  3. Offline Vector Safety Chatbot: Local conversational assistant answering queries (e.g., "How to purify flood water?", "Emergency evacuation bag checklist").
  4. Offline District Map Pack Manager: 1-click download cards for offline vector bundles (e.g., "Download Kolhapur MBTiles • 8.4 MB").
  5. Official Relocation Directive Exporter: Authority button to export signed PDF relocation orders directly to device storage.

---
### 3. TECHNICAL SPECIFICATIONS FOR DEVELOPERS
- Frontend Stack: Next.js 15 (React 19), Tailwind CSS, shadcn/ui, MapLibre GL / deck.gl.
- Mobile Client: React Native / Expo SDK, expo-location (Hardware GNSS), WatermelonDB / SQLite.
- State & Sync: Offline-first service worker architecture (`sw.js`) with background sync queues for citizen reports and SOS broadcasts.