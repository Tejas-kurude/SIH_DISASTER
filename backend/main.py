import os
import sys
from pathlib import Path

# Ensure backend root is in sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent))

from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse

from config import DEFAULT_CENTER_LAT, DEFAULT_CENTER_LON, REPORTS_DIR
from engines.red_zone_engine import red_zone_engine
from engines.carrying_capacity import carrying_capacity_engine
from engines.relocation_milp import relocation_milp_engine
from reports.pdf_generator import generate_collector_directive_pdf

app = FastAPI(
    title="Pan-India Disaster Red-Zoning, Carrying Capacity & MILP Relocation API",
    description="Automated AI & Mathematical Disaster Relocation Engine compliant with NDMA/MHA Disaster Management Workflows.",
    version="2.0.0"
)

# Allow CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {
        "status": "ONLINE",
        "system": "Automated Disaster Red-Zoning & Relocation Optimization Platform",
        "version": "2.0.0",
        "engines": [
            "Engine 1: Dynamic Red Zone Delineator (XGBoost + InSAR + DEM Geomorphology)",
            "Engine 2: Spatial Carrying Capacity Engine (PostGIS Green Zoning & AHP Suitability)",
            "Engine 3: Mathematical Relocation Optimization (PuLP Mixed-Integer Linear Programming)",
            "Reporting: District Collector Signed Relocation Directive PDF Generator"
        ]
    }

@app.get("/api/hazard/red-zones")
def get_red_zones(
    lat: float = Query(DEFAULT_CENTER_LAT, description="Target Latitude in India"),
    lon: float = Query(DEFAULT_CENTER_LON, description="Target Longitude in India"),
    radius_km: float = Query(8.0, description="Analysis Radius in Kilometers")
):
    """
    Engine 1: Calculates Dynamic Red Hazard Probability Polygons.
    """
    try:
        result = red_zone_engine.generate_dynamic_red_zones(lat, lon, radius_km=radius_km)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/carrying-capacity/safe-parcels")
def get_safe_parcels(
    lat: float = Query(DEFAULT_CENTER_LAT, description="Target Latitude in India"),
    lon: float = Query(DEFAULT_CENTER_LON, description="Target Longitude in India"),
    radius_km: float = Query(8.0, description="Analysis Radius in Kilometers")
):
    """
    Engine 2: Executes Spatial Subtraction & Multi-Criteria Carrying Capacity.
    """
    try:
        red_zones = red_zone_engine.generate_dynamic_red_zones(lat, lon, radius_km=radius_km)
        safe_parcels = carrying_capacity_engine.generate_safe_green_parcels(lat, lon, red_zones, radius_km=radius_km)
        return safe_parcels
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/relocation/optimize")
def get_relocation_optimization(
    lat: float = Query(DEFAULT_CENTER_LAT, description="Target Latitude in India"),
    lon: float = Query(DEFAULT_CENTER_LON, description="Target Longitude in India"),
    radius_km: float = Query(8.0, description="Analysis Radius in Kilometers")
):
    """
    Engine 3: Solves Mathematical Relocation Optimization (MILP via PuLP).
    """
    try:
        red_zones = red_zone_engine.generate_dynamic_red_zones(lat, lon, radius_km=radius_km)
        safe_parcels = carrying_capacity_engine.generate_safe_green_parcels(lat, lon, red_zones, radius_km=radius_km)
        optimization = relocation_milp_engine.optimize_relocation(lat, lon, safe_parcels)
        return {
            "optimization": optimization,
            "safe_parcels": safe_parcels,
            "red_zones": red_zones
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/reports/collector-directive-pdf")
def download_collector_directive_pdf(
    lat: float = Query(DEFAULT_CENTER_LAT, description="Target Latitude"),
    lon: float = Query(DEFAULT_CENTER_LON, description="Target Longitude"),
    district: str = Query("District Emergency Authority", description="District Name")
):
    """
    Generates and downloads official District Collector Relocation Order PDF.
    """
    try:
        red_zones = red_zone_engine.generate_dynamic_red_zones(lat, lon, radius_km=8.0)
        safe_parcels = carrying_capacity_engine.generate_safe_green_parcels(lat, lon, red_zones, radius_km=8.0)
        optimization = relocation_milp_engine.optimize_relocation(lat, lon, safe_parcels)
        pdf_path = generate_collector_directive_pdf(optimization, district_name=district)

        return FileResponse(
            path=pdf_path,
            filename=Path(pdf_path).name,
            media_type="application/pdf"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
