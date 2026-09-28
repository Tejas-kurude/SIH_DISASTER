export const API_KEYS = {
  MAPTILER: (import.meta.env.VITE_MAPTILER_KEY as string) || 'ci546igMJFhkfxXdzM2Q',
  GEMINI: (import.meta.env.VITE_GEMINI_KEY as string) || '',
  OPENWEATHER: (import.meta.env.VITE_OPENWEATHER_KEY as string) || '',
  DATA_GOV_IN: (import.meta.env.VITE_DATA_GOV_IN_KEY as string) || '579b464db66ec23bdd000001cdd3946e44ce4aad7209ff7b23ac571b',
  NASA_FIRMS: (import.meta.env.VITE_NASA_FIRMS_KEY as string) || '5865d89abf80ecf57ffce7e4bc96873e',
  PLANET_SENTINEL: (import.meta.env.VITE_PLANET_KEY as string) || 'PLAK28cb860c5ac44d56a831e05f66e949f2',
}
