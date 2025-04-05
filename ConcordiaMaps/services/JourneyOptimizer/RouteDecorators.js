import { useGoogleMapDirections } from "../../hooks/useGoogleMapDirections";
import { findShortestPath } from "../../components/IndoorNavigation/PathFinder";
import FloorRegistry from "../../services/BuildingDataService";

const pathLengthToMetersRatio = 6.5; //The paths in the nodes are written in length units :0.5,1,2.5 etc. The ratio between those units and real distance is about 6.5m

export const OutdoorToOutdoor =
  (baseCalculation) => async (locationA, locationB) => {
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
export const RoomToRoomSameFloor =
  (baseCalculation) => (locationA, locationB) => {
    const normalizedBuildingA = normalizeBuildingId(locationA.buildingId);
    const normalizedBuildingB = normalizeBuildingId(locationB.buildingId);

    // Verify both locations are in the same building and same floor
    if (normalizedBuildingA !== normalizedBuildingB) {
      console.error(
        `Locations are in different buildings: ${locationA.buildingId} and ${locationB.buildingId}`,
      );
      return baseCalculation(locationA, locationB);
    }

    // Rest of your function remains the same
    if (locationA.floor !== locationB.floor) {
      console.error(
        `Locations are on different floors: ${locationA.floor} and ${locationB.floor}`,
      );
      return baseCalculation(locationA, locationB);
    }

    // Fetch the graph for the specific building and floor
    const buildingType = FloorRegistry.getBuildingTypeFromId(
      locationA.buildingId,
    );
    const floorGraph = FloorRegistry.getGraph(buildingType, locationA.floor);

    if (!floorGraph) {
      console.error(
        `Graph not found for building: ${buildingType}, floor: ${locationA.floor}`,
      );
      return baseCalculation(locationA, locationB); // Fallback to base calculation
    }

    // Use the findShortestPath function to calculate the shortest path
    const path = findShortestPath(floorGraph, locationA.room, locationB.room);

    if (!path || path.length === 0) {
      console.error(
        `No path found between ${locationA.room} and ${locationB.room}`,
      );
      return baseCalculation(locationA, locationB); // Fallback to base calculation
    }

    // Calculate the total distance by summing the weights of the edges in the path
    let totalDistance = 0;
    for (let i = 0; i < path.length - 1; i++) {
      const currentNode = path[i];
      const nextNode = path[i + 1];
      totalDistance +=
        floorGraph[currentNode][nextNode] * pathLengthToMetersRatio;
    }

    // Add the base calculation result
    return totalDistance + baseCalculation(locationA, locationB);
  };
export const RoomToExit = (baseCalculation) => (locationA, locationB) => {
  // Room-to-exit distance calculation logic
  const roomToExitDistance = 2; // Placeholder for actual logic
  return roomToExitDistance + baseCalculation(locationA, locationB);
};

export const RoomToElevator = (baseCalculation) => (locationA, locationB) => {
  // Room-to-exit distance calculation logic
  const roomToExitDistance = 2; // Placeholder for actual logic
  return roomToExitDistance + baseCalculation(locationA, locationB);
};

export const RoomToStairs = (baseCalculation) => (locationA, locationB) => {
  // Room-to-exit distance calculation logic
  const roomToExitDistance = 2; // Placeholder for actual logic
  return roomToExitDistance + baseCalculation(locationA, locationB);
};

export const RoomToTunnel = (baseCalculation) => (locationA, locationB) => {
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

// Helper function to normalize building IDs
const normalizeBuildingId = (buildingId) => {
  if (!buildingId) return "";

  // Map of equivalent building IDs
  const buildingIdMap = {
    h: "hall",
    hall: "hall",
    mb: "jmsb",
    jmsb: "jmsb",
    ev: "ev",
    lb: "library",
    library: "library",
    ve: "ve",
    vl: "vl",
  };

  return buildingIdMap[buildingId.toLowerCase()] || buildingId.toLowerCase();
};
