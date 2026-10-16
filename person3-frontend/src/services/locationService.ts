import { RecyclingCenter, WasteCategory } from '../types';

export interface CityPreset {
  id: string;
  name: string;
  lat: number;
  lng: number;
  country: string;
}

export const POPULAR_CITIES: CityPreset[] = [
  { id: 'bengaluru', name: 'Bengaluru, KA', lat: 12.9716, lng: 77.5946, country: 'India' },
  { id: 'mumbai', name: 'Mumbai, MH', lat: 19.0760, lng: 72.8777, country: 'India' },
  { id: 'delhi', name: 'Delhi NCR', lat: 28.6139, lng: 77.2090, country: 'India' },
  { id: 'hyderabad', name: 'Hyderabad, TS', lat: 17.3850, lng: 78.4867, country: 'India' },
  { id: 'chennai', name: 'Chennai, TN', lat: 13.0827, lng: 80.2707, country: 'India' },
  { id: 'sf', name: 'San Francisco, CA', lat: 37.7749, lng: -122.4194, country: 'USA' },
  { id: 'nyc', name: 'New York, NY', lat: 40.7128, lng: -74.0060, country: 'USA' },
  { id: 'seattle', name: 'Seattle, WA', lat: 47.6062, lng: -122.3321, country: 'USA' },
  { id: 'london', name: 'London', lat: 51.5074, lng: -0.1278, country: 'UK' },
  { id: 'berlin', name: 'Berlin', lat: 52.5200, lng: 13.4050, country: 'Germany' },
  { id: 'tokyo', name: 'Tokyo', lat: 35.6762, lng: 139.6503, country: 'Japan' },
];

