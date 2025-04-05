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
/**
 * Determines the appropriate strategy based on location types
 * @private
 * @param {Object} locationA - First location
 * @param {Object} locationB - Second location
 * @returns {Object} Appropriate strategy object
 */
_determineStrategy(locationA, locationB) {
  // Validate input parameters
  if (!locationA || !locationB) {
    console.warn("Missing location parameter, using Outdoor strategy as fallback");
    return this.strategies.Outdoor;
  }

  // Normalize types if not explicitly set
  const typeA = locationA.type || (locationA.buildingId ? "indoor" : "outdoor");
  const typeB = locationB.type || (locationB.buildingId ? "indoor" : "outdoor");
  
  // CASE 1: Both locations are indoor
  if (typeA === "indoor" && typeB === "indoor") {
    // Validate building IDs
    if (!locationA.buildingId || !locationB.buildingId) {
      console.warn("Indoor location missing buildingId, using Mixed strategy");
      return this.strategies.Mixed;
    }
    
    // CASE 1A: Same building
    if (locationA.buildingId === locationB.buildingId) {
      // Validate floor information
      if (!locationA.floor || !locationB.floor) {
        console.warn("Indoor location missing floor information, using DifferentFloorSameBuilding strategy");
        return this.strategies.DifferentFloorSameBuilding;
      }
      
      // CASE 1A-1: Same floor
      if (locationA.floor === locationB.floor) {
        return this.strategies.SameFloorSameBuilding;
      } 
      // CASE 1A-2: Different floors
      else {
        return this.strategies.DifferentFloorSameBuilding;
      }
    } 
    // CASE 1B: Different buildings
    else {
      // CASE 1B-1: Different campuses
      if (this._areOnDifferentCampuses(locationA.buildingId, locationB.buildingId)) {
        return this.strategies.DifferentCampuses;
      } 
      // CASE 1B-2: Same campus, different buildings
      else {
        // If this strategy doesn't exist yet, it will need to be implemented
        return this.strategies.DifferentBuildingSameCampus || this.strategies.Outdoor;
      }
    }
  } 
  // CASE 2: Both locations are outdoor
  else if (typeA === "outdoor" && typeB === "outdoor") {
    // Validate coordinates
    if (!locationA.latitude || !locationA.longitude || !locationB.latitude || !locationB.longitude) {
      console.warn("Outdoor location missing coordinates, using Outdoor strategy anyway");
    }
    return this.strategies.Outdoor;
  } 
  // CASE 3: Mixed indoor and outdoor locations
  else {
    // Validate that the indoor location has required building info
    const indoorLocation = typeA === "indoor" ? locationA : locationB;
    if (!indoorLocation.buildingId) {
      console.warn("Indoor location missing buildingId in mixed scenario");
    }
    
    return this.strategies.Mixed;
  }
}

  
  /**
   * Determines if two buildings are on different campuses
   * @private
   * @param {string} buildingA - First building ID
   * @param {string} buildingB - Second building ID
   * @returns {boolean} Whether the buildings are on different campuses
   */
  _areOnDifferentCampuses(buildingA, buildingB) {
    const loyolaCampusBuildings = ["VL", "VE"]; // Loyola campus buildings
    const sgwCampusBuildings = ["H", "MB", "EV", "LB"]; // SGW campus buildings
    
    const isALoyola = loyolaCampusBuildings.includes(buildingA);
    const isBLoyola = loyolaCampusBuildings.includes(buildingB);
    
    const isASGW = sgwCampusBuildings.includes(buildingA);
    const isBSGW = sgwCampusBuildings.includes(buildingB);
    
    // Different campuses if one is Loyola and the other is SGW
    return (isALoyola && isBSGW) || (isASGW && isBLoyola);
  }
}

export default DistanceCalculatorService;
