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
    // Convert tasks to location objects
    const locations = tasks.map((task) => ({
      id: task.id,
      buildingId: task.buildingId,
      room: task.room,
      latitude: task.latitude,
      longitude: task.longitude,
      title: task.title,
      description:
        task.description || `Task at ${task.buildingId || "outdoor location"}`,
    }));

    // Find optimal path
    const optimizedLocations = this.findOptimalPath(locations);

    // Generate steps using the dedicated service
    return NavigationStepsService.generateNavigationSteps(optimizedLocations);
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