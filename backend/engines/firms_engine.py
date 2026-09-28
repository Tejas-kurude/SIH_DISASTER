import requests
import pandas as pd
from io import StringIO
from config import NASA_FIRMS_KEY

class NASAFirmsEngine:
    def __init__(self, api_key: str = NASA_FIRMS_KEY):
        self.api_key = api_key

    def fetch_thermal_hotspots(self, min_lon: float, min_lat: float, max_lon: float, max_lat: float, days: int = 1):
        """
        Fetches near-real-time satellite thermal detections from VIIRS SNPP / MODIS.
        """
        try:
            bbox_str = f"{min_lon},{min_lat},{max_lon},{max_lat}"
            url = f"https://firms.modaps.eosdis.nasa.gov/api/area/csv/{self.api_key}/VIIRS_SNPP_NRT/{bbox_str}/{days}"
            res = requests.get(url, timeout=8)
            if res.status_code == 200 and res.text.strip():
                df = pd.read_csv(StringIO(res.text))
                if not df.empty and 'latitude' in df.columns:
                    return df.to_dict(orient='records')
        except Exception as e:
            print(f"NASA FIRMS query exception: {e}")
        return []

    def compute_thermal_hazard_score(self, lat: float, lon: float, radius_deg: float = 0.5) -> float:
        """
        Returns a thermal/burn degradation hazard score (0.0 to 1.0)
        indicating soil hydrophobicity and accelerated runoff.
        """
        hotspots = self.fetch_thermal_hotspots(lon - radius_deg, lat - radius_deg, lon + radius_deg, lat + radius_deg)
        if not hotspots:
            return 0.1
        # Calculate score based on count and Fire Radiative Power (FRP)
        total_frp = sum(float(h.get('frp', 1.0)) for h in hotspots)
        return min(1.0, 0.2 + (len(hotspots) * 0.15) + (total_frp * 0.02))
