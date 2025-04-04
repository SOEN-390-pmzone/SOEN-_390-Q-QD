import { useGoogleMapDirections } from "../../hooks/useGoogleMapDirections";

export const OutdoorToOutdoor = (baseCalculation) => async (locationA, locationB) => {
  const { getDirections } = useGoogleMapDirections();

  try {
    // Fetch directions using the Google Maps API
    const data = await getDirections(locationA, locationB, "walking");

    // Extract the total walking distance from the response
    const walkingDistance = data.routes[0].legs[0].distance.value; // Distance in meters

    // Add the base calculation result
    return walkingDistance + baseCalculation(locationA, locationB);
  } catch (error) {
    console.error("Error fetching walking distance:", error);
    return baseCalculation(locationA, locationB); // Fallback to base calculation
  }
};
  export const RoomToExit = (baseCalculation) => (locationA, locationB) => {
    // Room-to-exit distance calculation logic
    const roomToExitDistance = 2; // Placeholder for actual logic
    return roomToExitDistance + baseCalculation(locationA, locationB);
  };
  
  export const ExitToRoom = (baseCalculation) => (locationA, locationB) => {
    // Exit-to-room distance calculation logic
    const exitToRoomDistance = 3; // Placeholder for actual logic
    return exitToRoomDistance + baseCalculation(locationA, locationB);
  };
  
  export const BaseCalculation = () => () => {
    // Base calculation returns 0 as the starting point
    return 0;
  };