import { ClassGraph } from './constants/ClassGraph';
import { HallXCoordinates } from './constants/HallXCoordinates';
import { findShortestPath } from './PathFinder';
import { visualizePath } from './PathVisualizer';

export class FloorNavigation {
  constructor(svgElement, floorNumber = 8) {
    this.svgElement = svgElement;
    this.floorNumber = floorNumber;
    this.graph = ClassGraph();
    this.coordinates = HallXCoordinates(floorNumber);
    this.highlightedRooms = [];
    
    // Add click handlers to rooms in SVG
    this.initializeRoomClickHandlers();
  }
  
  /**
   * Adds click handlers to room elements in the SVG
   */
  initializeRoomClickHandlers() {
    // This assumes your SVG has elements with IDs matching room names
    for (let roomName in this.coordinates) {
      const element = this.svgElement.getElementById(roomName);
      if (element) {
        element.style.cursor = 'pointer';
        element.addEventListener('click', () => this.handleRoomClick(roomName));
      }
    }
  }
  
  /**
   * Handles click on a room element
   * @param {String} roomName - The name of the clicked room
   */
  handleRoomClick(roomName) {
    // If no room is selected yet, select this as start
    if (this.highlightedRooms.length === 0) {
      this.highlightRoom(roomName, 'start');
    } 
    // If one room is already selected, use this as destination and calculate path
    else if (this.highlightedRooms.length === 1) {
      this.highlightRoom(roomName, 'end');
      this.calculateAndShowPath(this.highlightedRooms[0], roomName);
    } 
    // If two rooms are already selected, reset and start over
    else {
      this.resetNavigation();
      this.highlightRoom(roomName, 'start');
    }
  }
  
  /**
   * Highlights a room in the SVG
   * @param {String} roomName - The name of the room to highlight
   * @param {String} type - 'start' or 'end'
   */
  highlightRoom(roomName, type) {
    const element = this.svgElement.getElementById(roomName);
    if (!element) return;
    
    // Add room to highlighted list
    this.highlightedRooms.push(roomName);
    
    // Apply highlighting
    element.classList.add('highlighted-room');
    element.classList.add(`${type}-room`);
  }
  
  /**
   * Calculates and displays the path between two rooms
   * @param {String} start - Starting room name
   * @param {String} end - Ending room name
   */
  calculateAndShowPath(start, end) {
    const path = findShortestPath(this.graph, start, end);
    visualizePath(path, this.coordinates, this.svgElement);
    
    // Display info about the path (optional)
    console.log(`Path from ${start} to ${end}:`, path);
  }
  
  /**
   * Resets the navigation state
   */
  resetNavigation() {
    // Remove highlighting from rooms
    this.highlightedRooms.forEach(roomName => {
      const element = this.svgElement.getElementById(roomName);
      if (element) {
        element.classList.remove('highlighted-room', 'start-room', 'end-room');
      }
    });
    
    // Clear path
    const existingPaths = this.svgElement.querySelectorAll('.navigation-path');
    existingPaths.forEach(path => path.remove());
    
    // Reset state
    this.highlightedRooms = [];
  }
} 