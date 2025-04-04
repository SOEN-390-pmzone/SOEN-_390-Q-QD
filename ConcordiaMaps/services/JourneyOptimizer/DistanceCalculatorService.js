/**
 * DistanceCalculatorService
 *
 * Service that dynamically chooses the appropriate distance calculation strategy
 * based on the types of locations being compared.
 */

import RouteStrategies from "./RouteStrategies";

class DistanceCalculatorService {
  /**
   * @param {boolean} avoidOutdoor - Whether to avoid outdoor paths when possible
   */
  constructor(avoidOutdoor = false) {
    this.avoidOutdoor = avoidOutdoor;
    this.strategies = RouteStrategies;
  }

  /**
   * Determines if a path between two locations is allowed
   * @param {Object} locationA - First location
   * @param {Object} locationB - Second location
   * @returns {boolean} Whether the path is allowed
   */
  isPathAllowed(locationA, locationB) {
    const strategy = this._determineStrategy(locationA, locationB);
    return strategy.isPathAllowed(locationA, locationB, this.avoidOutdoor);
  }

  /**
   * Calculates the distance between two locations using the appropriate strategy
   * @param {Object} locationA - First location
   * @param {Object} locationB - Second location
   * @returns {number} Distance between the locations
   */
  calculateDistance(locationA, locationB) {
    const strategy = this._determineStrategy(locationA, locationB);
    return strategy.calculateDistance(locationA, locationB);
  }

  /**
   * Determines the appropriate strategy based on location types
   * @private
   * @param {Object} locationA - First location
   * @param {Object} locationB - Second location
   * @returns {Object} Appropriate strategy object
   */
  _determineStrategy(locationA, locationB) {
    // Both locations have building IDs - use indoor strategy
    if (locationA.buildingId && locationB.buildingId) {
      return this.strategies.Indoor;
    }

    // One location is indoor, one is outdoor - use mixed strategy
    if (
      (locationA.buildingId && !locationB.buildingId) ||
      (!locationA.buildingId && locationB.buildingId)
    ) {
      return this.strategies.Mixed;
    }

    // Both locations are outdoor - use outdoor strategy
    return this.strategies.Outdoor;
  }
}

export default DistanceCalculatorService;
