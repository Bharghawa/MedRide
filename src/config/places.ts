// Nearby hospitals using FREE APIs (Photon + Nominatim + Overpass) - no API key needed

// Cache for pre-fetched hospitals
let cachedHospitals: NearbyHospital[] | null = null;
let cachedLocation: { lat: number; lng: number } | null = null;

export function getCachedHospitals(): NearbyHospital[] | null {
  return cachedHospitals;
}

export interface NearbyHospital {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  distance: string;
  rating?: number;
  isOpen?: boolean;
}

function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Fetch nearby hospitals - tries 3 free APIs in order:
 * 1. Photon (komoot) - fast, designed for POI search
 * 2. Nominatim - OSM geocoding with proper params
 * 3. Overpass via POST - direct OSM database query
 */
export async function fetchNearbyHospitals(
  latitude: number,
  longitude: number,
  radiusMeters: number = 10000
): Promise<NearbyHospital[]> {
  console.log(`🏥 Fetching hospitals near ${latitude}, ${longitude}`);

  // Strategy 1: Photon API (komoot) - free, fast, no key
  let results = await tryPhoton(latitude, longitude);
  if (results.length > 0) return results;

  // Strategy 2: Nominatim with proper query
  results = await tryNominatim(latitude, longitude, radiusMeters);
  if (results.length > 0) return results;

  // Strategy 3: Overpass API via POST
  results = await tryOverpassPost(latitude, longitude, radiusMeters);
  if (results.length > 0) return results;

  console.log('🏥 All APIs failed - no hospitals found');
  return [];
}

// --- Strategy 1: Photon (komoot.io) ---
async function tryPhoton(latitude: number, longitude: number): Promise<NearbyHospital[]> {
  try {
    console.log('🏥 [1/3] Trying Photon API...');
    const url = `https://photon.komoot.io/api/?q=hospital&lat=${latitude}&lon=${longitude}&limit=20&lang=en`;

    const response = await fetch(url, {
      headers: { 'Accept': 'application/json' },
    });

    if (!response.ok) {
      console.log(`🏥 Photon returned ${response.status}`);
      return [];
    }

    const data = await response.json();
    const features = data.features || [];
    console.log(`🏥 Photon returned ${features.length} results`);

    if (features.length === 0) return [];

    const hospitals: NearbyHospital[] = features
      .filter((f: any) => f.geometry?.coordinates)
      .map((f: any, i: number) => {
        const [lng, lat] = f.geometry.coordinates;
        const props = f.properties || {};
        const dist = haversineDistance(latitude, longitude, lat, lng);

        const address = [
          props.street,
          props.district || props.locality,
          props.city || props.county,
          props.state,
        ].filter(Boolean).join(', ');

        return {
          id: `ph_${props.osm_id || i}`,
          name: props.name || `Hospital`,
          address: address || `${dist.toFixed(1)} km away`,
          latitude: lat,
          longitude: lng,
          distance: `${dist.toFixed(1)} km`,
          isOpen: undefined,
        };
      })
      .filter((h: NearbyHospital) => parseFloat(h.distance) < 30)
      .sort((a: NearbyHospital, b: NearbyHospital) => parseFloat(a.distance) - parseFloat(b.distance))
      .slice(0, 15);

    if (hospitals.length > 0) {
      console.log(`🏥 Photon success! Found ${hospitals.length}. First: ${hospitals[0].name}`);
      cachedHospitals = hospitals;
      cachedLocation = { lat: latitude, lng: longitude };
    }
    return hospitals;
  } catch (e: any) {
    console.log(`🏥 Photon error: ${e.message}`);
    return [];
  }
}

