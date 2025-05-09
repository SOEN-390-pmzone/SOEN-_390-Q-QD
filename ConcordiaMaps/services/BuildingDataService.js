// FloorRegistry.js
//Hall
import {
  rooms as Floor1Rooms,
  graph as Floor1Graph,
} from "../constants/coordinates/h1";
import {
  rooms as Floor2Rooms,
  graph as Floor2Graph,
} from "../constants/coordinates/h2";
import {
  rooms as Floor8Rooms,
  graph as Floor8Graph,
} from "../constants/coordinates/h8";
import {
  rooms as VL2Rooms,
  graph as VL2Graph,
} from "../constants/coordinates/vl2";

import {
  rooms as Floor9Rooms,
  graph as Floor9Graph,
} from "../constants/coordinates/h9";
//JMSB
import {
  rooms as JMSB1Rooms,
  graph as JMSB1Graph,
} from "../constants/coordinates/msb1";
import {
  rooms as JMSB2Rooms,
  graph as JMSB2Graph,
} from "../constants/coordinates/msb2";
//CC
import {
  rooms as CC1Rooms,
  graph as CC1Graph,
} from "../constants/coordinates/cc1";

//Loyola
import {
  rooms as VE2Rooms,
  graph as VE2graph,
} from "../constants/coordinates/ve2";
import {
  rooms as VE1Rooms,
  graph as VE1graph,
} from "../constants/coordinates/ve1";
import {
  rooms as VL1Rooms,
  graph as VL1graph,
} from "../constants/coordinates/vl1";

import SVGs from "../assets/svg/SVGtoString";

export const CONCORDIA_BUILDINGS = [
  {
    id: "H",
    name: "Hall Building",
    address: "1455 De Maisonneuve Blvd. Ouest",
    latitude: 45.497092,
    longitude: -73.5788,
  },
  {
    id: "LB",
    name: "J.W. McConnell Building",
    address: "1400 De Maisonneuve Blvd. Ouest",
    latitude: 45.4968158,
    longitude: -73.5779337,
  },
  {
    id: "MB",
    name: "John Molson Building",
    address: "1450 Guy St.",
    latitude: 45.495304,
    longitude: -73.579044,
  },
  {
    id: "EV",
    name: "Engineering & Visual Arts Complex",
    address: "1515 St. Catherine St. Ouest",
    latitude: 45.495376,
    longitude: -73.577997,
  },
  {
    id: "VL",
    name: "Vanier Library",
    address: "7141 Sherbrooke St. W",
    latitude: 45.459026,
    longitude: -73.638606,
  },
  {
    id: "VE",
    name: "Vanier Extension",
    address: "7141 Sherbrooke St. W",
    latitude: 45.459026,
    longitude: -73.638606,
  },
  {
    id: "CC",
    name: "CC Building",
    address: "7141 Sherbrooke St. W",
    latitude: 45.459026,
    longitude: -73.638606,
  },
];

class FloorRegistry {
  // Add this method to your BuildingDataService module

  /**
   * Find a building by name, partial name, or building code
   *
   * @param {string} nameOrCode - The building name or code to search for
   * @returns {object|null} The building object if found, null otherwise
   */
  static findBuildingByName(nameOrCode) {
    // Handle empty inputs
    if (!nameOrCode) {
      return null;
    }

    const searchTerm = nameOrCode.toLowerCase();
    const buildings = this.getBuildings();

    // Find the first building that matches the search term
    const building = buildings.find((building) => {
      // Check for exact name match (case insensitive)
      if (building.name.toLowerCase() === searchTerm) {
        return true;
      }

      // Check for partial name match (case insensitive)
      if (building.name.toLowerCase().includes(searchTerm)) {
        return true;
      }

      return building.code.toLowerCase() === searchTerm;
    });

    return building || null;
  }
  static getAddressByID(id) {
    const building = CONCORDIA_BUILDINGS.find((building) => building.id === id);
    return building ? building.address : null;
  }

