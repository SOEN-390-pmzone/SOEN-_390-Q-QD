import { RouteStrategyFactory } from './RouteStrategies';
import { generateNavigationSteps } from './NavigationStepGenerator';

/**
 * JourneyOptimizerService
 * 
 * Implementation of the Strategy Pattern with a Toggle-Based Factory.
 * This solves the path variant of the Traveling Salesman Problem using the Nearest Neighbor algorithm.
 * We are trying to hit all locations whilst only deciding the start location. 
 * Solution runs in O(n²) time. Not guaranteed to be optimal, but is at most log(n) times longer than the optimal path.
 * 
 * Works based on user preference for indoor or outdoor paths. There is a route strategy for each option.
 * 
 * ? Simple use case for a user who prefers indoors (e.g., when weather is bad)
 *  import JourneyOptimizerService from './JourneyOptimizerService';
 *  const indoorSteps = JourneyOptimizerService.generateOptimalJourney(tasks, true);
 * 
 * ? Advanced use case with optimizer instance
 *  const optimizer = JourneyOptimizerService.createOptimizer(true);
 *    Morning tasks
 *  const steps = optimizer.generateOptimalJourney(morningTasks);
 *    Afternoon tasks
 *  const afternoonSteps = optimizer.generateOptimalJourney(afternoonTasks);
 *    ...
 */

// Main service that uses the strategies
class JourneyOptimizer {
  /**
   * @param {Boolean} avoidOutdoor - True if user wants Indoor path that uses tunnels
   */
  constructor(avoidOutdoor = false) {
    this.strategy = RouteStrategyFactory.getStrategy(avoidOutdoor);
  }
  
  /**
   * Find the optimal path using Nearest Neighbor algorithm with the selected strategy
   * @param {Array} locations - Array of locations to visit
   * @returns {Array} Ordered array of locations to visit
   */
  findOptimalPath(locations) {
    // Trivial case with 2 or less locations
    if (!locations || locations.length <= 2) {
      return locations; 
    }
    
    // Always start with the first location
    const startLocation = locations[0];
    
    // All other locations need to be visited
    let currentLocation = startLocation;
    let remainingLocations = [...locations.slice(1)];
    let orderedPath = [startLocation];
    
    // Process locations until none remain or no valid paths exist
    while (remainingLocations.length > 0) {
      let nearestIndex = -1;
      let minDistance = Infinity;
      
      // Find nearest valid location
      remainingLocations.forEach((location, index) => {
        // Check if this path is allowed by the strategy
        if (this.strategy.isPathAllowed(currentLocation, location)) {
          const distance = this.strategy.calculateDistance(currentLocation, location);
          if (distance < minDistance) {
            minDistance = distance;
            nearestIndex = index;
          }
        }
      });
      
      // If no valid path was found, break the loop
      if (nearestIndex === -1) {
        console.warn("No valid path found. Some locations are unreachable with current constraints.");
        break;
      }
      
      // Add nearest location to path
      const nextLocation = remainingLocations[nearestIndex];
      orderedPath.push(nextLocation);
      currentLocation = nextLocation;
      
      remainingLocations.splice(nearestIndex, 1);
    }
    
    return orderedPath;
  }
  
  /**
   * Main method to generate an optimal journey
   * @param {Array} tasks - Tasks/locations to visit
   * @returns {Array} Navigation steps
   */
  generateOptimalJourney(tasks) {
    // Convert tasks to location objects
    const locations = tasks.map(task => ({
      id: task.id,
      buildingId: task.buildingId,
      room: task.room,
      latitude: task.latitude,
      longitude: task.longitude,
      title: task.title,
      description: task.description || `Task at ${task.buildingId || 'outdoor location'}`
    }));
    
    // Find optimal path
    const optimizedLocations = this.findOptimalPath(locations);
    
    // Generate steps 
    return generateNavigationSteps(optimizedLocations);
  }
}

// Export both factory functions for the service
export default {
  /**
   * Create a journey optimizer with specified preference
   * @param {boolean} avoidOutdoor - Whether to avoid outdoor paths
   * @returns {Object} Journey optimizer
   */
  createOptimizer: (avoidOutdoor = false) => new JourneyOptimizer(avoidOutdoor),
  
  /**
   * Generate optimal journey with specified preference
   * @param {Array} tasks - Tasks/locations to visit
   * @param {boolean} avoidOutdoor - Whether to avoid outdoor paths
   * @returns {Array} Navigation steps
   */
  generateOptimalJourney: (tasks, avoidOutdoor = false) => {
    const optimizer = new JourneyOptimizer(avoidOutdoor);
    return optimizer.generateOptimalJourney(tasks);
  }
};