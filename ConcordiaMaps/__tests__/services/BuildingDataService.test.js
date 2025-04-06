/* eslint-disable no-unused-vars */
// FloorRegistry.full.test.js

// Mocks for all imported modules
jest.mock("../../constants/coordinates/h1", () => ({
  rooms: { "H-101": { name: "H-101" } },
  graph: { "H-101": { someNode: 5 } },
}));

jest.mock("../../constants/coordinates/h8", () => ({
  rooms: { "H-801": { name: "H-801" } },
  graph: { "H-801": { someNode: 10 } },
}));

jest.mock("../../constants/coordinates/h9", () => ({
  rooms: { "H-901": { name: "H-901" } },
  graph: { "H-901": { someNode: 15 } },
}));

jest.mock("../../constants/coordinates/msb1", () => ({
  rooms: { "MB-1.101": { name: "MB-1.101" } },
  graph: { "MB-1.101": { someNode: 20 } },
}));

jest.mock("../../constants/coordinates/msb2", () => ({
  rooms: { "MB-2.101": { name: "MB-2.101" } },
  graph: { "MB-2.101": { someNode: 25 } },
}));

jest.mock("../../constants/coordinates/ve1", () => ({
  rooms: { "VE-101": { name: "VE-101" } },
  graph: { "VE-101": { someNode: 30 } },
}));

jest.mock("../../constants/coordinates/ve2", () => ({
  rooms: { "VE-201": { name: "VE-201" } },
  graph: { "VE-201": { someNode: 35 } },
}));

jest.mock("../../constants/coordinates/vl1", () => ({
  rooms: { "VL-101": { name: "VL-101" } },
  graph: { "VL-101": { someNode: 40 } },
}));

jest.mock("../../assets/svg/SVGtoString", () => ({
  floor1SVG: "<svg>Floor 1</svg>",
  floor8SVG: "<svg>Floor 8</svg>",
  floor9SVG: "<svg>Floor 9</svg>",
  MBfloor1SVG: "<svg>MB Floor 1</svg>",
  MBfloor2SVG: "<svg>MB Floor 2</svg>",
  VEfloor1SVG: "<svg>VE Floor 1</svg>",
  VEfloor2SVG: "<svg>VE Floor 2</svg>",
  VLfloor1SVG: "<svg>VL Floor 1</svg>",
}));

import FloorRegistry, {
  CONCORDIA_BUILDINGS,
} from "../../services/BuildingDataService";

// =====================
// Existing tests
// =====================

