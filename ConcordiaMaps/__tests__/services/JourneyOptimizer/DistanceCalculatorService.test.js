import DistanceCalculatorService from '../../../services/JourneyOptimizer/DistanceCalculatorService';
import RouteStrategies from '../../../services/JourneyOptimizer/RouteStrategies';

// Mock the RouteStrategies dependency
jest.mock('../../../services/JourneyOptimizer/RouteStrategies', () => ({
  SameFloorSameBuilding: {
    calculateDistance: jest.fn(() => 10),
    isPathAllowed: jest.fn(() => true)
  },
  DifferentFloorSameBuilding: {
    calculateDistance: jest.fn(() => 20),
    isPathAllowed: jest.fn(() => true)
  },
  DifferentCampuses: {
    calculateDistance: jest.fn(() => 100),
    isPathAllowed: jest.fn((locationA, locationB, avoidOutdoor) => !avoidOutdoor)
  },
  DifferentBuildingSameCampus: {
    calculateDistance: jest.fn(() => 50),
    isPathAllowed: jest.fn(() => true)
  },
  Outdoor: {
    calculateDistance: jest.fn(() => 30),
    isPathAllowed: jest.fn(() => true)
  },
  Mixed: {
    calculateDistance: jest.fn(() => 40),
    isPathAllowed: jest.fn(() => true)
  }
}));