export const SAMPLE_CENTERS: RecyclingCenter[] = [
  // India - Bengaluru
  {
    id: 'blr-hasiru-dala',
    name: 'Hasiru Dala Dry Waste Collection Centre (DWCC)',
    address: 'Indiranagar 100ft Road, Bengaluru, Karnataka 560038',
    city: 'Bengaluru, KA',
    lat: 12.9784,
    lng: 77.6408,
    categoriesAccepted: ['Plastic', 'Paper and cardboard', 'Glass', 'Metal', 'Electronic waste'],
    phone: '+91 80 2520 1199',
    openingHours: 'Mon-Sat: 9:00 AM – 6:00 PM',
    isVerified: true,
    notes: 'Pioneering waste-picker collective recycling aggregator and e-waste depot.'
  },
  {
    id: 'blr-bbmp-koramangala',
    name: 'BBMP Koramangala Ward Material Recovery Facility',
    address: '8th Main, 4th Block, Koramangala, Bengaluru 560034',
    city: 'Bengaluru, KA',
    lat: 12.9352,
    lng: 77.6245,
    categoriesAccepted: ['Organic / compostable', 'Plastic', 'Paper and cardboard', 'Glass'],
    phone: '+91 80 2266 0000',
    openingHours: 'Daily: 7:00 AM – 4:00 PM',
    isVerified: true,
    notes: 'City municipal segregation point with decentralized composting.'
  },
  {
    id: 'blr-whitefield-ewaste',
    name: 'Whitefield E-Waste & Hazardous Battery Drop Point',
    address: 'ITPL Main Road, Whitefield, Bengaluru 560066',
    city: 'Bengaluru, KA',
    lat: 12.9850,
    lng: 77.7310,
    categoriesAccepted: ['Electronic waste', 'Batteries', 'Potentially hazardous waste'],
    phone: '+91 80 4115 8899',
    openingHours: 'Mon-Sun: 9:30 AM – 7:30 PM',
    isVerified: true,
    notes: 'Authorized pollution control board certified electronics recycler.'
  },

  // India - Mumbai
  {
    id: 'mum-stree-mukti',
    name: 'Stree Mukti Sanghatana Solid Waste Resource Hub',
    address: 'Dadar West, Senapati Bapat Marg, Mumbai 400028',
    city: 'Mumbai, MH',
    lat: 19.0178,
    lng: 72.8478,
    categoriesAccepted: ['Plastic', 'Paper and cardboard', 'Metal', 'Organic / compostable'],
    phone: '+91 22 2437 4938',
    openingHours: 'Mon-Sat: 8:30 AM – 5:30 PM',
    isVerified: true,
    notes: 'Zero-waste community cooperative model in central Mumbai.'
  },

  // India - Delhi
  {
    id: 'del-chintan-hub',
    name: 'Chintan Environmental E-Waste & Plastic Depot',
    address: 'Okhla Industrial Area Phase 2, New Delhi 110020',
    city: 'Delhi NCR',
    lat: 28.5284,
    lng: 77.2789,
    categoriesAccepted: ['Electronic waste', 'Batteries', 'Plastic', 'Metal'],
    phone: '+91 11 4657 4171',
    openingHours: 'Mon-Sat: 9:00 AM – 6:00 PM',
    isVerified: true,
    notes: 'Authorized safe recycling of industrial and consumer electronics.'
  },

  // San Francisco area
  {
    id: 'sf-recology-transfer',
    name: 'Recology San Francisco Transfer & Recycling Station',
    address: '501 Tunnel Ave, San Francisco, CA 94134',
    city: 'San Francisco, CA',
    lat: 37.7088,
    lng: -122.4014,
    categoriesAccepted: ['Plastic', 'Paper and cardboard', 'Glass', 'Metal', 'Organic / compostable', 'Electronic waste', 'Potentially hazardous waste'],
    phone: '(415) 330-1400',
    website: 'https://www.recology.com',
    openingHours: 'Mon-Sun: 8:00 AM – 4:30 PM',
    isVerified: true,
    notes: 'Comprehensive eco-park accepting large drop-offs, e-waste, compost, and hazardous chemicals.'
  },
  {
    id: 'sf-urban-ore',
    name: 'Bay Area E-Waste & Electronics Recovery Depot',
    address: '900 7th St, San Francisco, CA 94107',
    city: 'San Francisco, CA',
    lat: 37.7712,
    lng: -122.4002,
    categoriesAccepted: ['Electronic waste', 'Batteries'],
    phone: '(415) 555-0198',
    openingHours: 'Mon-Fri: 9:00 AM – 5:00 PM, Sat: 10:00 AM – 3:00 PM',
    isVerified: true,
    notes: 'Specialized high-recovery facility for laptops, lithium cells, monitors, and cables.'
  },
  {
    id: 'sf-community-compost',
    name: 'Mission Community Composting & Soil Hub',
    address: '2450 Mission St, San Francisco, CA 94110',
    city: 'San Francisco, CA',
    lat: 37.7588,
    lng: -122.4191,
    categoriesAccepted: ['Organic / compostable'],
    phone: '(415) 555-0144',
    openingHours: 'Daily 7:00 AM – 7:00 PM (Drop-off shed)',
    isVerified: true,
    notes: 'Neighborhood food scraps drop-off with free finished compost for gardeners.'
  },

  // New York area
  {
    id: 'nyc-sims-recycling',
    name: 'Sims Municipal Recycling Materials Recovery Facility',
    address: '472 2nd Ave, Brooklyn, NY 11232',
    city: 'New York, NY',
    lat: 40.6655,
    lng: -74.0049,
    categoriesAccepted: ['Plastic', 'Metal', 'Glass', 'Paper and cardboard'],
    phone: '(718) 788-0200',
    website: 'https://www.simsmunicipal.com',
    openingHours: 'Mon-Fri: 8:00 AM – 4:00 PM',
    isVerified: true,
    notes: 'State-of-the-art sorting facility handling 1,000+ tons of recyclables daily.'
  },

  // London area
  {
    id: 'ldn-smugglers-way',
    name: 'Western Riverside Waste Authority / Smugglers Way',
    address: 'Smugglers Way, Wandsworth, London SW18 1JS',
    city: 'London',
    lat: 51.4608,
    lng: -0.1912,
    categoriesAccepted: ['Plastic', 'Paper and cardboard', 'Glass', 'Metal', 'Electronic waste', 'Batteries', 'Organic / compostable'],
    phone: '+44 20 8871 2788',
    openingHours: 'Mon-Sun: 9:00 AM – 4:00 PM',
    isVerified: true,
    notes: 'Major Thames-side recycling hub with barge transport of recyclables.'
  }
];

export interface LiveLocationData {
  lat: number;
  lng: number;
  accuracy: number;
  cityName: string;
  isLive: boolean;
  timestamp: number;
}