describe("FloorRegistry - existing tests", () => {
  describe("getBuildings", () => {
    test("returns all buildings as array", () => {
      const buildings = FloorRegistry.getBuildings();
      expect(Array.isArray(buildings)).toBe(true);
      expect(buildings.length).toBeGreaterThan(0);
      expect(buildings[0]).toHaveProperty("id");
      expect(buildings[0]).toHaveProperty("name");
      expect(buildings[0]).toHaveProperty("code");
    });
  });

  describe("getAllBuildings", () => {
    test("returns buildings object", () => {
      const buildings = FloorRegistry.getAllBuildings();
      expect(typeof buildings).toBe("object");
      expect(buildings).toHaveProperty("HallBuilding");
      expect(buildings).toHaveProperty("JMSB");
      expect(buildings).toHaveProperty("VanierExtension");
    });
  });

  describe("getBuilding", () => {
    test("returns correct building data for valid building type", () => {
      const hallBuilding = FloorRegistry.getBuilding("HallBuilding");
      expect(hallBuilding).toBeDefined();
      expect(hallBuilding.id).toBe("hall");
      expect(hallBuilding.name).toBe("Hall Building");
      expect(hallBuilding.code).toBe("H");
    });

    test("returns undefined for invalid building type", () => {
      const invalidBuilding = FloorRegistry.getBuilding("InvalidBuilding");
      expect(invalidBuilding).toBeUndefined();
    });
  });

  describe("getFloors", () => {
    test("returns all floors for a valid building type", () => {
      const hallFloors = FloorRegistry.getFloors("HallBuilding");
      expect(Array.isArray(hallFloors)).toBe(true);
      expect(hallFloors.length).toBe(5); // T, 1, 8, 9
      expect(hallFloors[0]).toHaveProperty("id");
      expect(hallFloors[0]).toHaveProperty("name");
      expect(hallFloors[0]).toHaveProperty("description");
    });

    test("returns empty array for invalid building type", () => {
      const invalidFloors = FloorRegistry.getFloors("InvalidBuilding");
      expect(invalidFloors).toEqual([]);
    });
  });

  describe("getFloor", () => {
    test("returns specific floor data for valid building and floor", () => {
      const floor8 = FloorRegistry.getFloor("HallBuilding", "8");
      expect(floor8).toBeDefined();
      expect(floor8.id).toBe("8");
      expect(floor8.name).toBe("8th Floor");
      expect(floor8.description).toBe("Computer Science department");
    });

    test("returns null for invalid building type", () => {
      const invalidFloor = FloorRegistry.getFloor("InvalidBuilding", "1");
      expect(invalidFloor).toBeNull();
    });

    test("returns undefined for invalid floor in valid building", () => {
      const invalidFloor = FloorRegistry.getFloor("HallBuilding", "99");
      expect(invalidFloor).toBeUndefined();
    });
  });

  describe("getRooms", () => {
    test("returns rooms for valid building and floor", () => {
      const rooms = FloorRegistry.getRooms("HallBuilding", "1");
      expect(rooms).toEqual({ "H-101": { name: "H-101" } });
    });

    test("returns empty object for invalid building", () => {
      const rooms = FloorRegistry.getRooms("InvalidBuilding", "1");
      expect(rooms).toEqual({});
    });

    test("returns empty object for invalid floor", () => {
      const rooms = FloorRegistry.getRooms("HallBuilding", "99");
      expect(rooms).toEqual({});
    });
  });

  describe("getGraph", () => {
    test("returns graph for valid building and floor", () => {
      const graph = FloorRegistry.getGraph("HallBuilding", "1");
      expect(graph).toEqual({ "H-101": { someNode: 5 } });
    });

    test("returns empty object for invalid building", () => {
      const graph = FloorRegistry.getGraph("InvalidBuilding", "1");
      expect(graph).toEqual({});
    });

    test("returns empty object for invalid floor", () => {
      const graph = FloorRegistry.getGraph("HallBuilding", "99");
      expect(graph).toEqual({});
    });
  });

  describe("getFloorPlan", () => {
    test("returns SVG content for valid building and floor", async () => {
      const svg = await FloorRegistry.getFloorPlan("HallBuilding", "1");
      expect(svg).toBe("<svg>Floor 1</svg>");
    });

    test("returns null for invalid building", async () => {
      const svg = await FloorRegistry.getFloorPlan("InvalidBuilding", "1");
      expect(svg).toBeNull();
    });

    test("returns null for invalid floor", async () => {
      const svg = await FloorRegistry.getFloorPlan("HallBuilding", "99");
      expect(svg).toBeNull();
    });

    test("returns null for floor without SVG", async () => {
      // Tunnel level doesn't have an SVG
      const svg = await FloorRegistry.getFloorPlan("HallBuilding", "T");
      expect(svg).toBeNull();
    });
  });

  describe("supportsNavigation", () => {
    test("returns true for floor with rooms and graph data", () => {
      const supportsNav = FloorRegistry.supportsNavigation("HallBuilding", "1");
      expect(supportsNav).toBe(true);
    });

    test("returns false for floor without rooms or graph data", () => {
      // Tunnel level has empty rooms and graph
      const supportsNav = FloorRegistry.supportsNavigation("HallBuilding", "T");
      expect(supportsNav).toBe(false);
    });

    test("returns null for invalid building", () => {
      const supportsNav = FloorRegistry.supportsNavigation(
        "InvalidBuilding",
        "1",
      );
      expect(supportsNav).toBeNull();
    });

    test("returns undefined for invalid floor", () => {
      const supportsNav = FloorRegistry.supportsNavigation(
        "HallBuilding",
        "99",
      );
      expect(supportsNav).toBeUndefined();
    });
  });

  describe("different building types", () => {
    test("can access JMSB data correctly", () => {
      const jmsbBuilding = FloorRegistry.getBuilding("JMSB");
      expect(jmsbBuilding.id).toBe("jmsb");
      expect(jmsbBuilding.code).toBe("MB");

      const jmsbRooms = FloorRegistry.getRooms("JMSB", "1");
      expect(jmsbRooms).toEqual({ "MB-1.101": { name: "MB-1.101" } });
    });

    test("can access Vanier Extension data correctly", () => {
      const veBuilding = FloorRegistry.getBuilding("VanierExtension");
      expect(veBuilding.id).toBe("ve");
      expect(veBuilding.code).toBe("VE");

      const veRooms = FloorRegistry.getRooms("VanierExtension", "2");
      expect(veRooms).toEqual({ "VE-201": { name: "VE-201" } });
    });

    test("can access Vanier Library data correctly", () => {
      const vlBuilding = FloorRegistry.getBuilding("VanierLibrary");
      expect(vlBuilding.id).toBe("vanierlibrary");
      expect(vlBuilding.code).toBe("VL");

      const vlRooms = FloorRegistry.getRooms("VanierLibrary", "1");
      expect(vlRooms).toEqual({ "VL-101": { name: "VL-101" } });
    });
  });

  test("can access EV Building data correctly", () => {
    const evBuilding = FloorRegistry.getBuilding("EVBuilding");
    expect(evBuilding).toBeDefined();
    expect(evBuilding.id).toBe("ev");
    expect(evBuilding.code).toBe("EV");
    expect(evBuilding.address).toBe("1515 St. Catherine W.");

    const evFloors = FloorRegistry.getFloors("EVBuilding");
    expect(evFloors).toHaveLength(2); // T and 1

    const evTunnel = FloorRegistry.getFloor("EVBuilding", "T");
    expect(evTunnel).toBeDefined();
    expect(evTunnel.name).toBe("Tunnel Level");

    const ev1 = FloorRegistry.getFloor("EVBuilding", "1");
    expect(ev1).toBeDefined();
    expect(ev1.name).toBe("EV Ground Floor");

    return FloorRegistry.getFloorPlan("EVBuilding", "1").then((svg) => {
      expect(svg).toBeNull();
    });
  });

  test("can access Webster Library data correctly", () => {
    const libraryBuilding = FloorRegistry.getBuilding("Library");
    expect(libraryBuilding).toBeDefined();
    expect(libraryBuilding.id).toBe("library");
    expect(libraryBuilding.code).toBe("LB");
    expect(libraryBuilding.address).toBe("1400 De Maisonneuve Blvd. W.");

    const libraryFloors = FloorRegistry.getFloors("Library");
    expect(libraryFloors).toHaveLength(2);

    const supportsNav = FloorRegistry.supportsNavigation("Library", "1");
    expect(supportsNav).toBe(false);

    return FloorRegistry.getFloorPlan("Library", "1").then((svg) => {
      expect(svg).toBeNull();
    });
  });
});

