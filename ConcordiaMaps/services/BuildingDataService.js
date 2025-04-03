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

class FloorRegistry {
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
        S2: {
          id: "S2",
          name: "MSB S2",
          description: "Second-lowest floor of JMSB",
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
