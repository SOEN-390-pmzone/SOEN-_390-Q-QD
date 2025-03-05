import axios from "axios";
const convertToCoordinates = async (postal_code) => {
  const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;
  try {
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${postal_code}&key=${GOOGLE_MAPS_API_KEY}`,
    );
    const { status, results } = response.data;

    if (status === "OK") {
      if (results.length > 0) {
        const { lat, lng } = results[0].geometry.location;
        return { latitude: lat, longitude: lng };
      } else {
        return { error: "ZERO_RESULTS" };
      }
    } else return { error: status };
  } catch (error) {
    console.error("Error converting to coordinates:", error);
    return { error: "Something went wrong. Please try again later." };
  }
};
export default convertToCoordinates;