// --- Strategy 2: Nominatim (fixed query format) ---
async function tryNominatim(latitude: number, longitude: number, radiusMeters: number): Promise<NearbyHospital[]> {
  try {
    console.log('🏥 [2/3] Trying Nominatim...');

    // viewbox format: left,top,right,bottom (west,north,east,south)
    const latDelta = radiusMeters / 111320;
    const lonDelta = radiusMeters / (111320 * Math.cos(latitude * Math.PI / 180));
    const west = longitude - lonDelta;
    const east = longitude + lonDelta;
    const south = latitude - latDelta;
    const north = latitude + latDelta;

    // Nominatim does NOT support OR - just search "hospital"
    const url = `https://nominatim.openstreetmap.org/search?` +
      `q=hospital&format=json&limit=20` +
      `&viewbox=${west},${north},${east},${south}&bounded=1` +
      `&addressdetails=1`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'MedRide-App/1.0 (medical transport)',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      console.log(`🏥 Nominatim returned ${response.status}`);
      return [];
    }

    const data = await response.json();
    console.log(`🏥 Nominatim returned ${data.length} results`);

    if (!data || data.length === 0) return [];

    const hospitals: NearbyHospital[] = data
      .map((place: any) => {
        const lat = parseFloat(place.lat);
        const lng = parseFloat(place.lon);
        const dist = haversineDistance(latitude, longitude, lat, lng);

        const addr = place.address || {};
        const address = [
          addr.road || addr.street,
          addr.suburb || addr.neighbourhood || addr.city_district,
          addr.city || addr.town || addr.village,
        ].filter(Boolean).join(', ');

        return {
          id: `nom_${place.place_id}`,
          name: place.name || place.display_name.split(',')[0],
          address: address || place.display_name.split(',').slice(1, 3).join(',').trim(),
          latitude: lat,
          longitude: lng,
          distance: `${dist.toFixed(1)} km`,
          isOpen: undefined,
        };
      })
      .sort((a: NearbyHospital, b: NearbyHospital) => parseFloat(a.distance) - parseFloat(b.distance))
      .slice(0, 15);

    if (hospitals.length > 0) {
      console.log(`🏥 Nominatim success! Found ${hospitals.length}. First: ${hospitals[0].name}`);
      cachedHospitals = hospitals;
      cachedLocation = { lat: latitude, lng: longitude };
    }
    return hospitals;
  } catch (e: any) {
    console.log(`🏥 Nominatim error: ${e.message}`);
    return [];
  }
}

// --- Strategy 3: Overpass via POST (avoids URL-length 406 issues) ---
async function tryOverpassPost(latitude: number, longitude: number, radiusMeters: number): Promise<NearbyHospital[]> {
  try {
    console.log('🏥 [3/3] Trying Overpass POST...');

    const query = `[out:json][timeout:15];
(
  node["amenity"="hospital"](around:${radiusMeters},${latitude},${longitude});
  way["amenity"="hospital"](around:${radiusMeters},${latitude},${longitude});
  node["amenity"="clinic"](around:${radiusMeters},${latitude},${longitude});
  way["amenity"="clinic"](around:${radiusMeters},${latitude},${longitude});
);
out center 20;`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const response = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
      },
      body: `data=${encodeURIComponent(query)}`,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      console.log(`🏥 Overpass POST returned ${response.status}`);
      return [];
    }

    const data = await response.json();
    const elements = data.elements || [];
    console.log(`🏥 Overpass returned ${elements.length} results`);

    if (elements.length === 0) return [];

    const hospitals: NearbyHospital[] = elements
      .map((el: any, i: number) => {
        const lat = el.lat ?? el.center?.lat;
        const lng = el.lon ?? el.center?.lon;
        if (!lat || !lng) return null;

        const tags = el.tags || {};
        const name = tags.name || tags['name:en'] || `Hospital #${i + 1}`;
        const address = [
          tags['addr:housenumber'],
          tags['addr:street'],
          tags['addr:city'] || tags['addr:suburb'],
        ].filter(Boolean).join(', ');

        const dist = haversineDistance(latitude, longitude, lat, lng);

        return {
          id: `osm_${el.id}`,
          name,
          address: address || `${dist.toFixed(1)} km away`,
          latitude: lat,
          longitude: lng,
          distance: `${dist.toFixed(1)} km`,
          isOpen: undefined,
        };
      })
      .filter(Boolean)
      .sort((a: NearbyHospital, b: NearbyHospital) => parseFloat(a.distance) - parseFloat(b.distance))
      .slice(0, 15);

    if (hospitals.length > 0) {
      console.log(`🏥 Overpass success! Found ${hospitals.length}. First: ${hospitals[0].name}`);
      cachedHospitals = hospitals;
      cachedLocation = { lat: latitude, lng: longitude };
    }
    return hospitals;
  } catch (e: any) {
    console.log(`🏥 Overpass error: ${e.message}`);
    return [];
  }
}
