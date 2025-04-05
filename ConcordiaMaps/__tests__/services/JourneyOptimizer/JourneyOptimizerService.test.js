import JourneyOptimizerService from "../../../services/JourneyOptimizer/JourneyOptimizerService";

describe("JourneyOptimizer - Robust NN Algorithm Tests", () => {
  let mockDistanceCalculator;
  let journeyOptimizer;

  beforeEach(() => {
    // Mock the distanceCalculator methods
    mockDistanceCalculator = {
      calculateDistance: jest.fn(),
      isPathAllowed: jest.fn(),
    };

    // Assume createOptimizer returns an object we can modify
    // Adjust this if createOptimizer has a different structure
    journeyOptimizer = JourneyOptimizerService.createOptimizer(false); // Assuming this creates the optimizer instance
    journeyOptimizer.distanceCalculator = mockDistanceCalculator;

    // Mock isPathAllowed to always return true for simplicity in these geometric tests
    mockDistanceCalculator.isPathAllowed.mockReturnValue(true);

    // Default mock for distance calculation (Euclidean) - can be overridden in specific tests if needed
    mockDistanceCalculator.calculateDistance.mockImplementation(
      (loc1, loc2) => {
        // Standard Euclidean distance
        return Math.sqrt(
          Math.pow(loc1.latitude - loc2.latitude, 2) +
            Math.pow(loc1.longitude - loc2.longitude, 2),
        );
      },
    );
  });

  // --- Existing Tests (Keep them here) ---

  it("handles a simple linear path", () => {
    const locations = [
      { id: "A", latitude: 0, longitude: 0 },
      { id: "B", latitude: 1, longitude: 0 },
      { id: "C", latitude: 2, longitude: 0 },
      { id: "D", latitude: 3, longitude: 0 },
    ];
    // Override distance calc for simplicity if needed (Manhattan distance)
    mockDistanceCalculator.calculateDistance.mockImplementation(
      (loc1, loc2) => {
        return (
          Math.abs(loc1.latitude - loc2.latitude) +
          Math.abs(loc1.longitude - loc2.longitude)
        );
      },
    );
    const result = journeyOptimizer.findOptimalPath(locations);
    const expectedResult = locations; // NN follows the order
    expect(result).toEqual(expectedResult);
    expect(result.map((loc) => loc.id)).toEqual(["A", "B", "C", "D"]);
  });

  it("handles clustered points with varying distances", () => {
    const locations = [
      { id: "A", latitude: 0, longitude: 0 },
      { id: "B", latitude: 1, longitude: 1 },
      { id: "C", latitude: 2, longitude: 2 },
      { id: "D", latitude: 10, longitude: 10 }, // Far away point
    ];
    const result = journeyOptimizer.findOptimalPath(locations);
    const expectedResult = [
      { id: "A", latitude: 0, longitude: 0 },
      { id: "B", latitude: 1, longitude: 1 },
      { id: "C", latitude: 2, longitude: 2 },
      { id: "D", latitude: 10, longitude: 10 },
    ]; // NN follows cluster then jumps
    expect(result).toEqual(expectedResult);
    expect(result.map((loc) => loc.id)).toEqual(["A", "B", "C", "D"]);
  });

  it("handles circular paths", () => {
    const locations = [
      { id: "A", latitude: 0, longitude: 0 },
      { id: "B", latitude: 0, longitude: 1 }, // Closest to A
      { id: "C", latitude: 1, longitude: 1 }, // Closest to B
      { id: "D", latitude: 1, longitude: 0 }, // Closest to C
    ];
    // Path Trace: A -> B (Dist 1) -> C (Dist 1) -> D (Dist 1) -> A (Dist 1 - not needed for path order)
    const result = journeyOptimizer.findOptimalPath(locations);
    const expectedResult = [
      { id: "A", latitude: 0, longitude: 0 },
      { id: "B", latitude: 0, longitude: 1 },
      { id: "C", latitude: 1, longitude: 1 },
      { id: "D", latitude: 1, longitude: 0 },
    ];
    expect(result).toEqual(expectedResult);
    expect(result.map((loc) => loc.id)).toEqual(["A", "B", "C", "D"]);
  });

  it("handles sparse and dense regions", () => {
    const locations = [
      { id: "A", latitude: 0, longitude: 0 }, // Dense Start
      { id: "B", latitude: 1, longitude: 1 },
      { id: "C", latitude: 2, longitude: 2 },
      { id: "D", latitude: 50, longitude: 50 }, // Sparse End
      { id: "E", latitude: 51, longitude: 51 },
    ];
    // Path Trace: A -> B -> C -> D -> E (follows clusters)
    const result = journeyOptimizer.findOptimalPath(locations);
    const expectedResult = [
      { id: "A", latitude: 0, longitude: 0 },
      { id: "B", latitude: 1, longitude: 1 },
      { id: "C", latitude: 2, longitude: 2 },
      { id: "D", latitude: 50, longitude: 50 },
      { id: "E", latitude: 51, longitude: 51 },
    ];
    expect(result).toEqual(expectedResult);
    expect(result.map((loc) => loc.id)).toEqual(["A", "B", "C", "D", "E"]);
  });

  it("handles a tricky path with misleading distances", () => {
    const locations = [
      { id: "A", latitude: 0, longitude: 0 },
      { id: "B", latitude: 10, longitude: 0 },
      { id: "C", latitude: 5, longitude: 5 }, // Closer to A than B is
      { id: "D", latitude: 10, longitude: 10 },
    ];
    // Path Trace:
    // Start A. Unvisited {B, C, D}. Dist(A,B)=10. Dist(A,C)=sqrt(50)~7.07. Dist(A,D)=sqrt(200)~14.14. Nearest: C.
    // Current C. Unvisited {B, D}. Dist(C,B)=sqrt(25+25)=sqrt(50)~7.07. Dist(C,D)=sqrt(25+25)=sqrt(50)~7.07. Tie! Assume B is chosen (e.g. lower index/ID in some internal check or floating point).
    // Current B. Unvisited {D}. Next D.
    // Path: A -> C -> B -> D
    const result = journeyOptimizer.findOptimalPath(locations);
    const expectedResult = [
      { id: "A", latitude: 0, longitude: 0 },
      { id: "C", latitude: 5, longitude: 5 },
      { id: "B", latitude: 10, longitude: 0 },
      { id: "D", latitude: 10, longitude: 10 },
    ];
    expect(result).toEqual(expectedResult);
    expect(result.map((loc) => loc.id)).toEqual(["A", "C", "B", "D"]);
  });

  // --- New Test Cases ---

  it("handles a forced detour", () => {
    const locations = [
      { id: "A", latitude: 0, longitude: 0 }, // Start
      { id: "B", latitude: 1, longitude: 1 }, // Very close to A
      { id: "C", latitude: 10, longitude: 10 }, // Far cluster
      { id: "D", latitude: 11, longitude: 10 },
      { id: "E", latitude: 10, longitude: 11 },
    ];
    // Path Trace:
    // Start A. Unvisited {B,C,D,E}. Dist(A,B)=sqrt(2)~1.41. Dist(A,C)=sqrt(200)~14.14. Nearest: B.
    // Current B(1,1). Unvisited {C,D,E}. Dist(B,C)=sqrt(81+81)~12.7. Dist(B,D)=sqrt(100+81)~13.4. Dist(B,E)=sqrt(81+100)~13.4. Nearest: C.
    // Current C(10,10). Unvisited {D,E}. Dist(C,D)=1. Dist(C,E)=1. Tie! Assume D.
    // Current D(11,10). Unvisited {E}. Next E.
    // Path: A -> B -> C -> D -> E
    const result = journeyOptimizer.findOptimalPath(locations);
    const expectedResult = [
      { id: "A", latitude: 0, longitude: 0 },
      { id: "B", latitude: 1, longitude: 1 },
      { id: "C", latitude: 10, longitude: 10 },
      { id: "D", latitude: 11, longitude: 10 },
      { id: "E", latitude: 10, longitude: 11 },
    ];
    expect(result).toEqual(expectedResult);
    expect(result.map((loc) => loc.id)).toEqual(["A", "B", "C", "D", "E"]);
  });

  it("handles collinear points in jumbled order", () => {
    const locations = [
      // Points on Y=0 axis, starting at A(5,0)
      { id: "A", latitude: 0, longitude: 5 }, // Start
      { id: "B", latitude: 0, longitude: 0 },
      { id: "C", latitude: 0, longitude: 10 },
      { id: "D", latitude: 0, longitude: 2 },
    ];
    // Path Trace (using Euclidean, which simplifies to |x1-x2| here):
    // Start A(5,0). Unvisited {B,C,D}. Dist(A,B)=5. Dist(A,C)=5. Dist(A,D)=3. Nearest: D.
    // Current D(2,0). Unvisited {B,C}. Dist(D,B)=2. Dist(D,C)=8. Nearest: B.
    // Current B(0,0). Unvisited {C}. Next C.
    // Path: A -> D -> B -> C
    const result = journeyOptimizer.findOptimalPath(locations);
    const expectedResult = [
      { id: "A", latitude: 0, longitude: 5 },
      { id: "D", latitude: 0, longitude: 2 },
      { id: "B", latitude: 0, longitude: 0 },
      { id: "C", latitude: 0, longitude: 10 },
    ];
    expect(result).toEqual(expectedResult);
    expect(result.map((loc) => loc.id)).toEqual(["A", "D", "B", "C"]);
  });

  it("handles slightly asymmetric equidistant choices", () => {
    const locations = [
      { id: "A", latitude: 0, longitude: 0 }, // Start
      { id: "B", latitude: 1, longitude: 1 }, // Dist = sqrt(2) ~1.414
      { id: "C", latitude: 1, longitude: -1.01 }, // Dist = sqrt(1 + 1.0201) ~1.421 -> B is closer
      { id: "D", latitude: 3, longitude: 0 },
    ];
    // Path Trace:
    // Start A. Unvisited {B,C,D}. Dist(A,B)~1.414. Dist(A,C)~1.421. Dist(A,D)=3. Nearest: B.
    // Current B(1,1). Unvisited {C,D}. Dist(B,C)=sqrt(0 + (2.01)^2)=2.01. Dist(B,D)=sqrt(2^2 + 1^2)=sqrt(5)~2.23. Nearest: C.
    // Current C(1,-1.01). Unvisited {D}. Next D.
    // Path: A -> B -> C -> D
    const result = journeyOptimizer.findOptimalPath(locations);
    const expectedResult = [
      { id: "A", latitude: 0, longitude: 0 },
      { id: "B", latitude: 1, longitude: 1 },
      { id: "C", latitude: 1, longitude: -1.01 },
      { id: "D", latitude: 3, longitude: 0 },
    ];
    expect(result).toEqual(expectedResult);
    expect(result.map((loc) => loc.id)).toEqual(["A", "B", "C", "D"]);
  });

  it("handles potential path crossing scenario", () => {
    const locations = [
      { id: "A", latitude: 0, longitude: 5 }, // Top Left
      { id: "B", latitude: 1, longitude: 0 }, // Bottom Left
      { id: "C", latitude: 5, longitude: 5 }, // Top Right
      { id: "D", latitude: 6, longitude: 0 }, // Bottom Right
    ];
    // Path Trace:
    // Start A(0,5). Unvisited {B,C,D}. Dist(A,B)=sqrt(1+25)=sqrt(26). Dist(A,C)=5. Dist(A,D)=sqrt(36+25)=sqrt(61). Nearest: C.
    // Current C(5,5). Unvisited {B,D}. Dist(C,B)=sqrt(16+25)=sqrt(41). Dist(C,D)=sqrt(1+25)=sqrt(26). Nearest: D.
    // Current D(6,0). Unvisited {B}. Next B.
    // Path: A -> C -> D -> B
    const result = journeyOptimizer.findOptimalPath(locations);
    const expectedResult = [
      { id: "A", latitude: 0, longitude: 5 },
      { id: "C", latitude: 5, longitude: 5 },
      { id: "D", latitude: 6, longitude: 0 },
      { id: "B", latitude: 1, longitude: 0 },
    ];
    expect(result).toEqual(expectedResult);
    expect(result.map((loc) => loc.id)).toEqual(["A", "C", "D", "B"]); // This path crosses itself
  });
  it("logs a warning and returns a partial path when some locations are unreachable", () => {
    const locations = [
      { id: "A", latitude: 0, longitude: 0 }, // Start
      { id: "B", latitude: 1, longitude: 1 }, // Reachable
      { id: "C", latitude: 2, longitude: 2 }, // Unreachable
      { id: "D", latitude: 3, longitude: 3 }, // Unreachable
    ];

    // Mock the distanceCalculator behavior
    mockDistanceCalculator.isPathAllowed.mockImplementation((loc1, loc2) => {
      // Disallow paths to locations "C" and "D"
      return loc2.id !== "C" && loc2.id !== "D";
    });
    mockDistanceCalculator.calculateDistance.mockImplementation(
      (loc1, loc2) => {
        return Math.sqrt(
          Math.pow(loc1.latitude - loc2.latitude, 2) +
            Math.pow(loc1.longitude - loc2.longitude, 2),
        );
      },
    );

    // Mock console.warn to capture warnings
    const consoleWarnSpy = jest
      .spyOn(console, "warn")
      .mockImplementation(() => {});

    const result = journeyOptimizer.findOptimalPath(locations);

    // Verify the result
    expect(result).toEqual([
      { id: "A", latitude: 0, longitude: 0 },
      { id: "B", latitude: 1, longitude: 1 },
    ]); // Only reachable locations are included

    // Verify the warning message
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      "No valid path found for some locations. These locations are unreachable:",
      ["C", "D"],
    );
    expect(consoleWarnSpy).toHaveBeenCalledWith("Unreachable locations:", [
      "C",
      "D",
    ]);

    // Restore the original console.warn
    consoleWarnSpy.mockRestore();
  });
});
