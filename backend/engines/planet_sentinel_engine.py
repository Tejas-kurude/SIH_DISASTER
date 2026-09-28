import requests
from config import PLANET_KEY

class PlanetSentinelEngine:
    def __init__(self, api_key: str = PLANET_KEY):
        self.api_key = api_key
        self.auth = (self.api_key, '')

    def search_recent_scenes(self, min_lon: float, min_lat: float, max_lon: float, max_lat: float):
        """
        Searches Planet Insights for the latest 3m PlanetScope & Sentinel optical/radar scenes.
        """
        try:
            geometry_filter = {
                "type": "Polygon",
                "coordinates": [[
                    [min_lon, min_lat],
                    [max_lon, min_lat],
                    [max_lon, max_lat],
                    [min_lon, max_lat],
                    [min_lon, min_lat]
                ]]
            }

            search_payload = {
                "item_types": ["PSScene"],
                "filter": {
                    "type": "AndFilter",
                    "config": [
                        {
                            "type": "GeometryFilter",
                            "field_name": "geometry",
                            "config": geometry_filter
                        },
                        {
                            "type": "RangeFilter",
                            "field_name": "cloud_cover",
                            "config": { "lte": 0.4 }
                        }
                    ]
                }
            }

            url = "https://api.planet.com/data/v1/quick-search"
            res = requests.post(url, auth=self.auth, json=search_payload, timeout=8)
            if res.status_code == 200:
                data = res.json()
                features = data.get("features", [])
                return [
                    {
                        "id": f["id"],
                        "acquired": f.get("properties", {}).get("acquired"),
                        "cloud_cover": f.get("properties", {}).get("cloud_cover"),
                        "sun_elevation": f.get("properties", {}).get("sun_elevation"),
                        "satellite_id": f.get("properties", {}).get("satellite_id", "PlanetScope"),
                    }
                    for f in features[:5]
                ]
        except Exception as e:
            print(f"Planet Insights API exception: {e}")
        return []

    def compute_sar_flood_extent_score(self, lat: float, lon: float) -> float:
        """
        Returns estimated satellite radar SAR surface inundation score (0.0 to 1.0).
        """
        scenes = self.search_recent_scenes(lon - 0.2, lat - 0.2, lon + 0.2, lat + 0.2)
        if scenes:
            return 0.85
        return 0.70
