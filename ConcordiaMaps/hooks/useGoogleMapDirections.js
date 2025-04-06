const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;
import polyline from "@mapbox/polyline"; //? To use the polyline decoding
import * as Crypto from "expo-crypto"; //? To generate a random token

export const useGoogleMapDirections = () => {
  /**
   * Fetches outdoor directions for a step between two points
   * @param {Object} step - A navigation step with start and end information
   * @param {Object} options - Additional options like userLocation and buildingRegistry
   * @returns {Promise<Object>} Contains directions and route information
   */
  const fetchOutdoorDirections = async (step, options = {}) => {
    if (step.type !== "outdoor") {
      throw new Error("Cannot fetch outdoor directions for non-outdoor step");
    }

    try {
      const originCoords = await resolveLocationCoordinates(
        step.startPoint,
        options.originDetails,
        options.buildingRegistry,
        "startPoint"
      );

      const destinationCoords = await resolveLocationCoordinates(
        step.endPoint,
        null,
        options.buildingRegistry,
        "endPoint"
      );

      if (!originCoords || !destinationCoords) {
        throw new Error(
          "Could not determine origin or destination coordinates"
        );
      }

      return await getDirectionsAndRoute(originCoords, destinationCoords, step);
    } catch (error) {
      console.error("Error fetching outdoor directions:", error);
      return createFallbackDirections(step);
    }
  };

  /**
   * Resolves coordinates for a location point
   * @private
   */
  const resolveLocationCoordinates = async (
    point,
    fallbackDetails,
    buildingRegistry,
    pointType
  ) => {
    // If point is a string (address/name), try geocoding
    if (point && typeof point === "string") {
      try {
        return await geocodeAddress(point);
      } catch (geocodeError) {
        console.error(`Error geocoding ${pointType}:`, geocodeError);
        return resolveFromBuildingRegistry(point, buildingRegistry);
      }
    }

    // If point is already coordinates
    if (point?.latitude && point?.longitude) {
      return point;
    }

    // Use fallback details if available
    if (fallbackDetails?.latitude && fallbackDetails?.longitude) {
      return {
        latitude: fallbackDetails.latitude,
        longitude: fallbackDetails.longitude,
      };
    }

    return null;
  };

  /**
   * Tries to resolve coordinates from building registry
   * @private
   */
  const resolveFromBuildingRegistry = (buildingName, buildingRegistry) => {
    if (!buildingRegistry) return null;

    const building = buildingRegistry.findBuilding(buildingName);
    if (building) {
      return buildingRegistry.getCoordinatesForBuilding(building.id);
    }
    return null;
  };

  /**
   * Gets directions and route between points
   * @private
   */
  const getDirectionsAndRoute = async (origin, destination, step) => {
    const directions = await getStepsInHTML(origin, destination, "walking");
    const route = await getPolyline(origin, destination, "walking");

    return {
      directions: formatDirections(directions, step),
      route: route || [],
    };
  };

  /**
   * Formats directions with improved text
   * @private
   */
  const formatDirections = (directions, step) => {
    if (!directions || directions.length === 0) {
      return createFallbackDirections(step).directions;
    }

    return directions.map((direction) => {
      let text = parseHtmlInstructions(direction.html_instructions);

      if (text.includes("Destination")) {
        const destBuildingName = getDestinationDisplayName(step);
        text = `You've arrived at ${destBuildingName}.`;
      }

      return {
        ...direction,
        formatted_text: text,
      };
    });
  };

  /**
   * Gets destination name for display
   * @private
   */
  const getDestinationDisplayName = (step) => {
    if (step.endAddress && typeof step.endAddress === "string") {
      return step.endAddress.split(",")[0];
    }
    return step.endPoint;
  };

  /**
   * Creates fallback directions when detailed directions can't be obtained
   * @private
   */
  const createFallbackDirections = (step) => {
    const startLocation = step.startAddress || "starting location";
    const endLocation = step.endAddress || "destination building";

    return {
      directions: [
        {
          distance: "Unknown distance",
          html_instructions: `Walk from ${startLocation} to ${endLocation}`,
          formatted_text: `Walk from ${startLocation} to ${endLocation}`,
        },
      ],
      route: [],
    };
  };

  /**
   * Helper function to parse HTML instructions from Google Directions API
   * @private
   */
  const parseHtmlInstructions = (htmlString) => {
    return htmlString
      .replace(/<div[^>]*>/gi, " ")
      .replace(/<\/div>/gi, "")
      .replace(/<\/?b>/gi, "")
      .replace(/<wbr[^>]*>/gi, "");
  };

  const generateRandomToken = async () => {
    try {
      // Generate random bytes
      const randomBytes = await Crypto.getRandomBytesAsync(16);

      // Convert to base64 string
      let base64 = "";
      for (const byte of randomBytes) {
        base64 += String.fromCharCode(byte);
      }
      base64 = btoa(base64);

      // Remove non-alphanumeric characters and trim to length
      return base64.replace(/[+/=]/g, "").substring(0, 16);
    } catch (error) {
      console.error("Error generating random token:", error);
    }
  };
  //? To turn a text address into its longitude and latitude coordinates
  const geocodeAddress = async (address) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
          address
        )}&key=${GOOGLE_MAPS_API_KEY}`
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

      if (!data?.routes?.[0]?.legs?.[0]) {
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
        `https://maps.googleapis.com/maps/api/directions/json?origin=${o.latitude},${o.longitude}&destination=${d.latitude},${d.longitude}&mode=${mode}&key=${GOOGLE_MAPS_API_KEY}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (!data || data.status !== "OK") {
        throw new Error(
          `Direction API error: ${data?.status || "Unknown error"}`
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
        `https://maps.googleapis.com/maps/api/directions/json?origin=${origin.latitude},${origin.longitude}&destination=${destination.latitude},${destination.longitude}&mode=${mode}&key=${GOOGLE_MAPS_API_KEY}`
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

      if (!data?.routes?.[0]?.overview_polyline?.points) {
        console.error(
          "Error fetching polyline: No overview_polyline.points found",
          data
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

  const searchPlaces = async (text, userLocation, sessionToken) => {
    if (text.length < 3) {
      return { predictions: [] };
    }

    try {
      let locationParam = "";
      if (userLocation?.latitude && userLocation?.longitude) {
        locationParam = `&location=${userLocation.latitude},${userLocation.longitude}&radius=5000`;
      } else {
        console.warn(
          "User location not available. Searching without location bias."
        );
      }

      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${text}&key=${GOOGLE_MAPS_API_KEY}&components=country:ca${locationParam}&sessiontoken=${sessionToken}`
      );

      const data = await response.json();
      return { predictions: data.predictions || [] };
    } catch (error) {
      console.error("Error searching places:", error);
      return { predictions: [], error };
    }
  };

  const fetchPlaceDetails = async (placeId, sessionToken) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=geometry,formatted_address&key=${GOOGLE_MAPS_API_KEY}&sessiontoken=${sessionToken}`
      );
      const data = await response.json();

      if (!data?.result?.geometry?.location) {
        throw new Error("Invalid place details response");
      }

      return {
        latitude: data.result.geometry.location.lat,
        longitude: data.result.geometry.location.lng,
        formatted_address: data.result.formatted_address || null,
      };
    } catch (error) {
      console.error("Error fetching place details:", error);
      throw error;
    }
  };

  return {
    geocodeAddress,
    getStepsInHTML,
    getDirections,
    getPolyline,
    generateRandomToken,
    fetchOutdoorDirections,
    parseHtmlInstructions,
    searchPlaces,
    fetchPlaceDetails,
  };
};
