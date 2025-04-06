/**
 * NavigationPlanService.js
 *
 * This service is responsible for creating and managing navigation plans
 * between different locations, including indoor and outdoor navigation.
 *
 * The service can handle various navigation scenarios:
 * - Room-to-room navigation within the same building
 * - Room to external location navigation
 * - External location to room navigation
 * - Building-to-building navigation
 * - External location to external location navigation
 */

import FloorRegistry from "./BuildingDataService";
import NavigationStrategyService from "./NavigationStrategyService";

/**
 * Creates and executes a navigation plan based on the provided origin and destination information
 *
 * REQUIRED PARAMETERS EXPLANATION:
 *
 * Origin parameters:
 * - originInputType: Either "location" (for outdoor locations) or "classroom" (for building rooms)
 * - originDetails: For location type, contains {latitude, longitude, formatted_address}
 * - origin: Text representation of origin
 * - originBuilding: Building object with {id, name} for classroom type
 * - originRoom: Room ID string (e.g., "H-920") for classroom type
 *
 * Destination parameters:
 * - destinationInputType: Either "location" or "classroom"
 * - destinationDetails: For location type, contains {latitude, longitude, formatted_address}
 * - destination: Text representation of destination
 * - building: Building object with {id, name} for classroom type
 * - room: Room ID string for classroom type
 *
 * State management functions:
 * - setInvalidOriginRoom: Function to update UI state when origin room is invalid
 * - setInvalidDestinationRoom: Function to update UI state when destination room is invalid
 * - setIsLoading: Function to toggle loading state in UI
 *
 * Navigation:
 * - navigation: React Navigation object for screen transitions
 *
 * @param {Object} params - Navigation plan parameters
 * @param {string} params.originInputType - Type of origin input ("location" or "classroom")
 * @param {Object} params.originDetails - Details of the origin location (for location type)
 * @param {string} params.origin - Origin text input
 * @param {Object} params.originBuilding - Origin building object
 * @param {string} params.originRoom - Origin room ID
 * @param {string} params.destinationInputType - Type of destination input ("location" or "classroom")
 * @param {Object} params.destinationDetails - Details of the destination location (for location type)
 * @param {string} params.destination - Destination text input
 * @param {Object} params.building - Destination building object
 * @param {string} params.room - Destination room ID
 * @param {Function} params.setInvalidOriginRoom - Function to update invalid origin room state
 * @param {Function} params.setInvalidDestinationRoom - Function to update invalid destination room state
 * @param {Function} params.setIsLoading - Function to update loading state
 * @param {Object} params.navigation - React Navigation object
 */
