import { useState } from "react";

interface LocationOption {
  label: string;
  value: string;

  country?: string;
  city?: string;

  lat?: number;
  lng?: number;
}

export default function useLocationSearch() {
  const [locationOptions, setLocationOptions] = useState<LocationOption[]>(
    [],
  );

  const [locationLoading, setLocationLoading] = useState(false);

  async function searchLocations(input: string) {
    if (!input.trim()) {
      setLocationOptions([]);
      return;
    }

    try {
      setLocationLoading(true);

      const res = await fetch(
        `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(
          input,
        )}&apiKey=${import.meta.env.VITE_GEOAPIFY_KEY}`,
      );

      const data = await res.json();

      const options: LocationOption[] = data.features.map((item: any) => ({
        label: item.properties.formatted,
        value: item.properties.formatted,

        country: item.properties.country,
        city: item.properties.city,

        lat: item.properties.lat,
        lng: item.properties.lon,
      }));

      setLocationOptions(options);
    } catch (err) {
      console.error("Location search failed:", err);
    } finally {
      setLocationLoading(false);
    }
  }

  return {
    locationOptions,
    locationLoading,
    searchLocations,
  };
}