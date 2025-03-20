import {
  validateRoomSelection,
  findFloorForRoom,
  findBuildingTypeFromId,
} from "../../services/NavigationValidationService";

describe("NavigationValidationService", () => {
  describe("validateRoomSelection", () => {
    test("should return null when both rooms are valid and exist in their respective graphs", () => {
      // Arrange
      const startFloorGraph = {
        room1: { room2: 1 },
        room2: { room1: 1 },
      };
      const endFloorGraph = {
        room3: { room4: 1 },
        room4: { room3: 1 },
      };
      const selectedStartRoom = "room1";
      const selectedEndRoom = "room3";

      // Act
      const result = validateRoomSelection(
        startFloorGraph,
        endFloorGraph,
        selectedStartRoom,
        selectedEndRoom,
      );

      // Assert
      expect(result).toBeNull();
    });

    test("should return error message when start room is not selected", () => {
      // Arrange
      const startFloorGraph = { room1: {} };
      const endFloorGraph = { room3: {} };
      const selectedStartRoom = null;
      const selectedEndRoom = "room3";

      // Act
      const result = validateRoomSelection(
        startFloorGraph,
        endFloorGraph,
        selectedStartRoom,
        selectedEndRoom,
      );

      // Assert
      expect(result).toBe("Please select both start and end rooms");
    });

    test("should return error message when end room is not selected", () => {
      // Arrange
      const startFloorGraph = { room1: {} };
      const endFloorGraph = { room3: {} };
      const selectedStartRoom = "room1";
      const selectedEndRoom = null;

      // Act
      const result = validateRoomSelection(
        startFloorGraph,
        endFloorGraph,
        selectedStartRoom,
        selectedEndRoom,
      );

      // Assert
      expect(result).toBe("Please select both start and end rooms");
    });

    test("should return error when start room is not in start floor graph", () => {
      // Arrange
      const startFloorGraph = { room1: {} };
      const endFloorGraph = { room3: {} };
      const selectedStartRoom = "invalidRoom";
      const selectedEndRoom = "room3";

      // Act
      const result = validateRoomSelection(
        startFloorGraph,
        endFloorGraph,
        selectedStartRoom,
        selectedEndRoom,
      );

      // Assert
      expect(result).toBe(
        "Start room invalidRoom not found in navigation graph",
      );
    });

    test("should return error when end room is not in end floor graph", () => {
      // Arrange
      const startFloorGraph = { room1: {} };
      const endFloorGraph = { room3: {} };
      const selectedStartRoom = "room1";
      const selectedEndRoom = "invalidRoom";

      // Act
      const result = validateRoomSelection(
        startFloorGraph,
        endFloorGraph,
        selectedStartRoom,
        selectedEndRoom,
      );

      // Assert
      expect(result).toBe("End room invalidRoom not found in navigation graph");
    });
  });

  describe("findFloorForRoom", () => {
    test("should return floor ID when room exists on a floor", () => {
      // Arrange
      const buildingType = "HallBuilding";
      const roomId = "room101";
      const mockFloorRegistry = {
        getBuilding: jest.fn().mockReturnValue({
          floors: {
            1: {},
            2: {},
          },
        }),
        getRooms: jest.fn().mockImplementation((buildingType, floorId) => {
          if (floorId === "1") {
            return { room101: {}, room102: {} };
          } else {
            return { room201: {}, room202: {} };
          }
        }),
      };

      // Act
      const result = findFloorForRoom(buildingType, roomId, mockFloorRegistry);

      // Assert
      expect(result).toBe("1");
      expect(mockFloorRegistry.getBuilding).toHaveBeenCalledWith(buildingType);
      expect(mockFloorRegistry.getRooms).toHaveBeenCalledWith(
        buildingType,
        "1",
      );

      // The implementation returns early once it finds the floor with the room,
      // so we shouldn't expect it to check floor '2'
      // expect(mockFloorRegistry.getRooms).toHaveBeenCalledWith(buildingType, '2');
    });

    test("should check multiple floors until it finds the room", () => {
      // Arrange
      const buildingType = "HallBuilding";
      const roomId = "room201"; // Room on the 2nd floor
      const mockFloorRegistry = {
        getBuilding: jest.fn().mockReturnValue({
          floors: {
            1: {},
            2: {},
          },
        }),
        getRooms: jest.fn().mockImplementation((buildingType, floorId) => {
          if (floorId === "1") {
            return { room101: {}, room102: {} };
          } else {
            return { room201: {}, room202: {} };
          }
        }),
      };

      // Act
      const result = findFloorForRoom(buildingType, roomId, mockFloorRegistry);

      // Assert
      expect(result).toBe("2");
      expect(mockFloorRegistry.getBuilding).toHaveBeenCalledWith(buildingType);
      expect(mockFloorRegistry.getRooms).toHaveBeenCalledWith(
        buildingType,
        "1",
      );
      expect(mockFloorRegistry.getRooms).toHaveBeenCalledWith(
        buildingType,
        "2",
      );
    });

    test("should return null when building does not exist", () => {
      // Arrange
      const buildingType = "InvalidBuilding";
      const roomId = "room101";
      const mockFloorRegistry = {
        getBuilding: jest.fn().mockReturnValue(null),
        getRooms: jest.fn(),
      };

      // Act
      const result = findFloorForRoom(buildingType, roomId, mockFloorRegistry);

      // Assert
      expect(result).toBeNull();
      expect(mockFloorRegistry.getBuilding).toHaveBeenCalledWith(buildingType);
      expect(mockFloorRegistry.getRooms).not.toHaveBeenCalled();
    });

    test("should return null when room does not exist on any floor", () => {
      // Arrange
      const buildingType = "HallBuilding";
      const roomId = "nonExistentRoom";
      const mockFloorRegistry = {
        getBuilding: jest.fn().mockReturnValue({
          floors: {
            1: {},
            2: {},
          },
        }),
        getRooms: jest.fn().mockImplementation((buildingType, floorId) => {
          if (floorId === "1") {
            return { room101: {}, room102: {} };
          } else {
            return { room201: {}, room202: {} };
          }
        }),
      };

      // Act
      const result = findFloorForRoom(buildingType, roomId, mockFloorRegistry);

      // Assert
      expect(result).toBeNull();
      expect(mockFloorRegistry.getBuilding).toHaveBeenCalledWith(buildingType);
      expect(mockFloorRegistry.getRooms).toHaveBeenCalledWith(
        buildingType,
        "1",
      );
      expect(mockFloorRegistry.getRooms).toHaveBeenCalledWith(
        buildingType,
        "2",
      );
    });
  });

  describe("findBuildingTypeFromId", () => {
    test("should return building type when building ID exists", () => {
      // Arrange
      const buildingId = "hall";
      const mockFloorRegistry = {
        getAllBuildings: jest.fn().mockReturnValue({
          HallBuilding: {},
          JMSB: {},
        }),
        getBuilding: jest.fn().mockImplementation((buildingType) => {
          if (buildingType === "HallBuilding") {
            return { id: "hall" };
          } else if (buildingType === "JMSB") {
            return { id: "jmsb" };
          }
          return null;
        }),
      };

      // Act
      const result = findBuildingTypeFromId(buildingId, mockFloorRegistry);

      // Assert
      expect(result).toBe("HallBuilding");
      expect(mockFloorRegistry.getAllBuildings).toHaveBeenCalled();
      expect(mockFloorRegistry.getBuilding).toHaveBeenCalledWith(
        "HallBuilding",
      );
    });

    test("should return null when building ID does not exist", () => {
      // Arrange
      const buildingId = "nonExistentBuilding";
      const mockFloorRegistry = {
        getAllBuildings: jest.fn().mockReturnValue({
          HallBuilding: {},
          JMSB: {},
        }),
        getBuilding: jest.fn().mockImplementation((buildingType) => {
          if (buildingType === "HallBuilding") {
            return { id: "hall" };
          } else if (buildingType === "JMSB") {
            return { id: "jmsb" };
          }
          return null;
        }),
      };

      // Act
      const result = findBuildingTypeFromId(buildingId, mockFloorRegistry);

      // Assert
      expect(result).toBeNull();
      expect(mockFloorRegistry.getAllBuildings).toHaveBeenCalled();
      expect(mockFloorRegistry.getBuilding).toHaveBeenCalledWith(
        "HallBuilding",
      );
      expect(mockFloorRegistry.getBuilding).toHaveBeenCalledWith("JMSB");
    });
  });
});