describe("tunnel levels and special cases", () => {
  test("tunnel level does not support navigation", () => {
    const tunnelSupportsNav = FloorRegistry.supportsNavigation(
      "HallBuilding",
      "T",
    );
    expect(tunnelSupportsNav).toBe(false);
  });

  test("can get empty floor plans for tunnel levels", async () => {
    const tunnelSVG = await FloorRegistry.getFloorPlan("HallBuilding", "T");
    expect(tunnelSVG).toBeNull();

    const jmsbTunnelSVG = await FloorRegistry.getFloorPlan("JMSB", "T");
    expect(jmsbTunnelSVG).toBeNull();
  });

  test("can get tunnel floor information", () => {
    const tunnelFloor = FloorRegistry.getFloor("HallBuilding", "T");
    expect(tunnelFloor).toBeDefined();
    expect(tunnelFloor.name).toBe("Tunnel Level");
    expect(tunnelFloor.description).toBe("Underground tunnel level");
  });
});

describe("edge cases in FloorRegistry methods", () => {
  test("getSVG returns null for floor without getSVG function", () => {
    const mockFloor = { id: "mock", name: "Mock Floor" };
    const getFloorSpy = jest.spyOn(FloorRegistry, "getFloor");
    getFloorSpy.mockReturnValueOnce(mockFloor);
    return FloorRegistry.getFloorPlan("JMSB", "mock").then((svg) => {
      expect(svg).toBeNull();
      getFloorSpy.mockRestore();
    });
  });

  test("supportsNavigation edge cases", () => {
    const floorWithOnlyRooms = {
      id: "test",
      name: "Test Floor",
      rooms: { "TEST-101": {} },
      graph: {},
    };
    const getFloorSpy = jest.spyOn(FloorRegistry, "getFloor");
    getFloorSpy.mockReturnValueOnce(floorWithOnlyRooms);
    const supportsNav1 = FloorRegistry.supportsNavigation(
      "HallBuilding",
      "test",
    );
    expect(supportsNav1).toBe(false);

    const floorWithOnlyGraph = {
      id: "test2",
      name: "Test Floor 2",
      rooms: {},
      graph: { node1: {} },
    };
    getFloorSpy.mockReturnValueOnce(floorWithOnlyGraph);
    const supportsNav2 = FloorRegistry.supportsNavigation(
      "HallBuilding",
      "test2",
    );
    expect(supportsNav2).toBe(false);
    getFloorSpy.mockRestore();
  });

  test("building metadata is accessible", () => {
    const hall = FloorRegistry.getBuilding("HallBuilding");
    expect(hall.description).toBe("Main academic building");
    expect(hall.address).toBe("1455 De Maisonneuve Blvd. W.");

    const jmsb = FloorRegistry.getBuilding("JMSB");
    expect(jmsb.description).toBe("Business school building");
    expect(jmsb.address).toBe("1450 Guy Street");

    const ve = FloorRegistry.getBuilding("VanierExtension");
    expect(ve.description).toBe("Loyola Vanier Extension");
    expect(ve.address).toBe("7141 Sherbrooke St W");

    const vl = FloorRegistry.getBuilding("VanierLibrary");
    expect(vl.description).toBe("Vanier Library");
    expect(vl.address).toBe("7141 Sherbrooke St W");
  });

  test("floor descriptions are accessible", () => {
    const hallT = FloorRegistry.getFloor("HallBuilding", "T");
    expect(hallT.description).toBe("Underground tunnel level");

    const hall1 = FloorRegistry.getFloor("HallBuilding", "1");
    expect(hall1.description).toBe("Main entrance, lobby");

    const hall8 = FloorRegistry.getFloor("HallBuilding", "8");
    expect(hall8.description).toBe("Computer Science department");

    const jmsbT = FloorRegistry.getFloor("JMSB", "T");
    expect(jmsbT.description).toBe("Underground tunnel level");

    const jmsb1 = FloorRegistry.getFloor("JMSB", "1");
    expect(jmsb1.description).toBe("First floor of JMSB");

    const jmsb2 = FloorRegistry.getFloor("JMSB", "S2");
    expect(jmsb2.description).toBe("S2 floor of JMSB");

    const vl1 = FloorRegistry.getFloor("VanierLibrary", "1");
    expect(vl1.description).toBe("Main floor of the Vanier Library");
  });

  test("navigation support is evaluated correctly across buildings", () => {
    expect(FloorRegistry.supportsNavigation("JMSB", "1")).toBe(true);
    expect(FloorRegistry.supportsNavigation("JMSB", "S2")).toBe(true);
    expect(FloorRegistry.supportsNavigation("JMSB", "T")).toBe(false);
    expect(FloorRegistry.supportsNavigation("VanierExtension", "1")).toBe(true);
    expect(FloorRegistry.supportsNavigation("VanierExtension", "2")).toBe(true);
    expect(FloorRegistry.supportsNavigation("VanierLibrary", "1")).toBe(true);
    expect(FloorRegistry.supportsNavigation("EVBuilding", "1")).toBe(false);
    expect(FloorRegistry.supportsNavigation("EVBuilding", "T")).toBe(false);
  });

  test("SVG plans for all buildings", async () => {
    const jmsb1SVG = await FloorRegistry.getFloorPlan("JMSB", "1");
    expect(jmsb1SVG).toBe("<svg>MB Floor 1</svg>");

    const jmsb2SVG = await FloorRegistry.getFloorPlan("JMSB", "S2");
    expect(jmsb2SVG).toBe("<svg>MB Floor 2</svg>");

    const ve1SVG = await FloorRegistry.getFloorPlan("VanierExtension", "1");
    expect(ve1SVG).toBe("<svg>VE Floor 1</svg>");

    const ve2SVG = await FloorRegistry.getFloorPlan("VanierExtension", "2");
    expect(ve2SVG).toBe("<svg>VE Floor 2</svg>");

    const vl1SVG = await FloorRegistry.getFloorPlan("VanierLibrary", "1");
    expect(vl1SVG).toBe("<svg>VL Floor 1</svg>");
  });
});

