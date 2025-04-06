/**
 * Utility service for navigation-related helper functions
 */

// Constants to replace magic literals
export const BUILDINGS = {
  HALL: "HallBuilding",
  H: "H",
  JMSB: "JMSB",
  MB: "MB",
  EV: "EVBuilding",
  LIBRARY: "Library",
  VANIER: "VanierExtension",
};

export const FLOORS = {
  FIRST: "1",
  SECOND: "2",
  EIGHTH: "8",
  NINTH: "9",
  TUNNEL: "T",
};

export const NODE_TYPES = {
  ENTRANCE: "entrance",
  MAIN_LOBBY: "Main lobby",
  MAIN_HALL: "main hall",
};

/**
 * Finds entrance-related nodes in a list of nodes
 * @param {Array<string>} nodes - Array of node names/IDs
 * @returns {Array<string>} - Array of nodes that match entrance criteria
 */
export const getEntranceOptions = (nodes) =>
  nodes.filter((node) =>
    [
      "ENTRANCE",
      "LOBBY",
      "DOOR",
      "ELEVATOR",
      "STAIRS",
      "Main lobby",
      "main hall",
    ].some((keyword) => node.toLowerCase().includes(keyword.toLowerCase())),
  );

/**
 * Validates if a node exists in a navigation graph
 * @param {Object} graph - Navigation graph object
 * @param {string} node - Node ID to check
 * @returns {boolean} - True if node exists in graph
 */
export const validateNodeExists = (graph, node) => {
  return Object.keys(graph).includes(node);
};

/**
 * Maps generic entrance concepts to building-specific node names
 * @param {string} buildingType - Building type identifier
 * @param {string} nodeType - Type of node ("entrance", "exit", etc.)
 * @returns {string} - Building-specific node name
 */
export const mapGenericNodeToBuildingSpecific = (buildingType, nodeType) => {
  if (
    nodeType.toLowerCase() !== NODE_TYPES.ENTRANCE &&
    nodeType.toLowerCase() !== "main entrance" &&
    nodeType.toLowerCase() !== "lobby" &&
    nodeType.toLowerCase() !== NODE_TYPES.MAIN_LOBBY.toLowerCase()
  ) {
    return nodeType; // Return as is if not an entrance type
  }

  // Building-specific mappings
  switch (buildingType) {
    case BUILDINGS.JMSB:
    case BUILDINGS.MB:
    case "JMSB":
    case "MB":
      return NODE_TYPES.MAIN_HALL;
    case BUILDINGS.HALL:
    case BUILDINGS.H:
    case "HallBuilding":
    case "H":
      return NODE_TYPES.MAIN_LOBBY;
    case BUILDINGS.EV:
    case "EVBuilding":
    case "EV":
      return "main entrance";
    default:
      // Match the expected behavior in tests
      // Default to Main lobby for unknown buildings
      return NODE_TYPES.MAIN_LOBBY;
  }
};

/**
 * Resolves an entrance node based on building type and available nodes
 * @param {string} buildingType - Type of building (e.g., "HallBuilding")
 * @param {string} floorId - Floor identifier (e.g., "1")
 * @param {Array<string>} availableNodes - List of available nodes in the graph
 * @returns {string} - Resolved entrance node
 */
export const resolveEntranceNode = (buildingType, floorId, availableNodes) => {
  // Special case for Hall Building first floor
  if (buildingType === BUILDINGS.HALL && floorId === FLOORS.FIRST) {
    // Use the utility function to find entrance-related nodes
    const entranceOptions = getEntranceOptions(availableNodes);

    if (entranceOptions.length > 0) {
      console.log("Found entrance node:", entranceOptions[0]);
      return entranceOptions[0];
    }
  }

  // For other buildings or if no entrance nodes found
  if (availableNodes.length > 0) {
    const entranceOptions = getEntranceOptions(availableNodes);
    return entranceOptions.length > 0 ? entranceOptions[0] : availableNodes[0];
  }

  // If no nodes available, return a default
  console.error("No nodes available in floor graph");
  return null;
};

/**
 * Normalizes a room ID based on building conventions
 * @param {string} buildingId - Building identifier (e.g., "H", "MB")
 * @param {string} roomId - Room identifier to normalize
 * @returns {string} - Normalized room ID
 */
export const normalizeRoomId = (buildingId, roomId) => {
  // Check if roomId is one of the entrance-related terms
  const entranceTerms = ["entrance", "main lobby", "main entrance", "lobby"];
  if (entranceTerms.includes(roomId.toLowerCase())) {
    return mapGenericNodeToBuildingSpecific(buildingId, roomId);
  }

  // If roomId already has building prefix, return as is
  if (roomId.toUpperCase().startsWith(buildingId.toUpperCase() + "-")) {
    return roomId;
  }

  // Special case for JMSB rooms with floor.room format
  if (buildingId.toUpperCase() === "MB") {
    // Check if it's in format like "1.293"
    if (/^\d+\.\d+$/.test(roomId)) {
      return roomId; // Return as is since the graph has this format
    }
    // If it's just a number sequence, add building prefix
    if (/^\d+$/.test(roomId)) {
      return `${buildingId.toUpperCase()}-${roomId}`;
    }
  }

  // For other buildings, simply add the prefix if not already present
  return `${buildingId.toUpperCase()}-${roomId}`;
};
