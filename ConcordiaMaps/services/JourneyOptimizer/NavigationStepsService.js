/**
 * NavigationStepsService
 *
 * Service responsible for generating detailed navigation steps between locations.
 * It takes an array of optimized locations and generates step-by-step directions.
 */

class NavigationStepsService {
  /**
   * Generates navigation steps between consecutive locations
   * @param {Array} optimizedLocations - Array of locations in optimal order
   * @returns {Array} Navigation steps with detailed directions
   */
  static generateNavigationSteps(optimizedLocations) {
    if (!optimizedLocations || optimizedLocations.length <= 1) {
      return [];
    }

    const steps = [];

    // Generate steps between each consecutive pair of locations
    for (let i = 0; i < optimizedLocations.length - 1; i++) {
      const currentLocation = optimizedLocations[i];
      const nextLocation = optimizedLocations[i + 1];

      steps.push({
        from: {
          id: currentLocation.id,
          buildingId: currentLocation.buildingId,
          room: currentLocation.room,
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
          title: currentLocation.title,
        },
        to: {
          id: nextLocation.id,
          buildingId: nextLocation.buildingId,
          room: nextLocation.room,
          latitude: nextLocation.latitude,
          longitude: nextLocation.longitude,
          title: nextLocation.title,
        },
        description: `Travel from ${currentLocation.title || currentLocation.room || "location"} to ${nextLocation.title || nextLocation.room || "location"}`,
      });
    }

    return steps;
  }

  /**
   * Generate detailed directions including turns and specific path instructions
   * This could be expanded in the future for more detailed directions
   *
   * @param {Object} fromLocation - Starting location
   * @param {Object} toLocation - Destination location
   * @returns {Array} Array of detailed direction steps
   */
  static generateDetailedDirections(fromLocation, toLocation) {
    // This is where you could add more complex direction logic
    // For example, indoor turn-by-turn directions, specific outdoor paths, etc.

    // Basic implementation for now
    return [
      {
        instruction: `Go from ${fromLocation.title || fromLocation.room || "current location"} to ${toLocation.title || toLocation.room || "destination"}`,
        distance: 0, // You could calculate this if needed
        duration: 0, // Estimated time could be added
      },
    ];
  }
}

export default NavigationStepsService;
