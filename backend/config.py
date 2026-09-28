import os
from pathlib import Path

# Try loading .env if python-dotenv is present
try:
    from dotenv import load_dotenv
    load_dotenv(Path(__file__).resolve().parent.parent / ".env")
except ImportError:
    pass

BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"

DEM_DIR = DATA_DIR / "dem"
LANDSLIDE_DIR = DATA_DIR / "landslide"
BUILDINGS_DIR = DATA_DIR / "buildings"
BOUNDARIES_DIR = DATA_DIR / "boundaries"
RIVER_DIR = DATA_DIR / "river"
REPORTS_DIR = BASE_DIR / "reports"

os.makedirs(REPORTS_DIR, exist_ok=True)

# Default fallback bounding coordinates (Maharashtra / Western Ghats / Pan-India)
DEFAULT_CENTER_LAT = 18.6298
DEFAULT_CENTER_LON = 73.7997
DEFAULT_BBOX = [73.5, 16.2, 74.8, 18.8]

# Authoritative API Keys from environment
MAPTILER_KEY = os.environ.get("MAPTILER_KEY", "ci546igMJFhkfxXdzM2Q")
OPENWEATHER_KEY = os.environ.get("OPENWEATHER_KEY", "")
GEMINI_KEY = os.environ.get("GEMINI_KEY", "")
NASA_FIRMS_KEY = os.environ.get("NASA_FIRMS_KEY", "5865d89abf80ecf57ffce7e4bc96873e")
PLANET_KEY = os.environ.get("PLANET_KEY", "PLAK28cb860c5ac44d56a831e05f66e949f2")
DATA_GOV_IN_KEY = os.environ.get("DATA_GOV_IN_KEY", "579b464db66ec23bdd000001cdd3946e44ce4aad7209ff7b23ac571b")
