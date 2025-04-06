/**
 * Formats room numbers according to building-specific conventions
 * @param {string} buildingId - The building identifier (e.g., "MB", "VE", "EV")
 * @param {string} roomText - The user input room text
 * @returns {string} - Properly formatted room identifier
 */
/**
 * Formats room numbers according to building-specific conventions
 * @param {string} buildingId - The building identifier (e.g., "MB", "VE", "EV")
 * @param {string} roomText - The user input room text
 * @returns {string} - Properly formatted room identifier
 */
/**
 * Formats room numbers according to building-specific conventions
 * @param {string} buildingId - The building identifier (e.g., "MB", "VE", "EV")
 * @param {string} roomText - The user input room text
 * @returns {string} - Properly formatted room identifier
 */
export const formatRoomNumber = (buildingId, roomText) => {
  if (!buildingId || !roomText) return roomText;

  const text = roomText.trim();

  // Special case for Hall building with redundant H prefix
  if (buildingId === "H") {
    return formatHallRoom(text);
  }

  // Handle MB (JMSB) building
  if (buildingId === "MB") {
    return formatMBRoom(text);
  }

  // Handle VE, VL, EV buildings
  if (["VE", "VL", "EV"].includes(buildingId)) {
    return formatSpecialBuildingRoom(buildingId, text);
  }

  // Default handling for other buildings
  return formatDefaultRoom(buildingId, text);
};

/**
 * Formats Hall building room numbers
 * @private
 */
function formatHallRoom(text) {
  // Handle redundant H prefix
  if (RegExp(/^H-?H-?\d+/i).exec(text)) {
    const correctedRoom = text.replace(/^H-?H-?(\d+)/i, "H-$1");
    console.log(`Corrected redundant H prefix: ${text} → ${correctedRoom}`);
    return correctedRoom;
  }

  // If it doesn't start with H-, add it
  if (!text.toUpperCase().startsWith("H-")) {
    return `H-${text}`;
  }

  return text;
}

/**
 * Formats MB (JMSB) building room numbers
 * @private
 */
function formatMBRoom(text) {
  // Already has MB prefix
  if (text.toUpperCase().startsWith("MB-")) {
    return text;
  }

  // Format like 1.293 or 1-293
  if (/^\d+\.\d+$/.test(text) || /^\d+-\d+$/.test(text)) {
    return `MB-${text}`;
  }

  // All other formats - add MB- prefix
  return `MB-${text}`;
}

/**
 * Formats room numbers for VE, VL, EV buildings
 * @private
 */
function formatSpecialBuildingRoom(buildingId, text) {
  const specialRooms = [
    "stairs",
    "elevator",
    "toilet",
    "escalator",
    "water_fountain",
  ];

  // Special facility rooms remain as-is
  if (specialRooms.includes(text.toLowerCase())) {
    return text.toLowerCase();
  }

  // Just a number - add building prefix
  if (/^\d+$/.test(text)) {
    return `${buildingId}-${text}`;
  }

  // Already has building prefix
  if (text.toUpperCase().includes(`${buildingId}-`)) {
    return text;
  }

  // Default - add building prefix
  return `${buildingId}-${text}`;
}

/**
 * Default formatting for any other building
 * @private
 */
function formatDefaultRoom(buildingId, text) {
  return text.includes(`${buildingId}-`) ? text : `${buildingId}-${text}`;
}

/**
 * Special rooms that don't follow the standard building-room format
 */
export const SPECIAL_ROOMS = [
  "stairs",
  "elevator",
  "toilet",
  "escalator",
  "water_fountain",
];

/**
 * Checks if a room is a special facility room
 * @param {string} room - Room name to check
 * @returns {boolean} - Whether the room is a special facility
 */
export const isSpecialRoom = (room) => {
  return SPECIAL_ROOMS.includes(room.toLowerCase());
};

/**
 * Validates and formats a room input for a given building
 * @param {string} buildingId - Building identifier
 * @param {string} roomText - Room text to format
 * @param {Function} setRoomFn - Function to set the formatted room
 * @param {Function} setInvalidFn - Function to set invalid state
 * @param {Object} floorRegistry - Floor registry service with validation methods
 */
export const processRoomInput = (
  buildingId,
  roomText,
  setRoomFn,
  setInvalidFn,
  floorRegistry,
) => {
  const formattedRoom = formatRoomNumber(buildingId, roomText);
  setRoomFn(formattedRoom);

  // Check if it's a valid room (only if text is provided)
  if (roomText.length > 0) {
    const isValid = floorRegistry.isValidRoom(buildingId, formattedRoom);
    setInvalidFn(!isValid);
  } else {
    setInvalidFn(false);
  }

  return formattedRoom;
};
