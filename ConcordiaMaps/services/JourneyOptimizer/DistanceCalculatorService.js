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
    if (!this._areLocationsValid(locationA, locationB)) {
      return this.strategies.Outdoor; // Fallback
    }

    // Normalize location types
    const { typeA, typeB } = this._getNormalizedTypes(locationA, locationB);

    // Handle by location type combinations
    if (typeA === "indoor" && typeB === "indoor") {
      return this._getIndoorToIndoorStrategy(locationA, locationB);
    } else if (typeA === "outdoor" && typeB === "outdoor") {
      return this._getOutdoorToOutdoorStrategy(locationA, locationB);
    } else {
      return this._getMixedStrategy(locationA, locationB);
    }
  }

  /**
   * Validates that both locations exist
   * @private
   */
  _areLocationsValid(locationA, locationB) {
    if (!locationA || !locationB) {
      console.warn(
        "Missing location parameter, using Outdoor strategy as fallback",
      );
      return false;
    }
    return true;
  }

  /**
   * Normalizes location types
   * @private
   */
  _getNormalizedTypes(locationA, locationB) {
    const typeA =
      locationA.type || (locationA.buildingId ? "indoor" : "outdoor");
    const typeB =
      locationB.type || (locationB.buildingId ? "indoor" : "outdoor");
    return { typeA, typeB };
  }

  /**
   * Normalizes building IDs for comparison
   * @private
   */
  _normalizeBuildingId(id) {
    return id ? id.toString().trim().toUpperCase() : null;
  }

  /**
   * Determines strategy for indoor-to-indoor routing
   * @private
   */
  _getIndoorToIndoorStrategy(locationA, locationB) {
    const buildingIdA = this._normalizeBuildingId(locationA.buildingId);
    const buildingIdB = this._normalizeBuildingId(locationB.buildingId);

    // Validate building IDs
    if (!buildingIdA || !buildingIdB) {
      console.warn("Indoor location missing buildingId, using Mixed strategy");
      return this.strategies.Mixed;
    }

    // Different buildings
    if (buildingIdA !== buildingIdB) {
      return this.strategies.DifferentBuilding;
    }

    // Same building - check floors
    return this._getSameBuildingStrategy(locationA, locationB);
  }

  /**
   * Determines strategy for same building routing
   * @private
   */
  _getSameBuildingStrategy(locationA, locationB) {
    // Validate floor information
    const hasValidFloors = this._hasValidFloorInfo(locationA, locationB);

    if (!hasValidFloors) {
      console.warn(
        "Indoor location missing floor information, using DifferentFloorSameBuilding strategy",
      );
      return this.strategies.DifferentFloorSameBuilding;
    }

    // Check if same floor
    return locationA.floor === locationB.floor
      ? this.strategies.SameFloorSameBuilding
      : this.strategies.DifferentFloorSameBuilding;
  }

  /**
   * Checks if both locations have valid floor information
   * @private
   */
  _hasValidFloorInfo(locationA, locationB) {
    return !(
      locationA.floor === undefined ||
      locationA.floor === null ||
      locationB.floor === undefined ||
      locationB.floor === null
    );
  }

  /**
   * Determines strategy for outdoor-to-outdoor routing
   * @private
   */
  _getOutdoorToOutdoorStrategy(locationA, locationB) {
    const isMissingCoordinates = this._isMissingCoordinates(
      locationA,
      locationB,
    );

    if (isMissingCoordinates) {
      console.warn(
        "Outdoor location missing coordinates, using Outdoor strategy anyway",
      );
    }

    return this.strategies.Outdoor;
  }

  /**
   * Checks if any location is missing coordinates
   * @private
   */
  _isMissingCoordinates(locationA, locationB) {
    return (
      locationA.latitude === undefined ||
      locationA.latitude === null ||
      locationA.longitude === undefined ||
      locationA.longitude === null ||
      locationB.latitude === undefined ||
      locationB.latitude === null ||
      locationB.longitude === undefined ||
      locationB.longitude === null
    );
  }

  /**
   * Determines strategy for mixed indoor/outdoor routing
   * @private
   */
  _getMixedStrategy(locationA, locationB) {
    const { typeA } = this._getNormalizedTypes(locationA, locationB);
    const indoorLocation = typeA === "indoor" ? locationA : locationB;
    const buildingId = this._normalizeBuildingId(indoorLocation.buildingId);

    if (!buildingId) {
      console.warn("Indoor location missing buildingId in mixed scenario");
    }

    if (!this.strategies.Mixed) {
      console.error(
        "Mixed strategy not found, using Outdoor strategy as fallback",
      );
      return this.strategies.Outdoor;
    }

    return this.strategies.Mixed;
  }
}

export default DistanceCalculatorService;
