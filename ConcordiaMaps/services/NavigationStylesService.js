/**
 * Service for navigation UI styling and visual elements
 */

/**
 * Get color for a navigation step type
 * @param {string} type - Step type (start, end, walk, escalator, elevator, stairs)
 * @returns {string} - Color code for the step type
 */
export const getStepColor = (type) => {
  switch (type) {
    case "start":
      return "#4CAF50"; // Green
    case "end":
      return "#F44336"; // Red
    case "escalator":
      return "#2196F3"; // Blue
    case "elevator":
      return "#9C27B0"; // Purple
    case "stairs":
      return "#FF9800"; // Orange
    default:
      return "#912338"; // Maroon
  }
};

/**
 * Get icon name for a navigation step type
 * @param {string} type - Step type (start, end, walk, escalator, elevator, stairs)
 * @returns {string} - Icon name for the step type
 */
export const getStepIcon = (type) => {
  switch (type) {
    case "start":
      return "flag";
    case "end":
      return "location-pin";
    case "escalator":
      return "git-compare";
    case "elevator":
      return "arrow-up-circle";
    case "stairs":
      return "layers";
    default:
      return "chevron-forward";
  }
};

/**
 * Format floor name for display
 * @param {string} floorId - Floor ID from FloorRegistry
 * @returns {string} - Formatted floor name
 */
export const formatFloorName = (floorId) => {
  if (floorId === "T") {
    return "Tunnel Level";
  } else if (floorId === "G") {
    return "Ground Floor";
  } else {
    // Try to parse as number for ordinal formatting
    const floorNum = parseInt(floorId, 10);
    if (!isNaN(floorNum)) {
      if (floorNum === 1) {
        return "1st Floor";
      } else if (floorNum === 2) {
        return "2nd Floor";
      } else if (floorNum === 3) {
        return "3rd Floor";
      } else {
        return `${floorNum}th Floor`;
      }
    } else {
      return `Floor ${floorId}`;
    }
  }
};