const createNavigationPlan = ({
  originInputType,
  originDetails,
  origin,
  originBuilding,
  originRoom,
  destinationInputType,
  destinationDetails,
  destination,
  building,
  room,
  setInvalidOriginRoom,
  setInvalidDestinationRoom,
  setIsLoading,
  navigation,
}) => {
  // Initialize variables to store processed origin information
  let originCoords = null; // Geographic coordinates
  let originAddress = null; // Human-readable address
  let originBuildingId = null; // Building identifier (e.g., "H" for Hall Building)
  let originRoomId = null; // Room identifier within the building

  // PROCESS ORIGIN INFORMATION
  const originProcessResult = processOriginInformation({
    originInputType,
    originDetails,
    origin,
    originBuilding,
    originRoom,
    setInvalidOriginRoom,
  });

  if (!originProcessResult) return;

  ({ originCoords, originAddress, originBuildingId, originRoomId } =
    originProcessResult);

  // PROCESS DESTINATION INFORMATION
  // Initialize variables for destination details
  let destinationCoords = null;
  let destinationAddress = null;
  let destinationBuildingId = null;
  let destinationRoomId = null;

  const destinationProcessResult = processDestinationInformation({
    destinationInputType,
    destinationDetails,
    destination,
    building,
    room,
    setInvalidDestinationRoom,
  });

  if (!destinationProcessResult) return;

  ({
    destinationCoords,
    destinationAddress,
    destinationBuildingId,
    destinationRoomId,
  } = destinationProcessResult);

  // Start the loading indicator for navigation plan creation
  setIsLoading(true);

  // CREATE NAVIGATION PLAN
  // Initialize array to hold navigation steps
  const steps = [];

  // Determine which navigation scenario to use
  if (
    originBuildingId &&
    destinationBuildingId &&
    originBuildingId === destinationBuildingId
  ) {
    // SCENARIO 1: SAME BUILDING NAVIGATION
    createSameBuildingNavigation({
      steps,
      originBuildingId,
      originRoomId,
      destinationRoomId,
      originBuilding,
    });
  } else if (originBuildingId && !destinationBuildingId) {
    // SCENARIO 2: ROOM TO OUTDOOR LOCATION
    createRoomToOutdoorNavigation({
      steps,
      originBuildingId,
      originRoomId,
      originBuilding,
      originCoords,
      destinationCoords,
      originAddress,
      destinationAddress,
    });
  } else if (!originBuildingId && destinationBuildingId) {
    // SCENARIO 3: OUTDOOR LOCATION TO ROOM
    createOutdoorToRoomNavigation({
      steps,
      destinationBuildingId,
      destinationRoomId,
      originCoords,
      destinationCoords,
      originAddress,
      destinationAddress,
      building,
    });
  } else if (
    originBuildingId &&
    destinationBuildingId &&
    originBuildingId !== destinationBuildingId
  ) {
    // SCENARIO 4: BUILDING TO BUILDING NAVIGATION
    createBuildingToBuildingNavigation({
      steps,
      originBuildingId,
      originRoomId,
      destinationBuildingId,
      destinationRoomId,
      originBuilding,
      building,
      originCoords,
      destinationCoords,
      originAddress,
    });
  } else {
    // SCENARIO 5: OUTDOOR TO OUTDOOR NAVIGATION
    createOutdoorToOutdoorNavigation({
      steps,
      originCoords,
      destinationCoords,
      originAddress,
      destinationAddress,
    });
  }

  // Create the complete route object with all steps
  const route = {
    title: `Navigate to ${destinationRoomId || destinationAddress}`,
    currentStep: 0,
    steps: steps,
  };

  // Use the NavigationStrategyService to initiate navigation with the created route
  NavigationStrategyService.navigateToStep(navigation, route);

  // End loading state
  setIsLoading(false);
};

/**
 * Process origin information and validate inputs
 * @param {Object} params - Parameters for origin processing
 * @returns {Object|null} - Process result or null if validation fails
 */
const processOriginInformation = ({
  originInputType,
  originDetails,
  origin,
  originBuilding,
  originRoom,
  setInvalidOriginRoom,
}) => {
  let originCoords = null;
  let originAddress = null;
  let originBuildingId = null;
  let originRoomId = null;

  // Handle outdoor location as origin
  if (originInputType === "location") {
    // Validate that required details are provided
    if (!originDetails) {
      alert("Please enter a valid origin address");
      return null;
    }
    // Extract coordinates and address
    originCoords = {
      latitude: originDetails.latitude,
      longitude: originDetails.longitude,
    };
    originAddress = originDetails.formatted_address || origin;
  } else {
    // Handle building/room as origin
    // Validate that a building was selected
    if (!originBuilding) {
      alert("Please enter a valid origin building");
      return null;
    }

    // If a room is specified, validate it exists in the building
    if (originRoom) {
      if (!FloorRegistry.isValidRoom(originBuilding.id, originRoom)) {
        setInvalidOriginRoom(true);
        alert(`Room ${originRoom} doesn't exist in ${originBuilding.name}`);
        return null;
      }
    } else {
      alert("Please enter a room number");
      return null;
    }

    // Get building coordinates and store identifier information
    originCoords = getCoordinatesForClassroom(originBuilding);
    originBuildingId = originBuilding.id;
    originRoomId = originRoom || "entrance"; // Default to entrance if no room
    originAddress = originRoom
      ? `${originRoom}, ${originBuilding.name}`
      : `${originBuilding.name} entrance`;
  }

  return { originCoords, originAddress, originBuildingId, originRoomId };
};

