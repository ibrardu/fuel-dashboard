// Pure geolocation helpers — no I/O. Used to snap a browser coordinate to the
// nearest of the dashboard's seeded major cities.

export function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

export function nearestCityId(
  lat: number,
  lng: number,
  cities: { id: number; lat: number; lng: number }[]
): number {
  let best = cities[0];
  let bestDist = Infinity;
  for (const city of cities) {
    const dist = haversineKm(lat, lng, city.lat, city.lng);
    if (dist < bestDist) {
      bestDist = dist;
      best = city;
    }
  }
  return best.id;
}
