/**
 * Route strategies for different types of location pairs
 */

const RouteStrategies = {
  /**
   * Indoor strategy for paths between rooms in buildings
   */
  Indoor: {
    calculateDistance(locationA, locationB) {
      // If in same building, use direct indoor distance
      if (locationA.buildingId === locationB.buildingId) {
        return this._calculateSameBuildingDistance(locationA, locationB);
      }

      // Different buildings - use tunnel system or known indoor paths
      return this._calculateCrossBuildingDistance(locationA, locationB);
    },

    isPathAllowed(locationA, locationB, avoidOutdoor) {
      // Different buildings - check if connected by tunnels/indoor paths
      if (locationA.buildingId !== locationB.buildingId) {
        // Check building connectivity through indoor paths
        return this._buildingsHaveIndoorConnection(
          locationA.buildingId,
          locationB.buildingId,
        );
      }
      return true; // Same building is always allowed
    },

    _calculateSameBuildingDistance(locationA, locationB) {
      // Implement indoor distance logic (floor differences, etc.)
      // ...
      return 1; // Placeholder
    },

    _calculateCrossBuildingDistance(locationA, locationB) {
      // Implement cross-building distance logic
      // ...
      return 10; // Placeholder
    },

    _buildingsHaveIndoorConnection(buildingA, buildingB) {
      // Check building connectivity (tunnels, bridges, etc.)
      // This would use building data to determine connectivity
      // ...
      return true; // Placeholder
    },
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