/**
 * Process destination information and validate inputs
 * @param {Object} params - Parameters for destination processing
 * @returns {Object|null} - Process result or null if validation fails
 */
const processDestinationInformation = ({
  destinationInputType,
  destinationDetails,
  destination,
  building,
  room,
  setInvalidDestinationRoom,
}) => {
  let destinationCoords = null;
  let destinationAddress = null;
  let destinationBuildingId = null;
  let destinationRoomId = null;

  // Handle outdoor location as destination
  if (destinationInputType === "location") {
    if (!destinationDetails) {
      alert("Please enter a valid destination address");
      return null;
    }
    destinationCoords = {
      latitude: destinationDetails.latitude,
      longitude: destinationDetails.longitude,
    };
    destinationAddress = destinationDetails.formatted_address || destination;
  } else {
    // Handle building/room as destination
    if (!building) {
      alert("Please enter a valid destination building");
      return null;
    }

    // If a room is specified, validate it exists in the building
    if (room) {
      if (!FloorRegistry.isValidRoom(building.id, room)) {
        setInvalidDestinationRoom(true);
        alert(`Room ${room} doesn't exist in ${building.name}`);
        return null;
      }
    } else {
      alert("Please enter a room number");
      return null;
    }

    // Get building coordinates and store identifier information
    destinationCoords = getCoordinatesForClassroom(building);
    destinationBuildingId = building.id;
    destinationRoomId = room;
    destinationAddress = `${room}, ${building.name}`;
  }

  return {
    destinationCoords,
    destinationAddress,
    destinationBuildingId,
    destinationRoomId,
  };
};

/**
 * SCENARIO 1: Create same building navigation steps
 * If both origin and destination are in the same building, create a single indoor navigation step
 */
const createSameBuildingNavigation = ({
  steps,
  originBuildingId,
  originRoomId,
  destinationRoomId,
  originBuilding,
}) => {
  // Create indoor step for room-to-room navigation
  steps.push({
    type: "indoor",
    title: `Navigate inside ${originBuilding.name}`,
    buildingId: originBuildingId,
    buildingType: FloorRegistry.getBuildingTypeFromId(originBuildingId),
    startRoom: originRoomId,
    endRoom: destinationRoomId,
    startFloor: FloorRegistry.extractFloorFromRoom(originRoomId),
    endFloor: FloorRegistry.extractFloorFromRoom(destinationRoomId),
    isComplete: false,
  });
};

/**
 * SCENARIO 2: Create room to outdoor location navigation steps
 * If origin is inside a building but destination is outside
 */
const createRoomToOutdoorNavigation = ({
  steps,
  originBuildingId,
  originRoomId,
  originBuilding,
  originCoords,
  destinationCoords,
  originAddress,
  destinationAddress,
}) => {
  // Step 1: Navigate from room to building entrance
  steps.push({
    type: "indoor",
    title: `Exit ${originBuilding.name}`,
    buildingId: originBuildingId,
    buildingType: FloorRegistry.getBuildingTypeFromId(originBuildingId),
    startRoom: originRoomId,
    // Use "Main lobby" instead of "entrance" as it's more likely to be in the navigation graph
    endRoom: "Main lobby",
    startFloor: FloorRegistry.extractFloorFromRoom(originRoomId),
    endFloor: "1", // Assume entrance is on first floor
    isComplete: false,
  });

  // Step 2: Navigate from building entrance to outdoor destination
  steps.push({
    type: "outdoor",
    title: `Travel to ${destinationAddress}`,
    startPoint: originCoords,
    endPoint: destinationCoords,
    startAddress: originAddress,
    endAddress: destinationAddress,
    isComplete: false,
  });
};

/**
 * SCENARIO 3: Create outdoor location to room navigation steps
 * If origin is outside but destination is inside a building
 */
