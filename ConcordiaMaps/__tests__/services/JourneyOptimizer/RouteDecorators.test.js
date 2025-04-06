import {
  OutdoorToOutdoor,
  RoomToRoomSameFloor,
  ElevatorTravel,
  OutdoorTravel,
  BuildingToEntrance,
  EntranceToBuilding,
  BaseCalculation,
} from "../../../services/JourneyOptimizer/RouteDecorators"; // Adjust the import path as needed
import { useGoogleMapDirections } from "../../../hooks/useGoogleMapDirections";
import { findShortestPath } from "../../../components/IndoorNavigation/PathFinder";
import FloorRegistry from "../../../services/BuildingDataService";

// --- Mocks ---

// Mock useGoogleMapDirections hook
jest.mock("../../../hooks/useGoogleMapDirections", () => ({
  useGoogleMapDirections: jest.fn(),
}));

// Mock findShortestPath function
jest.mock("../../../components/IndoorNavigation/PathFinder", () => ({
  findShortestPath: jest.fn(),
}));

// Mock FloorRegistry service
jest.mock("../../../services/BuildingDataService", () => ({
  getBuildingTypeFromId: jest.fn(),
  getGraph: jest.fn(),
}));

// --- Global Test Variables ---
let mockGetDirections;
let mockBaseCalculation;

// --- Test Suite ---

