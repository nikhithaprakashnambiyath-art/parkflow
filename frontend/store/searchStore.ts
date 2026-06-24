import { create } from "zustand";

export interface ParkingLot {
  id: string;
  name: string;
  location: string;
  coordinates: string; // JSON: { lat, lng }
  pricing: number;
  availability: number;
  rating: number;
  image: string;
  hasEVCharging: boolean;
  isCovered: boolean;
  hasSecurity: boolean;
  isAccessible: boolean;
  distance?: number;
}

export interface SearchFilters {
  distance: number; // max distance in kilometers
  price: number; // max price per hour in INR
  evCharging: boolean;
  covered: boolean;
  security: boolean;
  accessibility: boolean;
  vehicleType: "all" | "compact" | "suv" | "truck" | "motorcycle";
  startTime: string; // YYYY-MM-DDTHH:mm format
  endTime: string; // YYYY-MM-DDTHH:mm format
}

interface SearchState {
  searchQuery: string;
  suggestions: string[];
  selectedSpot: ParkingLot | null;
  filters: SearchFilters;
  results: ParkingLot[];
  loading: boolean;
  error: string | null;

  setSearchQuery: (query: string) => void;
  setSelectedSpot: (spot: ParkingLot | null) => void;
  setFilters: (filters: Partial<SearchFilters>) => void;
  fetchSuggestions: (query: string) => void;
  startLiveUpdates: () => void;
  stopLiveUpdates: () => void;
  favorites: string[];
  toggleFavorite: (id: string) => void;
}

let liveUpdateInterval: NodeJS.Timeout | null = null;

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

const getInitialFilters = (): SearchFilters => {
  const start = new Date();
  start.setMinutes(start.getMinutes() + 30 - (start.getMinutes() % 30));
  start.setSeconds(0, 0);
  const end = new Date(start);
  end.setHours(end.getHours() + 2);

  // Convert to local YYYY-MM-DDTHH:mm format
  const offset = start.getTimezoneOffset() * 60000;
  const startLocal = new Date(start.getTime() - offset)
    .toISOString()
    .slice(0, 16);
  const endLocal = new Date(end.getTime() - offset).toISOString().slice(0, 16);

  return {
    distance: 10,
    price: 50,
    evCharging: false,
    covered: false,
    security: false,
    accessibility: false,
    vehicleType: "all",
    startTime: startLocal,
    endTime: endLocal,
  };
};

const MOCK_LANDMARKS = [
  "Lulu Mall, Kochi",
  "Marine Drive, Kochi",
  "Fort Kochi, Kochi",
  "MG Road, Kochi",
  "Infopark Kakkanad, Kochi",
  "Focus Mall, Kozhikode",
  "HiLite Mall, Calicut",
  "Kozhikode Beach, Kozhikode",
  "SM Street, Kozhikode",
  "Cyberpark, Kozhikode",
  "Mavoor Road, Kozhikode",
  "Brigade Road, Bengaluru",
  "UB City, Bengaluru",
  "Indiranagar, Bengaluru",
  "Koramangala, Bengaluru",
  "Whitefield, Bengaluru",
  "Bandra Kurla Complex, Mumbai",
  "Gateway of India, Mumbai",
  "Marine Drive, Mumbai",
  "Phoenix Marketcity Kurla, Mumbai",
  "Colaba Causeway, Mumbai",
];

export const useSearchStore = create<SearchState>((set, get) => ({
  searchQuery: "",
  suggestions: [],
  selectedSpot: null,
  filters: getInitialFilters(),
  results: [],
  loading: false,
  error: null,
  favorites: typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('smartpark_favorites') || '[]') : [],

  toggleFavorite: (id) => {
    set((state) => {
      const isFav = state.favorites.includes(id);
      const newFavs = isFav ? state.favorites.filter(f => f !== id) : [...state.favorites, id];
      if (typeof window !== 'undefined') localStorage.setItem('smartpark_favorites', JSON.stringify(newFavs));
      return { favorites: newFavs };
    });
  },

  setSearchQuery: (query) => {
    set({ searchQuery: query });
    get().fetchSuggestions(query);
  },

  setSelectedSpot: (spot) => set({ selectedSpot: spot }),

  setFilters: (newFilters) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    }));
    get().fetchResults();
  },

  resetFilters: () => {
    set({ filters: getInitialFilters() });
    get().fetchResults();
  },

  fetchResults: async () => {
    set({ loading: true, error: null });
    const { searchQuery, filters } = get();

    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append("query", searchQuery);

      // Default to Kozhikode coordinates for nearby India geolocation calculations
      params.append("lat", "11.2588");
      params.append("lng", "75.7804");
      params.append("radius", filters.distance.toString());
      params.append("price", filters.price.toString());
      params.append("vehicleType", filters.vehicleType);
      params.append("startTime", filters.startTime);
      params.append("endTime", filters.endTime);

      if (filters.evCharging) params.append("evCharging", "true");
      if (filters.covered) params.append("covered", "true");
      if (filters.security) params.append("security", "true");
      if (filters.accessibility) params.append("accessibility", "true");

      const url = process.env.NEXT_PUBLIC_API_BASE_URL 
        ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/parking/search?${params.toString()}`
        : `/api/parking/search?${params.toString()}`;

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch parking locations (HTTP ${response.status})`);
      }

      const data = await response.json();
      set({ results: data, loading: false });
    } catch (error: any) {
      set({
        error: error.message || "Something went wrong",
        loading: false,
      });
    }
  },

  fetchSuggestions: (query) => {
    if (!query.trim()) {
      set({ suggestions: [] });
      return;
    }
    const q = query.toLowerCase();
    const matches = MOCK_LANDMARKS.filter((landmark) =>
      landmark.toLowerCase().includes(q),
    ).slice(0, 5); // Limit suggestions to 5
    set({ suggestions: matches });
  },

  startLiveUpdates: () => {
    if (liveUpdateInterval) return;
    liveUpdateInterval = setInterval(() => {
      set((state) => {
        // Randomly simulate bookings or departures in real-time, plus dynamic pricing
        const updatedResults = state.results.map((spot) => {
          if (Math.random() > 0.8) {
            const change = Math.random() > 0.5 ? 1 : -1;
            const newAvailability = Math.max(0, spot.availability + change);
            
            let newPricing = spot.pricing;
            if (newAvailability < 5 && change === -1) {
              newPricing = Math.floor(spot.pricing * 1.15); // 15% surge
            } else if (newAvailability >= 5 && change === 1) {
              newPricing = Math.max(40, Math.floor(spot.pricing * 0.9)); // drop price back down
            }
            
            return { ...spot, availability: newAvailability, pricing: newPricing };
          }
          return spot;
        });
        return { results: updatedResults };
      });
    }, 5000);
  },

  stopLiveUpdates: () => {
    if (liveUpdateInterval) {
      clearInterval(liveUpdateInterval);
      liveUpdateInterval = null;
    }
  },
}));
