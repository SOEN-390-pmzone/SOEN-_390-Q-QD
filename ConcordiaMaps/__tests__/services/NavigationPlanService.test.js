import NavigationPlanService from "../../services/NavigationPlanService";
import FloorRegistry from "../../services/BuildingDataService";
import NavigationStrategyService from "../../services/NavigationStrategyService";

// Mock dependencies
jest.mock("../../services/BuildingDataService", () => ({
  isValidRoom: jest.fn(),
  getBuildingTypeFromId: jest.fn(),
  extractFloorFromRoom: jest.fn(),
  getCoordinatesForBuilding: jest.fn(),
}));

jest.mock("../../services/NavigationStrategyService", () => ({
  navigateToStep: jest.fn(),
}));

// Mock global alert
global.alert = jest.fn();

describe("NavigationPlanService", () => {
  // Mock common parameters and functions
  const mockNavigation = { navigate: jest.fn() };
  const mockSetInvalidOriginRoom = jest.fn();
  const mockSetInvalidDestinationRoom = jest.fn();
  const mockSetIsLoading = jest.fn();

  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();

    // Default implementation for mocked functions
    FloorRegistry.isValidRoom.mockReturnValue(true);
    FloorRegistry.getBuildingTypeFromId.mockReturnValue("HallBuilding");
    FloorRegistry.extractFloorFromRoom.mockImplementation((room) => {
      if (room === "H-920") return "9";
      if (room === "H-1020") return "10";
      if (room === "MB-1.308") return "1";
      if (room === "MB-3.255") return "3";
      if (room === "entrance" || room === "Main lobby") return "1";
      return "1";
    });
    FloorRegistry.getCoordinatesForBuilding.mockImplementation((buildingId) => {
      if (buildingId === "H") return { latitude: 45.497, longitude: -73.578 };
      if (buildingId === "MB") return { latitude: 45.495, longitude: -73.579 };
      return { latitude: 45.496, longitude: -73.577 };
    });
  });

  describe("getCoordinatesForClassroom", () => {
    test("should return coordinates for valid building", () => {
      const building = { id: "H", name: "Hall Building" };
      const result = NavigationPlanService.getCoordinatesForClassroom(building);

      expect(FloorRegistry.getCoordinatesForBuilding).toHaveBeenCalledWith("H");
      expect(result).toEqual({ latitude: 45.497, longitude: -73.578 });
    });

    test("should return null for null building", () => {
      const result = NavigationPlanService.getCoordinatesForClassroom(null);

      expect(FloorRegistry.getCoordinatesForBuilding).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });
  });

  describe("createNavigationPlan", () => {
    describe("SCENARIO 1: Same Building Navigation", () => {
      test("should create navigation plan for rooms in same building", () => {
        // Setup test data for same building navigation
        const params = {
          originInputType: "classroom",
          originDetails: null,
          origin: "H-920",
          originBuilding: { id: "H", name: "Hall Building" },
          originRoom: "H-920",
          destinationInputType: "classroom",
          destinationDetails: null,
          destination: "H-1020",
          building: { id: "H", name: "Hall Building" },
          room: "H-1020",
          setInvalidOriginRoom: mockSetInvalidOriginRoom,
          setInvalidDestinationRoom: mockSetInvalidDestinationRoom,
          setIsLoading: mockSetIsLoading,
          navigation: mockNavigation,
        };

        // Execute service function
        NavigationPlanService.createNavigationPlan(params);

        // Check loading state was updated
        expect(mockSetIsLoading).toHaveBeenCalledWith(true);
        expect(mockSetIsLoading).toHaveBeenCalledWith(false);

        // Check that the correct navigation plan was created
        expect(NavigationStrategyService.navigateToStep).toHaveBeenCalledWith(
          mockNavigation,
          expect.objectContaining({
            title: "Navigate to H-1020",
            currentStep: 0,
            steps: [
              expect.objectContaining({
                type: "indoor",
                title: "Navigate inside Hall Building",
                buildingId: "H",
                buildingType: "HallBuilding",
                startRoom: "H-920",
                endRoom: "H-1020",
                startFloor: "9",
                endFloor: "10",
              }),
            ],
          }),
        );
      });
    });

    describe("SCENARIO 2: Room to Outdoor Location", () => {
      test("should create navigation plan from room to outdoor location", () => {
        // Setup test data for room to outdoor location
        const params = {
          originInputType: "classroom",
          originDetails: null,
          origin: "H-920",
          originBuilding: { id: "H", name: "Hall Building" },
          originRoom: "H-920",
          destinationInputType: "location",
          destinationDetails: {
            latitude: 45.498,
            longitude: -73.576,
            formatted_address: "Some Destination Address",
          },
          destination: "Some Destination",
          building: null,
          room: "",
          setInvalidOriginRoom: mockSetInvalidOriginRoom,
          setInvalidDestinationRoom: mockSetInvalidDestinationRoom,
          setIsLoading: mockSetIsLoading,
          navigation: mockNavigation,
        };

        // Execute service function
        NavigationPlanService.createNavigationPlan(params);

        // Check that the correct navigation plan was created
        expect(NavigationStrategyService.navigateToStep).toHaveBeenCalledWith(
          mockNavigation,
          expect.objectContaining({
            title: "Navigate to Some Destination Address",
            currentStep: 0,
            steps: [
              expect.objectContaining({
                type: "indoor",
                title: "Exit Hall Building",
                buildingId: "H",
                startRoom: "H-920",
                endRoom: "Main lobby",
                startFloor: "9",
                endFloor: "1",
              }),
              expect.objectContaining({
                type: "outdoor",
                title: "Travel to Some Destination Address",
                startAddress: "H-920, Hall Building",
                endAddress: "Some Destination Address",
              }),
            ],
          }),
        );
      });
    });

    describe("SCENARIO 3: Outdoor Location to Room", () => {
      test("should create navigation plan from outdoor location to room", () => {
        // Setup test data for outdoor location to room
        const params = {
          originInputType: "location",
          originDetails: {
            latitude: 45.498,
            longitude: -73.576,
            formatted_address: "Current Location",
          },
          origin: "Current Location",
          originBuilding: null,
          originRoom: "",
          destinationInputType: "classroom",
          destinationDetails: null,
          destination: "H-920",
          building: { id: "H", name: "Hall Building" },
          room: "H-920",
          setInvalidOriginRoom: mockSetInvalidOriginRoom,
          setInvalidDestinationRoom: mockSetInvalidDestinationRoom,
          setIsLoading: mockSetIsLoading,
          navigation: mockNavigation,
        };

        // Execute service function
        NavigationPlanService.createNavigationPlan(params);

        // Check that the correct navigation plan was created
        expect(NavigationStrategyService.navigateToStep).toHaveBeenCalledWith(
          mockNavigation,
          expect.objectContaining({
            title: "Navigate to H-920",
            currentStep: 0,
            steps: [
              expect.objectContaining({
                type: "outdoor",
                title: "Travel to Hall Building",
                startAddress: "Current Location",
                endAddress: "H-920, Hall Building",
              }),
              expect.objectContaining({
                type: "indoor",
                title: "Navigate to room H-920 in Hall Building",
                buildingId: "H",
                startRoom: "entrance",
                endRoom: "H-920",
                startFloor: "1",
                endFloor: "9",
              }),
            ],
          }),
        );
      });
    });

    describe("SCENARIO 4: Building to Building Navigation", () => {
      test("should create navigation plan between different buildings", () => {
        // Setup test data for building to building navigation
        const params = {
          originInputType: "classroom",
          originDetails: null,
          origin: "H-920",
          originBuilding: { id: "H", name: "Hall Building" },
          originRoom: "H-920",
          destinationInputType: "classroom",
          destinationDetails: null,
          destination: "MB-3.255",
          building: { id: "MB", name: "John Molson Building" },
          room: "MB-3.255",
          setInvalidOriginRoom: mockSetInvalidOriginRoom,
          setInvalidDestinationRoom: mockSetInvalidDestinationRoom,
          setIsLoading: mockSetIsLoading,
          navigation: mockNavigation,
        };

        // Execute service function
        NavigationPlanService.createNavigationPlan(params);

        // Check that the correct navigation plan was created
        expect(NavigationStrategyService.navigateToStep).toHaveBeenCalledWith(
          mockNavigation,
          expect.objectContaining({
            title: "Navigate to MB-3.255",
            currentStep: 0,
            steps: [
              expect.objectContaining({
                type: "indoor",
                title: "Exit Hall Building",
                buildingId: "H",
                startRoom: "H-920",
                endRoom: "entrance",
                startFloor: "9",
                endFloor: "1",
              }),
              expect.objectContaining({
                type: "outdoor",
                title: "Travel to John Molson Building",
                startAddress: "H-920, Hall Building",
                endAddress: "John Molson Building entrance",
              }),
              expect.objectContaining({
                type: "indoor",
                title: "Navigate to room MB-3.255 in John Molson Building",
                buildingId: "MB",
                startRoom: "entrance",
                endRoom: "MB-3.255",
                startFloor: "1",
                endFloor: "3",
              }),
            ],
          }),
        );
      });
    });

    describe("SCENARIO 5: Outdoor to Outdoor Navigation", () => {
      test("should create navigation plan between two outdoor locations", () => {
        // Setup test data for outdoor to outdoor navigation
        const params = {
          originInputType: "location",
          originDetails: {
            latitude: 45.498,
            longitude: -73.576,
            formatted_address: "Origin Address",
          },
          origin: "Origin Location",
          originBuilding: null,
          originRoom: "",
          destinationInputType: "location",
          destinationDetails: {
            latitude: 45.499,
            longitude: -73.575,
            formatted_address: "Destination Address",
          },
          destination: "Destination Location",
          building: null,
          room: "",
          setInvalidOriginRoom: mockSetInvalidOriginRoom,
          setInvalidDestinationRoom: mockSetInvalidDestinationRoom,
          setIsLoading: mockSetIsLoading,
          navigation: mockNavigation,
        };

        // Execute service function
        NavigationPlanService.createNavigationPlan(params);

        // Check that the correct navigation plan was created
        expect(NavigationStrategyService.navigateToStep).toHaveBeenCalledWith(
          mockNavigation,
          expect.objectContaining({
            title: "Navigate to Destination Address",
            currentStep: 0,
            steps: [
              expect.objectContaining({
                type: "outdoor",
                title: "Travel to Destination Address",
                startAddress: "Origin Address",
                endAddress: "Destination Address",
              }),
            ],
          }),
        );
      });
    });

    describe("Input Validation", () => {
      test("should validate origin building for classroom input type", () => {
        const params = {
          originInputType: "classroom",
          originDetails: null,
          origin: "",
          originBuilding: null, // Missing building
          originRoom: "H-920",
          destinationInputType: "classroom",
          destinationDetails: null,
          destination: "H-1020",
          building: { id: "H", name: "Hall Building" },
          room: "H-1020",
          setInvalidOriginRoom: mockSetInvalidOriginRoom,
          setInvalidDestinationRoom: mockSetInvalidDestinationRoom,
          setIsLoading: mockSetIsLoading,
          navigation: mockNavigation,
        };

        NavigationPlanService.createNavigationPlan(params);

        expect(global.alert).toHaveBeenCalledWith(
          "Please enter a valid origin building",
        );
        expect(NavigationStrategyService.navigateToStep).not.toHaveBeenCalled();
      });

      test("should validate origin room when building is selected", () => {
        const params = {
          originInputType: "classroom",
          originDetails: null,
          origin: "",
          originBuilding: { id: "H", name: "Hall Building" },
          originRoom: "", // Missing room
          destinationInputType: "classroom",
          destinationDetails: null,
          destination: "H-1020",
          building: { id: "H", name: "Hall Building" },
          room: "H-1020",
          setInvalidOriginRoom: mockSetInvalidOriginRoom,
          setInvalidDestinationRoom: mockSetInvalidDestinationRoom,
          setIsLoading: mockSetIsLoading,
          navigation: mockNavigation,
        };

        NavigationPlanService.createNavigationPlan(params);

        expect(global.alert).toHaveBeenCalledWith("Please enter a room number");
        expect(NavigationStrategyService.navigateToStep).not.toHaveBeenCalled();
      });

      test("should validate if origin room exists in building", () => {
        FloorRegistry.isValidRoom.mockReturnValue(false);

        const params = {
          originInputType: "classroom",
          originDetails: null,
          origin: "",
          originBuilding: { id: "H", name: "Hall Building" },
          originRoom: "H-9999", // Invalid room
          destinationInputType: "classroom",
          destinationDetails: null,
          destination: "H-1020",
          building: { id: "H", name: "Hall Building" },
          room: "H-1020",
          setInvalidOriginRoom: mockSetInvalidOriginRoom,
          setInvalidDestinationRoom: mockSetInvalidDestinationRoom,
          setIsLoading: mockSetIsLoading,
          navigation: mockNavigation,
        };

        NavigationPlanService.createNavigationPlan(params);

        expect(mockSetInvalidOriginRoom).toHaveBeenCalledWith(true);
        expect(global.alert).toHaveBeenCalledWith(
          "Room H-9999 doesn't exist in Hall Building",
        );
        expect(NavigationStrategyService.navigateToStep).not.toHaveBeenCalled();
      });

      test("should validate destination building for classroom input type", () => {
        const params = {
          originInputType: "location",
          originDetails: {
            latitude: 45.498,
            longitude: -73.576,
            formatted_address: "Origin Address",
          },
          origin: "Origin Location",
          originBuilding: null,
          originRoom: "",
          destinationInputType: "classroom",
          destinationDetails: null,
          destination: "",
          building: null, // Missing building
          room: "H-1020",
          setInvalidOriginRoom: mockSetInvalidOriginRoom,
          setInvalidDestinationRoom: mockSetInvalidDestinationRoom,
          setIsLoading: mockSetIsLoading,
          navigation: mockNavigation,
        };

        NavigationPlanService.createNavigationPlan(params);

        expect(global.alert).toHaveBeenCalledWith(
          "Please enter a valid destination building",
        );
        expect(NavigationStrategyService.navigateToStep).not.toHaveBeenCalled();
      });

      test("should validate destination room when building is selected", () => {
        const params = {
          originInputType: "location",
          originDetails: {
            latitude: 45.498,
            longitude: -73.576,
            formatted_address: "Origin Address",
          },
          origin: "Origin Location",
          originBuilding: null,
          originRoom: "",
          destinationInputType: "classroom",
          destinationDetails: null,
          destination: "",
          building: { id: "H", name: "Hall Building" },
          room: "", // Missing room
          setInvalidOriginRoom: mockSetInvalidOriginRoom,
          setInvalidDestinationRoom: mockSetInvalidDestinationRoom,
          setIsLoading: mockSetIsLoading,
          navigation: mockNavigation,
        };

        NavigationPlanService.createNavigationPlan(params);

        expect(global.alert).toHaveBeenCalledWith("Please enter a room number");
        expect(NavigationStrategyService.navigateToStep).not.toHaveBeenCalled();
      });

      test("should validate if destination room exists in building", () => {
        FloorRegistry.isValidRoom.mockImplementation((buildingId, room) => {
          // Make origin room valid but destination room invalid
          if (buildingId === "H" && room === "H-920") return true;
          if (buildingId === "H" && room === "H-9999") return false;
          return true;
        });

        const params = {
          originInputType: "classroom",
          originDetails: null,
          origin: "",
          originBuilding: { id: "H", name: "Hall Building" },
          originRoom: "H-920",
          destinationInputType: "classroom",
          destinationDetails: null,
          destination: "",
          building: { id: "H", name: "Hall Building" },
          room: "H-9999", // Invalid room
          setInvalidOriginRoom: mockSetInvalidOriginRoom,
          setInvalidDestinationRoom: mockSetInvalidDestinationRoom,
          setIsLoading: mockSetIsLoading,
          navigation: mockNavigation,
        };

        NavigationPlanService.createNavigationPlan(params);

        expect(mockSetInvalidDestinationRoom).toHaveBeenCalledWith(true);
        expect(global.alert).toHaveBeenCalledWith(
          "Room H-9999 doesn't exist in Hall Building",
        );
        expect(NavigationStrategyService.navigateToStep).not.toHaveBeenCalled();
      });
    });
  });
});
