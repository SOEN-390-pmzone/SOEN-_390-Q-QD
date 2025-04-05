/**
 * Route strategies for different types of location pairs
 */
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

  /**
   * Outdoor strategy for paths between outdoor locations
   */
  Outdoor: {
    calculateDistance(locationA, locationB) {
      // Simple haversine formula or similar for direct outdoor distance
      return Math.sqrt(
        Math.pow(locationB.latitude - locationA.latitude, 2) +
          Math.pow(locationB.longitude - locationA.longitude, 2),
      );
    },

    isPathAllowed(locationA, locationB, avoidOutdoor) {
      // If avoiding outdoor paths, this might return false
      // But typically all outdoor paths are possible
      return (
        !avoidOutdoor || this._isShortDistanceOutdoors(locationA, locationB)
      );
    },

    _isShortDistanceOutdoors(locationA, locationB) {
      // Logic to determine if an outdoor path is short enough to be acceptable
      // even when avoiding outdoor paths
      // ...
      return true; // Placeholder
    },
  },

  /**
   * Mixed strategy for paths between indoor and outdoor locations
   */
  Mixed: {
    calculateDistance(locationA, locationB) {
      // Find nearest building entrance to the outdoor location
      // Then calculate: indoor location -> building entrance + entrance -> outdoor location
      // ...
      return 5; // Placeholder
    },

    isPathAllowed(locationA, locationB, avoidOutdoor) {
      // Mixed paths are always allowed, but might prefer certain entrances
      // based on user preferences
      return true;
    },
  },
};

export default RouteStrategies;
