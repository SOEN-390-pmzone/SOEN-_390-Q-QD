/**
 * Route strategies for different types of location pairs
 */
import FloorRegistry from "../BuildingDataService";
import {
  RoomToRoomSameFloor,
  ElevatorTravel,
  OutdoorTravel,
  BaseCalculation,
  BuildingToEntrance,
} from "./RouteDecorators";

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
      const distance = roomToRoomCalculator(locationA, locationB);
      console.log(
        "Distance found between" +
          locationA +
          "and" +
          locationB +
          "of" +
          distance,
      );
      return distance;
    },

    isPathAllowed(locationA, locationB) {
      // Same floor check
      if (locationA.floor !== locationB.floor) {
        console.log("Same floor same building path not allowed");
        return false;
      }
      return true; // Same building is always allowed
    },
  },
  DifferentFloorSameBuilding: {
    calculateDistance(locationA, locationB) {
      console.log(
        "Different Floor Same Building strategy chosen, calculating distance",
      );

      // Create a base calculation
      const baseCalculation = BaseCalculation();

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
        return 100; // Fallback distance
      }

      // Build a complete route calculator using decorators:
      // 1. Calculate room to elevator on source floor
      // 2. Calculate elevator travel between floors
      // 3. Calculate elevator to room on destination floor

      // First leg: Source room to elevator on same floor
      const firstLegDistance = RoomToRoomSameFloor(baseCalculation)(
        locationA,
        elevatorOnFloorA,
      );
      console.log("DifferentFloorSameBuilding Leg 1 complete");

      // Second leg: Elevator travel between floors
      const secondLegDistance = ElevatorTravel(baseCalculation)(
        elevatorOnFloorA,
        elevatorOnFloorB,
      );
      console.log("DifferentFloorSameBuilding Leg 2 complete");

      // Third leg: Elevator to destination room on same floor
      const thirdLegDistance = RoomToRoomSameFloor(baseCalculation)(
        elevatorOnFloorB,
        locationB,
      );
      console.log("DifferentFloorSameBuilding Leg 3 complete");

      // Total distance is the sum of the three legs
      const totalDistance =
        firstLegDistance + secondLegDistance + thirdLegDistance;

      console.log(
        `Path via elevator: ${firstLegDistance}m (to elevator) + ${secondLegDistance}m (elevator travel) + ${thirdLegDistance}m (from elevator) = ${totalDistance}m total`,
      );

      return totalDistance;
    },

    isPathAllowed(locationA, locationB) {
      // Check if locations are in the same building but different floors
      return locationA.buildingId === locationB.buildingId; // Return true only if buildings match
    },
  },
  DifferentBuilding: {
    calculateDistance(locationA, locationB) {
      console.log("Different Building strategy chosen, calculating distance");

      // Create a base calculation that returns 0
      const baseCalculation = () => 0;

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

      // Step 2: Calculate the distance from source room to source building exit
      const buildingToEntranceCalculator = BuildingToEntrance(baseCalculation);
      console.log(
        "Different Building strategy chosen,Step 2: calculate distance from room to building exit",
      );

      const distanceToExit = buildingToEntranceCalculator(
        locationA,
        RouteStrategies,
      );
      console.log(
        "Different Building strategy chosen,Step 3: outdoor distance between buildings",
      );

      // Step 3: Calculate outdoor distance between building entrances
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

      const outdoorTravelCalculator = OutdoorTravel(baseCalculation);
      const outdoorDistance = outdoorTravelCalculator(outdoorLocA, outdoorLocB);
      console.log(
        "Different Building strategy chosen,Step 4: Calculate distance from destination building entrance to destination room",
      );

      // Step 4: Calculate distance from destination building entrance to destination room
      const entranceToRoomCalculator = BuildingToEntrance(baseCalculation);
      const distanceFromEntrance = entranceToRoomCalculator(
        locationB,
        RouteStrategies,
      );
      console.log(
        "Different Building strategy chosen,Step 5: add up distances",
      );

      // Step 5: Calculate total distance
      const totalDistance =
        distanceToExit + outdoorDistance + distanceFromEntrance;

      console.log(
        `Path between buildings: ${distanceToExit}m (exit) + ${outdoorDistance}m (outdoor) + ${distanceFromEntrance}m (entrance) = ${totalDistance}m total`,
      );

      return totalDistance;
    },

    isPathAllowed(locationA, locationB) {
      return (
        !!locationA.buildingId &&
        !!locationB.buildingId &&
        locationA.buildingId !== locationB.buildingId
      );
    },
  },
  /**
   * Outdoor strategy for paths between outdoor locations
   */
  Outdoor: {
    calculateDistance: (locationA, locationB) => {
      console.log("Outdoor strategy chosen, calculating distance");

      // Create a base calculation that returns 0
      const baseCalculation = () => 0;

      // Use the OutdoorTravel decorator to calculate the distance
      const outdoorTravelCalculator = OutdoorTravel(baseCalculation);
      const distance = outdoorTravelCalculator(locationA, locationB);

      console.log(`Distance calculated: ${distance} meters`);
      return distance;
    },

    isPathAllowed(locationA, locationB) {
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

  Mixed: {
    calculateDistance(locationA, locationB) {
      console.log(
        "Mixed strategy chosen, calculating distance between indoor and outdoor locations",
      );

      // Create a base calculation that returns 0
      const baseCalculation = () => 0;
      console.log("Mixed STEP1");

      // Step 1: Determine which location is indoor and which is outdoor
      const indoorLocation =
        locationA.type === "indoor" ? locationA : locationB;
      const outdoorLocation =
        locationA.type === "outdoor" ? locationA : locationB;
      console.log("Mixed STEP2");

      // Step 2: Get building coordinates for the indoor location
      const buildingCoords = FloorRegistry.getCoordinatesForBuilding(
        indoorLocation.buildingId,
      );

      if (!buildingCoords) {
        console.error(
          `Building coordinates not found for ${indoorLocation.buildingId}, using fallback distance`,
        );
        return 300; // Fallback distance
      }
      console.log("Mixed STEP3");

      // Step 3: Calculate the indoor segment (from indoor location to building entrance)
      // Use the BuildingToEntrance decorator to calculate this part
      const buildingToEntranceCalculator = BuildingToEntrance(baseCalculation);
      const indoorDistance = buildingToEntranceCalculator(
        indoorLocation,
        RouteStrategies,
      );
      console.log("Mixed STEP4");

      // Step 4: Calculate the outdoor segment (from building entrance to outdoor location)
      // Create an outdoor point representing the building entrance
      const entranceOutdoor = {
        type: "outdoor",
        latitude: buildingCoords.latitude,
        longitude: buildingCoords.longitude,
        title: `${indoorLocation.buildingId} Outside Entrance`,
      };

      // Use the OutdoorTravel decorator to calculate this part
      const outdoorTravelCalculator = OutdoorTravel(baseCalculation);
      const outdoorDistance = outdoorTravelCalculator(
        entranceOutdoor,
        outdoorLocation,
      );
      console.log("Mixed STEP5");

      // Step 5: Sum the distances
      const totalDistance = indoorDistance + outdoorDistance;

      console.log(
        `Mixed path: ${indoorDistance}m (indoor) + ${outdoorDistance}m (outdoor) = ${totalDistance}m total`,
      );

      return totalDistance;
    },

    isPathAllowed(locationA, locationB) {
      // Verify one location is indoor and one is outdoor
      const hasIndoor =
        locationA.type === "indoor" || locationB.type === "indoor";
      const hasOutdoor =
        locationA.type === "outdoor" || locationB.type === "outdoor";

      if (!hasIndoor || !hasOutdoor) {
        console.log(
          "Mixed strategy requires one indoor and one outdoor location",
        );
        return false;
      }

      // For indoor location, check that it has a valid buildingId
      const indoorLocation =
        locationA.type === "indoor" ? locationA : locationB;
      if (!indoorLocation.buildingId) {
        console.warn("Indoor location missing buildingId");
        return false;
      }

      // For outdoor location, check that it has valid coordinates
      const outdoorLocation =
        locationA.type === "outdoor" ? locationA : locationB;
      if (
        outdoorLocation.latitude === undefined ||
        outdoorLocation.latitude === null ||
        outdoorLocation.longitude === undefined ||
        outdoorLocation.longitude === null
      ) {
        console.warn(
          "Outdoor location missing coordinates:",
          `(${outdoorLocation.latitude},${outdoorLocation.longitude})`,
        );
        return false;
      }

      return true;
    },
  },
};

export default RouteStrategies;
