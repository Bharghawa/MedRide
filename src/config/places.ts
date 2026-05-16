// Google Places API configuration
// Replace with your actual Google Maps API key (enable Places API in Google Cloud Console)
export const GOOGLE_PLACES_API_KEY = 'YOUR_GOOGLE_PLACES_API_KEY';

export const IS_PLACES_DEMO = GOOGLE_PLACES_API_KEY === 'YOUR_GOOGLE_PLACES_API_KEY';

export interface NearbyHospital {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  distance: string; // e.g. "1.2 km"
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
 * Fetch nearby hospitals using Google Places Nearby Search API.
 * Falls back to demo data if API key is not configured.
 */
export async function fetchNearbyHospitals(
  latitude: number,
  longitude: number,
  radiusMeters: number = 5000
): Promise<NearbyHospital[]> {
  if (IS_PLACES_DEMO) {
    // Return demo data with recalculated distances
    return DEMO_HOSPITALS.map((h) => ({
      ...h,
      distance: `${haversineDistance(latitude, longitude, h.latitude, h.longitude).toFixed(1)} km`,
    })).sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));
  }

  try {
    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=${radiusMeters}&type=hospital&key=${GOOGLE_PLACES_API_KEY}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== 'OK' || !data.results) {
      return DEMO_HOSPITALS;
    }

    return data.results.slice(0, 10).map((place: any) => {
      const dist = haversineDistance(
        latitude,
        longitude,
        place.geometry.location.lat,
        place.geometry.location.lng
      );
      return {
        id: place.place_id,
        name: place.name,
        address: place.vicinity || place.formatted_address || '',
        latitude: place.geometry.location.lat,
        longitude: place.geometry.location.lng,
        distance: `${dist.toFixed(1)} km`,
        rating: place.rating,
        isOpen: place.opening_hours?.open_now,
      };
    }).sort((a: NearbyHospital, b: NearbyHospital) => parseFloat(a.distance) - parseFloat(b.distance));
  } catch (error) {
    // Network error — fall back to demo
    return DEMO_HOSPITALS;
  }
}
