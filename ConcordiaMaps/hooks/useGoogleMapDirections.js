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
      // Handle origin coordinates
      let originCoords;
      if (step.startPoint && typeof step.startPoint === "string") {
        try {
          originCoords = await geocodeAddress(step.startPoint);
        } catch (geocodeError) {
          console.error("Error geocoding startPoint:", geocodeError);

          // Try looking up building coordinates if available in options
          if (options.buildingRegistry) {
            const startBuilding = options.buildingRegistry.findBuilding(
              step.startPoint,
            );
            if (startBuilding) {
              originCoords = options.buildingRegistry.getCoordinatesForBuilding(
                startBuilding.id,
              );
            }
          }
        }
      } else if (step.startPoint?.latitude && step.startPoint?.longitude) {
        originCoords = step.startPoint;
      } else if (options.originDetails) {
        originCoords = {
          latitude: options.originDetails.latitude,
          longitude: options.originDetails.longitude,
        };
      }

      // Handle destination coordinates with similar pattern
      let destinationCoords;
      if (step.endPoint) {
        if (typeof step.endPoint === "string") {
          try {
            destinationCoords = await geocodeAddress(step.endPoint);
          } catch (geocodeError) {
            console.error("Error geocoding endPoint:", geocodeError);

            // Try building registry lookup
            if (options.buildingRegistry) {
              const destBuilding = options.buildingRegistry.findBuilding(
                step.endPoint,
              );
              if (destBuilding) {
                destinationCoords =
                  options.buildingRegistry.getCoordinatesForBuilding(
                    destBuilding.id,
                  );
              }
            }
          }
        } else if (step.endPoint.latitude && step.endPoint.longitude) {
          destinationCoords = step.endPoint;
        }
      }

      if (!originCoords || !destinationCoords) {
        throw new Error(
          "Could not determine origin or destination coordinates",
        );
      }

      // Get directions and route
      const directions = await getStepsInHTML(
        originCoords,
        destinationCoords,
        "walking",
      );
      const route = await getPolyline(
        originCoords,
        destinationCoords,
        "walking",
      );

      // Format directions with improved text
      let formattedDirections = [];

      if (directions && directions.length > 0) {
        formattedDirections = directions.map((direction) => {
          let text = parseHtmlInstructions(direction.html_instructions);

          if (text.includes("Destination")) {
            const destBuildingName =
              step.endAddress && typeof step.endAddress === "string"
                ? step.endAddress.split(",")[0]
                : step.endPoint;
            text = `You've arrived at ${destBuildingName}.`;
          }

          return {
            ...direction,
            formatted_text: text,
          };
        });
      } else {
        // Provide fallback directions
        formattedDirections = [
          {
            distance: "approx. 250m",
            html_instructions: `Walk from ${step.startAddress || "starting location"} to ${step.endAddress || "destination building"}`,
            formatted_text: `Walk from ${step.startAddress || "starting location"} to ${step.endAddress || "destination building"}`,
          },
        ];
      }

      return {
        directions: formattedDirections,
        route: route || [],
      };
    } catch (error) {
      console.error("Error fetching outdoor directions:", error);

      // Return fallback directions even on error
      return {
        directions: [
          {
            distance: "Unknown distance",
            html_instructions: `Walk from ${step.startAddress || "starting location"} to ${step.endAddress || "destination building"}`,
            formatted_text: `Walk from ${step.startAddress || "starting location"} to ${step.endAddress || "destination building"}`,
          },
        ],
        route: [],
      };
    }
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

      if (!data?.routes?.[0]?.overview_polyline?.points) {
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
    generateRandomToken,
    fetchOutdoorDirections,
    parseHtmlInstructions,
  };
};
