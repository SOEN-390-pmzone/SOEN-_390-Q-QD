import SVGs from '../assets/svg/SVGtoString';

class FloorPlanService {
  static cache = new Map();

  static async getFloorPlan(floor) {
    if (this.cache.has(floor)) {
      return this.cache.get(floor);
    }

    try {
      let svgContent = '';
      switch (floor) {
        case '8':
          svgContent =SVGs.floor8SVG ;
          break;
        case '9':
          svgContent = SVGs.floor9SVG;
          break;
        // Add more floors as needed
        default:
          throw new Error(`Floor ${floor} not supported`);
      }
      
      this.cache.set(floor, svgContent);
      return svgContent;
    } catch (error) {
      console.error(`Error loading floor plan for floor ${floor}:`, error);
      throw error;
    }
  }

  static clearCache() {
    this.cache.clear();
  }
}

export default FloorPlanService; 