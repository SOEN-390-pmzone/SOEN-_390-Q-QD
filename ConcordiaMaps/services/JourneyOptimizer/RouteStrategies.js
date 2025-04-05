/**
 * Route strategies for different types of location pairs
 */
import FloorRegistry from "../BuildingDataService";
import { RoomToRoomSameFloor, BaseCalculation } from "./RouteDecorators";

const RouteStrategies = {
  /**
   * Indoor Strategy for rooms in the same floor
   */
  SameFloorSameBuilding: {
    calculateDistance(locationA, locationB) {
      console.log(
        "Same Floor, same BuildingStrategy chosen, now calculating distance",
      );
      // Create a base calculation that returns 0
      const baseCalculation = () => 0;
      // Use the RoomToRoomSameFloor decorator to calculate distance
      const roomToRoomCalculator = RoomToRoomSameFloor(baseCalculation);
      // Get the distance using the decorated calculator
      return roomToRoomCalculator(locationA, locationB);
    },

    isPathAllowed(locationA, locationB, avoidOutdoor) {
      // Same floor check
      if (locationA.floor !== locationB.floor) {
        return false;
      }
      return true; // Same building is always allowed
    },
  },
  DifferentFloorSameBuilding: {
    calculateDistance(locationA, locationB) {
      // Create a base calculation that returns 0
      const baseCalculation = () => 0;

      // Step 1: Find elevators on both floors
      const buildingType = FloorRegistry.getBuildingTypeFromId(
        locationA.buildingId,
      );
      const elevatorOnFloorA = FloorRegistry._findElevatorForBuilding(
        buildingType,
        locationA.floor,
      );
      const elevatorOnFloorB = FloorRegistry._findElevatorForBuilding(
        buildingType,
        locationB.floor,
      );

      // Exit early with a fallback calculation if elevators aren't found
      if (!elevatorOnFloorA || !elevatorOnFloorB) {
        console.error(
          `No elevators found for building ${locationA.buildingId}, using fallback distance`,
        );
        return 100; // Fallback distance - consider using a better estimate
      }

      // Step 2: Calculate distance from locationA to elevator on same floor
      const roomToElevatorCalculator = RoomToRoomSameFloor(baseCalculation);
      const distanceToElevator = roomToElevatorCalculator(
        locationA,
        elevatorOnFloorA,
      );

      // Step 3: Calculate elevator transition cost between floors
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

      // Step 4: Calculate distance from elevator to locationB on same floor
      const elevatorToRoomCalculator = RoomToRoomSameFloor(baseCalculation);
      const distanceFromElevator = elevatorToRoomCalculator(
        elevatorOnFloorB,
        locationB,
      );

      const totalDistance =
        distanceToElevator + elevatorTransitionCost + distanceFromElevator;

      console.log(
        `Path via elevator: ${distanceToElevator} + ${elevatorTransitionCost} + ${distanceFromElevator} = ${totalDistance}`,
      );

      return totalDistance;
    },
    isPathAllowed(locationA, locationB, avoidOutdoor) {
      // Same floor check
      if (locationA.buildingId !== locationB.buildingId) {
        return false;
      }
      return true; // Same building is always allowed
    },
  },
  DifferentBuilding: {
    calculateDistance(locationA, locationB) {
      console.log("Different Building strategy chosen, calculating distance");

      // Step 1: Get building coordinates from BuildingDataService
      const buildingACoords = FloorRegistry.getCoordinatesForBuilding(
        locationA.buildingId,
      );
      const buildingBCoords = FloorRegistry.getCoordinatesForBuilding(
        locationB.buildingId,
      );

      if (!buildingACoords || !buildingBCoords) {
        console.error(
          `Building coordinates not found for ${locationA.buildingId} or ${locationB.buildingId}, using fallback distance`,
        );
        return 500; // Fallback distance
      }

      const entranceA = {
        type: "indoor",
        buildingId: locationA.buildingId,
        floor: "1",
        room: FloorRegistry.normalizeRoomId("entrance"), // Use normalization
        title: `${locationA.buildingId} Entrance`,
      };
      
      const entranceB = {
        type: "indoor",
        buildingId: locationB.buildingId,
        floor: "1",
        room: FloorRegistry.normalizeRoomId("entrance"), // Use normalization
        title: `${locationB.buildingId} Entrance`,
      };

      // Step 3: Calculate the three segments of the journey

      // Part A: From source room to source building exit
      let distanceToExit;
      try {
        if (locationA.floor === "1") {
          // If already on floor 1, use SameFloorSameBuilding strategy
          distanceToExit =
            RouteStrategies.SameFloorSameBuilding.calculateDistance(
              locationA,
              entranceA,
            );
        } else {
          // If on different floor, use DifferentFloorSameBuilding strategy
          distanceToExit =
            RouteStrategies.DifferentFloorSameBuilding.calculateDistance(
              locationA,
              entranceA,
            );
        }
      } catch (error) {
        console.error("Error calculating distance to exit:", error);
        distanceToExit = 100; // Fallback distance if calculation fails
      }

      // Part B: From source building exit to destination building entrance (outdoor)
      const outdoorLocA = {
        type: "outdoor",
        latitude: buildingACoords.latitude,
        longitude: buildingACoords.longitude,
      };

      const outdoorLocB = {
        type: "outdoor",
        latitude: buildingBCoords.latitude,
        longitude: buildingBCoords.longitude,
      };

      const outdoorDistance = RouteStrategies.Outdoor.calculateDistance(
        outdoorLocA,
        outdoorLocB,
      );

      // Part C: From destination building entrance to destination room
      let distanceFromEntrance;
      try {
        if (locationB.floor === "1") {
          // If already on floor 1, use SameFloorSameBuilding strategy
          distanceFromEntrance =
            RouteStrategies.SameFloorSameBuilding.calculateDistance(
              entranceB,
              locationB,
            );
        } else {
          // If on different floor, use DifferentFloorSameBuilding strategy
          distanceFromEntrance =
            RouteStrategies.DifferentFloorSameBuilding.calculateDistance(
              entranceB,
              locationB,
            );
        }
      } catch (error) {
        console.error("Error calculating distance from entrance:", error);
        distanceFromEntrance = 100; // Fallback distance if calculation fails
      }

      const totalDistance =
        distanceToExit + outdoorDistance + distanceFromEntrance;

      console.log(
        `Path between buildings: ${distanceToExit}m (exit) + ${outdoorDistance}m (outdoor) + ${distanceFromEntrance}m (entrance) = ${totalDistance}m total`,
      );

      return totalDistance;
    },

    isPathAllowed(locationA, locationB, avoidOutdoor) {
      // Cannot navigate between buildings if outdoor paths are avoided
      if (avoidOutdoor) {
        console.log(
          "Cannot navigate between buildings when avoiding outdoor paths",
        );
        return false;
      }

      // Check that both locations have building IDs
      if (!locationA.buildingId || !locationB.buildingId) {
        console.warn("Missing building ID for indoor location");
        return false;
      }

      // Check that buildings are actually different
      if (locationA.buildingId === locationB.buildingId) {
        return false;
      }

      return true; // The actual campus check is done by the DistanceCalculatorService
    },
  },
  /**
   * Outdoor strategy for paths between outdoor locations
   */
  Outdoor: {
    calculateDistance: (locationA, locationB) => {
      // Remove 'async'
      console.log("Outdoor strategy chosen, calculating distance");

      // Calculate using Haversine formula synchronously
      const R = 6371e3; // Earth radius in meters
      const φ1 = (locationA.latitude * Math.PI) / 180;
      const φ2 = (locationB.latitude * Math.PI) / 180;
      const Δφ = ((locationB.latitude - locationA.latitude) * Math.PI) / 180;
      const Δλ = ((locationB.longitude - locationA.longitude) * Math.PI) / 180;

      const a =
        Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

      const distance = R * c; // Distance in meters
      console.log(`Distance calculated: ${distance} meters`);

      return distance; // Return a number, not a Promise
    },

    isPathAllowed(locationA, locationB, avoidOutdoor) {
      // Check if outdoor paths should be avoided
      if (avoidOutdoor) {
        console.log("Outdoor paths are being avoided by user preference");
        return false;
      }

      // Validate that both locations have coordinates (properly)
      if (
        locationA.latitude === undefined ||
        locationA.latitude === null ||
        locationA.longitude === undefined ||
        locationA.longitude === null ||
        locationB.latitude === undefined ||
        locationB.latitude === null ||
        locationB.longitude === undefined ||
        locationB.longitude === null
      ) {
        console.warn(
          "Outdoor location missing coordinates:",
          `A(${locationA.latitude},${locationA.longitude})`,
          `B(${locationB.latitude},${locationB.longitude})`,
        );
        return false;
      }

      return true; // Outdoor paths are allowed by default
    },
  },

  /**
 * Mixed strategy for paths between indoor and outdoor locations
 */
Mixed: {
  calculateDistance(locationA, locationB) {
    console.log("Mixed strategy chosen, calculating distance between indoor and outdoor locations");
    
    // Step 1: Determine which location is indoor and which is outdoor
    const indoorLocation = locationA.type === "indoor" ? locationA : locationB;
    const outdoorLocation = locationA.type === "outdoor" ? locationA : locationB;
    
    // Step 2: Get building coordinates for the indoor location
    const buildingCoords = FloorRegistry.getCoordinatesForBuilding(
      indoorLocation.buildingId
    );
    
    if (!buildingCoords) {
      console.error(
        `Building coordinates not found for ${indoorLocation.buildingId}, using fallback distance`
      );
      return 300; // Fallback distance
    }
    
    // Step 3: Create a building entrance location on floor 1
    const buildingEntrance = {
      type: "indoor",
      buildingId: indoorLocation.buildingId,
      floor: "1",
      // Use the normalization function to get the correct room ID
      room: FloorRegistry.normalizeRoomId("entrance"),
      title: `${indoorLocation.buildingId} Entrance`
    };
    
    // Step 4: Calculate the indoor segment (from indoor location to building entrance)
    let indoorDistance;
    try {
      if (indoorLocation.floor === "1") {
        // If already on floor 1, use SameFloorSameBuilding strategy
        indoorDistance = RouteStrategies.SameFloorSameBuilding.calculateDistance(
          indoorLocation,
          buildingEntrance
        );
      } else {
        // If on different floor, use DifferentFloorSameBuilding strategy
        indoorDistance = RouteStrategies.DifferentFloorSameBuilding.calculateDistance(
          indoorLocation,
          buildingEntrance
        );
      }
    } catch (error) {
      console.error("Error calculating indoor distance:", error);
      indoorDistance = 50; // Fallback if calculation fails
    }
    
    // Step 5: Calculate the outdoor segment (from building entrance to outdoor location)
    const entranceOutdoor = {
      type: "outdoor",
      latitude: buildingCoords.latitude,
      longitude: buildingCoords.longitude,
      title: `${indoorLocation.buildingId} Outside Entrance`
    };
    
    const outdoorDistance = RouteStrategies.Outdoor.calculateDistance(
      entranceOutdoor,
      outdoorLocation
    );
    
    // Step 6: Sum the distances
    const totalDistance = indoorDistance + outdoorDistance;
    
    console.log(
      `Mixed path: ${indoorDistance}m (indoor) + ${outdoorDistance}m (outdoor) = ${totalDistance}m total`
    );
    
    return totalDistance;
  },
  
  isPathAllowed(locationA, locationB, avoidOutdoor) {
    // Cannot use this path if avoiding outdoor travel
    if (avoidOutdoor) {
      console.log("Mixed indoor/outdoor paths are being avoided by user preference");
      return false;
    }
    
    // Verify one location is indoor and one is outdoor
    const hasIndoor = (locationA.type === "indoor" || locationB.type === "indoor");
    const hasOutdoor = (locationA.type === "outdoor" || locationB.type === "outdoor");
    
    if (!hasIndoor || !hasOutdoor) {
      console.log("Mixed strategy requires one indoor and one outdoor location");
      return false;
    }
    
    // For indoor location, check that it has a valid buildingId
    const indoorLocation = locationA.type === "indoor" ? locationA : locationB;
    if (!indoorLocation.buildingId) {
      console.warn("Indoor location missing buildingId");
      return false;
    }
    
    // For outdoor location, check that it has valid coordinates
    const outdoorLocation = locationA.type === "outdoor" ? locationA : locationB;
    if (
      outdoorLocation.latitude === undefined || 
      outdoorLocation.latitude === null ||
      outdoorLocation.longitude === undefined || 
      outdoorLocation.longitude === null
    ) {
      console.warn(
        "Outdoor location missing coordinates:",
        `(${outdoorLocation.latitude},${outdoorLocation.longitude})`
      );
      return false;
    }
    
    return true;
  }
}
};

export default RouteStrategies;
