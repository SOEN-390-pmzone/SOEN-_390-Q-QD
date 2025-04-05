/**
 * Route strategies for different types of location pairs
 */
import FloorRegistry from '../BuildingDataService';
import { RoomToRoomSameFloor, BaseCalculation } from './RouteDecorators';

const RouteStrategies = {
  /**
   * Indoor Strategy for rooms in the same floor
   */
  SameFloorSameBuilding: {
    calculateDistance(locationA, locationB) {
      console.log("Same Floor, same BuildingStrategy chosen, now calculating distance");
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
    }
  },
  DifferentFloorSameBuilding: {
    calculateDistance(locationA, locationB) {
      // Create a base calculation that returns 0
      const baseCalculation = () => 0;
      
      // Step 1: Find elevators on both floors
      const buildingType = FloorRegistry.getBuildingTypeFromId(locationA.buildingId);
      const elevatorOnFloorA = FloorRegistry._findElevatorForBuilding(buildingType, locationA.floor);
      const elevatorOnFloorB = FloorRegistry._findElevatorForBuilding(buildingType, locationB.floor);
      
      // Exit early with a fallback calculation if elevators aren't found
      if (!elevatorOnFloorA || !elevatorOnFloorB) {
        console.error(`No elevators found for building ${locationA.buildingId}, using fallback distance`);
        return 100; // Fallback distance - consider using a better estimate
      }
      
      // Step 2: Calculate distance from locationA to elevator on same floor
      const roomToElevatorCalculator = RoomToRoomSameFloor(baseCalculation);
      const distanceToElevator = roomToElevatorCalculator(locationA, elevatorOnFloorA);
      
      // Step 3: Calculate elevator transition cost between floors
      const getFloorNumericValue = (floor) => {
        if (!floor) return 0;
        
        // Handle special floor designations
        if (floor === 'T' || floor === 't') return 0; // Tunnel level is floor 
        
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
      const distanceFromElevator = elevatorToRoomCalculator(elevatorOnFloorB, locationB);
      
      const totalDistance = distanceToElevator + elevatorTransitionCost + distanceFromElevator;
      
      console.log(`Path via elevator: ${distanceToElevator} + ${elevatorTransitionCost} + ${distanceFromElevator} = ${totalDistance}`);
      
      return totalDistance;
    },
    isPathAllowed(locationA, locationB, avoidOutdoor) {
      // Same floor check
      if (locationA.buildingId !== locationB.buildingId) {
        return false;
      }
      return true; // Same building is always allowed
    },
  },DifferentBuildingSameCampus:{},

  /**
   * Outdoor strategy for paths between outdoor locations
   */
  Outdoor: {
    
  },

  /**
   * Mixed strategy for paths between indoor and outdoor locations
   */
  Mixed: {
    
  },

  DifferentCampuses:{

  },
};

export default RouteStrategies;