describe("getAllBuildings comprehensive testing", () => {
  test("getAllBuildings returns complete building structure", () => {
    const allBuildings = FloorRegistry.getAllBuildings();
    expect(allBuildings).toHaveProperty("HallBuilding");
    expect(allBuildings).toHaveProperty("JMSB");
    expect(allBuildings).toHaveProperty("VanierExtension");
    expect(allBuildings).toHaveProperty("VanierLibrary");
    expect(allBuildings).toHaveProperty("EVBuilding");
    expect(allBuildings).toHaveProperty("Library");

    const hall = allBuildings.HallBuilding;
    expect(hall.floors).toHaveProperty("T");
    expect(hall.floors).toHaveProperty("1");
    expect(hall.floors).toHaveProperty("8");
    expect(hall.floors).toHaveProperty("9");

    expect(hall.floors["1"].rooms).toBeDefined();
    expect(hall.floors["1"].graph).toBeDefined();
    expect(typeof hall.floors["1"].getSVG).toBe("function");
  });
});

describe("edge cases for building-specific features", () => {
  test("supportsNavigation with partial data structures", () => {
    const incompleteFloor = {
      id: "partial",
      name: "Partial Floor",
      rooms: { "ROOM-101": { name: "Room 101" } },
      graph: {},
    };
    const getFloorSpy = jest.spyOn(FloorRegistry, "getFloor");
    getFloorSpy.mockReturnValueOnce(incompleteFloor);
    const supportsNav = FloorRegistry.supportsNavigation(
      "TestBuilding",
      "partial",
    );
    expect(supportsNav).toBe(false);
    getFloorSpy.mockRestore();
  });

  test("supportsNavigation null floor handling", () => {
    const getFloorSpy = jest.spyOn(FloorRegistry, "getFloor");
    getFloorSpy.mockReturnValueOnce(null);
    const supportsNav = FloorRegistry.supportsNavigation(
      "TestBuilding",
      "null",
    );
    expect(supportsNav).toBeNull();
    getFloorSpy.mockRestore();
  });

  test("supportsNavigation with undefined properties", () => {
    const undefinedPropsFloor = {
      id: "undefined",
      name: "Undefined Props Floor",
      rooms: {},
      graph: {},
    };
    const getFloorSpy = jest.spyOn(FloorRegistry, "getFloor");
    getFloorSpy.mockReturnValueOnce(undefinedPropsFloor);
    const supportsNav = FloorRegistry.supportsNavigation(
      "TestBuilding",
      "undefined",
    );
    expect(supportsNav).toBe(false);
    getFloorSpy.mockRestore();
  });
});

