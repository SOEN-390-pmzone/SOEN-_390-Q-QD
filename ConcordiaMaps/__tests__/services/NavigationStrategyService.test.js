import NavigationStrategyService from "../../services/NavigationStrategyService";
import { Alert } from "react-native";
import FloorRegistry from "../../services/BuildingDataService";

// Mock dependencies
jest.mock("react-native", () => ({
  Alert: {
    alert: jest.fn(),
  },
}));

jest.mock("../../services/BuildingDataService", () => ({
  getAllBuildings: jest.fn(),
  getBuilding: jest.fn(),
}));

describe("NavigationStrategyService", () => {
  let mockNavigation;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Setup mock navigation object
    mockNavigation = {
      navigate: jest.fn(),
    };

    // Setup FloorRegistry mock implementation
    FloorRegistry.getAllBuildings.mockReturnValue({
      H: { id: "hall" },
      MB: { id: "mb" },
    });
    FloorRegistry.getBuilding.mockImplementation((key) => {
      const buildings = {
        H: { id: "hall" },
        MB: { id: "mb" },
      };
      return buildings[key];
    });
  });

  describe("createIndoorRoute", () => {
    test("should create single-step route when on same floor with direct routing", () => {
      const route = NavigationStrategyService.createIndoorRoute(
        "hall",
        "H-920",
        "H-925",
        { directRouting: true },
      );

      expect(route).toBeDefined();
      expect(route.steps.length).toBe(1);
      expect(route.steps[0].type).toBe("indoor");
      expect(route.steps[0].buildingId).toBe("hall");
      expect(route.steps[0].startFloor).toBe("9");
      expect(route.steps[0].endFloor).toBe("9");
    });

    test("should create multi-step route when floors are different without direct routing", () => {
      const route = NavigationStrategyService.createIndoorRoute(
        "hall",
        "H-920",
        "H-820",
      );

      expect(route).toBeDefined();
      expect(route.steps.length).toBe(3);
      expect(route.steps[0].type).toBe("indoor");
      expect(route.steps[1].type).toBe("transition");
      expect(route.steps[2].type).toBe("indoor");
      expect(route.steps[1].startFloor).toBe("9");
      expect(route.steps[1].endFloor).toBe("8");
    });

    test("should handle special case for entrance room", () => {
      const route = NavigationStrategyService.createIndoorRoute(
        "hall",
        "entrance",
        "H-920",
      );

      expect(route).toBeDefined();
      expect(route.steps.length).toBe(3);
      expect(route.steps[0].startRoom).toBe("entrance");
      expect(route.steps[0].floor).toBe("1");
    });
  });

  describe("_extractFloorFromRoom", () => {
    test("should extract floor from standard room format", () => {
      expect(NavigationStrategyService._extractFloorFromRoom("H-920")).toBe(
        "9",
      );
      expect(NavigationStrategyService._extractFloorFromRoom("MB-302")).toBe(
        "3",
      );
    });

    test("should extract floor from alternate room format", () => {
      expect(NavigationStrategyService._extractFloorFromRoom("H920")).toBe("9");
    });

    test("should handle special cases", () => {
      expect(NavigationStrategyService._extractFloorFromRoom("entrance")).toBe(
        "1",
      );
      expect(
        NavigationStrategyService._extractFloorFromRoom("ELEVATOR-H-9"),
      ).toBe("9");
      expect(
        NavigationStrategyService._extractFloorFromRoom("elevator"),
      ).toBeNull();
    });

    test("should return default floor for invalid inputs", () => {
      expect(NavigationStrategyService._extractFloorFromRoom("")).toBe("1");
      expect(NavigationStrategyService._extractFloorFromRoom(null)).toBe("1");
      expect(NavigationStrategyService._extractFloorFromRoom("invalid")).toBe(
        "1",
      );
    });
  });

  describe("createInterFloorRoute", () => {
    test("should create a transition route between floors", () => {
      const route = NavigationStrategyService.createInterFloorRoute(
        "hall",
        "2",
        "5",
        { transportationType: "elevator" },
      );

      expect(route).toBeDefined();
      expect(route.steps.length).toBe(1);
      expect(route.steps[0].type).toBe("transition");
      expect(route.steps[0].transportationType).toBe("elevator");
      expect(route.steps[0].startFloor).toBe("2");
      expect(route.steps[0].endFloor).toBe("5");
    });
  });

  describe("navigateToStep", () => {
    test("should handle multi-step navigation plan", () => {
      const plan = {
        title: "Test Plan",
        steps: [{ type: "indoor", title: "Step 1" }],
      };

      NavigationStrategyService.navigateToStep(mockNavigation, plan);

      expect(mockNavigation.navigate).toHaveBeenCalledWith(
        "MultistepNavigation",
        { navigationPlan: plan },
      );
    });

    test("should use indoor navigation strategy", () => {
      const step = {
        type: "indoor",
        buildingId: "hall",
        startRoom: "H-920",
        endRoom: "H-925",
      };

      NavigationStrategyService.navigateToStep(mockNavigation, step);

      expect(mockNavigation.navigate).toHaveBeenCalledWith(
        "MultistepNavigation",
        expect.anything(),
      );
    });

    test("should use RoomToRoomNavigation when only buildingId is provided", () => {
      const step = {
        type: "indoor",
        buildingId: "hall",
      };

      NavigationStrategyService.navigateToStep(mockNavigation, step);

      expect(mockNavigation.navigate).toHaveBeenCalledWith(
        "RoomToRoomNavigation",
        expect.anything(),
      );
    });

    test("should show alert when indoor navigation lacks required params", () => {
      const step = {
        type: "indoor",
      };

      NavigationStrategyService.navigateToStep(mockNavigation, step);

      expect(Alert.alert).toHaveBeenCalled();
      expect(mockNavigation.navigate).not.toHaveBeenCalled();
    });

    test("should use outdoor navigation strategy", () => {
      const step = {
        type: "outdoor",
        startPoint: "Location A",
        endPoint: "Location B",
      };

      NavigationStrategyService.navigateToStep(mockNavigation, step);

      expect(Alert.alert).toHaveBeenCalled();
    });

    test("should use transition navigation strategy", () => {
      const step = {
        type: "transition",
        buildingId: "hall",
        startFloor: "2",
        endFloor: "3",
      };

      NavigationStrategyService.navigateToStep(mockNavigation, step);

      expect(mockNavigation.navigate).toHaveBeenCalledWith(
        "MultistepNavigation",
        expect.anything(),
      );
    });

    test("should show alert for transition navigation with missing params", () => {
      const step = {
        type: "transition",
        buildingId: "hall",
        // Missing startFloor or endFloor
      };

      NavigationStrategyService.navigateToStep(mockNavigation, step);

      expect(Alert.alert).toHaveBeenCalled();
      expect(mockNavigation.navigate).not.toHaveBeenCalled();
    });

    test("should use combined navigation strategy", () => {
      const step = {
        type: "combined",
        externalAddress: "123 Main St",
        buildingId: "hall",
        endRoom: "H-920",
      };

      NavigationStrategyService.navigateToStep(mockNavigation, step);

      expect(mockNavigation.navigate).toHaveBeenCalledWith(
        "MultistepNavigation",
        expect.anything(),
      );
    });

    test("should show alert for combined navigation with missing params", () => {
      const step = {
        type: "combined",
        buildingId: "hall",
        // Missing externalAddress or endRoom
      };

      NavigationStrategyService.navigateToStep(mockNavigation, step);

      expect(Alert.alert).toHaveBeenCalled();
      expect(mockNavigation.navigate).not.toHaveBeenCalled();
    });
  });

  describe("createNavigationStep", () => {
    test("should create a navigation step with required properties", () => {
      const step = NavigationStrategyService.createNavigationStep(
        "indoor",
        "Go to Room",
        {
          buildingId: "hall",
          startRoom: "H-920",
          endRoom: "H-925",
        },
      );

      expect(step).toBeDefined();
      expect(step.type).toBe("indoor");
      expect(step.title).toBe("Go to Room");
      expect(step.buildingId).toBe("hall");
      expect(step.startRoom).toBe("H-920");
      expect(step.endRoom).toBe("H-925");
    });
  });

  describe("createCombinedRoute", () => {
    test("should create a combined route from external address to room", () => {
      const step = NavigationStrategyService.createCombinedRoute(
        "1455 De Maisonneuve Blvd W",
        "hall",
        "H-920",
        { buildingName: "Hall Building" },
      );

      expect(step).toBeDefined();
      expect(step.type).toBe("combined");
      expect(step.externalAddress).toBe("1455 De Maisonneuve Blvd W");
      expect(step.buildingId).toBe("hall");
      expect(step.buildingName).toBe("Hall Building");
      expect(step.endRoom).toBe("H-920");
    });
  });
});
