import { useGoogleMapDirections } from "../../hooks/useGoogleMapDirections";
import { findShortestPath } from "../../components/IndoorNavigation/PathFinder";
import FloorRegistry from "../../services/BuildingDataService";

const pathLengthToMetersRatio = 6.5; //The paths in the nodes are written in length units :0.5,1,2.5 etc. The ratio between those units and real distance is about 6.5m

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
export const RoomToRoomSameFloor = (baseCalculation) => (locationA, locationB) => {
    const normalizedBuildingA = normalizeBuildingId(locationA.buildingId);
    const normalizedBuildingB = normalizeBuildingId(locationB.buildingId);
    console.log("RoomToRoomSameFloor Strategy called")
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

// ElevatorTravel decorator to calculate cost of floor transitions
export const ElevatorTravel = (baseCalculation) => (locationA, locationB) => {
    // Calculate elevator transition cost between floors
    const getFloorNumericValue = (floor) => {
      if (!floor) return 0;
      
      // Handle special floor designations
      if (floor === "T" || floor === "t") return 0; // Tunnel level is floor
      
      // Try to parse as integer, default to 0 if NaN
      const parsed = parseInt(floor);
      return isNaN(parsed) ? 0 : parsed;
    };
    
    const floorValueA = getFloorNumericValue(locationA.floor);
    const floorValueB = getFloorNumericValue(locationB.floor);
    const floorDifference = Math.abs(floorValueA - floorValueB);
    const elevatorTransitionCost = floorDifference * 5; // 5 units per floor transition
    
    return baseCalculation(locationA, locationB) + elevatorTransitionCost;
  };
// OutdoorTravel decorator to calculate distance between outdoor points
export const OutdoorTravel = (baseCalculation) => {
  return (locationA, locationB) => {
    // Calculate using Haversine formula
    const R = 6371e3; // Earth radius in meters
    const φ1 = (locationA.latitude * Math.PI) / 180;
    const φ2 = (locationB.latitude * Math.PI) / 180;
    const Δφ = ((locationB.latitude - locationA.latitude) * Math.PI) / 180;
    const Δλ = ((locationB.longitude - locationA.longitude) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const outdoorDistance = R * c; // Distance in meters
    
    // Add the base calculation result
    return baseCalculation(locationA, locationB) + outdoorDistance;
  };
};

// Remove the direct import to avoid circular dependency
// import RouteStrategies from "./RouteStrategies";

// BuildingToEntrance decorator for calculating distance from a room to building entrance
export const BuildingToEntrance = (baseCalculation) => {
  return (location, routeStrategies) => {
    // Extract building ID from location
    const buildingId = location.buildingId;
    
    if (!buildingId) {
      console.error("Missing building ID for location");
      return baseCalculation(location, location) + 100; // Fallback distance
    }
    
    const entrance = {
      type: "indoor",
      buildingId: buildingId,
      floor: "1",
      room: "entrance", // Use entrance as the room ID
      title: `${buildingId} Entrance`,
    };
    
    let distanceToEntrance;
    try {
      if (location.floor === "1") {
        // If already on floor 1, use SameFloorSameBuilding strategy
        distanceToEntrance = routeStrategies.SameFloorSameBuilding.calculateDistance(
          location,
          entrance
        );
      } else {
        // If on different floor, use DifferentFloorSameBuilding strategy
        distanceToEntrance = routeStrategies.DifferentFloorSameBuilding.calculateDistance(
          location,
          entrance
        );
      }
    } catch (error) {
      console.error("Error calculating distance to entrance:", error);
      distanceToEntrance = 100; // Fallback distance
    }
    
    return baseCalculation(location, entrance) + distanceToEntrance;
  };
};

// EntranceToBuilding decorator for calculating distance from building entrance to a room
export const EntranceToBuilding = (baseCalculation) => {
  return (location, routeStrategies) => {
    // Extract building ID from location
    const buildingId = location.buildingId;
    
    if (!buildingId) {
      console.error("Missing building ID for location");
      return baseCalculation(location, location) + 100; // Fallback distance
    }
    
    const entrance = {
      type: "indoor",
      buildingId: buildingId,
      floor: "1",
      room: "entrance", // Use entrance as the room ID
      title: `${buildingId} Entrance`,
    };
    
    let distanceFromEntrance;
    try {
      if (location.floor === "1") {
        // If already on floor 1, use SameFloorSameBuilding strategy
        distanceFromEntrance = routeStrategies.SameFloorSameBuilding.calculateDistance(
          entrance,
          location
        );
      } else {
        // If on different floor, use DifferentFloorSameBuilding strategy
        distanceFromEntrance = routeStrategies.DifferentFloorSameBuilding.calculateDistance(
          entrance,
          location
        );
      }
    } catch (error) {
      console.error("Error calculating distance from entrance:", error);
      distanceFromEntrance = 100; // Fallback distance
    }
    
    return baseCalculation(entrance, location) + distanceFromEntrance;
  };
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
