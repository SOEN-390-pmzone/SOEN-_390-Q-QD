import RouteStrategies from "../services/JourneyOptimizer/RouteStrategies";

// Mock FloorRegistry methods
jest.mock("../services/BuildingDataService", () => ({
  getBuildingTypeFromId: jest.fn(() => "mockBuilding"),
  _findElevatorForBuilding: jest.fn((buildingType, floor) => ({
    buildingId: "H",
    floor,
  })),
  getCoordinatesForBuilding: jest.fn(() => ({
    latitude: 45.5,
    longitude: -73.6,
  })),
  getGraph: jest.fn(() => ({
    nodes: [],
    edges: [],
  })),
}));

jest.mock("../services/JourneyOptimizer/RouteDecorators.js", () => ({
  RoomToRoomSameFloor: () => () => 10,
  ElevatorTravel: () => () => 20,
  OutdoorTravel: () => () => 50,
  BaseCalculation: () => () => 0,
  BuildingToEntrance: () => () => 15,
}));

describe("RouteStrategies", () => {
  const indoorA = { type: "indoor", buildingId: "H", floor: 5 };
  const indoorB = { type: "indoor", buildingId: "H", floor: 5 };
  const indoorC = { type: "indoor", buildingId: "H", floor: 6 };
  const outdoorA = { type: "outdoor", latitude: 45.5, longitude: -73.6 };
  const outdoorB = { type: "outdoor", latitude: 45.501, longitude: -73.61 };

  test("SameFloorSameBuilding - isPathAllowed should return true", () => {
    expect(
      RouteStrategies.SameFloorSameBuilding.isPathAllowed(indoorA, indoorB),
    ).toBe(true);
  });

  test("DifferentFloorSameBuilding - isPathAllowed should return true", () => {
    expect(
      RouteStrategies.DifferentFloorSameBuilding.isPathAllowed(
        indoorA,
        indoorC,
      ),
    ).toBe(true);
  });

  test("DifferentFloorSameBuilding - calculateDistance returns total of all legs", () => {
    const dist = RouteStrategies.DifferentFloorSameBuilding.calculateDistance(
      indoorA,
      indoorC,
    );
    // 10 (leg 1) + 20 (elevator) + 10 (leg 3)
    expect(dist).toBe(40);
  });

  test("Outdoor - isPathAllowed should return true", () => {
    expect(RouteStrategies.Outdoor.isPathAllowed(outdoorA, outdoorB)).toBe(
      true,
    );
  });

  test("Outdoor - calculateDistance returns value", () => {
    const dist = RouteStrategies.Outdoor.calculateDistance(outdoorA, outdoorB);
    expect(dist).toBe(50);
  });

  test("Mixed - isPathAllowed returns true for one indoor and one outdoor", () => {
    expect(RouteStrategies.Mixed.isPathAllowed(indoorA, outdoorA)).toBe(true);
  });

  test("Mixed - calculateDistance returns sum of indoor and outdoor segments", () => {
    const dist = RouteStrategies.Mixed.calculateDistance(indoorA, outdoorA);
    expect(dist).toBe(15 + 50); // 15 from BuildingToEntrance, 50 from OutdoorTravel
  });

  test("DifferentBuilding - isPathAllowed returns true if buildings differ", () => {
    const indoorX = { ...indoorA, buildingId: "H" };
    const indoorY = { ...indoorB, buildingId: "MB" };
    expect(
      RouteStrategies.DifferentBuilding.isPathAllowed(indoorX, indoorY),
    ).toBe(true);
  });

  test("DifferentBuilding - calculateDistance returns total of all segments", () => {
    const indoorX = { ...indoorA, buildingId: "H" };
    const indoorY = { ...indoorB, buildingId: "MB" };
    const dist = RouteStrategies.DifferentBuilding.calculateDistance(
      indoorX,
      indoorY,
    );
    expect(dist).toBe(15 + 50 + 15); // Exit, Outdoor, Entrance
  });
});
