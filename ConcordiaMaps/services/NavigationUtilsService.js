/**
 * Utility service for navigation-related helper functions
 */

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
    nodeType.toLowerCase() !== "entrance" &&
    nodeType.toLowerCase() !== "main entrance" &&
    nodeType.toLowerCase() !== "lobby" &&
    nodeType.toLowerCase() !== "main lobby"
  ) {
    return nodeType; // Return as is if not an entrance type
  }

  // Building-specific mappings
  switch (buildingType) {
    case "JMSB":
    case "MB":
      return "main hall";
    case "HallBuilding":
    case "H":
      return "Main lobby";
    case "EVBuilding":
    case "EV":
      return "main entrance";
    default: {
      // Default fallback - return first available option
      const options = ["Main lobby", "main hall", "entrance", "lobby"];
      // Return the first option as default
      return options[0];
    }
  }
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
