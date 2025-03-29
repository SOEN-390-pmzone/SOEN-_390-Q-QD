import {
  BUILDINGS,
  FLOORS,
  NODE_TYPES,
  getEntranceOptions,
  validateNodeExists,
  mapGenericNodeToBuildingSpecific,
  resolveEntranceNode,
  normalizeRoomId,
} from "../../services/NavigationUtilsService"; // Adjust the path if necessary

describe("Navigation Utilities", () => {
  // Mock console methods to prevent test output clutter and allow assertions
  let consoleLogSpy;
  let consoleErrorSpy;

  beforeEach(() => {
    // Spy on console methods before each test
    consoleLogSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    // Restore original console methods after each test
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  //--- Tests for getEntranceOptions ---
  describe("getEntranceOptions", () => {
    it("should return an empty array if no nodes are provided", () => {
      expect(getEntranceOptions([])).toEqual([]);
    });

    it("should return an empty array if no nodes match entrance keywords", () => {
      const nodes = ["Room101", "CorridorA", "H-811"];
      expect(getEntranceOptions(nodes)).toEqual([]);
    });

    it("should find nodes containing 'ENTRANCE' (case-insensitive)", () => {
      const nodes = ["Main Entrance", "SideEntrance", "ROOM101"];
      expect(getEntranceOptions(nodes)).toEqual([
        "Main Entrance",
        "SideEntrance",
      ]);
    });

    it("should find nodes containing 'LOBBY' (case-insensitive)", () => {
      const nodes = ["Main lobby", "UpperLobby", "H-100"];
      expect(getEntranceOptions(nodes)).toEqual(["Main lobby", "UpperLobby"]);
    });

    it("should find nodes containing 'DOOR' (case-insensitive)", () => {
      const nodes = ["Front Door", "EmergencyDoor", "Exit"];
      expect(getEntranceOptions(nodes)).toEqual([
        "Front Door",
        "EmergencyDoor",
      ]);
    });

    it("should find nodes containing 'ELEVATOR' (case-insensitive)", () => {
      const nodes = ["Main Elevator", "ServiceElevator", "Hallway"];
      expect(getEntranceOptions(nodes)).toEqual([
        "Main Elevator",
        "ServiceElevator",
      ]);
    });

    it("should find nodes containing 'STAIRS' (case-insensitive)", () => {
      const nodes = ["Main Stairs", "EmergencyStairs", "Escalator"];
      expect(getEntranceOptions(nodes)).toEqual([
        "Main Stairs",
        "EmergencyStairs",
      ]);
    });

    it("should find nodes matching 'Main lobby'", () => {
      const nodes = ["Main lobby", "H-100"];
      expect(getEntranceOptions(nodes)).toEqual(["Main lobby"]);
    });

    it("should find nodes matching 'main hall'", () => {
      const nodes = ["main hall", "MB-100"];
      expect(getEntranceOptions(nodes)).toEqual(["main hall"]);
    });

    it("should find multiple different types of entrance nodes", () => {
      const nodes = [
        "Main Entrance",
        "Room101",
        "Lower Lobby",
        "Back Door",
        "Service Elevator",
        "Main Stairs",
        "main hall",
      ];
      expect(getEntranceOptions(nodes)).toEqual([
        "Main Entrance",
        "Lower Lobby",
        "Back Door",
        "Service Elevator",
        "Main Stairs",
        "main hall",
      ]);
    });
  });

  //--- Tests for validateNodeExists ---
  describe("validateNodeExists", () => {
    const graph = {
      "H-101": ["H-102"],
      "H-102": ["H-101", "Main Lobby"],
      "Main Lobby": ["H-102"],
      "MB-1.293": [],
    };

    it("should return true if the node exists as a key in the graph", () => {
      expect(validateNodeExists(graph, "H-101")).toBe(true);
      expect(validateNodeExists(graph, "Main Lobby")).toBe(true);
      expect(validateNodeExists(graph, "MB-1.293")).toBe(true);
    });

    it("should return false if the node does not exist as a key in the graph", () => {
      expect(validateNodeExists(graph, "H-999")).toBe(false);
      expect(validateNodeExists(graph, "NonExistentNode")).toBe(false);
    });

    it("should return false for an empty graph", () => {
      expect(validateNodeExists({}, "AnyNode")).toBe(false);
    });

    it("should be case-sensitive", () => {
      expect(validateNodeExists(graph, "main lobby")).toBe(false); // Graph has 'Main Lobby'
    });
  });

  //--- Tests for mapGenericNodeToBuildingSpecific ---
  describe("mapGenericNodeToBuildingSpecific", () => {
    // Test non-entrance types
    it("should return nodeType as is if it's not an entrance-related term", () => {
      expect(mapGenericNodeToBuildingSpecific(BUILDINGS.HALL, "H-811")).toBe(
        "H-811",
      );
      expect(mapGenericNodeToBuildingSpecific(BUILDINGS.MB, "MB-205")).toBe(
        "MB-205",
      );
      expect(mapGenericNodeToBuildingSpecific(BUILDINGS.EV, "RandomNode")).toBe(
        "RandomNode",
      );
    });

    // Test entrance types with different building variations
    const entranceTerms = [
      "entrance",
      "ENTRANCE",
      "lobby",
      "LOBBY",
      "main entrance",
      "Main Entrance",
      "main lobby",
      NODE_TYPES.MAIN_LOBBY,
    ];
    const jmsbMbBuildings = [BUILDINGS.JMSB, BUILDINGS.MB, "JMSB", "MB"];
    const hallHBuildings = [BUILDINGS.HALL, BUILDINGS.H, "HallBuilding", "H"];
    const evBuildings = [BUILDINGS.EV, "EVBuilding", "EV"];
    const otherBuildings = [BUILDINGS.LIBRARY, "UnknownBuilding"]; // Test default case

    entranceTerms.forEach((term) => {
      jmsbMbBuildings.forEach((building) => {
        it(`should map '${term}' to '${NODE_TYPES.MAIN_HALL}' for building '${building}'`, () => {
          expect(mapGenericNodeToBuildingSpecific(building, term)).toBe(
            NODE_TYPES.MAIN_HALL,
          );
        });
      });

      hallHBuildings.forEach((building) => {
        it(`should map '${term}' to '${NODE_TYPES.MAIN_LOBBY}' for building '${building}'`, () => {
          expect(mapGenericNodeToBuildingSpecific(building, term)).toBe(
            NODE_TYPES.MAIN_LOBBY,
          );
        });
      });

      evBuildings.forEach((building) => {
        it(`should map '${term}' to 'main entrance' for building '${building}'`, () => {
          expect(mapGenericNodeToBuildingSpecific(building, term)).toBe(
            "main entrance",
          );
        });
      });

      otherBuildings.forEach((building) => {
        it(`should map '${term}' to '${NODE_TYPES.MAIN_LOBBY}' (default) for building '${building}'`, () => {
          expect(mapGenericNodeToBuildingSpecific(building, term)).toBe(
            NODE_TYPES.MAIN_LOBBY,
          );
        });
      });
    });
  });

  //--- Tests for resolveEntranceNode ---
  describe("resolveEntranceNode", () => {
    // Special Case: Hall Building, First Floor
    it("should return the first found entrance node for Hall Building 1st floor if available", () => {
      const availableNodes = ["H-101", "Side Entrance", "Main Lobby", "H-102"];
      const result = resolveEntranceNode(
        BUILDINGS.HALL,
        FLOORS.FIRST,
        availableNodes,
      );
      expect(result).toBe("Side Entrance"); // First one found by getEntranceOptions
      expect(consoleLogSpy).toHaveBeenCalledWith(
        "Found entrance node:",
        "Side Entrance",
      );
    });

    it("should fall through and return the first *available* node for Hall 1st floor if NO entrance nodes are found", () => {
      const availableNodes = ["H-101", "Corridor X", "H-102"];
      const result = resolveEntranceNode(
        BUILDINGS.HALL,
        FLOORS.FIRST,
        availableNodes,
      );
      // Falls through to the second block, getEntranceOptions is empty, returns availableNodes[0]
      expect(result).toBe("H-101");
      expect(consoleLogSpy).not.toHaveBeenCalled(); // No entrance found message
    });

    it("should return null and log error if no nodes are available for Hall 1st floor", () => {
      const availableNodes = [];
      const result = resolveEntranceNode(
        BUILDINGS.HALL,
        FLOORS.FIRST,
        availableNodes,
      );
      expect(result).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "No nodes available in floor graph",
      );
      expect(consoleLogSpy).not.toHaveBeenCalled(); // Should not log found entrance
    });

    // General Case: Other buildings/floors
    it("should return the first found entrance node for non-Hall/1st floor if available", () => {
      const availableNodes = [
        "MB-201",
        "Service Elevator",
        "MB-202",
        "main hall",
      ];
      const result = resolveEntranceNode(
        BUILDINGS.MB,
        FLOORS.SECOND,
        availableNodes,
      );
      expect(result).toBe("Service Elevator"); // First one found by getEntranceOptions
      expect(consoleLogSpy).not.toHaveBeenCalled(); // No special logging for non-Hall/1st
    });

    it("should return the first available node for non-Hall/1st floor if NO entrance nodes are found", () => {
      const availableNodes = ["EV-801", "Lab A", "EV-802"];
      const result = resolveEntranceNode(
        BUILDINGS.EV,
        FLOORS.EIGHTH,
        availableNodes,
      );
      expect(result).toBe("EV-801"); // getEntranceOptions is empty, returns availableNodes[0]
      expect(consoleLogSpy).not.toHaveBeenCalled();
    });

    it("should return null and log error if no nodes are available for non-Hall/1st floor", () => {
      const availableNodes = [];
      const result = resolveEntranceNode(
        BUILDINGS.JMSB,
        FLOORS.NINTH,
        availableNodes,
      );
      expect(result).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "No nodes available in floor graph",
      );
    });

    it("should handle Hall building non-first floor like the general case (find entrance)", () => {
      const availableNodes = ["H-801", "H-8 Elevator", "H-802"];
      const result = resolveEntranceNode(
        BUILDINGS.HALL,
        FLOORS.EIGHTH,
        availableNodes,
      );
      expect(result).toBe("H-8 Elevator");
      expect(consoleLogSpy).not.toHaveBeenCalled();
    });

    it("should handle Hall building non-first floor like the general case (no entrance found)", () => {
      const availableNodes = ["H-901", "Office Complex", "H-902"];
      const result = resolveEntranceNode(
        BUILDINGS.HALL,
        FLOORS.NINTH,
        availableNodes,
      );
      expect(result).toBe("H-901");
      expect(consoleLogSpy).not.toHaveBeenCalled();
    });
  });

  //--- Tests for normalizeRoomId ---
  describe("normalizeRoomId", () => {
    // Test entrance term mapping
    it("should map 'entrance' using mapGenericNodeToBuildingSpecific for Hall", () => {
      expect(normalizeRoomId(BUILDINGS.H, "entrance")).toBe(
        NODE_TYPES.MAIN_LOBBY,
      );
    });

    it("should map 'lobby' using mapGenericNodeToBuildingSpecific for MB", () => {
      expect(normalizeRoomId(BUILDINGS.MB, "Lobby")).toBe(NODE_TYPES.MAIN_HALL);
    });

    it("should map 'main entrance' using mapGenericNodeToBuildingSpecific for EV", () => {
      expect(normalizeRoomId(BUILDINGS.EV, "main entrance")).toBe(
        "main entrance",
      );
    });

    it("should map 'Main Lobby' using mapGenericNodeToBuildingSpecific for an unknown building", () => {
      expect(normalizeRoomId("XYZ", "Main Lobby")).toBe(NODE_TYPES.MAIN_LOBBY); // Uses default mapping
    });

    // Test already prefixed rooms
    it("should return roomId as is if it already starts with the building prefix (case-insensitive)", () => {
      expect(normalizeRoomId("H", "H-811")).toBe("H-811");
      expect(normalizeRoomId("MB", "MB-1.293")).toBe("MB-1.293");
      expect(normalizeRoomId("ev", "EV-301")).toBe("EV-301"); // Case insensitive buildingId
      expect(normalizeRoomId("h", "H-100")).toBe("H-100");
    });

    it("should return roomId as is if it starts with building prefix but different case", () => {
      expect(normalizeRoomId("H", "h-811")).toBe("h-811"); // Code checks startswith (case-insensitive) but returns original roomId
      expect(normalizeRoomId("mb", "MB-1.293")).toBe("MB-1.293");
    });

    // Test MB building special cases
    it("should return MB room '1.293' as is", () => {
      expect(normalizeRoomId("MB", "1.293")).toBe("1.293");
      expect(normalizeRoomId("mb", "9.123")).toBe("9.123"); // Case insensitive buildingId
    });

    it("should prefix MB room '4321' with 'MB-'", () => {
      expect(normalizeRoomId("MB", "4321")).toBe("MB-4321");
      expect(normalizeRoomId("mb", "105")).toBe("MB-105"); // Case insensitive buildingId
    });

    it("should prefix MB room 'SomeOffice' with 'MB-' (default MB case)", () => {
      expect(normalizeRoomId("MB", "SomeOffice")).toBe("MB-SomeOffice");
    });

    // Test default prefixing for other buildings
    it("should prefix Hall room '811' with 'H-'", () => {
      expect(normalizeRoomId("H", "811")).toBe("H-811");
      expect(normalizeRoomId("h", "905")).toBe("H-905"); // Prefixes with uppercase H
    });

    it("should prefix EV room '915' with 'EV-'", () => {
      expect(normalizeRoomId("EV", "915")).toBe("EV-915");
      expect(normalizeRoomId("ev", "T10")).toBe("EV-T10"); // Prefixes with uppercase EV
    });

    it("should prefix Library room 'L200' with 'LIBRARY-'", () => {
      // Assuming LIBRARY = 'Library' constant exists and is used, otherwise use the string
      expect(normalizeRoomId(BUILDINGS.LIBRARY, "L200")).toBe("LIBRARY-L200");
      expect(normalizeRoomId("Library", "RefRoom")).toBe("LIBRARY-RefRoom");
    });

    it("should handle building IDs with different cases correctly during prefixing", () => {
      expect(normalizeRoomId("h", "ConfRoom")).toBe("H-ConfRoom"); // Always prefixes uppercase
      expect(normalizeRoomId("Mb", "ConfRoom")).toBe("MB-ConfRoom"); // Special MB case still uses uppercase MB
    });
  });
});