describe("findBuildingByName", () => {
  test("returns building data when given an exact building name", () => {
    const building = FloorRegistry.findBuildingByName("Hall Building");
    expect(building).toBeDefined();
    expect(building.id).toBe("hall");
    expect(building.code).toBe("H");
  });

  test("returns building data when given a partial building name", () => {
    const hallBuilding = FloorRegistry.findBuildingByName("Hall");
    expect(hallBuilding).toBeDefined();
    expect(hallBuilding.id).toBe("hall");

    const jmsbBuilding = FloorRegistry.findBuildingByName("John Molson");
    expect(jmsbBuilding).toBeDefined();
    expect(jmsbBuilding.id).toBe("jmsb");
  });

  test("returns building data when using different case", () => {
    const building = FloorRegistry.findBuildingByName("hall building");
    expect(building).toBeDefined();
    expect(building.id).toBe("hall");
  });

  test("returns building when given a building code", () => {
    const hallBuilding = FloorRegistry.findBuildingByName("H");
    expect(hallBuilding).toBeDefined();
    expect(hallBuilding.code).toBe("H");

    const jmsbBuilding = FloorRegistry.findBuildingByName("MB");
    expect(jmsbBuilding).toBeDefined();
    expect(jmsbBuilding.code).toBe("MB");
  });

  test("returns null when given an invalid building name", () => {
    const building = FloorRegistry.findBuildingByName("Unknown Building");
    expect(building).toBeNull();
  });

  test("returns null when given empty input", () => {
    expect(FloorRegistry.findBuildingByName("")).toBeNull();
    expect(FloorRegistry.findBuildingByName(null)).toBeNull();
    expect(FloorRegistry.findBuildingByName(undefined)).toBeNull();
  });
});

