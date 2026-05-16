// Nearby hospitals using OpenStreetMap Overpass API (free, no API key needed)

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

// Demo fallback data (Hyderabad hospitals)
export const DEMO_HOSPITALS: NearbyHospital[] = [
  {
    id: 'demo_1',
    name: 'Apollo Hospital',
    address: 'Jubilee Hills, Hyderabad',
    latitude: 17.4156,
    longitude: 78.4347,
    distance: '2.3 km',
    rating: 4.5,
    isOpen: true,
  },
  {
    id: 'demo_2',
    name: 'KIMS Hospital',
    address: 'Secunderabad, Hyderabad',
    latitude: 17.4399,
    longitude: 78.4983,
    distance: '3.1 km',
    rating: 4.3,
    isOpen: true,
  },
  {
    id: 'demo_3',
    name: 'Yashoda Hospital',
    address: 'Somajiguda, Hyderabad',
    latitude: 17.4239,
    longitude: 78.4538,
    distance: '1.8 km',
    rating: 4.4,
    isOpen: true,
  },
  {
    id: 'demo_4',
    name: 'Care Hospital',
    address: 'Banjara Hills, Hyderabad',
    latitude: 17.4156,
    longitude: 78.4480,
    distance: '2.7 km',
    rating: 4.2,
    isOpen: true,
  },
  {
    id: 'demo_5',
    name: 'Continental Hospital',
    address: 'Gachibowli, Hyderabad',
    latitude: 17.4400,
    longitude: 78.3489,
    distance: '5.4 km',
    rating: 4.6,
    isOpen: true,
  },
  {
    id: 'demo_6',
    name: 'Sunshine Hospital',
    address: 'Paradise, Secunderabad',
    latitude: 17.4445,
    longitude: 78.4824,
    distance: '3.8 km',
    rating: 4.1,
    isOpen: false,
  },
];

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
 * Fetch nearby hospitals using OpenStreetMap Overpass API.
 * Free, no API key required. Falls back to demo data on error.
 */
export async function fetchNearbyHospitals(
  latitude: number,
  longitude: number,
  radiusMeters: number = 5000
): Promise<NearbyHospital[]> {
  try {
    // Overpass QL query: find hospitals, clinics, and doctors within radius
    const query = `
      [out:json][timeout:10];
      (
        node["amenity"="hospital"](around:${radiusMeters},${latitude},${longitude});
        way["amenity"="hospital"](around:${radiusMeters},${latitude},${longitude});
        node["amenity"="clinic"](around:${radiusMeters},${latitude},${longitude});
        way["amenity"="clinic"](around:${radiusMeters},${latitude},${longitude});
      );
      out center body;
    `;

    const response = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `data=${encodeURIComponent(query)}`,
    });

    if (!response.ok) {
      return DEMO_HOSPITALS.map((h) => ({
        ...h,
        distance: `${haversineDistance(latitude, longitude, h.latitude, h.longitude).toFixed(1)} km`,
      }));
    }

    const data = await response.json();

    if (!data.elements || data.elements.length === 0) {
      return DEMO_HOSPITALS.map((h) => ({
        ...h,
        distance: `${haversineDistance(latitude, longitude, h.latitude, h.longitude).toFixed(1)} km`,
      }));
    }

    const hospitals: NearbyHospital[] = data.elements
      .map((el: any) => {
        // For ways, use center coordinates
        const lat = el.lat ?? el.center?.lat;
        const lng = el.lon ?? el.center?.lon;
        if (!lat || !lng) return null;

        const tags = el.tags || {};
        const name = tags.name || tags['name:en'] || 'Hospital/Clinic';
        
        // Skip unnamed entries
        if (name === 'Hospital/Clinic' && !tags['addr:street']) return null;

        const address = [
          tags['addr:street'],
          tags['addr:city'] || tags['addr:suburb'],
          tags['addr:district'],
        ].filter(Boolean).join(', ') || tags.description || '';

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

    return hospitals.length > 0 ? hospitals : DEMO_HOSPITALS;
  } catch (error) {
    // Network error — fall back to demo
    return DEMO_HOSPITALS.map((h) => ({
      ...h,
      distance: `${haversineDistance(latitude, longitude, h.latitude, h.longitude).toFixed(1)} km`,
    }));
  }
}
