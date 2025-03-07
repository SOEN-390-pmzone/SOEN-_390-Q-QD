import SVGs from '../assets/svg/SVGtoString';

class FloorPlanService {
  static cache = new Map();

  static async getFloorPlan(floor) {
    // Convert floor to string for consistent comparison
    const floorStr = floor.toString();
    
    if (this.cache.has(floorStr)) {
      return this.cache.get(floorStr);
    }

    try {
      let svgContent = '';
      switch (floorStr) {
        case '8':
          svgContent = SVGs.floor8SVG;
          break;
        case '9':
          svgContent = SVGs.floor9SVG;
          break;
        // Add more floors as needed
        default:
          throw new Error(`Floor ${floorStr} not supported`);
      }
      
      this.cache.set(floorStr, svgContent);
      return svgContent;
    } catch (error) {
      console.error(`Error loading floor plan for floor ${floorStr}:`, error);
      throw error;
    }
  }

  static clearCache() {
    this.cache.clear();
  }
}

export default FloorPlanService; 