  static parseRoomFormat(text) {
    // Common formats: "H-920", "H 920", "Hall Building 920"
    const buildingMatch = text.match(/^([A-Za-z]+)-?(\d+)$/);
    if (buildingMatch) {
      const [, buildingCode, roomNumber] = buildingMatch;
      return {
        buildingCode,
        roomNumber,
        formatted: `${buildingCode}-${roomNumber}`,
      };
    }
    return null;
  }

  static findBuildingByCode(buildingCode) {
    return CONCORDIA_BUILDINGS.find(
      (b) => b.id.toLowerCase() === buildingCode.toLowerCase(),
    );
  }

  static filterBuildingSuggestions(text) {
    return CONCORDIA_BUILDINGS.filter(
      (building) =>
        building.name.toLowerCase().includes(text.toLowerCase()) ||
        building.id.toLowerCase().includes(text.toLowerCase()),
    );
  }
  static getBuildingTypeFromId(buildingId) {
    if (!buildingId) return "HallBuilding"; // Default

    // Direct mappings for common building codes
    const directMappings = {
      MB: "JMSB",
      JMSB: "JMSB",
      H: "HallBuilding",
      HALL: "HallBuilding",
      VE: "VanierExtension",
      VL: "VanierLibrary",
      EV: "EVBuilding",
      LB: "Library",
    };

    // Check for direct mapping first
    const upperBuildingId = buildingId.toUpperCase();
    if (directMappings[upperBuildingId]) {
      return directMappings[upperBuildingId];
    }

    try {
      // Look through available buildings in registry as fallback
      const buildingTypes = Object.keys(this.#buildings);
      const foundType = buildingTypes.find(
        (key) => this.#buildings[key]?.code === upperBuildingId,
      );

      if (foundType) return foundType;
    } catch (error) {
      console.error("Error finding building type:", error);
    }
    console.log(
      "Couldnt find floor from FloorRegistry. defaulting to Hall Building",
    );
    return "HallBuilding"; // Default to Hall Building if no match
  }

  // Extract floor from room ID (e.g. "H-920" => "9", "1.293" => "1")
  static extractFloorFromRoom(roomId) {
    if (!roomId || typeof roomId !== "string") return "1";

    // Handle common room identifiers like "elevator", "stairs", etc.
    const commonRoomTypes = [
      "entrance",
      "elevator",
      "stairs",
      "toilet",
      "escalator",
      "water_fountain",
      "women_washroom",
      "men_washroom",
    ];
    if (commonRoomTypes.includes(roomId.toLowerCase())) {
      return "1"; // Most common rooms are on the first floor
    }

    // Try to extract floor from room number formats
    let floor = "1"; // Default floor

    // For JMSB second floor format: S2.230
    const mbS2Regex = /^(?:MB-)?S2\./i;
    if (mbS2Regex.test(roomId)) {
      return "S2";
    }

    // For Hall Building rooms like H-920, H920
    const hallRegex = /^h-?(\d)/i;
    const hallResult = hallRegex.exec(roomId);
    if (hallResult) {
      return hallResult[1];
    }

    // For MB/JMSB rooms like 1.293 or 1-293
    const mbRegex = /^(mb-?)?(\d+)[.-]/i;
    const mbResult = mbRegex.exec(roomId);
    if (mbResult) {
      return mbResult[2]; // Using index 2 for the capture group
    }

    // For other buildings with room numbers like VE-101, VL-201, etc.
    const generalRegex = /^[a-z]{1,3}-?(\d)\d{2}/i;
    const generalResult = generalRegex.exec(roomId);
    if (generalResult) {
      return generalResult[1];
    }

    return floor;
  }

  // Normalize room ID to match format in floor data
  // Normalize room ID to match format in floor data
  static normalizeRoomId(roomId) {
    if (!roomId) return roomId;

    // Handle entrance specially with multiple options to increase chances of finding a match
    if (
      typeof roomId === "string" &&
      ["entrance", "main entrance", "main", "lobby", "main lobby"].includes(
        roomId.toLowerCase(),
      )
    ) {
      // For Hall Building, "Main lobby" seems to be the correct format
      return "Main lobby";
    }

    // Make sure we're working with a string
    const roomIdStr = String(roomId);

    // Array of regex patterns and their replacement logic
    const patterns = [
      // For Hall Building: Convert H-903 format to H903 format
      {
        regex: /^(H)-(\d+)$/i,
        replace: (match, p1, p2) => `${p1}${p2}`.toUpperCase(),
      },
      // For JMSB (MB) building: Format like 1.293 directly
      {
        regex: /^MB-(\d+\.\d+)$/i,
        replace: (match, p1) => p1,
      },
      // For JMSB (MB) building second floor: Convert MB-S2.230 format to S2.230 format
      {
        regex: /^MB-(S2\.\d+)$/i,
        replace: (match, p1) => p1,
      },
      // For JMSB (MB) building: Convert MB-1-293 format to 1.293 format
      {
        regex: /^MB-(\d+)-(\d+)$/i,
        replace: (match, p1, p2) => `${p1}.${p2}`,
      },
      // For VE building: Convert VE-191 format to 191 format
      {
        regex: /^VE-(\d+)$/i,
        replace: (match, p1) => p1,
      },
      // For VL building: Convert VL-101 format to 101 format
      {
        regex: /^VL-(\d+)$/i,
        replace: (match, p1) => p1,
      },
    ];

    // Try each pattern in sequence
    for (const pattern of patterns) {
      const match = pattern.regex.exec(roomIdStr);
      if (match) {
        return pattern.replace(...match);
      }
    }

    // Handle other special room types like stairs, elevator, toilet, etc.
    const specialRooms = [
      "stairs",
      "elevator",
      "toilet",
      "water_fountain",
      "escalator",
      "women_washroom",
      "men_washroom",
    ];
    for (const special of specialRooms) {
      if (roomIdStr.toLowerCase().includes(special.toLowerCase())) {
        return special;
      }
    }

    // For other buildings, follow similar pattern
    return roomIdStr.replace(/^([A-Za-z]+)-(\d+)$/, "$1$2").toUpperCase();
  }

  // Get valid rooms for building
  static getValidRoomsForBuilding(buildingId) {
    if (!buildingId) return [];

    const buildingType = this.getBuildingTypeFromId(buildingId);
    if (!buildingType) return [];

    // Get all floors for the building
    const building = this.getBuilding(buildingType);
    if (!building?.floors) return [];

    // Always add common room types for all buildings
    const commonRooms = [
      "entrance",
      "elevator",
      "stairs",
      "escalator",
      "toilet",
      "women_washroom",
      "men_washroom",
      "water_fountain",
    ];

    // Gather all rooms from all floors
    const validRooms = [...commonRooms];

    // Helper function to add building-specific room formats
    const addBuildingSpecificFormats = (roomId) => {
      // For JMSB building
      if (buildingId === "MB" && /^\d+\.\d+$/.test(roomId)) {
        const floorNum = roomId.split(".")[0];
        const roomNum = roomId.split(".")[1];
        validRooms.push(`MB-${roomId}`);
        validRooms.push(`MB-${floorNum}-${roomNum}`);
      }

      // For buildings with simple room numbers
      if (/^\d+$/.test(roomId)) {
        // Add building-prefixed versions
        if (buildingId === "VE") validRooms.push(`VE-${roomId}`);
        if (buildingId === "VL") validRooms.push(`VL-${roomId}`);
        if (buildingId === "EV") validRooms.push(`EV-${roomId}`);
        if (buildingId === "H") validRooms.push(`H-${roomId}`);
      }

      // For Hall Building with H-prefix
      if (buildingId === "H" && /^H\d+$/.test(roomId)) {
        const roomNum = roomId.replace(/^H/, "");
        validRooms.push(`H-${roomNum}`);
      }
    };

    Object.values(building.floors).forEach((floor) => {
      if (floor?.rooms) {
        // Process each room on this floor
        Object.keys(floor.rooms).forEach((roomId) => {
          validRooms.push(roomId);
          addBuildingSpecificFormats(roomId);
        });
      }
    });

    return validRooms;
  }

  /**
   * Validates if a room exists in the specified building
   * @param {string} buildingId - Building identifier
   * @param {string} roomId - Room identifier to validate
   * @returns {boolean} - Whether the room is valid in the building
   */
  static isValidRoom(buildingId, roomId) {
    // Basic input validation
    if (!this._areInputsValid(buildingId, roomId)) {
      return false;
    }

    const buildingIdStr = String(buildingId).trim();
    const roomIdStr = String(roomId).trim();

    // Check for common facilities like entrances, elevators, etc.
    if (this._isCommonFacility(roomIdStr)) {
      return true;
    }

    try {
      // Get building type and validate against known rooms
      const buildingType = this.getBuildingTypeFromId(buildingIdStr);
      if (!buildingType) {
        return false;
      }

      // Check if room is in the valid rooms list for this building
      if (this._isInValidRoomsList(buildingIdStr, roomIdStr)) {
        return true;
      }

      // Check floor-specific room formats
      if (this._isValidRoomByFloor(buildingType, roomIdStr)) {
        return true;
      }

      // Check building-specific formats as last resort
      return this._matchesBuildingSpecificFormat(buildingIdStr, roomIdStr);
    } catch (error) {
      console.error("Error in isValidRoom:", error);
      return false;
    }
  }

  /**
   * Validates basic input parameters
   * @private
   */
  static _areInputsValid(buildingId, roomId) {
    if (
      buildingId === null ||
      buildingId === undefined ||
      roomId === null ||
      roomId === undefined
    ) {
      return false;
    }

    return String(buildingId).trim() !== "" && String(roomId).trim() !== "";
  }

  /**
   * Checks if the room is a common facility like elevator, stairs, etc.
   * @private
   */
  static _isCommonFacility(roomIdStr) {
    // Check for entrance aliases
    const entranceAliases = [
      "entrance",
      "main lobby",
      "lobby",
      "main entrance",
      "entry",
      "main entry",
      "main",
      "atrium",
      "foyer",
      "hall",
      "vestibule",
      "reception",
    ];

    if (
      entranceAliases.some((alias) => roomIdStr.toLowerCase().includes(alias))
    ) {
      return true;
    }

    // Check for other common facilities
    const commonFacilities = [
      "elevator",
      "lift",
      "escalator",
      "stairs",
      "staircase",
      "stairwell",
      "toilet",
      "washroom",
      "restroom",
      "bathroom",
      "water_fountain",
      "women",
      "men",
      "exit",
      "gender neutral",
      "accessible",
    ];

    return commonFacilities.some((facility) =>
      roomIdStr.toLowerCase().includes(facility),
    );
  }

  /**
   * Checks if the room is in the valid rooms list for the building
   * @private
   */
  static _isInValidRoomsList(buildingIdStr, roomIdStr) {
    const validRooms = this.getValidRoomsForBuilding(buildingIdStr);

    // Check direct match
    if (validRooms.includes(roomIdStr)) {
      return true;
    }

    // Check common variations
    const variations = [
      roomIdStr,
      `${buildingIdStr}-${roomIdStr}`,
      `${buildingIdStr}${roomIdStr}`,
    ];

    return variations.some((variant) => validRooms.includes(variant));
  }

  /**
   * Validates room against floor-specific data
   * @private
   */
  static _isValidRoomByFloor(buildingType, roomIdStr) {
    // Extract floor from room ID
    const floor = this.extractFloorFromRoom(roomIdStr);
    if (!floor) return false;

    // Check if floor exists in building
    const floorObj = this.getFloor(buildingType, floor);
    if (!floorObj?.rooms) return false;

    // Check normalized room ID
    const normalizedRoomId = this.normalizeRoomId(roomIdStr);
    return normalizedRoomId && normalizedRoomId in floorObj.rooms;
  }

  /**
   * Checks if room matches building-specific formats
   * @private
   */
  static _matchesBuildingSpecificFormat(buildingIdStr, roomIdStr) {
    const buildingUpper = buildingIdStr.toUpperCase();

    // Check JMSB formats
    if (buildingUpper === "MB" || buildingIdStr.toLowerCase() === "jmsb") {
      return this._isValidMBFormat(roomIdStr);
    }

    // Check Hall Building formats
    if (buildingUpper === "H" || buildingIdStr.toLowerCase() === "hall") {
      return this._isValidHallFormat(roomIdStr);
    }

    // Check general format for other buildings
    return this._isValidGeneralFormat(roomIdStr);
  }

  /**
   * Validates JMSB/MB building room formats
   * @private
   */
  static _isValidMBFormat(roomIdStr) {
    const mbPatterns = [
      /^(\d+)\.(\d+)$/, // 1.293
      /^MB-(\d+)\.(\d+)$/i, // MB-1.293
      /^(\d+)-(\d+)$/, // 1-293
      /^MB-(\d+)-(\d+)$/i, // MB-1-293
      /^S2\.(\d+)$/, // S2.230
      /^MB-S2\.(\d+)$/i, // MB-S2.230
    ];

    return mbPatterns.some((pattern) => pattern.test(roomIdStr));
  }

  /**
   * Validates Hall Building room formats
   * @private
   */
  static _isValidHallFormat(roomIdStr) {
    // Check pattern first
    if (!/^H-?\d{3,4}$/i.test(roomIdStr) && !/^\d{3,4}$/.test(roomIdStr)) {
      return false;
    }

    // Extract floor number
    const floorNum = roomIdStr.replace(/^H-?/i, "")[0];

    // Check if floor exists in Hall Building
    return this.getFloor("HallBuilding", floorNum) !== null;
  }

  /**
   * Validates general room number format for other buildings
   * @private
   */
  static _isValidGeneralFormat(roomIdStr) {
    return (
      /^[A-Za-z]{1,3}-\d{3,4}$/i.test(roomIdStr) || /^\d{3,4}$/.test(roomIdStr)
    );
  }
  static getCoordinatesForBuilding(buildingId) {
    if (!buildingId) return null;

    // Map from long identifiers to short codes
    const idToCode = {
      hall: "H",
      jmsb: "MB",
      ev: "EV",
      library: "LB",
      ve: "VE",
      vanierlibrary: "VL",
      vanierextension: "VE",
      cc: "CC",
    };

    // Convert to uppercase for consistency
    const normalizedId = buildingId.toLowerCase();

    // Use the code mapping if this is a long identifier
    const buildingCode = idToCode[normalizedId] || buildingId.toUpperCase();

    const coordinates = {
      H: { latitude: 45.497092, longitude: -73.5788 },
      MB: { latitude: 45.495304, longitude: -73.577893 },
      EV: { latitude: 45.495655, longitude: -73.578025 },
      LB: { latitude: 45.49674, longitude: -73.57785 },
      VE: { latitude: 45.459044, longitude: -73.638409 },
      VL: { latitude: 45.459249, longitude: -73.638265 },
      CC: { latitude: 45.459044, longitude: -73.638409 },
    };

    return coordinates[buildingCode] || null;
  }

  static getReadableBuildingName(buildingId) {
    if (!buildingId) return buildingId;

    const buildingTypes = Object.keys(this.#buildings);
    for (const type of buildingTypes) {
      if (this.#buildings[type].code === buildingId.toUpperCase()) {
        return this.#buildings[type].name;
      }
    }

    return buildingId; // Return the ID if no match is found
  }

  // Common special rooms that are available in all buildings
  static COMMON_ROOMS = [
    "entrance",
    "elevator",
    "stairs",
    "escalator",
    "toilet",
    "women_washroom",
    "men_washroom",
    "water_fountain",
  ];

  // Get placeholder suggestion for room input based on building
  static getRoomPlaceholder(buildingId) {
    if (!buildingId) return "Enter room number";

    const placeholders = {
      VE: "Enter room number (e.g. 101 or stairs)",
      VL: "Enter room number (e.g. 101 or elevator)",
      EV: "Enter room number (e.g. 200 or stairs)",
      H: "Enter room number (e.g. 920 or elevator)",
      MB: "Enter room number (e.g. 1.293 or stairs)",
      CC: "Enter room number (e.g. 101 or elevator)",
    };

    return placeholders[buildingId] || `Enter room number`;
  }

  // Get error message for invalid room
  static getErrorMessageForRoom(buildingId, buildingName) {
    if (!buildingId) return "Room not found.";

    const errorMessages = {
      MB: "Room not found. Try a format like 1.293 or 1-293.",
      VE: 'Room not found. Try a room number or "elevator"/"stairs".',
      EV: 'Room not found. Try a room number or "elevator"/"stairs".',
      H: "Room not found. Try a format like 920 or H-920.",
      VL: 'Room not found. Try a room number or "elevator"/"stairs".',
      CC: 'Room not found. Try a room number or "elevator"/"stairs".',
    };

    return (
      errorMessages[buildingId] || `This room doesn't exist in ${buildingName}`
    );
  }
  static #buildings = {
    HallBuilding: {
      id: "hall",
      name: "Hall Building",
      code: "H",
      description: "Main academic building",
      address: "1455 De Maisonneuve Blvd. W.",
      floors: {
        T: {
          id: "T",
          name: "Tunnel Level",
          description: "Underground tunnel level",
          rooms: {},
          graph: {},
          getSVG: () => null,
        },
        1: {
          id: "1",
          name: "1st Floor",
          description: "Main entrance, lobby",
          rooms: Floor1Rooms,
          graph: Floor1Graph,
          getSVG: () => SVGs.floor1SVG,
        },
        2: {
          id: "2",
          name: "2nd Floor",
          description: "Hall Building - 2nd Floor",
          rooms: Floor2Rooms,
          graph: Floor2Graph,
          getSVG: () => SVGs.floor2SVG,
        },
        8: {
          id: "8",
          name: "8th Floor",
          description: "Computer Science department",
          rooms: Floor8Rooms,
          graph: Floor8Graph,
          getSVG: () => SVGs.floor8SVG,
        },
        9: {
          id: "9",
          name: "9th Floor",
          description: "Faculty offices",
          rooms: Floor9Rooms,
          graph: Floor9Graph,
          getSVG: () => SVGs.floor9SVG,
        },
      },
    },
    JMSB: {
      id: "jmsb",
      name: "John Molson Building",
      code: "MB",
      description: "Business school building",
      address: "1450 Guy Street",
      floors: {
        T: {
          id: "T",
          name: "Tunnel Level",
          description: "Underground tunnel level",
          rooms: {},
          graph: {},
          getSVG: () => null,
        },
        1: {
          id: "1",
          name: "MSB 1",
          description: "First floor of JMSB",
          rooms: JMSB1Rooms,
          graph: JMSB1Graph,
          getSVG: () => SVGs.MBfloor1SVG,
        },
        S2: {
          id: "S2",
          name: "MSB S2",
          description: "S2 floor of JMSB",
          rooms: JMSB2Rooms,
          graph: JMSB2Graph,
          getSVG: () => SVGs.MBfloor2SVG,
        },
      },
    },
    VanierExtension: {
      id: "ve",
      name: "Vanier Extension",
      code: "VE",
      description: "Loyola Vanier Extension",
      address: "7141 Sherbrooke St W",
      floors: {
        1: {
          id: "1",
          name: "VE 1",
          description: "First floor of Vanier Extension",
          rooms: VE1Rooms,
          graph: VE1graph,
          getSVG: () => SVGs.VEfloor1SVG,
        },
        2: {
          id: "2",
          name: "VE 2",
          description: "Second floor of Vanier Extension",
          rooms: VE2Rooms,
          graph: VE2graph,
          getSVG: () => SVGs.VEfloor2SVG,
        },
      },
    },
    // Add CC Building
    CCBuilding: {
      id: "cc",
      name: "CC Building",
      code: "CC",
      description: "Communication Studies and Journalism Building",
      address: "7141 Sherbrooke St W",
      floors: {
        1: {
          id: "1",
          name: "CC 1",
          description: "First floor of CC Building",
          rooms: CC1Rooms,
          graph: CC1Graph,
          getSVG: () => SVGs.CCfloor1SVG,
        },
      },
    },
    // Add EV Building
    EVBuilding: {
      id: "ev",
      name: "EV Building",
      code: "EV",
      description:
        "Engineering, Computer Science and Visual Arts Integrated Complex",
      address: "1515 St. Catherine W.",
      floors: {
        T: {
          id: "T",
          name: "Tunnel Level",
          description: "Underground tunnel level",
          rooms: {},
          graph: {},
          getSVG: () => null,
        },
        1: {
          id: "1",
          name: "EV Ground Floor",
          description: "Main entrance, atrium",
          rooms: {}, // Add EV room data when available
          graph: {},
          getSVG: () => null, // Replace with actual SVG when available
        },
      },
    },
    // Add Webster Library
    Library: {
      id: "library",
      name: "Webster Library",
      code: "LB",
      description: "Webster Library",
      address: "1400 De Maisonneuve Blvd. W.",
      floors: {
        T: {
          id: "T",
          name: "Tunnel Level",
          description: "Underground tunnel level",
          rooms: {},
          graph: {},
          getSVG: () => null,
        },
        1: {
          id: "1",
          name: "LB 1st Floor",
          description: "Main entrance, circulation desk",
          rooms: {}, // Add Library room data when available
          graph: {},
          getSVG: () => null, // Replace with actual SVG when available
        },
      },
    },
    // Add Webster Library
    VanierLibrary: {
      id: "vanierlibrary",
      name: "Vanier Library",
      code: "VL",
      description: "Vanier Library",
      address: "7141 Sherbrooke St W",
      floors: {
        1: {
          id: "1",
          name: "VL 1st Floor",
          description: "Main floor of the Vanier Library",
          rooms: VL1Rooms,
          graph: VL1graph,
          getSVG: () => SVGs.VLfloor1SVG,
        },
        2: {
          id: "2",
          name: "VL 2nd Floor",
          description: "Second floor of the Vanier Library",
          rooms: VL2Rooms,
          graph: VL2Graph,
          getSVG: () => SVGs.VLfloor2SVG,
        },
      },
    },
  };
  /**
   * Finds elevators for a specific building and floor
   * @private
   * @param {string} buildingType - The building type (e.g., "HallBuilding")
   * @param {string} floor - The floor number
   * @returns {Object} An elevator location object or null if not found
   */
  static _findElevatorForBuilding(buildingType, floor) {
    // Validate inputs
    if (!buildingType || !floor) {
      console.warn(
        "Missing building type or floor when searching for elevators",
      );
      return null;
    }

    // Get the floor data from FloorRegistry
    const floorData = FloorRegistry.getFloor(buildingType, floor);
    if (!floorData) {
      console.warn(`Floor data not found for ${buildingType}, floor ${floor}`);
      return null;
    }

    // Get the rooms for this floor
    const rooms = floorData.rooms;
    if (!rooms) {
      console.warn(`No rooms found for ${buildingType}, floor ${floor}`);
      return null;
    }

    // Get the building code for creating the location object later
    const building = FloorRegistry.getBuilding(buildingType);
    const buildingCode = building?.code || "H"; // Default to "H" if not found

    // Try to find elevator nodes based on common patterns
    const possibleElevatorKeys = [
      "elevator",
      "Elevator",
      "ELEVATOR",
      "elevators",
      `${buildingCode}${floor}elevator`,
      `${buildingCode}-${floor}-elevator`,
      `${buildingCode}-elevator`,
      `${buildingCode.toLowerCase()}-elevator`,
    ];

    // Look for elevator in room keys
    for (const key of possibleElevatorKeys) {
      if (rooms[key]) {
        // Found an elevator, create a location object
        return {
          buildingId: buildingCode,
          floor: floor,
          room: key,
          type: "indoor",
          title: "Elevator",
        };
      }
    }

    // Alternative approach: search for any room key containing "elevator"
    for (const key in rooms) {
      if (key.toLowerCase().includes("elevator")) {
        return {
          buildingId: buildingCode,
          floor: floor,
          room: key,
          type: "indoor",
          title: "Elevator",
        };
      }
    }

    // If no elevator was found, create a virtual elevator near the stairs
    // (Many buildings have stairs but not explicitly labeled elevators in the data)
    for (const key in rooms) {
      if (key.toLowerCase().includes("stair")) {
        console.warn(
          `No elevator found on floor ${floor} of ${buildingType}, using stairs instead`,
        );
        return {
          buildingId: buildingCode,
          floor: floor,
          room: key,
          type: "indoor",
          title: "Stairs",
        };
      }
    }

    // Last resort: use the first room on the floor as an approximation
    const roomKeys = Object.keys(rooms);
    if (roomKeys.length > 0) {
      console.warn(
        `No elevator or stairs found on floor ${floor} of ${buildingType}, using first available room`,
      );
      return {
        buildingId: buildingCode,
        floor: floor,
        room: roomKeys[0],
        type: "indoor",
        title: "Virtual Elevator",
      };
    }

    console.error(
      `Could not find any elevator or room on floor ${floor} of ${buildingType}`,
    );
    return null;
  }

  /**
   * Checks if a tunnel connection exists between two buildings. This function is mainly only used for US24
   * When user asks to protect from weather so we need to recommend them to use a tunnel
   * @param {string} buildingId1 - First building identifier
   * @param {string} buildingId2 - Second building identifier
   * @returns {boolean} - True if a tunnel connection exists, false otherwise
   */
  static hasTunnelConnection(buildingId1, buildingId2) {
    // Normalize building IDs to their canonical forms
    const normalizedId1 = this.#normalizeBuildingIdForTunnel(buildingId1);
    const normalizedId2 = this.#normalizeBuildingIdForTunnel(buildingId2);

    if (!normalizedId1 || !normalizedId2) return false;
    if (normalizedId1 === normalizedId2) return false; // Same building

    // Check specifically for Hall-JMSB tunnel connection (in any order)
    return (
      (normalizedId1 === "hall" && normalizedId2 === "jmsb") ||
      (normalizedId1 === "jmsb" && normalizedId2 === "hall")
    );
  }

  /**
   * Helper method to normalize building IDs for tunnel connection check
   * @private
   * @param {string} buildingId - Building identifier to normalize
   * @returns {string} - Normalized building ID
   */
  static #normalizeBuildingIdForTunnel(buildingId) {
    if (!buildingId) return null;

    // Convert to lowercase for consistent comparison
    const lowerBuildingId = buildingId.toLowerCase();

    // Map of equivalent building IDs to canonical forms
    const buildingIdMap = {
      h: "hall",
      hall: "hall",
      hallbuilding: "hall",

      mb: "jmsb",
      jmsb: "jmsb",

      ev: "ev",
      evbuilding: "ev",

      lb: "library",
      library: "library",
      websterlibrary: "library",

      vl: "vanierlibrary",
      vanierlibrary: "vanierlibrary",

      ve: "vanierextension",
      vanierextension: "vanierextension",

      cc: "ccbuilding",
      ccbuilding: "ccbuilding",
    };

    return buildingIdMap[lowerBuildingId] || lowerBuildingId;
  }

