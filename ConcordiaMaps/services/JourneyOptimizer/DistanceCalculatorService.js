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
    console.log(
      "DistanceCalculatorService: Dtermining the distance between A and B",
    );
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
      console.warn(
        "Missing location parameter, using Outdoor strategy as fallback",
      );
      return this.strategies.Outdoor;
    }

    // Normalize types if not explicitly set
    const typeA =
      locationA.type || (locationA.buildingId ? "indoor" : "outdoor");
    const typeB =
      locationB.type || (locationB.buildingId ? "indoor" : "outdoor");

    // Normalize building IDs for comparison (if they exist)
    const normalizeBuildingId = (id) => {
      return id ? id.toString().trim().toUpperCase() : null;
    };

    const buildingIdA = normalizeBuildingId(locationA.buildingId);
    const buildingIdB = normalizeBuildingId(locationB.buildingId);

    // CASE 1: Both locations are indoor
    if (typeA === "indoor" && typeB === "indoor") {
      // Validate building IDs
      if (!buildingIdA || !buildingIdB) {
        console.warn(
          "Indoor location missing buildingId, using Mixed strategy",
        );
        return this.strategies.Mixed;
      }

      // CASE 1A: Same building
      if (buildingIdA === buildingIdB) {
        // Validate floor information
        if (
          locationA.floor === undefined ||
          locationA.floor === null ||
          locationB.floor === undefined ||
          locationB.floor === null
        ) {
          console.warn(
            "Indoor location missing floor information, using DifferentFloorSameBuilding strategy",
          );
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
        // Use DifferentBuilding strategy for all different buildings
        return this.strategies.DifferentBuilding;
      }
    }
    // CASE 2: Both locations are outdoor
    else if (typeA === "outdoor" && typeB === "outdoor") {
      // Validate coordinates properly - check for undefined or null specifically
      const isMissingCoordinates =
        locationA.latitude === undefined ||
        locationA.latitude === null ||
        locationA.longitude === undefined ||
        locationA.longitude === null ||
        locationB.latitude === undefined ||
        locationB.latitude === null ||
        locationB.longitude === undefined ||
        locationB.longitude === null;

      if (isMissingCoordinates) {
        console.warn(
          "Outdoor location missing coordinates, using Outdoor strategy anyway",
        );
      }
      return this.strategies.Outdoor;
    }
    // CASE 3: Mixed indoor and outdoor locations
    else {
      // Identify the indoor location using normalized types
      const indoorLocation = typeA === "indoor" ? locationA : locationB;
      const indoorLocationBuildingId = normalizeBuildingId(
        indoorLocation.buildingId,
      );

      if (!indoorLocationBuildingId) {
        console.warn("Indoor location missing buildingId in mixed scenario");
      }

      // Ensure the strategy exists
      if (!this.strategies.Mixed) {
        console.error(
          "Mixed strategy not found, using Outdoor strategy as fallback",
        );
        return this.strategies.Outdoor;
      }

      return this.strategies.Mixed;
    }
  }
}

export default DistanceCalculatorService;