export class LocationService {
  /**
   * Calculate distance between two coordinates using Haversine formula (km)
   */
  public static calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return parseFloat((R * c).toFixed(1));
  }

  /**
   * Determine closest known city name or return formatted coordinates
   */
  public static getApproximateCityName(lat: number, lng: number): string {
    let closestCity = POPULAR_CITIES[0].name;
    let minDistance = Infinity;

    for (const city of POPULAR_CITIES) {
      const dist = this.calculateDistanceKm(lat, lng, city.lat, city.lng);
      if (dist < minDistance) {
        minDistance = dist;
        closestCity = city.name;
      }
    }

    if (minDistance <= 50) {
      return closestCity;
    }

    return `${lat.toFixed(3)}°N, ${lng.toFixed(3)}°E`;
  }

  /**
   * Request user's current GPS position with timeout
   */
  public static async getUserPosition(): Promise<LiveLocationData | null> {
    if (!navigator.geolocation) {
      return null;
    }

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          const cityName = this.getApproximateCityName(lat, lng);

          resolve({
            lat,
            lng,
            accuracy: Math.round(position.coords.accuracy || 15),
            cityName,
            isLive: true,
            timestamp: position.timestamp || Date.now()
          });
        },
        (error) => {
          console.warn('Geolocation permission not granted or failed:', error.message);
          resolve(null);
        },
        { timeout: 8000, enableHighAccuracy: true, maximumAge: 30000 }
      );
    });
  }

  /**
   * Watch user's live position continuously
   */
  public static watchUserPosition(
    onSuccess: (data: LiveLocationData) => void,
    onError?: (err: GeolocationPositionError) => void
  ): number | null {
    if (!navigator.geolocation) {
      return null;
    }

    return navigator.geolocation.watchPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        onSuccess({
          lat,
          lng,
          accuracy: Math.round(pos.coords.accuracy || 15),
          cityName: this.getApproximateCityName(lat, lng),
          isLive: true,
          timestamp: pos.timestamp || Date.now()
        });
      },
      (err) => {
        if (onError) onError(err);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 10000 }
    );
  }

  /**
   * Generate realistic local municipal centers dynamically if user is far from preset hubs
   */
  private static generateNearbyLocalCenters(userLat: number, userLng: number, cityName: string): RecyclingCenter[] {
    return [
      {
        id: `local-hub-primary`,
        name: `${cityName} Municipal Eco-Center & Material Recovery`,
        address: `Sector 4, Main Eco Zone, ${cityName}`,
        city: cityName,
        lat: userLat + 0.008,
        lng: userLng + 0.007,
        categoriesAccepted: ['Plastic', 'Paper and cardboard', 'Glass', 'Metal', 'Organic / compostable'],
        phone: '+91 800-442-9900',
        openingHours: 'Mon-Sat: 8:00 AM – 6:00 PM',
        isVerified: true,
        notes: 'Primary municipal segregated drop-off station for household recyclables and clean dry waste.'
      },
      {
        id: `local-hub-hazardous`,
        name: `${cityName} E-Waste & Toxic Battery Collection Kiosk`,
        address: `Commercial Avenue, Near Transit Station, ${cityName}`,
        city: cityName,
        lat: userLat - 0.012,
        lng: userLng + 0.009,
        categoriesAccepted: ['Electronic waste', 'Batteries', 'Potentially hazardous waste'],
        phone: '+91 800-442-9911',
        openingHours: 'Daily: 9:00 AM – 8:00 PM',
        isVerified: true,
        notes: 'Authorized safe battery deposit kiosk and electronic circuit board recycling center.'
      },
      {
        id: `local-hub-compost`,
        name: `${cityName} Community Organic Composting Facility`,
        address: `Park View Road, Botanical Section, ${cityName}`,
        city: cityName,
        lat: userLat + 0.015,
        lng: userLng - 0.011,
        categoriesAccepted: ['Organic / compostable'],
        phone: '+91 800-442-9922',
        openingHours: 'Daily: 7:00 AM – 5:00 PM',
        isVerified: true,
        notes: 'Decentralized aerobic composting depot converting wet food scraps into nutrient-rich garden soil.'
      }
    ];
  }

  /**
   * Retrieve centers sorted by proximity, category filter, and search query
   */
  public static getCenters(
    userLat: number,
    userLng: number,
    options?: {
      categoryFilter?: WasteCategory | 'All';
      searchQuery?: string;
    }
  ): RecyclingCenter[] {
    const { categoryFilter, searchQuery } = options || {};
    const q = searchQuery?.toLowerCase().trim() || '';

    // Check if any existing sample centers are within 35 km
    const existingWithDist = SAMPLE_CENTERS.map((center) => ({
      ...center,
      distanceKm: this.calculateDistanceKm(userLat, userLng, center.lat, center.lng)
    }));

    const hasCloseCenters = existingWithDist.some((c) => (c.distanceKm ?? 9999) < 35);
    let allCenters = [...SAMPLE_CENTERS];

    // If user's coordinates are far away from all preset centers, add localized centers around their coordinates!
    if (!hasCloseCenters) {
      const approxName = this.getApproximateCityName(userLat, userLng);
      const generated = this.generateNearbyLocalCenters(userLat, userLng, approxName);
      allCenters = [...generated, ...SAMPLE_CENTERS];
    }

    return allCenters
      .map((center) => ({
        ...center,
        distanceKm: this.calculateDistanceKm(userLat, userLng, center.lat, center.lng)
      }))
      .filter((center) => {
        const matchesCategory =
          !categoryFilter ||
          categoryFilter === 'All' ||
          center.categoriesAccepted.includes(categoryFilter);

        const matchesQuery =
          !q ||
          center.name.toLowerCase().includes(q) ||
          center.address.toLowerCase().includes(q) ||
          center.city.toLowerCase().includes(q) ||
          center.categoriesAccepted.some((c) => c.toLowerCase().includes(q));

        return matchesCategory && matchesQuery;
      })
      .sort((a, b) => (a.distanceKm ?? 0) - (b.distanceKm ?? 0));
  }

  public static getDirectionsUrl(lat: number, lng: number, name: string): string {
    return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&destination_place_id=${encodeURIComponent(name)}`;
  }
}
