// FloorRegistry.js
import { rooms as Floor1Rooms, graph as Floor1Graph } from '../../constants/coordinates/floor1';
import { rooms as Floor8Rooms, graph as Floor8Graph } from '../../constants/coordinates/floor8';
import { rooms as Floor9Rooms, graph as Floor9Graph } from '../../constants/coordinates/floor9';
import SVGs from '../../assets/svg/SVGtoString';

class FloorRegistry {
  static #buildings = {
    HallBuilding: {
      id: 'hall',
      name: 'Hall Building',
      code: 'H',
      description: 'Main academic building',
      address: '1455 De Maisonneuve Blvd. W.',
      floors: {
        '1': {
          id: '1',
          name: '1st Floor',
          description: 'Main entrance, lobby',
          rooms: Floor1Rooms,
          graph: Floor1Graph,
          getSVG: () => SVGs.floor1SVG
        },
        '8': {
          id: '8',
          name: '8th Floor',
          description: 'Computer Science department',
          rooms: Floor8Rooms,
          graph: Floor8Graph,
          getSVG: () => SVGs.floor8SVG
        },
        '9': {
          id: '9',
          name: '9th Floor',
          description: 'Faculty offices',
          rooms: Floor9Rooms,
          graph: Floor9Graph,
          getSVG: () => SVGs.floor9SVG
        }
      }
    },
    JMSB: {
      id: 'jmsb',
      name: 'John Molson Building',
      code: 'MB',
      description: 'Business school building',
      address: '1450 Guy Street',
      floors: {
        '1': {
          id: '1',
          name: 'MSB 1',
          description: 'First floor of JMSB',
          rooms: {}, // Add JMSB room data when available
          graph: {},
          getSVG: () => SVGs.MBfloor1SVG // Replace with actual SVG when available
        }
      }
    },
    VanierExtension: {
      id: 've',
      name: 'Vanier Extension',
      code: 'VE',
      description: 'Loyola Vanier Extension',
      address: '7141 Sherbrooke St W',
      floors: {
        '2': {
          id: '2',
          name: 'VE 1',
          description: 'Second floor of Vanier Extension',
          rooms: {}, // Add Vanier room data when available
          graph: {},
          getSVG: () => SVGs.VEfloor2SVG 
        }
      }
    },
    // Add EV Building
    EVBuilding: {
      id: 'ev',
      name: 'EV Building',
      code: 'EV',
      description: 'Engineering, Computer Science and Visual Arts Integrated Complex',
      address: '1515 St. Catherine W.',
      floors: {
        '1': {
          id: '1',
          name: 'EV Ground Floor',
          description: 'Main entrance, atrium',
          rooms: {}, // Add EV room data when available
          graph: {},
          getSVG: () => null // Replace with actual SVG when available
        }
      }
    },
    // Add Webster Library
    Library: {
      id: 'library',
      name: 'Webster Library',
      code: 'LB',
      description: 'Webster Library',
      address: '1400 De Maisonneuve Blvd. W.',
      floors: {
        '1': {
          id: '1',
          name: 'LB 1st Floor',
          description: 'Main entrance, circulation desk',
          rooms: {}, // Add Library room data when available
          graph: {},
          getSVG: () => null // Replace with actual SVG when available
        }
      }
    }
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
    if (!floor || !floor.getSVG) return null;
    return floor.getSVG();
  }

  // Check if a floor supports indoor navigation
  static supportsNavigation(buildingType, floorId) {
    const floor = this.getFloor(buildingType, floorId);
    return floor && Object.keys(floor.rooms).length > 0 && Object.keys(floor.graph).length > 0;
  }
}

export default FloorRegistry;