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

  let formattedRoom;
  const text = roomText.trim();

  // Special case for Hall building with redundant H prefix
  if (buildingId === "H") {
    // More aggressive handling of redundant H prefixes - catches all variants
    if (RegExp(/^H-?H-?\d+/i).exec(text)) {
      const correctedRoom = text.replace(/^H-?H-?(\d+)/i, "H-$1");
      console.log(`Corrected redundant H prefix: ${text} → ${correctedRoom}`);
      return correctedRoom;
    }
  }

  if (buildingId === "MB") {
    // Special handling for MB rooms
    // Try matching format like 1.293
    const dotMatch = /^\d+\.\d+$/.exec(text);
    if (dotMatch) {
      formattedRoom = `MB-${text}`;
    }
    // Try matching format like 1-293
    else if (/^\d+-\d+$/.test(text)) {
      formattedRoom = `MB-${text}`;
    }
    // If doesn't start with MB-, add the prefix
    else if (!text.startsWith("MB-")) {
      formattedRoom = `MB-${text}`;
    } else {
      formattedRoom = text;
    }
  } else if (["VE", "VL", "EV"].includes(buildingId)) {
    // Handle special rooms for Vanier Extension, Vanier Library and EV Building
    const specialRooms = [
      "stairs",
      "elevator",
      "toilet",
      "escalator",
      "water_fountain",
    ];

    if (specialRooms.includes(text.toLowerCase())) {
      formattedRoom = text.toLowerCase();
    } else if (/^\d+$/.exec(text)) {
      // Just a number like "101" - prefix with building code
      formattedRoom = `${buildingId}-${text}`;
    } else if (
      !text.includes(`${buildingId}-`) &&
      !specialRooms.includes(text.toLowerCase())
    ) {
      // Any other input without building prefix
      formattedRoom = `${buildingId}-${text}`;
    } else {
      // Keep as is if already has building prefix
      formattedRoom = text;
    }
  } else {
    // Default handling for other buildings
    formattedRoom = !text.includes(`${buildingId}-`)
      ? `${buildingId}-${text}`
      : text;
  }

  return formattedRoom;
};

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