// =====================
// Additional tests to hit remaining branches
// =====================

describe("Additional tests for remaining branches", () => {
  describe("parseRoomFormat", () => {
    test("should parse valid room format", () => {
      const result = FloorRegistry.parseRoomFormat("H-920");
      expect(result).toEqual({
        buildingCode: "H",
        roomNumber: "920",
        formatted: "H-920",
      });
    });
    test("should return null for invalid format", () => {
      expect(FloorRegistry.parseRoomFormat("invalid")).toBeNull();
    });
  });

  describe("findBuildingByCode", () => {
    test("should return building for valid code", () => {
      const building = FloorRegistry.findBuildingByCode("H");
      expect(building).toBeDefined();
      expect(building.name).toBe("Hall Building");
    });
    test("should be case insensitive", () => {
      const building = FloorRegistry.findBuildingByCode("h");
      expect(building).toBeDefined();
      expect(building.name).toBe("Hall Building");
    });
    test("should return undefined for invalid code", () => {
      expect(FloorRegistry.findBuildingByCode("XYZ")).toBeUndefined();
    });
  });

  describe("filterBuildingSuggestions", () => {
    test("should filter suggestions based on building name or id", () => {
      const suggestions = FloorRegistry.filterBuildingSuggestions("Hall");
      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions[0].name).toContain("Hall");
    });
    test("should return empty array when no suggestions match", () => {
      const suggestions =
        FloorRegistry.filterBuildingSuggestions("Nonexistent");
      expect(suggestions).toEqual([]);
    });
  });

  describe("getAddressByID", () => {
    test("should return address for valid building id", () => {
      expect(FloorRegistry.getAddressByID("H")).toBe(
        "1455 De Maisonneuve Blvd. Ouest",
      );
    });
    test("should return null for invalid building id", () => {
      expect(FloorRegistry.getAddressByID("XYZ")).toBeNull();
    });
  });

  describe("getBuildingTypeFromId", () => {
    test("should return default 'HallBuilding' when buildingId is falsy", () => {
      expect(FloorRegistry.getBuildingTypeFromId("")).toBe("HallBuilding");
      expect(FloorRegistry.getBuildingTypeFromId(null)).toBe("HallBuilding");
      expect(FloorRegistry.getBuildingTypeFromId(undefined)).toBe(
        "HallBuilding",
      );
    });
    test("should return correct type for direct mappings", () => {
      expect(FloorRegistry.getBuildingTypeFromId("MB")).toBe("JMSB");
      expect(FloorRegistry.getBuildingTypeFromId("HALL")).toBe("HallBuilding");
      expect(FloorRegistry.getBuildingTypeFromId("VE")).toBe("VanierExtension");
    });
    test("should return default if not found in direct mappings or registry", () => {
      expect(FloorRegistry.getBuildingTypeFromId("UNKNOWN")).toBe(
        "HallBuilding",
      );
    });
  });

  describe("extractFloorFromRoom", () => {
    test("should return '1' for common room types", () => {
      expect(FloorRegistry.extractFloorFromRoom("elevator")).toBe("1");
      expect(FloorRegistry.extractFloorFromRoom("stairs")).toBe("1");
    });
    test("should extract floor for MB-S2 format", () => {
      expect(FloorRegistry.extractFloorFromRoom("MB-S2.230")).toBe("S2");
    });
    test("should extract floor for Hall Building rooms", () => {
      expect(FloorRegistry.extractFloorFromRoom("H-920")).toBe("9");
      expect(FloorRegistry.extractFloorFromRoom("H920")).toBe("9");
    });
    test("should extract floor for MB/JMSB rooms", () => {
      expect(FloorRegistry.extractFloorFromRoom("MB-1.293")).toBe("1");
      expect(FloorRegistry.extractFloorFromRoom("1.293")).toBe("1");
    });
    test("should extract floor for general format", () => {
      expect(FloorRegistry.extractFloorFromRoom("VE-101")).toBe("1");
    });
    test("should return default floor '1' if no match", () => {
      expect(FloorRegistry.extractFloorFromRoom("XYZ")).toBe("1");
    });
  });

  describe("normalizeRoomId", () => {
    test("should return 'Main lobby' for entrance variants", () => {
      expect(FloorRegistry.normalizeRoomId("main entrance")).toBe("Main lobby");
      expect(FloorRegistry.normalizeRoomId("lobby")).toBe("Main lobby");
    });
    test("should normalize H-903 to H903", () => {
      expect(FloorRegistry.normalizeRoomId("H-903")).toBe("H903");
    });
    test("should normalize MB-1.293 to 1.293", () => {
      expect(FloorRegistry.normalizeRoomId("MB-1.293")).toBe("1.293");
    });
    test("should normalize MB-S2.230 to S2.230", () => {
      expect(FloorRegistry.normalizeRoomId("MB-S2.230")).toBe("S2.230");
    });
    test("should normalize MB-1-293 to 1.293", () => {
      expect(FloorRegistry.normalizeRoomId("MB-1-293")).toBe("1.293");
    });
    test("should normalize VE-191 to 191", () => {
      expect(FloorRegistry.normalizeRoomId("VE-191")).toBe("191");
    });
    test("should normalize VL-101 to 101", () => {
      expect(FloorRegistry.normalizeRoomId("VL-101")).toBe("101");
    });
    test("should return special room type for strings containing stairs", () => {
      expect(FloorRegistry.normalizeRoomId("extra stairs here")).toBe("stairs");
    });
    test("should fallback to default normalization", () => {
      expect(FloorRegistry.normalizeRoomId("AB-123")).toBe(
        "AB123".toUpperCase(),
      );
    });
  });
});
