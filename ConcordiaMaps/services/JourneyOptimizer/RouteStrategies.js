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

      // Step 2: Create entrance locations using the building ID and floor 1
      const entranceA = {
        type: "indoor",
        buildingId: locationA.buildingId,
        floor: "1",
        room: "entrance", // Or use "Main lobby" depending on building convention
        title: `${locationA.buildingId} Entrance`,
      };

      const entranceB = {
        type: "indoor",
        buildingId: locationB.buildingId,
        floor: "1",
        room: "entrance",
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
  Mixed: {},
};

export default RouteStrategies;
