import {
  calculateDistance,
  getLocationCoordinates,
  estimateIndoorDistance,
  hasIndoorConnection,
  estimateDistanceBetweenBuildings,
} from "./NavigationHelperFunctions";

/**
 * Route Strategies for JourneyOptimizer
 *
 * This file contains strategy implementations for different route optimization approaches.
 * Following the Strategy Pattern, each strategy implements the same interface but provides
 * different algorithms for calculating path distances and determining valid paths.
 */

// Strategy interface (abstract)
export class RouteStrategy {
  calculateDistance(locationA, locationB) {
    /* abstract */
  }
  isPathAllowed(fromLocation, toLocation) {
    /* abstract */
  }
}

// Strategy for users who want to minimize distance regardless of indoor/outdoor
export class ShortestPathStrategy extends RouteStrategy {
  calculateDistance(locationA, locationB) {
    // If same building, use indoor distance
    if (
      locationA.buildingId &&
      locationB.buildingId &&
      locationA.buildingId === locationB.buildingId
    ) {
      return estimateIndoorDistance(locationA.room, locationB.room);
    }

    // Otherwise, calculate direct geographic distance
    const coordA = getLocationCoordinates(locationA);
    const coordB = getLocationCoordinates(locationB);
    return calculateDistance(coordA, coordB);
  }

  isPathAllowed() {
    // All paths are allowed in shortest path strategy
    return true;
  }
}

// Strategy for users who want to stay indoors
export class IndoorOnlyStrategy extends RouteStrategy {
  calculateDistance(locationA, locationB) {
    // If same building, use indoor distance
    if (
      locationA.buildingId &&
      locationB.buildingId &&
      locationA.buildingId === locationB.buildingId
    ) {
      return estimateIndoorDistance(locationA.room, locationB.room);
    }

    // If buildings have indoor connection, use that distance
    if (
      locationA.buildingId &&
      locationB.buildingId &&
      hasIndoorConnection(locationA.buildingId, locationB.buildingId)
    ) {
      return estimateDistanceBetweenBuildings(
        locationA.buildingId,
        locationB.buildingId,
      );
    }

    // No indoor connection possible
    return Infinity; // Make this path impossible to select
  }

  isPathAllowed(locationA, locationB) {
    // Only allow paths that are within the same building or have tunnel/indoor connections
    if (!locationA.buildingId || !locationB.buildingId) {
      return false; // One of them is outdoor, not allowed
    }

    return (
      locationA.buildingId === locationB.buildingId ||
      hasIndoorConnection(locationA.buildingId, locationB.buildingId)
    );
  }
}

// Factory for creating strategy based on user preference
export class RouteStrategyFactory {
  static getStrategy(avoidOutdoor) {
    return avoidOutdoor ? new IndoorOnlyStrategy() : new ShortestPathStrategy();
  }
}
