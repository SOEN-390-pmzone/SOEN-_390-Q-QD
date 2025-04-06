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
    console.log(
      `Starting location: ${startLocation.id} (${startLocation.type})`,
    );

    // All other locations need to be visited
    let currentLocation = startLocation;
    let remainingLocations = [...locations.slice(1)];
    let orderedPath = [startLocation];
    let unreachableLocations = []; // Track locations that cannot be reached

    console.log(`Remaining locations to process: ${remainingLocations.length}`);

    // Process locations until none remain or no valid paths exist
    let iteration = 1;
    while (remainingLocations.length > 0) {
      console.log(`\n--- Iteration ${iteration++} ---`);
      console.log(
        `Current location: ${currentLocation.id} (${currentLocation.type})`,
      );
      console.log(`Remaining locations: ${remainingLocations.length}`);

      let nearestIndex = -1;
      let minDistance = Infinity;
      let distanceLog = []; // Track all calculated distances for debugging

      // Find nearest valid location
      remainingLocations.forEach((location, index) => {
        console.log(
          `\nChecking location ${index}: ${location.id} (${location.type})`,
        );

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
      console.log(`FROM: ${currentLocation.id} (${currentLocation.type})${
        currentLocation.buildingId ? `, Building: ${currentLocation.buildingId}` : ''
      }${currentLocation.floor ? `, Floor: ${currentLocation.floor}` : ''}${
        currentLocation.room ? `, Room: ${currentLocation.room}` : ''
      }${
        currentLocation.latitude ? `, Position: [${currentLocation.latitude.toFixed(4)}, ${currentLocation.longitude.toFixed(4)}]` : ''
      }`);
      console.log(`TO: ${location.id} (${location.type})${
        location.buildingId ? `, Building: ${location.buildingId}` : ''
      }${location.floor ? `, Floor: ${location.floor}` : ''}${
        location.room ? `, Room: ${location.room}` : ''
      }${
        location.latitude ? `, Position: [${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}]` : ''
      }`);
            const distance = this.distanceCalculator.calculateDistance(
              currentLocation,
              location,
            );
            console.log(`Distance calculated: ${distance}`);
            distanceLog.push({ locationId: location.id, index, distance });

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

      console.log("\n--- Distance Summary ---");
      console.log("All distances:", distanceLog);
      console.log(`Minimum distance: ${minDistance}`);
      console.log(`Nearest index: ${nearestIndex}`);

      // If no valid path was found, mark remaining locations as unreachable
      if (nearestIndex === -1) {
        // Add these detailed warnings for debugging
        console.warn(
          "No valid path found. Nearest index is still -1 despite checked locations.",
        );
        console.warn(
          "This typically happens when isPathAllowed is true but the distance calculation fails",
        );
        console.warn(
          "Check if the Outdoor strategy's calculateDistance method returns undefined, Infinity, or null",
        );

        unreachableLocations = [...remainingLocations];

        // Add THIS SPECIFIC message format to match the test expectation
        console.warn(
          "No valid path found for some locations. These locations are unreachable:",
          unreachableLocations.map((loc) => loc.id),
        );
        break;
      }
      // Add nearest location to path
      const nextLocation = remainingLocations[nearestIndex];
      console.log(
        `Selected next location: ${nextLocation.id} at distance ${minDistance}`,
      );
      orderedPath.push(nextLocation);
      currentLocation = nextLocation;

      // Remove the visited location from the remaining list
      remainingLocations.splice(nearestIndex, 1);
      console.log(`Updated path length: ${orderedPath.length}`);
      console.log(`Remaining locations: ${remainingLocations.length}`);
    }

    // Log unreachable locations if any
    if (unreachableLocations.length > 0) {
      console.warn(
        "Unreachable locations:",
        unreachableLocations.map((loc) => loc.id),
      );
    }

    console.log("=== PATH FINDING COMPLETE ===");
    console.log(`Final path length: ${orderedPath.length}`);
    console.log(`Unreachable locations: ${unreachableLocations.length}`);
    // At the end of the function:
    distanceLog = null;
    unreachableLocations = null;
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
    console.log("JourneyOptimizerService: Sending Locations to be optimized!");
    const optimizedLocations = this.findOptimalPath(locations);

    // Log the entire array in a readable format
    console.log("OPTIMIZED ROUTE CREATED:", optimizedLocations);

    // For a more detailed view that shows all properties
    console.log("DETAILED OPTIMIZED ROUTE:");
    optimizedLocations.forEach((location, index) => {
      console.log(`Location ${index + 1}:`, JSON.stringify(location, null, 2));
    });
    return optimizedLocations;
  }
}

// Export both factory functions for the service
export default {
  /**
   * Create a journey optimizer with default settings
   * @returns {Object} Journey optimizer
   */
  createOptimizer: () =>
    new JourneyOptimizer(new DistanceCalculatorService()),

  /**
   * Generate optimal journey
   * @param {Array} tasks - Tasks/locations to visit
   * @returns {Array} Navigation steps
   */
  generateOptimalJourney: (tasks) => {
    const optimizer = new JourneyOptimizer(
      new DistanceCalculatorService()
    );
    return optimizer.generateOptimalJourney(tasks);
  },
};
