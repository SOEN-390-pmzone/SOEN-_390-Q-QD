import {
  parseOriginClassroom,
  parseDestination,
  handleBuildingSelect,
} from "../../services/NavigationFormService";
import FloorRegistry from "../../services/BuildingDataService";

// Mock the BuildingDataService module
jest.mock("../../services/BuildingDataService", () => {
  return {
    parseRoomFormat: jest.fn(),
    findBuildingByCode: jest.fn(),
    getValidRoomsForBuilding: jest.fn(),
    CONCORDIA_BUILDINGS: [
      { id: "H", name: "Hall Building" },
      { id: "MB", name: "John Molson Building" },
    ],
  };
});

describe("NavigationFormService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("parseOriginClassroom", () => {
    test("should set origin text and return true when valid room format is provided", () => {
      // Mock functions
      const setOrigin = jest.fn();
      const setOriginBuilding = jest.fn();
      const setOriginRoom = jest.fn();
      const filterOriginBuildingSuggestions = jest.fn();

      // Mock return values
      FloorRegistry.parseRoomFormat.mockReturnValue({
        buildingCode: "H",
        formatted: "H-920",
      });
      FloorRegistry.findBuildingByCode.mockReturnValue({
        id: "H",
        name: "Hall Building",
      });

      // Execute function
      const result = parseOriginClassroom(
        "H-920",
        setOrigin,
        setOriginBuilding,
        setOriginRoom,
        filterOriginBuildingSuggestions,
      );

      // Assertions
      expect(result).toBe(true);
      expect(setOrigin).toHaveBeenCalledWith("H-920");
      expect(setOriginBuilding).toHaveBeenCalledWith({
        id: "H",
        name: "Hall Building",
      });
      expect(setOriginRoom).toHaveBeenCalledWith("H-920");
      expect(filterOriginBuildingSuggestions).not.toHaveBeenCalled();
    });

    test("should filter suggestions and return false when invalid format is provided", () => {
      // Mock functions
      const setOrigin = jest.fn();
      const setOriginBuilding = jest.fn();
      const setOriginRoom = jest.fn();
      const filterOriginBuildingSuggestions = jest.fn();

      // Mock return value
      FloorRegistry.parseRoomFormat.mockReturnValue(null);

      // Execute function
      const result = parseOriginClassroom(
        "Hall",
        setOrigin,
        setOriginBuilding,
        setOriginRoom,
        filterOriginBuildingSuggestions,
      );

      // Assertions
      expect(result).toBe(false);
      expect(setOrigin).toHaveBeenCalledWith("Hall");
      expect(setOriginBuilding).not.toHaveBeenCalled();
      expect(setOriginRoom).not.toHaveBeenCalled();
      expect(filterOriginBuildingSuggestions).toHaveBeenCalledWith("Hall");
    });

    test("should return false when building is not found", () => {
      // Mock functions
      const setOrigin = jest.fn();
      const setOriginBuilding = jest.fn();
      const setOriginRoom = jest.fn();
      const filterOriginBuildingSuggestions = jest.fn();

      // Mock return values
      FloorRegistry.parseRoomFormat.mockReturnValue({
        buildingCode: "XYZ",
        formatted: "XYZ-100",
      });
      FloorRegistry.findBuildingByCode.mockReturnValue(null);

      // Execute function
      const result = parseOriginClassroom(
        "XYZ-100",
        setOrigin,
        setOriginBuilding,
        setOriginRoom,
        filterOriginBuildingSuggestions,
      );

      // Assertions
      expect(result).toBe(false);
      expect(setOrigin).toHaveBeenCalledWith("XYZ-100");
      expect(setOriginBuilding).not.toHaveBeenCalled();
      expect(setOriginRoom).not.toHaveBeenCalled();
    });
  });

  describe("parseDestination", () => {
    test("should parse valid room format correctly", () => {
      // Mock functions
      const setDestination = jest.fn();
      const setBuilding = jest.fn();
      const setRoom = jest.fn();
      const filterBuildingSuggestions = jest.fn();

      // Execute function
      const result = parseDestination(
        "H-920",
        setDestination,
        setBuilding,
        setRoom,
        filterBuildingSuggestions,
      );

      // Assertions
      expect(result).toBe(true);
      expect(setDestination).toHaveBeenCalledWith("H-920");
      expect(setBuilding).toHaveBeenCalledWith({
        id: "H",
        name: "Hall Building",
      });
      expect(setRoom).toHaveBeenCalledWith("H-920");
      expect(filterBuildingSuggestions).not.toHaveBeenCalled();
    });

    test("should parse alternative room format with space", () => {
      // Mock functions
      const setDestination = jest.fn();
      const setBuilding = jest.fn();
      const setRoom = jest.fn();
      const filterBuildingSuggestions = jest.fn();

      // Execute function
      const result = parseDestination(
        "H 920",
        setDestination,
        setBuilding,
        setRoom,
        filterBuildingSuggestions,
      );

      // Assertions
      expect(result).toBe(true);
      expect(setDestination).toHaveBeenCalledWith("H 920");
      expect(setBuilding).toHaveBeenCalledWith({
        id: "H",
        name: "Hall Building",
      });
      expect(setRoom).toHaveBeenCalledWith("H-920");
    });

    test("should filter suggestions when building name is provided", () => {
      // Mock functions
      const setDestination = jest.fn();
      const setBuilding = jest.fn();
      const setRoom = jest.fn();
      const filterBuildingSuggestions = jest.fn();

      // Execute function
      const result = parseDestination(
        "Hall Building",
        setDestination,
        setBuilding,
        setRoom,
        filterBuildingSuggestions,
      );

      // Assertions
      expect(result).toBe(false);
      expect(setDestination).toHaveBeenCalledWith("Hall Building");
      expect(filterBuildingSuggestions).toHaveBeenCalledWith("Hall Building");
      expect(setBuilding).not.toHaveBeenCalled();
      expect(setRoom).not.toHaveBeenCalled();
    });
  });

  describe("handleBuildingSelect", () => {
    test("should set building and related states correctly", () => {
      // Mock functions
      const setBuilding = jest.fn();
      const setBuildingText = jest.fn();
      const setShowBuildingSuggestions = jest.fn();
      const setAvailableRooms = jest.fn();
      const setInvalidRoom = jest.fn();

      // Mock data
      const building = { id: "MB", name: "John Molson Building" };
      FloorRegistry.getValidRoomsForBuilding.mockReturnValue([
        "MB-1.401",
        "MB-2.255",
      ]);

      // Execute function
      handleBuildingSelect(
        building,
        setBuilding,
        setBuildingText,
        setShowBuildingSuggestions,
        setAvailableRooms,
        setInvalidRoom,
      );

      // Assertions
      expect(setBuilding).toHaveBeenCalledWith(building);
      expect(setBuildingText).toHaveBeenCalledWith("John Molson Building");
      expect(setShowBuildingSuggestions).toHaveBeenCalledWith(false);
      expect(setAvailableRooms).toHaveBeenCalledWith(["MB-1.401", "MB-2.255"]);
      expect(setInvalidRoom).toHaveBeenCalledWith(false);
      expect(FloorRegistry.getValidRoomsForBuilding).toHaveBeenCalledWith("MB");
    });

    test("should handle case when optional functions are not provided", () => {
      // Mock functions
      const setBuilding = jest.fn();
      const setBuildingText = jest.fn();
      const setShowBuildingSuggestions = jest.fn();

      // Mock data
      const building = { id: "H", name: "Hall Building" };

      // Execute function (without optional parameters)
      handleBuildingSelect(
        building,
        setBuilding,
        setBuildingText,
        setShowBuildingSuggestions,
      );

      // Assertions
      expect(setBuilding).toHaveBeenCalledWith(building);
      expect(setBuildingText).toHaveBeenCalledWith("Hall Building");
      expect(setShowBuildingSuggestions).toHaveBeenCalledWith(false);
      expect(FloorRegistry.getValidRoomsForBuilding).not.toHaveBeenCalled();
    });
  });
});
