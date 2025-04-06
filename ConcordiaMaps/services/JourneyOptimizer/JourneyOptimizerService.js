/**
 * JourneyOptimizerService
 *
 * Core service for finding optimal paths through a set of locations.
 * Implements the Traveling Salesman Problem using the Nearest Neighbor algorithm.
 * Agnostic to the specific distance calculation method.
 */

import DistanceCalculatorService from "./DistanceCalculatorService";

class JourneyOptimizer {
  /**
   * @param {Object} distanceCalculator - Service for calculating distances
   */
  constructor(distanceCalculator) {
    this.distanceCalculator = distanceCalculator;
  }

  /**
   * Find the optimal path using Nearest Neighbor algorithm
   * @param {Array} locations - Array of locations to visit
   * @returns {Array} Ordered array of locations to visit
   */
  /**
   * Find the optimal path using Nearest Neighbor algorithm
   * @param {Array} locations - Array of locations to visit
   * @returns {Array} Ordered array of locations to visit
   */
  findOptimalPath(locations) {
    console.log("=== STARTING OPTIMAL PATH FINDING ===");
    console.log(`Total locations to visit: ${locations.length}`);

    // Trivial case with 2 or fewer locations
    if (!locations || locations.length <= 2) {
      console.log("Trivial case: 2 or fewer locations, returning as-is");
      return locations;
    }

    // Always start with the first location
    const startLocation = locations[0];

    // All other locations need to be visited
    let currentLocation = startLocation;
    let remainingLocations = [...locations.slice(1)];
    let orderedPath = [startLocation];

    while (remainingLocations.length > 0) {
      let nearestIndex = -1;
      let minDistance = Infinity;
      let distanceLog = []; // Track all calculated distances for debugging

      // Find nearest valid location
      remainingLocations.forEach((location, index) => {
        // Check if this path is allowed
        const isPathAllowed = this.distanceCalculator.isPathAllowed(
          currentLocation,
          location,
        );
        console.log(`Path allowed: ${isPathAllowed}`);

        if (isPathAllowed) {
          try {
            // Add detailed comparison log
            console.log(`--- COMPARING LOCATIONS ---`);
            const distance = this.distanceCalculator.calculateDistance(
              currentLocation,
              location,
            );
            console.log(`Distance calculated: ${distance}`);
            distanceLog.push({ locationId: location.id, index, distance });
            console.log(distanceLog);

            if (distance < minDistance) {
              console.log(
                `New minimum distance found: ${distance} < ${minDistance}`,
              );
              minDistance = distance;
              nearestIndex = index;
            } else {
              console.log(`Not closer: ${distance} >= ${minDistance}`);
            }
          } catch (error) {
            console.error(
              `Error calculating distance to ${location.id}:`,
              error,
            );
          }
        }
      });

      // Add nearest location to path
      const nextLocation = remainingLocations[nearestIndex];

      orderedPath.push(nextLocation);
      currentLocation = nextLocation;

      // Remove the visited location from the remaining list
      remainingLocations.splice(nearestIndex, 1);
    }

    remainingLocations = null;
    return orderedPath;
  }

  /**
   * Generate navigation steps from optimized locations
   * @param {Array} tasks - Tasks/locations to visit
   * @returns {Array} Navigation steps
   */
  generateOptimalJourney(tasks) {
    // Convert tasks to location objects while preserving type-specific properties
    const locations = tasks.map((task) => {
      // Create base location object with common properties
      const locationType = task.type;
      const baseLocation = {
        id: task.id,
        title: task.title,
        type: locationType,
        description:
          task.description ||
          (locationType === "indoor"
            ? `Visit ${task.title} in ${task.buildingId}, room ${task.room}`
            : `Visit ${task.title} at this location`),
      };

      // Add type-specific properties based on location type
      if (task.type === "indoor" || task.buildingId) {
        // Indoor location - include building, room, floor
        return {
          ...baseLocation,
          buildingId: task.buildingId,
          room: task.room,
          floor: task.floor,
          // Include coordinates if available
          ...(task.latitude &&
            task.longitude && {
              latitude: task.latitude,
              longitude: task.longitude,
            }),
        };
      } else {
        // Outdoor location - include coordinates
        return {
          ...baseLocation,
          latitude: task.latitude,
          longitude: task.longitude,
        };
      }
    });
    const optimizedLocations = this.findOptimalPath(locations);
    return optimizedLocations;
  }
}

// Export both factory functions for the service
export default {
  /**
   * Create a journey optimizer with default settings
   * @returns {Object} Journey optimizer
   */
  createOptimizer: () => new JourneyOptimizer(new DistanceCalculatorService()),

  /**
   * Generate optimal journey
   * @param {Array} tasks - Tasks/locations to visit
   * @returns {Array} Navigation steps
   */
  generateOptimalJourney: (tasks) => {
    const optimizer = new JourneyOptimizer(new DistanceCalculatorService());
    return optimizer.generateOptimalJourney(tasks);
  },
};
