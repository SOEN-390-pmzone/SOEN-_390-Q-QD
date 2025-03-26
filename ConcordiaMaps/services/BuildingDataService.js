// FloorRegistry.js
//Hall
import {
  rooms as Floor1Rooms,
  graph as Floor1Graph,
} from "../constants/coordinates/h1";
import {
  rooms as Floor8Rooms,
  graph as Floor8Graph,
} from "../constants/coordinates/h8";
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

class FloorRegistry {
  // Get building type from building ID
  static getBuildingTypeFromId(buildingId) {
    if (!buildingId) return "HallBuilding"; // Default

    try {
      // Look through available buildings in registry
      const buildingTypes = Object.keys(this.#buildings);
      const foundType = buildingTypes.find(
        (key) => this.#buildings[key]?.code === buildingId.toUpperCase(),
      );

      if (foundType) return foundType;
    } catch (error) {
      console.error("Error finding building type:", error);
    }

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

    // For Hall Building rooms like H-920, H920
    const hallMatch = roomId.match(/h[-]?(\d)/i);
    if (hallMatch) {
      return hallMatch[1];
    }

    // For MB/JMSB rooms like 1.293 or 1-293
    const mbMatch = roomId.match(/^(?:mb[-]?)?(\d+)[.-]/i);
    if (mbMatch) {
      return mbMatch[1];
    }

    // For other buildings with room numbers like VE-101, VL-201, etc.
    const generalMatch = roomId.match(/(?:[a-z]+[-]?)?(\d)(?:\d{2})/i);
    if (generalMatch) {
      return generalMatch[1];
    }

    return floor;
  }

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
    Object.values(building.floors).forEach((floor) => {
      if (floor?.rooms) {
        // Add all room IDs from this floor
        Object.keys(floor.rooms).forEach((roomId) => {
          validRooms.push(roomId);

          // For JMSB building, also add MB-prefixed versions to accommodate user input
          if (buildingId === "MB") {
            // For room IDs like 1.293, also add MB-1.293 and MB-1-293
            if (/^\d+\.\d+$/.test(roomId)) {
              const floorNum = roomId.split(".")[0];
              const roomNum = roomId.split(".")[1];
              validRooms.push(`MB-${roomId}`);
              validRooms.push(`MB-${floorNum}-${roomNum}`);
            }
          }

          // For Vanier Extension building
          if (buildingId === "VE") {
            // Add formats like VE-191
            if (/^\d+$/.test(roomId)) {
              validRooms.push(`VE-${roomId}`);
            }
          }

          // For Vanier Library building
          if (buildingId === "VL") {
            // Add formats like VL-101
            if (/^\d+$/.test(roomId)) {
              validRooms.push(`VL-${roomId}`);
            }
          }

          // For EV Building
          if (buildingId === "EV") {
            // Add formats like EV-200
            if (/^\d+$/.test(roomId)) {
              validRooms.push(`EV-${roomId}`);
            }
          }

          // For Hall Building, add H-prefixed versions
          if (buildingId === "H") {
            // Add formats like H-801
            if (/^\d+$/.test(roomId)) {
              validRooms.push(`H-${roomId}`);
            }
            // Add formats for H801
            if (/^H\d+$/.test(roomId)) {
              const roomNum = roomId.replace(/^H/, "");
              validRooms.push(`H-${roomNum}`);
            }
          }
        });
      }
    });

    return validRooms;
  }

  // Validate if a room exists in the building
  static isValidRoom(buildingId, roomId) {
    if (!buildingId || !roomId) return false;

    // Special cases for common facilities
    if (
      ["entrance", "main lobby", "lobby", "main entrance"].includes(
        roomId.toLowerCase(),
      )
    )
      return true;

    // Handle common facility types across buildings
    if (
      [
        "elevator",
        "stairs",
        "escalator",
        "toilet",
        "water_fountain",
        "women_washroom",
        "men_washroom",
      ].includes(roomId.toLowerCase())
    )
      return true;

    // Get building type from ID
    const buildingType = this.getBuildingTypeFromId(buildingId);
    if (!buildingType) return false;

    // Extract floor from room
    const floor = this.extractFloorFromRoom(roomId);
    if (!floor) return false;

    // Check if the floor exists in the building
    const floorObj = this.getFloor(buildingType, floor);
    if (!floorObj) return false;

    // Normalize room ID
    const normalizedRoomId = this.normalizeRoomId(roomId);

    // Check if room exists in floor's room registry
    return normalizedRoomId in floorObj.rooms;
  }
  static getCoordinatesForBuilding(buildingId) {
    if (!buildingId) return null;

    const coordinates = {
      H: { latitude: 45.497092, longitude: -73.5788 },
      MB: { latitude: 45.495304, longitude: -73.577893 },
      EV: { latitude: 45.495655, longitude: -73.578025 },
      LB: { latitude: 45.49674, longitude: -73.57785 },
      VE: { latitude: 45.459044, longitude: -73.638409 },
      VL: { latitude: 45.459249, longitude: -73.638265 },
    };

    return coordinates[buildingId.toUpperCase()] || null;
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
        2: {
          id: "2",
          name: "MSB 2",
          description: "Second floor of JMSB",
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
      },
    },
  };

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
