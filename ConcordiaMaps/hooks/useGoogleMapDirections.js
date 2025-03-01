const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;
import polyline from "@mapbox/polyline"; //? To use the polyline decoding

export const useGoogleMapDirections = () => {
  //? To turn a text address into its longitude and latitude coordinates
  const geocodeAddress = async (address) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
          address,
        )}&key=${GOOGLE_MAPS_API_KEY}`,
      );

      const data = await response.json();

      if (data.status === "OK" && data.results.length > 0) {
        const location = data.results[0].geometry.location;
        return {
          latitude: location.lat,
          longitude: location.lng,
        };
      } else {
        throw new Error(`Geocoding failed: ${data.status}`);
      }
    } catch (error) {
      console.error("Geocoding error:", error);
      throw error;
    }
  };

  //? Returns only the array of steps in html elements
  const getStepsInHTML = async (origin, destination, mode) => {
    try {
      const data = await getDirections(origin, destination, mode);

      if (
        !data ||
        !data.routes ||
        !data.routes[0] ||
        !data.routes[0].legs ||
        !data.routes[0].legs[0]
      ) {
        throw new Error("Invalid directions data structure");
      }

      const steps = data.routes[0].legs[0].steps;

      // Using map instead of for loop for better readability
      const instructions = steps.map((step) => ({
        html_instructions: step.html_instructions,
        distance: step.distance.text,
      }));

      // Return the result
      return instructions;
    } catch (error) {
      console.error("Error getting steps:", error);
      throw error;
    }
  };

  //? Returns the entire API result when calling the direction between two points
  const getDirections = async (o, d, mode) => {
    console.log("GETTING DIRECTIONS");
    try {
      if (!o || !d) {
        throw new Error("Invalid origin or destination");
      }

      const response = await fetch(
        `https://maps.googleapis.com/maps/api/directions/json?origin=${o.latitude},${o.longitude}&destination=${d.latitude},${d.longitude}&mode=${mode}&key=${GOOGLE_MAPS_API_KEY}`,
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (!data || data.status !== "OK") {
        throw new Error(
          `Direction API error: ${data?.status || "Unknown error"}`,
        );
      }

      if (!Array.isArray(data.routes) || data.routes.length === 0) {
        throw new Error("No routes available");
      }

      return data;
    } catch (error) {
      console.error("Directions error:", error);
      throw error;
    }
  };

  const getPolyline = async (origin, destination, mode) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/directions/json?origin=${origin.latitude},${origin.longitude}&destination=${destination.latitude},${destination.longitude}&mode=${mode}&key=${GOOGLE_MAPS_API_KEY}`,
      );
      const data = await response.json();

      console.log("API Response:", data);

      if (!data || data.status !== "OK") {
        console.error("Error fetching polyline: API error", data);
        return [];
      }

      if (!data.routes || data.routes.length === 0) {
        console.error("Error fetching polyline: No routes found", data);
        return [];
      }

      if (
        !data.routes[0].overview_polyline ||
        !data.routes[0].overview_polyline.points
      ) {
        console.error(
          "Error fetching polyline: No overview_polyline.points found",
          data,
        );
        return [];
      }

      const points = polyline.decode(data.routes[0].overview_polyline.points);
      const coords = points.map((point) => ({
        latitude: point[0],
        longitude: point[1],
      }));
      console.log(coords);
      console.log(coords[0]);
      return coords;
    } catch (error) {
      console.error("Error fetching polyline:", error);
      return [];
    }
  };

  return {
    // State

    // Setters

    // Methods
    geocodeAddress,
    getStepsInHTML,
    getDirections,
    getPolyline,
  };
};