describe('DistanceCalculatorService', () => {
  let service;
  let mockIndoorLocations;
  let mockOutdoorLocations;
  
  beforeEach(() => {
    // Reset all mock implementations
    jest.clearAllMocks();
    
    // Create a fresh instance for each test
    service = new DistanceCalculatorService();
    
    // Setup mock locations
    mockIndoorLocations = {
      // Hall building locations
      hallNinthFloor: { 
        id: 'hall-920',
        type: 'indoor',
        buildingId: 'H',
        floor: '9',
        room: 'H-920'
      },
      hallEighthFloor: { 
        id: 'hall-820',
        type: 'indoor',
        buildingId: 'H',
        floor: '8',
        room: 'H-820'
      },
      // JMSB building locations
      jmsb: {
        id: 'jmsb-210',
        type: 'indoor',
        buildingId: 'MB',
        floor: '2',
        room: 'MB-2.210'
      },
      // Library building location
      library: {
        id: 'library-305',
        type: 'indoor',
        buildingId: 'LB',
        floor: '3',
        room: 'LB-305'
      },
      // Vanier Library (Loyola campus)
      vanier: {
        id: 'vanier-201',
        type: 'indoor',
        buildingId: 'VL',
        floor: '2',
        room: 'VL-201'
      },
      // Incomplete indoor location (missing buildingId)
      incompleteIndoor: {
        id: 'incomplete-indoor',
        type: 'indoor',
        floor: '1'
      },
      // Incomplete indoor location (missing floor)
      indoorNoFloor: {
        id: 'indoor-no-floor',
        type: 'indoor',
        buildingId: 'H',
        room: 'H-???'
      }
    };
    
    // Outdoor locations
    mockOutdoorLocations = {
      sgwCampus: {
        id: 'sgw-outdoor',
        type: 'outdoor',
        latitude: 45.497092,
        longitude: -73.578957,
        title: 'SGW Campus'
      },
      loyolaCampus: {
        id: 'loyola-outdoor',
        type: 'outdoor',
        latitude: 45.458424,
        longitude: -73.640259,
        title: 'Loyola Campus'
      },
      incompleteOutdoor: {
        id: 'incomplete-outdoor',
        type: 'outdoor',
        // Missing coordinates
      }
    };
  });
  
  describe('constructor', () => {
    it('should initialize with default avoidOutdoor=false', () => {
      expect(service.avoidOutdoor).toBe(false);
      expect(service.strategies).toBe(RouteStrategies);
    });
    
    it('should initialize with custom avoidOutdoor value', () => {
      const serviceAvoidOutdoor = new DistanceCalculatorService(true);
      expect(serviceAvoidOutdoor.avoidOutdoor).toBe(true);
    });
  });
  
  describe('_determineStrategy', () => {
    // CASE 1: Both locations are indoor
    describe('when both locations are indoor', () => {
      // CASE 1A: Same building
      describe('when locations are in the same building', () => {
        // CASE 1A-1: Same floor
        it('should use SameFloorSameBuilding strategy for same building, same floor', () => {
          const strategy = service._determineStrategy(
            mockIndoorLocations.hallNinthFloor, 
            mockIndoorLocations.hallNinthFloor
          );
          expect(strategy).toBe(RouteStrategies.SameFloorSameBuilding);
        });
        
        // CASE 1A-2: Different floors
        it('should use DifferentFloorSameBuilding strategy for same building, different floors', () => {
          const strategy = service._determineStrategy(
            mockIndoorLocations.hallNinthFloor, 
            mockIndoorLocations.hallEighthFloor
          );
          expect(strategy).toBe(RouteStrategies.DifferentFloorSameBuilding);
        });
        
        // Missing floor information
        it('should use DifferentFloorSameBuilding strategy when floor info is missing', () => {
          const strategy = service._determineStrategy(
            mockIndoorLocations.hallNinthFloor,
            mockIndoorLocations.indoorNoFloor
          );
          expect(strategy).toBe(RouteStrategies.DifferentFloorSameBuilding);
        });
      });
      
      // CASE 1B: Different buildings
      describe('when locations are in different buildings', () => {
        // CASE 1B-1: Different campuses
        it('should use DifferentCampuses strategy for buildings on different campuses', () => {
          const strategy = service._determineStrategy(
            mockIndoorLocations.hallNinthFloor,
            mockIndoorLocations.vanier
          );
          expect(strategy).toBe(RouteStrategies.DifferentCampuses);
        });
        
        // CASE 1B-2: Same campus, different buildings
        it('should use DifferentBuildingSameCampus strategy for different buildings on same campus', () => {
          const strategy = service._determineStrategy(
            mockIndoorLocations.hallNinthFloor,
            mockIndoorLocations.jmsb
          );
          expect(strategy).toBe(RouteStrategies.DifferentBuildingSameCampus || RouteStrategies.Outdoor);
        });
      });
      
      // Missing building ID
      it('should use Mixed strategy when buildingId is missing for indoor location', () => {
        const strategy = service._determineStrategy(
          mockIndoorLocations.hallNinthFloor,
          mockIndoorLocations.incompleteIndoor
        );
        expect(strategy).toBe(RouteStrategies.Mixed);
      });
    });
    
    // CASE 2: Both locations are outdoor
    it('should use Outdoor strategy when both locations are outdoor', () => {
      const strategy = service._determineStrategy(
        mockOutdoorLocations.sgwCampus,
        mockOutdoorLocations.loyolaCampus
      );
      expect(strategy).toBe(RouteStrategies.Outdoor);
    });
    
    it('should use Outdoor strategy even when outdoor coordinates are missing', () => {
      const strategy = service._determineStrategy(
        mockOutdoorLocations.sgwCampus,
        mockOutdoorLocations.incompleteOutdoor
      );
      expect(strategy).toBe(RouteStrategies.Outdoor);
    });
    
    // CASE 3: Mixed indoor and outdoor locations
    it('should use Mixed strategy when one location is indoor and one is outdoor', () => {
      const strategy = service._determineStrategy(
        mockIndoorLocations.hallNinthFloor,
        mockOutdoorLocations.sgwCampus
      );
      expect(strategy).toBe(RouteStrategies.Mixed);
    });
    
    // Edge cases
    it('should default to Outdoor strategy when a location is missing', () => {
      const strategy = service._determineStrategy(
        mockIndoorLocations.hallNinthFloor,
        null
      );
      expect(strategy).toBe(RouteStrategies.Outdoor);
    });
    
    it('should infer type from buildingId if type is not specified', () => {
      const locationWithoutType = { 
        buildingId: 'H', 
        floor: '9', 
        room: 'H-920'
      };
      const strategy = service._determineStrategy(
        locationWithoutType,
        mockIndoorLocations.hallNinthFloor
      );
      expect(strategy).toBe(RouteStrategies.SameFloorSameBuilding);
    });
  });
  
  describe('_areOnDifferentCampuses', () => {
    it('should return true for buildings on different campuses', () => {
      expect(service._areOnDifferentCampuses('H', 'VL')).toBe(true);
      expect(service._areOnDifferentCampuses('VL', 'MB')).toBe(true);
    });
    
    it('should return false for buildings on the same campus', () => {
      expect(service._areOnDifferentCampuses('H', 'MB')).toBe(false);
      expect(service._areOnDifferentCampuses('VL', 'VE')).toBe(false);
    });
  });
  
  describe('calculateDistance', () => {
    it('should delegate to SameFloorSameBuilding strategy for same floor indoor locations', () => {
      service.calculateDistance(
        mockIndoorLocations.hallNinthFloor,
        mockIndoorLocations.hallNinthFloor
      );
      expect(RouteStrategies.SameFloorSameBuilding.calculateDistance).toHaveBeenCalledWith(
        mockIndoorLocations.hallNinthFloor,
        mockIndoorLocations.hallNinthFloor
      );
    });
    
    it('should delegate to Outdoor strategy for outdoor locations', () => {
      service.calculateDistance(
        mockOutdoorLocations.sgwCampus,
        mockOutdoorLocations.loyolaCampus
      );
      expect(RouteStrategies.Outdoor.calculateDistance).toHaveBeenCalledWith(
        mockOutdoorLocations.sgwCampus,
        mockOutdoorLocations.loyolaCampus
      );
    });
  });
  
  describe('isPathAllowed', () => {
    it('should delegate to the selected strategy with correct avoidOutdoor parameter', () => {
      // Create service with avoidOutdoor=true
      const serviceAvoidOutdoor = new DistanceCalculatorService(true);
      
      serviceAvoidOutdoor.isPathAllowed(
        mockIndoorLocations.hallNinthFloor,
        mockIndoorLocations.vanier
      );
      
      expect(RouteStrategies.DifferentCampuses.isPathAllowed).toHaveBeenCalledWith(
        mockIndoorLocations.hallNinthFloor,
        mockIndoorLocations.vanier,
        true // avoidOutdoor parameter should be passed
      );
    });
    
    it('should delegate to the selected strategy with default avoidOutdoor=false', () => {
      service.isPathAllowed(
        mockIndoorLocations.hallNinthFloor,
        mockIndoorLocations.hallNinthFloor
      );
      
      expect(RouteStrategies.SameFloorSameBuilding.isPathAllowed).toHaveBeenCalledWith(
        mockIndoorLocations.hallNinthFloor,
        mockIndoorLocations.hallNinthFloor,
        false // default avoidOutdoor value
      );
    });
  });
});