  // Get list of all buildings
  static getBuildings() {
    return Object.values(this.#buildings);
  }
  static getAllBuildings() {
    return this.#buildings;
  }

  // Get specific building data
  static getBuilding(buildingType) {
    return this.#buildings[buildingType];
  }

  // Get list of floors for a building
  static getFloors(buildingType) {
    const building = this.#buildings[buildingType];
    if (!building) return [];
    return Object.values(building.floors);
  }

  // Get specific floor data
  static getFloor(buildingType, floorId) {
    const building = this.#buildings[buildingType];
    if (!building) return null;
    return building.floors[floorId];
  }

  // Get room data for a specific floor
  static getRooms(buildingType, floorId) {
    const floor = this.getFloor(buildingType, floorId);
    return floor ? floor.rooms : {};
  }

  // Get graph data for pathfinding on a specific floor
  static getGraph(buildingType, floorId) {
    const floor = this.getFloor(buildingType, floorId);
    return floor ? floor.graph : {};
  }

  // Get the SVG content for a floor
  static async getFloorPlan(buildingType, floorId) {
    const floor = this.getFloor(buildingType, floorId);
    return floor?.getSVG?.() ?? null;
  }

  // Check if a floor supports indoor navigation
  static supportsNavigation(buildingType, floorId) {
    const floor = this.getFloor(buildingType, floorId);
    return (
      floor &&
      Object.keys(floor.rooms).length > 0 &&
      Object.keys(floor.graph).length > 0
    );
  }
}

export default FloorRegistry;
