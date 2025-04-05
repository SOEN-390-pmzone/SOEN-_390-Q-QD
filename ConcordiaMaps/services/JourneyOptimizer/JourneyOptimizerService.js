/**
 * JourneyOptimizerService
 *
 * Core service for finding optimal paths through a set of locations.
 * Implements the Traveling Salesman Problem using the Nearest Neighbor algorithm.
 * Agnostic to the specific distance calculation method.
 */

import DistanceCalculatorService from "./DistanceCalculatorService";
import NavigationStepsService from "./NavigationStepsService";

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
  findOptimalPath(locations) {
    // Trivial case with 2 or fewer locations
    if (!locations || locations.length <= 2) {
      return locations;
    }
  
    // Always start with the first location
    const startLocation = locations[0];
  
    // All other locations need to be visited
    let currentLocation = startLocation;
    let remainingLocations = [...locations.slice(1)];
    let orderedPath = [startLocation];
    let unreachableLocations = []; // Track locations that cannot be reached
  
    // Process locations until none remain or no valid paths exist
    while (remainingLocations.length > 0) {
      let nearestIndex = -1;
      let minDistance = Infinity;
  
      // Find nearest valid location
      remainingLocations.forEach((location, index) => {
        // Check if this path is allowed
        if (this.distanceCalculator.isPathAllowed(currentLocation, location)) {
          const distance = this.distanceCalculator.calculateDistance(
            currentLocation,
            location,
          );
          if (distance < minDistance) {
            minDistance = distance;
            nearestIndex = index;
          }
        }
      });
  
      // If no valid path was found, mark remaining locations as unreachable
      if (nearestIndex === -1) {
        console.warn(
          "No valid path found for some locations. These locations are unreachable:",
          remainingLocations.map((loc) => loc.id),
        );
        unreachableLocations = [...remainingLocations];
        break;
      }
  
      // Add nearest location to path
      const nextLocation = remainingLocations[nearestIndex];
      orderedPath.push(nextLocation);
      currentLocation = nextLocation;
  
      // Remove the visited location from the remaining list
      remainingLocations.splice(nearestIndex, 1);
    }
  
    // Log unreachable locations if any
    if (unreachableLocations.length > 0) {
      console.warn(
        "Unreachable locations:",
        unreachableLocations.map((loc) => loc.id),
      );
    }
  
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
      const baseLocation = {
        id: task.id,
        title: task.title,
        type: task.type || (task.buildingId ? "indoor" : "outdoor"),
        description: task.description || 
          (task.type === "indoor" ? 
            `Visit ${task.title} in ${task.buildingId}, room ${task.room}` : 
            `Visit ${task.title} at this location`)
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
          ...(task.latitude && task.longitude && {
            latitude: task.latitude,
            longitude: task.longitude
          })
        };
      } else {
        // Outdoor location - include coordinates
        return {
          ...baseLocation,
          latitude: task.latitude,
          longitude: task.longitude
        };
      }
    });
    console.log("JourneyOptimizerService: Sending Locations to be optimized!")
    optimizedLocations = this.findOptimalPath(locations);
  // Log the entire array in a readable format
    console.log("OPTIMIZED ROUTE CREATED:", optimizedLocations);

    // For a more detailed view that shows all properties
    console.log("DETAILED OPTIMIZED ROUTE:");
    optimizedLocations.forEach((location, index) => {
      console.log(`Location ${index + 1}:`, JSON.stringify(location, null, 2));
    });
    //TODO: 
    // Generate steps using the dedicated service
    // return NavigationStepsService.generateNavigationSteps(optimizedLocations);
  }
}

// Export both factory functions for the service
export default {
  /**
   * Create a journey optimizer with specified preference
   * @param {boolean} avoidOutdoor - Whether to avoid outdoor paths
   * @returns {Object} Journey optimizer
   */
  createOptimizer: (avoidOutdoor = false) =>
    new JourneyOptimizer(new DistanceCalculatorService(avoidOutdoor)),

  /**
   * Generate optimal journey with specified preference
   * @param {Array} tasks - Tasks/locations to visit
   * @param {boolean} avoidOutdoor - Whether to avoid outdoor paths
   * @returns {Array} Navigation steps
   */
  generateOptimalJourney: (tasks, avoidOutdoor = false) => {
    const optimizer = new JourneyOptimizer(
      new DistanceCalculatorService(avoidOutdoor),
    );
    return optimizer.generateOptimalJourney(tasks);
  },
};