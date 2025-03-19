import JourneyOptimizerService from "../../services/JourneyOptimizer/JourneyOptimizerService";
import { RouteStrategyFactory } from "../../services/JourneyOptimizer/RouteStrategies";
import { generateNavigationSteps } from "../../services/JourneyOptimizer/NavigationStepGenerator";

// Mock dependencies
jest.mock("../../services/JourneyOptimizer/RouteStrategies", () => ({
  RouteStrategyFactory: {
    getStrategy: jest.fn(),
  },
}));

jest.mock("../../services/JourneyOptimizer/NavigationStepGenerator", () => ({
  generateNavigationSteps: jest.fn(),
}));

describe("JourneyOptimizerService", () => {
  // Mock strategies with controlled behavior
  const mockIndoorStrategy = {
    isPathAllowed: jest.fn(),
    calculateDistance: jest.fn(),
  };

  const mockOutdoorStrategy = {
    isPathAllowed: jest.fn(),
    calculateDistance: jest.fn(),
  };

  // Sample test data
  const sampleTasks = [
    {
      id: "1",
      buildingId: "hall",
      room: "H-820",
      title: "Hall Building",
      description: "Visit Hall Building"
    },
    {
      id: "2",
      buildingId: "library",
      room: "LB-205",
      title: "Webster Library",
      description: "Visit Webster Library"
    },
    {
      id: "3",
      latitude: 45.497,
      longitude: -73.579,
      title: "Outdoor Location",
      description: "Visit Outdoor Location"
    }
  ];

  const mockNavigationSteps = [
    { id: "step-1", type: "indoor", buildingId: "hall" },
    { id: "step-2", type: "outdoor" }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    
    // FIX: Use mockImplementation to return strategy based on parameter
    RouteStrategyFactory.getStrategy.mockImplementation((avoidOutdoor) => {
      return avoidOutdoor ? mockIndoorStrategy : mockOutdoorStrategy;
    });
    
    generateNavigationSteps.mockReturnValue(mockNavigationSteps);
    
    // Setup strategy behaviors for tests
    mockIndoorStrategy.isPathAllowed.mockReturnValue(true);
    mockIndoorStrategy.calculateDistance.mockImplementation((locA, locB) => {
      // Simple distance implementation for testing
      if (locA.buildingId === locB.buildingId) return 10;
      return 50;
    });
    
    mockOutdoorStrategy.isPathAllowed.mockReturnValue(true);
    mockOutdoorStrategy.calculateDistance.mockImplementation((locA, locB) => {
      // Always return the same distance for predictable results
      return 30;
    });
  });

  describe("Factory Methods", () => {
    test("createOptimizer should create a JourneyOptimizer with specified preference", () => {
      const optimizer = JourneyOptimizerService.createOptimizer(true);
      
      expect(RouteStrategyFactory.getStrategy).toHaveBeenCalledWith(true);
      expect(optimizer).toHaveProperty("strategy");
      expect(optimizer).toHaveProperty("findOptimalPath");
      expect(optimizer).toHaveProperty("generateOptimalJourney");
    });

    test("generateOptimalJourney should create optimizer and generate journey steps", () => {
      const result = JourneyOptimizerService.generateOptimalJourney(sampleTasks, false);
      
      expect(RouteStrategyFactory.getStrategy).toHaveBeenCalledWith(false);
      expect(generateNavigationSteps).toHaveBeenCalled();
      expect(result).toEqual(mockNavigationSteps);
    });
  });

  describe("findOptimalPath", () => {
    test("should handle empty location array", () => {
      const optimizer = JourneyOptimizerService.createOptimizer(true); // FIX: Explicitly use indoor
      const result = optimizer.findOptimalPath([]);
      
      expect(result).toEqual([]);
      expect(mockIndoorStrategy.calculateDistance).not.toHaveBeenCalled();
    });

    test("should handle single location", () => {
      const optimizer = JourneyOptimizerService.createOptimizer(true); // FIX: Explicitly use indoor
      const singleLocation = [sampleTasks[0]];
      const result = optimizer.findOptimalPath(singleLocation);
      
      expect(result).toEqual(singleLocation);
      expect(mockIndoorStrategy.calculateDistance).not.toHaveBeenCalled();
    });

    test("should handle two locations", () => {
      const optimizer = JourneyOptimizerService.createOptimizer(true); // FIX: Explicitly use indoor
      const twoLocations = [sampleTasks[0], sampleTasks[1]];
      const result = optimizer.findOptimalPath(twoLocations);
      
      expect(result).toEqual(twoLocations);
    });

    test("should find optimal path using nearest neighbor algorithm", () => {
      // FIX: Reset mocks specifically for this test
      mockIndoorStrategy.isPathAllowed.mockReset().mockReturnValue(true);
      mockIndoorStrategy.calculateDistance.mockReset().mockImplementation((from, to) => {
        if (from.id === "1" && to.id === "2") return 20;
        if (from.id === "1" && to.id === "3") return 50;
        if (from.id === "2" && to.id === "3") return 10;
        return 100;
      });
      
      const optimizer = JourneyOptimizerService.createOptimizer(true); // FIX: Explicitly use indoor
      const result = optimizer.findOptimalPath([...sampleTasks]);
      
      // We expect the path to be: 1 -> 2 -> 3 based on the mocked distances
      expect(result[0].id).toBe("1");
      expect(result[1].id).toBe("2");
      expect(result[2].id).toBe("3");
      
      // FIX: For 3 locations, we should have 3 calculate distance calls
      // From location 1 to 2, from 1 to 3, and from 2 to 3
      expect(mockIndoorStrategy.calculateDistance).toHaveBeenCalledTimes(3);
      expect(mockIndoorStrategy.isPathAllowed).toHaveBeenCalledTimes(3);
    });

    test("should handle unreachable locations", () => {
      // FIX: Reset mocks specifically for this test
      mockIndoorStrategy.isPathAllowed.mockReset().mockImplementation((from, to) => {
        return to.id !== "3"; // Path to location 3 is not allowed
      });
      
      const optimizer = JourneyOptimizerService.createOptimizer(true); // FIX: Explicitly use indoor
      
      // Spy on console.warn
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      const result = optimizer.findOptimalPath([...sampleTasks]);
      
      // We expect only the reachable locations in the result
      expect(result.length).toBe(2);
      expect(result[0].id).toBe("1");
      expect(result[1].id).toBe("2");
      
      // Verify warning was logged
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining("No valid path found")
      );
      
      consoleWarnSpy.mockRestore();
    });
  });

  describe("generateOptimalJourney", () => {
    test("should convert tasks to locations and call findOptimalPath", () => {
      const optimizer = JourneyOptimizerService.createOptimizer(true); // FIX: Explicitly use indoor
      
      // Spy on findOptimalPath
      const findOptimalPathSpy = jest.spyOn(optimizer, 'findOptimalPath');
      
      optimizer.generateOptimalJourney(sampleTasks);
      
      expect(findOptimalPathSpy).toHaveBeenCalled();
      const locationsArg = findOptimalPathSpy.mock.calls[0][0];
      
      // Verify tasks were converted to locations correctly
      expect(locationsArg.length).toBe(sampleTasks.length);
      expect(locationsArg[0]).toHaveProperty('id', '1');
      expect(locationsArg[0]).toHaveProperty('buildingId', 'hall');
      expect(locationsArg[0]).toHaveProperty('room', 'H-820');
      
      // Verify generateNavigationSteps was called with optimized locations
      expect(generateNavigationSteps).toHaveBeenCalled();
    });

    test("should handle task descriptions correctly", () => {
      const optimizer = JourneyOptimizerService.createOptimizer(true); // FIX: Explicitly use indoor
      
      // Task with no description
      const tasksWithoutDescription = [
        { id: "1", buildingId: "hall", title: "Hall" },
        { id: "2", latitude: 45.49, longitude: -73.57, title: "Outdoors" }
      ];
      
      // Verify findOptimalPath was called with correct default descriptions
      const findOptimalPathSpy = jest.spyOn(optimizer, 'findOptimalPath');
      optimizer.generateOptimalJourney(tasksWithoutDescription);
      
      const locationsArg = findOptimalPathSpy.mock.calls[0][0];
      expect(locationsArg[0].description).toBe("Task at hall");
      expect(locationsArg[1].description).toBe("Task at outdoor location");
    });
  });

  describe("Integration with strategies", () => {
    test("should use indoor strategy when avoidOutdoor is true", () => {
      JourneyOptimizerService.generateOptimalJourney(sampleTasks, true);
      expect(RouteStrategyFactory.getStrategy).toHaveBeenCalledWith(true);
    });

    test("should use outdoor strategy by default", () => {
      JourneyOptimizerService.generateOptimalJourney(sampleTasks);
      expect(RouteStrategyFactory.getStrategy).toHaveBeenCalledWith(false);
    });
  });
});