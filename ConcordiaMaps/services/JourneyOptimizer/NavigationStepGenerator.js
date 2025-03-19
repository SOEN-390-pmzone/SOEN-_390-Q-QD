import { hasIndoorConnection } from './NavigationHelperFunctions';

/**
 * Navigation Step Generators
 * 
 * This module contains functions to generate detailed navigation steps
 * between different types of locations (buildings, outdoor locations).
 * Used by the JourneyOptimizerService to create step-by-step instructions.
 */

/**
 * Generate steps for navigation within the same building
 * @param {Object} from - Starting location
 * @param {Object} to - Destination location
 * @param {Array} steps - Array to append steps to
 */
export function generateSameBuildingSteps(from, to, steps) {
  console.log(`Generating steps within building ${from.buildingId}: ${from.room || 'entrance'} → ${to.room || 'exit'}`);
  
  steps.push({
    id: `step-${steps.length + 1}`,
    title: `Navigate in ${from.buildingId.toUpperCase()}`,
    description: `Go from ${from.room || 'entrance'} to ${to.room || 'exit'} within ${from.buildingId.toUpperCase()} building`,
    type: 'indoor',
    buildingId: from.buildingId,
    startPoint: from.room || 'entrance',
    endPoint: to.room || 'exit'
  });
  
  console.log(`Added step: Navigate within ${from.buildingId.toUpperCase()} building`);
}

/**
 * Generate steps for navigation between buildings using indoor connections
 * @param {Object} from - Starting building location
 * @param {Object} to - Destination building location
 * @param {Array} steps - Array to append steps to
 */
export function generateIndoorConnectedBuildingSteps(from, to, steps) {
  console.log(`Generating tunnel steps: ${from.buildingId} → ${to.buildingId}`);
  
  // Step 1: Navigate to tunnel entrance
  steps.push({
    id: `step-${steps.length + 1}`,
    title: `Find Tunnel Entrance`,
    description: `Navigate to the tunnel entrance in ${from.buildingId.toUpperCase()} building`,
    type: 'indoor',
    buildingId: from.buildingId,
    startPoint: from.room || 'current position',
    endPoint: 'tunnel-entrance'
  });
  
  // Step 2: Take tunnel
  steps.push({
    id: `step-${steps.length + 1}`,
    title: `Take Tunnel`,
    description: `Walk through the tunnel from ${from.buildingId.toUpperCase()} to ${to.buildingId.toUpperCase()}`,
    type: 'tunnel',
    startPoint: `${from.buildingId}-tunnel`,
    endPoint: `${to.buildingId}-tunnel`
  });
  
  // Step 3: Navigate to destination
  steps.push({
    id: `step-${steps.length + 1}`,
    title: `Go to Destination`,
    description: `From the tunnel exit, go to ${to.room || 'your destination'} in ${to.buildingId.toUpperCase()}`,
    type: 'indoor',
    buildingId: to.buildingId,
    startPoint: 'tunnel-exit',
    endPoint: to.room || 'destination'
  });
  
  console.log(`Added tunnel navigation steps from ${from.buildingId.toUpperCase()} to ${to.buildingId.toUpperCase()}`);
}

/**
 * Generate steps for navigation between buildings via outdoor paths
 * @param {Object} from - Starting building location
 * @param {Object} to - Destination building location
 * @param {Array} steps - Array to append steps to
 */
export function generateBuildingToBuildingOutdoorSteps(from, to, steps) {
  console.log(`Generating outdoor steps between buildings: ${from.buildingId} → ${to.buildingId}`);
  
  // Step 1: Exit building
  steps.push({
    id: `step-${steps.length + 1}`,
    title: `Exit Building`,
    description: `Exit ${from.buildingId.toUpperCase()} building from the nearest door`,
    type: 'indoor',
    buildingId: from.buildingId,
    startPoint: from.room || 'current position',
    endPoint: 'building-exit'
  });
  
  // Step 2: Walk outside
  steps.push({
    id: `step-${steps.length + 1}`,
    title: `Walk Outside`,
    description: `Walk from ${from.buildingId.toUpperCase()} to ${to.buildingId.toUpperCase()} across campus`,
    type: 'outdoor',
    startPoint: `${from.buildingId}-exit`,
    endPoint: `${to.buildingId}-entrance`
  });
  
  // Step 3: Enter building
  steps.push({
    id: `step-${steps.length + 1}`,
    title: `Enter Building`,
    description: `Enter ${to.buildingId.toUpperCase()} building and go to ${to.room || 'your destination'}`,
    type: 'indoor',
    buildingId: to.buildingId,
    startPoint: 'building-entrance',
    endPoint: to.room || 'destination'
  });
  
  console.log(`Added outdoor navigation steps from ${from.buildingId.toUpperCase()} to ${to.buildingId.toUpperCase()}`);
}

/**
 * Generate steps for navigation from a building to an outdoor location
 * @param {Object} from - Starting building location
 * @param {Object} to - Destination outdoor location
 * @param {Array} steps - Array to append steps to
 */
