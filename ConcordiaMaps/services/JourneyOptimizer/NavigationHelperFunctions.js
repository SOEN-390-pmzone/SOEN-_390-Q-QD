// TODO: 
// Implement these connections and coordinates for known buildings. 

import buildingConnections from "../../data/BuildingConnections";
import buildingCoordinates from "../../data/BuildingCoordinates";

/**
 * Navigation Helper Functions
 * 
 * This module contains reusable helper functions for navigation calculations
 * that support the JourneyOptimizer service.
 * These are all theoretical calculations based on distances from longitude, latitude coordinates.
 * TODO:
 * Implement hardcoded distances for known values such as tunnel, floor, buildings etc.
 */

/**
 * Calculate the distance between two geographic coordinates
 * @param {Object} coord1 - First coordinate {latitude, longitude}
 * @param {Object} coord2 - Second coordinate {latitude, longitude}
 * @returns {number} Distance in meters
 */
export const calculateDistance = (coord1, coord2) => {
  const toRad = (value) => (value * Math.PI) / 180;
  const R = 6371; // Earth radius in km
  
  const dLat = toRad(coord2.latitude - coord1.latitude);
  const dLon = toRad(coord2.longitude - coord1.longitude);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(coord1.latitude)) * Math.cos(toRad(coord2.latitude)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c * 1000; // Convert to meters
};

/**
 * Get coordinates for a location (either building or specific outdoor location)
 * @param {Object} location - Location with buildingId or coordinates
 * @returns {Object} Coordinates {latitude, longitude}
 */
export const getLocationCoordinates = (location) => {
  if (location.latitude && location.longitude) {
    return {
      latitude: location.latitude,
      longitude: location.longitude
    };
  }
  
  if (location.buildingId) {
    const building = buildingCoordinates[location.buildingId.toLowerCase()];
    if (building) {
      return {
        latitude: building.latitude,
        longitude: building.longitude
      };
    }
  }
  
  console.error("Could not find coordinates for location:", location);
  return { latitude: 45.497092, longitude: -73.578974 }; // Default to Hall Building
};

/**
 * Extract floor number from a room ID
 * @param {string} roomId - Room identifier (e.g., "H823")
 * @returns {number|null} Floor number or null if couldn't extract
 */
export const extractFloor = (roomId) => {
  if (!roomId || typeof roomId !== 'string') return null;
  
  // Try to extract floor number using common patterns in room names
  const match = roomId.match(/[a-zA-Z]?[-]?(\d{1,2})\d*/);
  if (match && match[1]) {
    return parseInt(match[1], 10);
  }
  return null;
};

/**
 * Estimate indoor distance between rooms
 * @param {string} roomA - First room identifier
 * @param {string} roomB - Second room identifier
 * @returns {number} Estimated distance in meters
 */
export const estimateIndoorDistance = (roomA, roomB) => {
  // Basic room distance estimation
  const floorA = extractFloor(roomA);
  const floorB = extractFloor(roomB);
  
  // Base distance for being on the same floor
  let distance = 50; // meters - arbitrary base distance
  
  // Add distance for floor differences
  if (floorA !== null && floorB !== null && floorA !== floorB) {
    const floorDiff = Math.abs(floorA - floorB);
    distance += floorDiff * 25; // 25m penalty per floor difference
  }
  
  return distance;
};

/**
 * Check if two buildings have an indoor connection (tunnel)
 * @param {string} buildingA - First building ID
 * @param {string} buildingB - Second building ID
 * @returns {boolean} True if buildings have an indoor connection
 */
export const hasIndoorConnection = (buildingA, buildingB) => {
  if (!buildingA || !buildingB) return false;
  
  const normalizedA = buildingA.toLowerCase();
  const normalizedB = buildingB.toLowerCase();
  
  //iterate through each element in buildingConnections and check if any are a combination of buildingA, buildingB that
  //are connected through a tunnel
  return buildingConnections.some(connection => 
    (connection.building1.toLowerCase() === normalizedA && 
     connection.building2.toLowerCase() === normalizedB &&
     connection.type === 'tunnel') ||
    (connection.building1.toLowerCase() === normalizedB && 
     connection.building2.toLowerCase() === normalizedA &&
     connection.type === 'tunnel')
  );
};

/**
 * Estimate the distance between two buildings via their indoor connection
 * @param {string} buildingA - First building ID
 * @param {string} buildingB - Second building ID
 * @returns {number} Distance in meters
 */
export const estimateDistanceBetweenBuildings = (buildingA, buildingB) => {
  if (!buildingA || !buildingB) return Infinity;
  
  // Try to find the tunnel distance in connections data
  const connection = buildingConnections.find(conn => 
    (conn.building1.toLowerCase() === buildingA.toLowerCase() && 
     conn.building2.toLowerCase() === buildingB.toLowerCase()) ||
    (conn.building1.toLowerCase() === buildingB.toLowerCase() && 
     conn.building2.toLowerCase() === buildingA.toLowerCase())
  );
  
  // If we have a distance measure in the data, use it
  if (connection && connection.distance) {
    return connection.distance;
  }
  
  // Otherwise, calculate the direct distance between the buildings
  // and add a penalty (tunnels are usually longer than direct paths)
  const coordA = getLocationCoordinates({ buildingId: buildingA });
  const coordB = getLocationCoordinates({ buildingId: buildingB });
  return calculateDistance(coordA, coordB) * 1.5; // 50% longer than direct path
};