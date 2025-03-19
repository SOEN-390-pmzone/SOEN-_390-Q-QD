/**
 * Service for calculating navigation paths between rooms
 */
import { findShortestPath } from "../components/IndoorNavigation/PathFinder";

/**
 * Find available transportation method between floors
 * @param {Object} startFloorGraph - Navigation graph for start floor
 * @param {Object} endFloorGraph - Navigation graph for end floor
 * @returns {string|null} - Transportation method or null if none found
 */
export const findTransportMethod = (startFloorGraph, endFloorGraph) => {
  const startNodes = new Set(Object.keys(startFloorGraph));
  const endNodes = new Set(Object.keys(endFloorGraph));

  const transportMethods = ["escalator", "elevator", "stairs"];

  for (const method of transportMethods) {
    if (startNodes.has(method) && endNodes.has(method)) {
      return method;
    }
  }

  return null;
};

/**
 * Handle navigation on the same floor
 * @param {Object} startFloorGraph - Navigation graph
 * @param {string} selectedStartRoom - Start room ID
 * @param {string} selectedEndRoom - End room ID
 * @param {string} startFloor - Floor ID
 * @param {string} buildingName - Building name
 * @returns {Object} - Path calculation result
 */
export const handleSameFloorNavigation = (
  startFloorGraph,
  selectedStartRoom,
  selectedEndRoom,
  startFloor,
  buildingName,
) => {
  const directPath = findShortestPath(
    startFloorGraph,
    selectedStartRoom,
    selectedEndRoom,
  );

  if (directPath.length < 2) {
    throw new Error("Could not find a path between these rooms");
  }

  return {
    startFloorPath: directPath,
    endFloorPath: [],
    navigationSteps: [
      {
        type: "start",
        text: `Start at room ${selectedStartRoom} on floor ${startFloor} of ${buildingName}`,
      },
      ...directPath.slice(1, -1).map((node) => ({
        type: "walk",
        text: `Go to ${node}`,
      })),
      {
        type: "end",
        text: `Arrive at destination: ${selectedEndRoom}`,
      },
    ],
  };
};

/**
 * Handle navigation between different floors
 * @param {Object} startFloorGraph - Start floor navigation graph
 * @param {Object} endFloorGraph - End floor navigation graph
 * @param {string} selectedStartRoom - Start room ID
 * @param {string} selectedEndRoom - End room ID
 * @param {string} startFloor - Start floor ID
 * @param {string} endFloor - End floor ID
 * @param {string} buildingName - Building name
 * @returns {Object} - Path calculation result
 */
export const handleInterFloorNavigation = (
  startFloorGraph,
  endFloorGraph,
  selectedStartRoom,
  selectedEndRoom,
  startFloor,
  endFloor,
  buildingName,
) => {
  const transportMethod = findTransportMethod(startFloorGraph, endFloorGraph);

  if (!transportMethod) {
    throw new Error(
      `Cannot navigate between floors ${startFloor} and ${endFloor}`,
    );
  }

  const startFloorTransportPath = findShortestPath(
    startFloorGraph,
    selectedStartRoom,
    transportMethod,
  );
  const endFloorTransportPath = findShortestPath(
    endFloorGraph,
    transportMethod,
    selectedEndRoom,
  );

  if (startFloorTransportPath.length < 2 || endFloorTransportPath.length < 2) {
    throw new Error("Could not find a complete path between these rooms");
  }

  return {
    startFloorPath: startFloorTransportPath,
    endFloorPath: endFloorTransportPath,
    navigationSteps: [
      {
        type: "start",
        text: `Start at room ${selectedStartRoom} on floor ${startFloor} of ${buildingName}`,
      },
      ...startFloorTransportPath.slice(1).map((node, index) => ({
        type: "walk",
        text:
          index === startFloorTransportPath.length - 2
            ? `Arrive at ${transportMethod} on floor ${startFloor}`
            : `Go to ${node}`,
      })),
      {
        type: transportMethod,
        text: `Take ${transportMethod} to floor ${endFloor}`,
      },
      ...endFloorTransportPath.slice(1).map((node, index) => ({
        type: "walk",
        text:
          index === 0
            ? `Start from ${transportMethod} on floor ${endFloor}`
            : `Go to ${node}`,
      })),
      {
        type: "end",
        text: `Arrive at destination: ${selectedEndRoom}`,
      },
    ],
  };
};

/**
 * Main function to calculate path between rooms
 * @param {Object} params - Parameters for path calculation
 * @returns {Object} - Path calculation result
 */
export const calculateNavigationPath = ({
  buildingType,
  startFloor,
  endFloor,
  selectedStartRoom,
  selectedEndRoom,
  FloorRegistry,
}) => {
  // Verify all required data is available
  if (
    !buildingType ||
    !startFloor ||
    !endFloor ||
    !selectedStartRoom ||
    !selectedEndRoom
  ) {
    throw new Error(
      "Missing navigation data. Please select building, floors, and rooms.",
    );
  }

  console.log(
    "Calculating path from",
    selectedStartRoom,
    "to",
    selectedEndRoom,
  );
  console.log(
    "Building type:",
    buildingType,
    "Start floor:",
    startFloor,
    "End floor:",
    endFloor,
  );

  const startFloorGraph = FloorRegistry.getGraph(buildingType, startFloor);
  const endFloorGraph = FloorRegistry.getGraph(buildingType, endFloor);
  const building = FloorRegistry.getBuilding(buildingType);

  // Validate room selection
  if (!selectedStartRoom || !selectedEndRoom) {
    throw new Error("Please select both start and end rooms");
  }

  if (!startFloorGraph[selectedStartRoom]) {
    throw new Error(
      `Start room ${selectedStartRoom} not found in navigation graph`,
    );
  }

  if (!endFloorGraph[selectedEndRoom]) {
    throw new Error(
      `End room ${selectedEndRoom} not found in navigation graph`,
    );
  }

  // Calculate path based on whether rooms are on the same floor or not
  if (startFloor === endFloor) {
    return handleSameFloorNavigation(
      startFloorGraph,
      selectedStartRoom,
      selectedEndRoom,
      startFloor,
      building.name,
    );
  } else {
    return handleInterFloorNavigation(
      startFloorGraph,
      endFloorGraph,
      selectedStartRoom,
      selectedEndRoom,
      startFloor,
      endFloor,
      building.name,
    );
  }
};
