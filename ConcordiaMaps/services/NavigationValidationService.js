/**
 * Service for validating navigation inputs and selections
 */

/**
 * Validates room selection for navigation
 * @param {Object} startFloorGraph - Navigation graph for start floor
 * @param {Object} endFloorGraph - Navigation graph for end floor
 * @param {string} selectedStartRoom - Selected start room ID
 * @param {string} selectedEndRoom - Selected end room ID
 * @returns {string|null} - Error message or null if validation passes
 */
export const validateRoomSelection = (
    startFloorGraph,
    endFloorGraph,
    selectedStartRoom,
    selectedEndRoom
  ) => {
    if (!selectedStartRoom || !selectedEndRoom) {
      return "Please select both start and end rooms";
    }
  
    if (!startFloorGraph[selectedStartRoom]) {
      return `Start room ${selectedStartRoom} not found in navigation graph`;
    }
  
    if (!endFloorGraph[selectedEndRoom]) {
      return `End room ${selectedEndRoom} not found in navigation graph`;
    }
  
    return null;
  };
  
  /**
   * Identifies which floor a room is on
   * @param {string} buildingType - Building type from FloorRegistry
   * @param {string} roomId - Room ID to find
   * @param {Object} FloorRegistry - Floor registry service
   * @returns {string|null} - Floor ID or null if not found
   */
  export const findFloorForRoom = (buildingType, roomId, FloorRegistry) => {
    const building = FloorRegistry.getBuilding(buildingType);
    if (!building) return null;
    
    // Check each floor for the room
    for (const floorId in building.floors) {
      const rooms = FloorRegistry.getRooms(buildingType, floorId);
      if (rooms && roomId in rooms) {
        return floorId;
      }
    }
    return null;
  };
  
  /**
   * Find building type from building ID
   * @param {string} id - Building ID
   * @param {Object} FloorRegistry - Floor registry service
   * @returns {string|null} - Building type or null if not found
   */
  export const findBuildingTypeFromId = (id, FloorRegistry) => {
    const buildingTypes = Object.keys(FloorRegistry.getAllBuildings());
    return buildingTypes.find(
      (key) => FloorRegistry.getBuilding(key).id === id
    ) || null;
  };