export function generateBuildingToOutdoorSteps(from, to, steps) {
  console.log(`Generating building to outdoor steps: ${from.buildingId} → outdoor location`);
  
  // Step 1: Exit building
  steps.push({
    id: `step-${steps.length + 1}`,
    title: `Exit Building`,
    description: `Exit ${from.buildingId.toUpperCase()} building from the nearest door`,
    type: 'indoor',
    buildingId: from.buildingId,
    startPoint: from.room || 'current position',
    endPoint: 'building-exit'
  });
  
  // Step 2: Walk to outdoor destination
  steps.push({
    id: `step-${steps.length + 1}`,
    title: `Go to ${to.title || 'Outdoor Location'}`,
    description: `Walk from ${from.buildingId.toUpperCase()} building to ${to.description || 'the outdoor location'}`,
    type: 'outdoor',
    startPoint: `${from.buildingId}-exit`,
    endPoint: 'outdoor-destination',
    coordinates: {
      latitude: to.latitude,
      longitude: to.longitude
    }
  });
  
  console.log(`Added building to outdoor navigation steps from ${from.buildingId.toUpperCase()}`);
}

/**
 * Generate steps for navigation from an outdoor location to a building
 * @param {Object} from - Starting outdoor location
 * @param {Object} to - Destination building location
 * @param {Array} steps - Array to append steps to
 */
export function generateOutdoorToBuildingSteps(from, to, steps) {
  console.log(`Generating outdoor to building steps: outdoor location → ${to.buildingId}`);
  
  steps.push({
    id: `step-${steps.length + 1}`,
    title: `Enter ${to.buildingId.toUpperCase()} Building`,
    description: `Walk to and enter ${to.buildingId.toUpperCase()} building`,
    type: 'outdoor',
    startPoint: 'current-outdoor-location',
    endPoint: `${to.buildingId}-entrance`,
    coordinates: {
      latitude: from.latitude,
      longitude: from.longitude
    }
  });
  
  // If there's a specific room to go to
  if (to.room) {
    steps.push({
      id: `step-${steps.length + 1}`,
      title: `Go to Room ${to.room}`,
      description: `Navigate to room ${to.room} in ${to.buildingId.toUpperCase()} building`,
      type: 'indoor',
      buildingId: to.buildingId,
      startPoint: 'building-entrance',
      endPoint: to.room
    });
  }
  
  console.log(`Added outdoor to building navigation steps to ${to.buildingId.toUpperCase()}`);
}

/**
 * Generate steps for navigation between two outdoor locations
 * @param {Object} from - Starting outdoor location
 * @param {Object} to - Destination outdoor location
 * @param {Array} steps - Array to append steps to
 */
export function generateOutdoorToOutdoorSteps(from, to, steps) {
  console.log(`Generating outdoor to outdoor steps: (${from.latitude}, ${from.longitude}) → (${to.latitude}, ${to.longitude})`);
  
  steps.push({
    id: `step-${steps.length + 1}`,
    title: `Go to ${to.title || 'Outdoor Location'}`,
    description: `Walk from your current location to ${to.description || 'the destination'}`,
    type: 'outdoor',
    startPoint: 'current-outdoor-location',
    endPoint: 'destination-outdoor-location',
    coordinates: {
      start: {
        latitude: from.latitude,
        longitude: from.longitude
      },
      end: {
        latitude: to.latitude,
        longitude: to.longitude
      }
    }
  });
  
  console.log(`Added outdoor to outdoor navigation steps`);
}

/**
 * Generate navigation steps between a sequence of optimized locations
 * Decides whether the steps are withn the same building, connected buildings, non connected buildings, from building 
 * to ourdoors, from outdoors to building or from outdoors to outdoors.
 * @param {Array} optimizedLocations - Locations in optimal order
 * @returns {Array} Navigation steps
 */
export function generateNavigationSteps(optimizedLocations) {
  const steps = [];
  
  for (let i = 0; i < optimizedLocations.length - 1; i++) {
    const fromLocation = optimizedLocations[i];
    const toLocation = optimizedLocations[i + 1];
    
    // Generate steps based on location types
    if (fromLocation.buildingId && toLocation.buildingId) {
      if (fromLocation.buildingId === toLocation.buildingId) {
        // Same building navigation
        generateSameBuildingSteps(fromLocation, toLocation, steps);
      } else if (hasIndoorConnection(fromLocation.buildingId, toLocation.buildingId)) {
        // Buildings connected by tunnel/bridge
        generateIndoorConnectedBuildingSteps(fromLocation, toLocation, steps);
      } else {
        // Buildings not connected, must go outside
        generateBuildingToBuildingOutdoorSteps(fromLocation, toLocation, steps);
      }
    } else if (fromLocation.buildingId && toLocation.latitude) {
      // Building to outdoor location
      generateBuildingToOutdoorSteps(fromLocation, toLocation, steps);
    } else if (fromLocation.latitude && toLocation.buildingId) {
      // Outdoor location to building
      generateOutdoorToBuildingSteps(fromLocation, toLocation, steps);
    } else if (fromLocation.latitude && toLocation.latitude) {
      // Outdoor to outdoor location
      generateOutdoorToOutdoorSteps(fromLocation, toLocation, steps);
    }
  }
  
  return steps;
}