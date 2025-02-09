const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;

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
  const getStepsInHTML = async (origin, destination) => {
    try {
      const data = await getDirections(origin, destination);

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
  const getDirections = async (o, d) => {
    console.log("GETTING DIRECTIONS");
    try {
      if (!o || !d) {
        throw new Error("Invalid origin or destination");
      }

      const response = await fetch(
        `https://maps.googleapis.com/maps/api/directions/json?origin=${o.latitude},${o.longitude}&destination=${d.latitude},${d.longitude}&mode=walking&key=${GOOGLE_MAPS_API_KEY}`,
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

      //! TODO : Implement the polyline in the map
      //   const route = data.routes[0];
      //   const encodedPolyline = route.overview_polyline.points;
      //   const decodedPolyline = decodePolyline(encodedPolyline);
      //   setDirections(decodedPolyline);

      return data;
    } catch (error) {
      console.error("Directions error:", error);
      throw error;
    }
  };

  //! TODO : Decode and imlpement the poly line
  //   const decodePolyline = (encoded) => {
  //     const poly = [];
  //     let index = 0,
  //       len = encoded.length;
  //     let lat = 0,
  //       lng = 0;

  //     while (index < len) {
  //       let b,
  //         shift = 0,
  //         result = 0;
  //       do {
  //         b = encoded.charCodeAt(index++) - 63;
  //         result |= (b & 0x1f) << shift;
  //         shift += 5;
  //       } while (b >= 0x20);
  //       const dlat = ((result & 1) != 0 ? ~(result >> 1) : result >> 1);
  //       lat += dlat;

  //       shift = 0;
  //       result = 0;
  //       do {
  //         b = encoded.charCodeAt(index++) - 63;
  //         result |= (b & 0x1f) << shift;
  //         shift += 5;
  //       } while (b >= 0x20);
  //       const dlng = ((result & 1) != 0 ? ~(result >> 1) : result >> 1);
  //       lng += dlng;

  //       poly.push({
  //         latitude: lat / 1e5,
  //         longitude: lng / 1e5,
  //       });
  //     }
  //     return poly;
  //   };

  return {
    // State

    // Setters

    // Methods
    geocodeAddress,
    getStepsInHTML,
    getDirections,
  };
};
