import { rooms as Floor8Rooms, graph as Floor8Graph } from './coordinates/floor8';
import { rooms as Floor9Rooms, graph as Floor9Graph } from './coordinates/floor9';

/**
 * Function that returns the coordinates of the different classes & 
 * points of interest on a given floor of the Hall building
 * @param {number} floorNumber - The floor number to get data for
 * @returns {object} - The rooms data for the specified floor
 */
export function getHallRoomData(floorNumber) {
  floorNumber = parseInt(floorNumber, 10); // Ensure floorNumber is a number

  switch (floorNumber) {
    case 8:
      return Floor8Rooms;
    case 9:
      return Floor9Rooms;
    default:
      throw new Error(`No data available for floor ${floorNumber}`);
  }
}

/**
 * Function that returns the graph data for a given floor of the Hall building
 * @param {number} floorNumber - The floor number to get data for
 * @returns {object} - The graph data for the specified floor
 */
export function getHallGraphData(floorNumber) {
  floorNumber = parseInt(floorNumber, 10); // Ensure floorNumber is a number
  switch (floorNumber) {
    case 8:
      return Floor8Graph;
    case 9:
      return Floor9Graph;
    default:
      throw new Error(`No data available for floor ${floorNumber}`);
  }
}