const createOutdoorToRoomNavigation = ({
  steps,
  destinationBuildingId,
  destinationRoomId,
  originCoords,
  destinationCoords,
  originAddress,
  destinationAddress,
  building,
}) => {
  // Step 1: Navigate from origin to building entrance
  steps.push({
    type: "outdoor",
    title: `Travel to ${building.name}`,
    startPoint: originCoords,
    endPoint: destinationCoords,
    startAddress: originAddress,
    endAddress: destinationAddress,
    isComplete: false,
  });

  // Step 2: Navigate from building entrance to destination room
  steps.push({
    type: "indoor",
    title: `Navigate to room ${destinationRoomId} in ${building.name}`,
    buildingId: destinationBuildingId,
    buildingType: FloorRegistry.getBuildingTypeFromId(destinationBuildingId),
    startRoom: "entrance", // Default entry point
    endRoom: destinationRoomId,
    startFloor: "1", // Assume entrance is on first floor
    endFloor: FloorRegistry.extractFloorFromRoom(destinationRoomId),
    isComplete: false,
  });
};

/**
 * SCENARIO 4: Create building to building navigation steps
 * If origin and destination are in different buildings
 */
const createBuildingToBuildingNavigation = ({
  steps,
  originBuildingId,
  originRoomId,
  destinationBuildingId,
  destinationRoomId,
  originBuilding,
  building,
  originCoords,
  destinationCoords,
  originAddress,
}) => {
  // Step 1: Navigate from origin room to building entrance
  steps.push({
    type: "indoor",
    title: `Exit ${originBuilding.name}`,
    buildingId: originBuildingId,
    buildingType: FloorRegistry.getBuildingTypeFromId(originBuildingId),
    startRoom: originRoomId,
    endRoom: "entrance",
    startFloor: FloorRegistry.extractFloorFromRoom(originRoomId),
    endFloor: "1", // Assume entrance is on first floor
    isComplete: false,
  });

  // Step 2: Navigate between buildings (outdoor)
  steps.push({
    type: "outdoor",
    title: `Travel to ${building.name}`,
    startPoint: originCoords,
    endPoint: destinationCoords,
    startAddress: originAddress,
    endAddress: `${building.name} entrance`,
    isComplete: false,
  });

  // Step 3: Navigate from destination building entrance to room
  steps.push({
    type: "indoor",
    title: `Navigate to room ${destinationRoomId} in ${building.name}`,
    buildingId: destinationBuildingId,
    buildingType: FloorRegistry.getBuildingTypeFromId(destinationBuildingId),
    startRoom: "entrance", // Default entry point
    endRoom: destinationRoomId,
    startFloor: "1", // Assume entrance is on first floor
    endFloor: FloorRegistry.extractFloorFromRoom(destinationRoomId),
    isComplete: false,
  });
};

/**
 * SCENARIO 5: Create outdoor to outdoor navigation steps
 * If both origin and destination are outdoor locations
 */
const createOutdoorToOutdoorNavigation = ({
  steps,
  originCoords,
  destinationCoords,
  originAddress,
  destinationAddress,
}) => {
  // Create a single outdoor navigation step
  steps.push({
    type: "outdoor",
    title: `Travel to ${destinationAddress}`,
    startPoint: originCoords,
    endPoint: destinationCoords,
    startAddress: originAddress,
    endAddress: destinationAddress,
    isComplete: false,
  });
};

/**
 * Helper function to get coordinates for a classroom based on building information
 * Uses building registry to look up the geographic coordinates associated with a building
 *
 * @param {Object} building - Building object with id property
 * @returns {Object|null} - Coordinates object with latitude and longitude, or null if building is invalid
 */
const getCoordinatesForClassroom = (building) => {
  if (!building) return null;
  return FloorRegistry.getCoordinatesForBuilding(building.id);
};

/**
 * Export the service functions to be used by other components
 * - createNavigationPlan: Main function to generate and execute navigation plans
 * - getCoordinatesForClassroom: Helper function that might be useful elsewhere
 */
export default {
  createNavigationPlan,
  getCoordinatesForClassroom,
};