describe("RouteDecorators", () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();

    // Setup default mock implementations
    mockGetDirections = jest.fn();
    useGoogleMapDirections.mockReturnValue({
      getDirections: mockGetDirections,
    });

    // Mock a base calculation function that can be spied on
    mockBaseCalculation = jest.fn(() => 10); // Default base value of 10 for testing addition

    // Reset FloorRegistry mocks
    FloorRegistry.getBuildingTypeFromId.mockImplementation((id) =>
      id.toLowerCase(),
    ); // Simple echo mock
    FloorRegistry.getGraph.mockReturnValue(null); // Default to no graph

    // Reset findShortestPath mock
    findShortestPath.mockReturnValue(null); // Default to no path

    // Spy on console.error to suppress output during tests and check calls
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    // Restore console.error
    console.error.mockRestore();
  });

  // --- BaseCalculation ---
  describe("BaseCalculation", () => {
    it("should return 0", () => {
      const baseCalc = BaseCalculation();
      expect(baseCalc({}, {})).toBe(0); // Arguments don't matter
    });
  });

  // --- OutdoorToOutdoor ---
  describe("OutdoorToOutdoor", () => {
    const locationA = { latitude: 45.497, longitude: -73.579 };
    const locationB = { latitude: 45.496, longitude: -73.578 };

    it("should calculate distance using Google Maps API and add base calculation", async () => {
      const mockResponse = {
        routes: [{ legs: [{ distance: { value: 1000 } }] }], // 1000 meters
      };
      mockGetDirections.mockResolvedValue(mockResponse);
      const decoratedCalculation = OutdoorToOutdoor(mockBaseCalculation);

      const distance = await decoratedCalculation(locationA, locationB);

      expect(useGoogleMapDirections).toHaveBeenCalledTimes(1);
      expect(mockGetDirections).toHaveBeenCalledWith(
        locationA,
        locationB,
        "walking",
      );
      expect(mockBaseCalculation).toHaveBeenCalledWith(locationA, locationB);
      expect(distance).toBe(1000 + 10); // API distance + base calculation
    });

    it("should fall back to base calculation if Google Maps API fails", async () => {
      const apiError = new Error("API error");
      mockGetDirections.mockRejectedValue(apiError);
      const decoratedCalculation = OutdoorToOutdoor(mockBaseCalculation);

      const distance = await decoratedCalculation(locationA, locationB);

      expect(mockGetDirections).toHaveBeenCalledWith(
        locationA,
        locationB,
        "walking",
      );
      expect(console.error).toHaveBeenCalledWith(
        "Error fetching walking distance:",
        apiError,
      );
      expect(mockBaseCalculation).toHaveBeenCalledWith(locationA, locationB);
      expect(distance).toBe(10); // Only base calculation
    });

    it("should handle missing data in Google Maps response", async () => {
      // Simulate responses that might lack the expected structure
      const incompleteResponses = [
        {},
        { routes: [] },
        { routes: [{}] },
        { routes: [{ legs: [] }] },
        { routes: [{ legs: [{}] }] },
        { routes: [{ legs: [{ distance: {} }] }] },
      ];

      const decoratedCalculation = OutdoorToOutdoor(mockBaseCalculation);

      for (const mockResponse of incompleteResponses) {
        mockGetDirections.mockResolvedValue(mockResponse);
        // We expect it to throw an error internally, which gets caught
        const distance = await decoratedCalculation(locationA, locationB);
        expect(distance).toBe(10); // Fallback to base calculation
        expect(console.error).toHaveBeenCalled();
        console.error.mockClear(); // Clear mock calls for the next iteration
      }
    });
  });

  // --- RoomToRoomSameFloor ---
  describe("RoomToRoomSameFloor", () => {
    const locationA = {
      buildingId: "Hall",
      floor: "8",
      room: "H801",
      latitude: 0,
      longitude: 0,
    };
    const locationB = {
      buildingId: "hall",
      floor: "8",
      room: "H805",
      latitude: 0,
      longitude: 0,
    };
    const locationDiffBuilding = {
      buildingId: "MB",
      floor: "8",
      room: "MB8.1",
      latitude: 0,
      longitude: 0,
    };
    const locationDiffFloor = {
      buildingId: "Hall",
      floor: "9",
      room: "H901",
      latitude: 0,
      longitude: 0,
    };
    const mockGraph = {
      H801: { H802: 1, H803: 2.5 },
      H802: { H801: 1, H805: 3 },
      H803: { H801: 2.5 },
      H805: { H802: 3 },
    };
    const pathLengthToMetersRatio = 6.5;

    it("should calculate distance using graph and add base calculation for same building/floor", () => {
      FloorRegistry.getBuildingTypeFromId.mockReturnValue("hall"); // Normalized
      FloorRegistry.getGraph.mockReturnValue(mockGraph);
      findShortestPath.mockReturnValue(["H801", "H802", "H805"]); // Path: H801 -> H802 (1) -> H805 (3) = Total Length 4

      const decoratedCalculation = RoomToRoomSameFloor(mockBaseCalculation);
      const distance = decoratedCalculation(locationA, locationB);

      const expectedPathDistance = (1 + 3) * pathLengthToMetersRatio; // 4 * 6.5 = 26

      expect(FloorRegistry.getBuildingTypeFromId).toHaveBeenCalledWith("Hall");
      expect(FloorRegistry.getGraph).toHaveBeenCalledWith("hall", "8");
      expect(findShortestPath).toHaveBeenCalledWith(mockGraph, "H801", "H805");
      expect(mockBaseCalculation).toHaveBeenCalledWith(locationA, locationB);
      expect(distance).toBe(expectedPathDistance + 10); // Path distance + base calculation
    });

    it("should fall back to base calculation if buildings are different", () => {
      const decoratedCalculation = RoomToRoomSameFloor(mockBaseCalculation);
      const distance = decoratedCalculation(locationA, locationDiffBuilding);

      expect(console.error).toHaveBeenCalledWith(
        "Locations are in different buildings: Hall and MB",
      );
      expect(findShortestPath).not.toHaveBeenCalled();
      expect(mockBaseCalculation).toHaveBeenCalledWith(
        locationA,
        locationDiffBuilding,
      );
      expect(distance).toBe(10); // Only base calculation
    });

    it("should fall back to base calculation if floors are different", () => {
      const decoratedCalculation = RoomToRoomSameFloor(mockBaseCalculation);
      const distance = decoratedCalculation(locationA, locationDiffFloor);

      expect(console.error).toHaveBeenCalledWith(
        "Locations are on different floors: 8 and 9",
      );
      expect(findShortestPath).not.toHaveBeenCalled();
      expect(mockBaseCalculation).toHaveBeenCalledWith(
        locationA,
        locationDiffFloor,
      );
      expect(distance).toBe(10); // Only base calculation
    });

    it("should fall back to base calculation if graph is not found", () => {
      FloorRegistry.getGraph.mockReturnValue(null);
      const decoratedCalculation = RoomToRoomSameFloor(mockBaseCalculation);
      const distance = decoratedCalculation(locationA, locationB);

      expect(console.error).toHaveBeenCalledWith(
        "Graph not found for building: hall, floor: 8",
      );
      expect(findShortestPath).not.toHaveBeenCalled();
      expect(mockBaseCalculation).toHaveBeenCalledWith(locationA, locationB);
      expect(distance).toBe(10); // Only base calculation
    });

    it("should fall back to base calculation if path is not found", () => {
      FloorRegistry.getGraph.mockReturnValue(mockGraph);
      findShortestPath.mockReturnValue(null); // No path found
      const decoratedCalculation = RoomToRoomSameFloor(mockBaseCalculation);
      const distance = decoratedCalculation(locationA, locationB);

      expect(console.error).toHaveBeenCalledWith(
        "No path found between H801 and H805",
      );
      expect(findShortestPath).toHaveBeenCalledWith(mockGraph, "H801", "H805");
      expect(mockBaseCalculation).toHaveBeenCalledWith(locationA, locationB);
      expect(distance).toBe(10); // Only base calculation
    });

    it("should handle path with zero length (same start/end node)", () => {
      FloorRegistry.getGraph.mockReturnValue(mockGraph);
      findShortestPath.mockReturnValue(["H801"]); // Path is just the start node

      const decoratedCalculation = RoomToRoomSameFloor(mockBaseCalculation);
      const distance = decoratedCalculation(locationA, {
        ...locationB,
        room: "H801",
      }); // Same room

      const expectedPathDistance = 0; // No edges traversed

      expect(findShortestPath).toHaveBeenCalledWith(mockGraph, "H801", "H801");
      expect(mockBaseCalculation).toHaveBeenCalledWith(locationA, {
        ...locationB,
        room: "H801",
      });
      expect(distance).toBe(expectedPathDistance + 10); // 0 + base calculation
    });

    it("should correctly normalize building IDs before comparison", () => {
      const locH = { buildingId: "h", floor: "1", room: "H101" };
      const locHall = { buildingId: "Hall", floor: "1", room: "H105" };

      // Create a specific mock graph for this test with the right node structure
      const testGraph = {
        H101: { H105: 2 },
        H105: { H101: 2 },
      };

      FloorRegistry.getBuildingTypeFromId.mockImplementation((id) => {
        if (id.toLowerCase() === "h" || id.toLowerCase() === "hall")
          return "hall";
        return id.toLowerCase();
      });

      FloorRegistry.getGraph.mockReturnValue(testGraph);
      findShortestPath.mockReturnValue(["H101", "H105"]);

      const decoratedCalculation = RoomToRoomSameFloor(mockBaseCalculation);
      const distance = decoratedCalculation(locH, locHall);

      // Expect no error about different buildings
      expect(console.error).not.toHaveBeenCalledWith(
        expect.stringContaining("Locations are in different buildings"),
      );
      // Ensure it proceeded to try finding graph/path
      expect(FloorRegistry.getGraph).toHaveBeenCalledWith("hall", "1");
      expect(findShortestPath).toHaveBeenCalled();
      // Check the distance calculation worked properly
      expect(distance).toBe(2 * pathLengthToMetersRatio + 10);
    });
  });

  // --- ElevatorTravel ---
  describe("ElevatorTravel", () => {
    const locationA = { floor: "5" };
    const locationB = { floor: "2" };
    const locationC = { floor: "T" }; // Tunnel
    const locationD = { floor: "t" }; // Tunnel lower
    const locationE = { floor: "G" }; // Ground floor (non-numeric)
    const locationF = { floor: undefined }; // Missing floor

    it("should add cost based on floor difference", () => {
      const decoratedCalculation = ElevatorTravel(mockBaseCalculation);
      const distance = decoratedCalculation(locationA, locationB); // 5 -> 2, diff = 3
      expect(distance).toBe(10 + 3 * 5); // base + cost
      expect(mockBaseCalculation).toHaveBeenCalledWith(locationA, locationB);
    });

    it("should handle tunnel floors ('T', 't') as floor 0", () => {
      const decoratedCalculation = ElevatorTravel(mockBaseCalculation);
      const distanceAT = decoratedCalculation(locationA, locationC); // 5 -> 0, diff = 5
      const distanceTA = decoratedCalculation(locationC, locationA); // 0 -> 5, diff = 5
      const distanceAD = decoratedCalculation(locationA, locationD); // 5 -> 0, diff = 5
      const distanceTD = decoratedCalculation(locationC, locationD); // 0 -> 0, diff = 0

      expect(distanceAT).toBe(10 + 5 * 5);
      expect(distanceTA).toBe(10 + 5 * 5);
      expect(distanceAD).toBe(10 + 5 * 5);
      expect(distanceTD).toBe(10 + 0 * 5);
    });

    it("should handle non-numeric floors as floor 0", () => {
      const decoratedCalculation = ElevatorTravel(mockBaseCalculation);
      const distanceAE = decoratedCalculation(locationA, locationE); // 5 -> 0, diff = 5
      const distanceEA = decoratedCalculation(locationE, locationA); // 0 -> 5, diff = 5
      expect(distanceAE).toBe(10 + 5 * 5);
      expect(distanceEA).toBe(10 + 5 * 5);
    });

    it("should handle missing or undefined floors as floor 0", () => {
      const decoratedCalculation = ElevatorTravel(mockBaseCalculation);
      const distanceAF = decoratedCalculation(locationA, locationF); // 5 -> 0, diff = 5
      const distanceFA = decoratedCalculation(locationF, locationA); // 0 -> 5, diff = 5
      const distanceFF = decoratedCalculation(locationF, locationF); // 0 -> 0, diff = 0
      expect(distanceAF).toBe(10 + 5 * 5);
      expect(distanceFA).toBe(10 + 5 * 5);
      expect(distanceFF).toBe(10 + 0 * 5);
    });

    it("should add zero cost if floors are the same", () => {
      const decoratedCalculation = ElevatorTravel(mockBaseCalculation);
      const distance = decoratedCalculation(locationA, { ...locationA }); // Same floor 5
      expect(distance).toBe(10 + 0 * 5); // base + zero cost
      expect(mockBaseCalculation).toHaveBeenCalledWith(locationA, {
        ...locationA,
      });
    });
  });

  // --- OutdoorTravel ---
  describe("OutdoorTravel", () => {
    // Using coordinates roughly 1km apart for easier verification
    // Start: Concordia SGW Campus approx
    const locationA = { latitude: 45.4972, longitude: -73.5788 };
    // End: Near Atwater Market approx
    const locationB = { latitude: 45.4885, longitude: -73.578 };
    // Expected distance ~ 968m based on online Haversine calculators

    it("should calculate distance using Haversine formula and add base calculation", () => {
      const decoratedCalculation = OutdoorTravel(mockBaseCalculation);
      const distance = decoratedCalculation(locationA, locationB);
      const expectedHaversineDistance = 969; // Updated to match actual calculation (969.4)

      expect(mockBaseCalculation).toHaveBeenCalledWith(locationA, locationB);
      // Use toBeCloseTo for floating point results
      expect(distance - 10).toBeCloseTo(expectedHaversineDistance, 0); // Check Haversine part within reasonable tolerance
      expect(distance).toBeGreaterThan(10 + 900); // Sanity check
      expect(distance).toBeLessThan(10 + 1000); // Sanity check
    });

    it("should return only base calculation if locations are identical", () => {
      const decoratedCalculation = OutdoorTravel(mockBaseCalculation);
      const distance = decoratedCalculation(locationA, locationA); // Same location

      expect(mockBaseCalculation).toHaveBeenCalledWith(locationA, locationA);
      expect(distance).toBe(10); // Haversine should be 0
    });
  });

  // --- BuildingToEntrance ---
  describe("BuildingToEntrance", () => {
    const locationFloor1 = { buildingId: "Hall", floor: "1", room: "H101" };
    const locationFloor8 = { buildingId: "Hall", floor: "8", room: "H808" };
    const locationNoBuilding = { floor: "1", room: "Somewhere" };
    const expectedEntrance = {
      type: "indoor",
      buildingId: "Hall",
      floor: "1",
      room: "entrance",
      title: "Hall Entrance",
    };

    // Mock route strategies needed by this decorator
    const mockRouteStrategies = {
      SameFloorSameBuilding: { calculateDistance: jest.fn(() => 50) },
      DifferentFloorSameBuilding: { calculateDistance: jest.fn(() => 150) },
    };

    it("should use SameFloor strategy for floor 1 and add base calculation", () => {
      const decoratedCalculation = BuildingToEntrance(mockBaseCalculation);
      const distance = decoratedCalculation(
        locationFloor1,
        mockRouteStrategies,
      );

      expect(
        mockRouteStrategies.SameFloorSameBuilding.calculateDistance,
      ).toHaveBeenCalledWith(locationFloor1, expectedEntrance);
      expect(
        mockRouteStrategies.DifferentFloorSameBuilding.calculateDistance,
      ).not.toHaveBeenCalled();
      expect(mockBaseCalculation).toHaveBeenCalledWith(
        locationFloor1,
        expectedEntrance,
      );
      expect(distance).toBe(50 + 10); // Strategy distance + base
    });

    it("should use DifferentFloor strategy for other floors and add base calculation", () => {
      const decoratedCalculation = BuildingToEntrance(mockBaseCalculation);
      const distance = decoratedCalculation(
        locationFloor8,
        mockRouteStrategies,
      );

      expect(
        mockRouteStrategies.DifferentFloorSameBuilding.calculateDistance,
      ).toHaveBeenCalledWith(locationFloor8, expectedEntrance);
      expect(
        mockRouteStrategies.SameFloorSameBuilding.calculateDistance,
      ).not.toHaveBeenCalled();
      expect(mockBaseCalculation).toHaveBeenCalledWith(
        locationFloor8,
        expectedEntrance,
      );
      expect(distance).toBe(150 + 10); // Strategy distance + base
    });

    it("should fall back to default distance + base if buildingId is missing", () => {
      const decoratedCalculation = BuildingToEntrance(mockBaseCalculation);
      const distance = decoratedCalculation(
        locationNoBuilding,
        mockRouteStrategies,
      );

      expect(console.error).toHaveBeenCalledWith(
        "Missing building ID for location",
      );
      expect(
        mockRouteStrategies.SameFloorSameBuilding.calculateDistance,
      ).not.toHaveBeenCalled();
      expect(
        mockRouteStrategies.DifferentFloorSameBuilding.calculateDistance,
      ).not.toHaveBeenCalled();
      expect(mockBaseCalculation).toHaveBeenCalledWith(
        locationNoBuilding,
        locationNoBuilding,
      ); // Base called with original location twice
      expect(distance).toBe(100 + 10); // Fallback distance + base
    });

    it("should fall back to default distance + base if strategy throws error", () => {
      const error = new Error("Strategy failed");
      mockRouteStrategies.SameFloorSameBuilding.calculateDistance.mockImplementation(
        () => {
          throw error;
        },
      );
      const decoratedCalculation = BuildingToEntrance(mockBaseCalculation);
      const distance = decoratedCalculation(
        locationFloor1,
        mockRouteStrategies,
      );

      expect(console.error).toHaveBeenCalledWith(
        "Error calculating distance to entrance:",
        error,
      );
      expect(mockBaseCalculation).toHaveBeenCalledWith(
        locationFloor1,
        expectedEntrance,
      );
      expect(distance).toBe(100 + 10); // Fallback distance + base
    });
  });

  // --- EntranceToBuilding ---
  describe("EntranceToBuilding", () => {
    const locationFloor1 = { buildingId: "MB", floor: "1", room: "MB1.1" };
    const locationFloor4 = { buildingId: "MB", floor: "4", room: "MB4.4" };
    const locationNoBuilding = { floor: "1", room: "Somewhere" };
    const expectedEntrance = {
      type: "indoor",
      buildingId: "MB",
      floor: "1",
      room: "entrance",
      title: "MB Entrance",
    };

    // Mock route strategies needed by this decorator
    const mockRouteStrategies = {
      SameFloorSameBuilding: { calculateDistance: jest.fn(() => 60) },
      DifferentFloorSameBuilding: { calculateDistance: jest.fn(() => 180) },
    };

    it("should use SameFloor strategy for floor 1 and add base calculation", () => {
      const decoratedCalculation = EntranceToBuilding(mockBaseCalculation);
      const distance = decoratedCalculation(
        locationFloor1,
        mockRouteStrategies,
      );

      expect(
        mockRouteStrategies.SameFloorSameBuilding.calculateDistance,
      ).toHaveBeenCalledWith(expectedEntrance, locationFloor1);
      expect(
        mockRouteStrategies.DifferentFloorSameBuilding.calculateDistance,
      ).not.toHaveBeenCalled();
      expect(mockBaseCalculation).toHaveBeenCalledWith(
        expectedEntrance,
        locationFloor1,
      );
      expect(distance).toBe(60 + 10); // Strategy distance + base
    });

    it("should use DifferentFloor strategy for other floors and add base calculation", () => {
      const decoratedCalculation = EntranceToBuilding(mockBaseCalculation);
      const distance = decoratedCalculation(
        locationFloor4,
        mockRouteStrategies,
      );

      expect(
        mockRouteStrategies.DifferentFloorSameBuilding.calculateDistance,
      ).toHaveBeenCalledWith(expectedEntrance, locationFloor4);
      expect(
        mockRouteStrategies.SameFloorSameBuilding.calculateDistance,
      ).not.toHaveBeenCalled();
      expect(mockBaseCalculation).toHaveBeenCalledWith(
        expectedEntrance,
        locationFloor4,
      );
      expect(distance).toBe(180 + 10); // Strategy distance + base
    });

    it("should fall back to default distance + base if buildingId is missing", () => {
      const decoratedCalculation = EntranceToBuilding(mockBaseCalculation);
      const distance = decoratedCalculation(
        locationNoBuilding,
        mockRouteStrategies,
      );

      expect(console.error).toHaveBeenCalledWith(
        "Missing building ID for location",
      );
      expect(
        mockRouteStrategies.SameFloorSameBuilding.calculateDistance,
      ).not.toHaveBeenCalled();
      expect(
        mockRouteStrategies.DifferentFloorSameBuilding.calculateDistance,
      ).not.toHaveBeenCalled();
      expect(mockBaseCalculation).toHaveBeenCalledWith(
        locationNoBuilding,
        locationNoBuilding,
      ); // Base called with original location twice
      expect(distance).toBe(100 + 10); // Fallback distance + base
    });

    it("should fall back to default distance + base if strategy throws error", () => {
      const error = new Error("Strategy failed");
      mockRouteStrategies.DifferentFloorSameBuilding.calculateDistance.mockImplementation(
        () => {
          throw error;
        },
      );
      const decoratedCalculation = EntranceToBuilding(mockBaseCalculation);
      const distance = decoratedCalculation(
        locationFloor4,
        mockRouteStrategies,
      );

      expect(console.error).toHaveBeenCalledWith(
        "Error calculating distance from entrance:",
        error,
      );
      expect(mockBaseCalculation).toHaveBeenCalledWith(
        expectedEntrance,
        locationFloor4,
      );
      expect(distance).toBe(100 + 10); // Fallback distance + base
    });
  });
});
