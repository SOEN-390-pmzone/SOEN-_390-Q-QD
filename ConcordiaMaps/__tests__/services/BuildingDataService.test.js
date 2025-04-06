import FloorRegistry from "../../services/BuildingDataService";

// Mock the imports
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

describe("FloorRegistry", () => {
  describe("getBuildings", () => {
    test("returns all buildings as array", () => {
      const buildings = FloorRegistry.getBuildings();
      expect(buildings).toBeInstanceOf(Array);
      expect(buildings.length).toBeGreaterThan(0);
      expect(buildings[0]).toHaveProperty("id");
      expect(buildings[0]).toHaveProperty("name");
      expect(buildings[0]).toHaveProperty("code");
    });
  });

  describe("getAllBuildings", () => {
    test("returns buildings object", () => {
      const buildings = FloorRegistry.getAllBuildings();
      expect(buildings).toBeInstanceOf(Object);
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
      expect(hallFloors).toBeInstanceOf(Array);
      expect(hallFloors.length).toBe(5); // T, 1, 2, 8, 9
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
        "1"
      );
      expect(supportsNav).toBeNull();
    });

    test("returns undefined for invalid floor", () => {
      const supportsNav = FloorRegistry.supportsNavigation(
        "HallBuilding",
        "99"
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

  // Add tests for EV Building
  test("can access EV Building data correctly", () => {
    const evBuilding = FloorRegistry.getBuilding("EVBuilding");
    expect(evBuilding).toBeDefined();
    expect(evBuilding.id).toBe("ev");
    expect(evBuilding.code).toBe("EV");
    expect(evBuilding.address).toBe("1515 St. Catherine W.");

    const evFloors = FloorRegistry.getFloors("EVBuilding");
    expect(evFloors).toHaveLength(2); // Should have T and 1st floor

    // Test tunnel level
    const evTunnel = FloorRegistry.getFloor("EVBuilding", "T");
    expect(evTunnel).toBeDefined();
    expect(evTunnel.name).toBe("Tunnel Level");

    // Test 1st floor
    const ev1 = FloorRegistry.getFloor("EVBuilding", "1");
    expect(ev1).toBeDefined();
    expect(ev1.name).toBe("EV Ground Floor");

    // Get SVG for EV (should return null for now)
    return FloorRegistry.getFloorPlan("EVBuilding", "1").then((svg) => {
      expect(svg).toBeNull();
    });
  });

  // Add tests for Webster Library
  test("can access Webster Library data correctly", () => {
    const libraryBuilding = FloorRegistry.getBuilding("Library");
    expect(libraryBuilding).toBeDefined();
    expect(libraryBuilding.id).toBe("library");
    expect(libraryBuilding.code).toBe("LB");
    expect(libraryBuilding.address).toBe("1400 De Maisonneuve Blvd. W.");

    const libraryFloors = FloorRegistry.getFloors("Library");
    expect(libraryFloors).toHaveLength(2); // Should have T and 1st floor

    // Test navigation support (should be false since rooms/graph are empty)
    const supportsNav = FloorRegistry.supportsNavigation("Library", "1");
    expect(supportsNav).toBe(false);

    // Test floor plan retrieval
    return FloorRegistry.getFloorPlan("Library", "1").then((svg) => {
      expect(svg).toBeNull();
    });
  });
});

// Add tests for tunnel levels and empty room/graph combinations
describe("tunnel levels and special cases", () => {
  test("tunnel level does not support navigation", () => {
    const tunnelSupportsNav = FloorRegistry.supportsNavigation(
      "HallBuilding",
      "T"
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

// Add tests for specific edge cases in FloorRegistry methods
describe("edge cases in FloorRegistry methods", () => {
  test("getSVG returns null for floor without SVG function", () => {
    // Create a mock floor object without getSVG function
    const mockFloor = {
      id: "mock",
      name: "Mock Floor",
    };

    // Create a spy on getFloor to return our mock
    const getFloorSpy = jest.spyOn(FloorRegistry, "getFloor");
    getFloorSpy.mockReturnValueOnce(mockFloor);

    return FloorRegistry.getFloorPlan("JMSB", "mock").then((svg) => {
      expect(svg).toBeNull();
      getFloorSpy.mockRestore();
    });
  });

  test("supportsNavigation edge cases", () => {
    // Test with floor that has rooms but no graph
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
      "test"
    );
    expect(supportsNav1).toBe(false);

    // Test with floor that has graph but no rooms
    const floorWithOnlyGraph = {
      id: "test2",
      name: "Test Floor 2",
      rooms: {},
      graph: { node1: {} },
    };

    getFloorSpy.mockReturnValueOnce(floorWithOnlyGraph);
    const supportsNav2 = FloorRegistry.supportsNavigation(
      "HallBuilding",
      "test2"
    );
    expect(supportsNav2).toBe(false);

    getFloorSpy.mockRestore();
  });

  test("building metadata is accessible", () => {
    // Hall Building metadata
    const hall = FloorRegistry.getBuilding("HallBuilding");
    expect(hall.description).toBe("Main academic building");
    expect(hall.address).toBe("1455 De Maisonneuve Blvd. W.");

    // JMSB metadata
    const jmsb = FloorRegistry.getBuilding("JMSB");
    expect(jmsb.description).toBe("Business school building");
    expect(jmsb.address).toBe("1450 Guy Street");

    // Vanier Extension metadata
    const ve = FloorRegistry.getBuilding("VanierExtension");
    expect(ve.description).toBe("Loyola Vanier Extension");
    expect(ve.address).toBe("7141 Sherbrooke St W");

    // Vanier Library metadata
    const vl = FloorRegistry.getBuilding("VanierLibrary");
    expect(vl.description).toBe("Vanier Library");
    expect(vl.address).toBe("7141 Sherbrooke St W");
  });

  // Test detailed floor descriptions
  test("floor descriptions are accessible", () => {
    // Hall building floors
    const hallT = FloorRegistry.getFloor("HallBuilding", "T");
    expect(hallT.description).toBe("Underground tunnel level");

    const hall1 = FloorRegistry.getFloor("HallBuilding", "1");
    expect(hall1.description).toBe("Main entrance, lobby");

    const hall8 = FloorRegistry.getFloor("HallBuilding", "8");
    expect(hall8.description).toBe("Computer Science department");

    // JMSB floors
    const jmsbT = FloorRegistry.getFloor("JMSB", "T");
    expect(jmsbT.description).toBe("Underground tunnel level");

    const jmsb1 = FloorRegistry.getFloor("JMSB", "1");
    expect(jmsb1.description).toBe("First floor of JMSB");

    const jmsb2 = FloorRegistry.getFloor("JMSB", "S2");
    expect(jmsb2.description).toBe("S2 floor of JMSB");

    // Vanier Library floor
    const vl1 = FloorRegistry.getFloor("VanierLibrary", "1");
    expect(vl1.description).toBe("Main floor of the Vanier Library");
  });

  // Test navigation support across buildings comprehensively
  test("navigation support is evaluated correctly across buildings", () => {
    // JMSB navigation support
    const jmsb1Nav = FloorRegistry.supportsNavigation("JMSB", "1");
    expect(jmsb1Nav).toBe(true);

    const jmsb2Nav = FloorRegistry.supportsNavigation("JMSB", "S2");
    expect(jmsb2Nav).toBe(true);

    const jmsbTNav = FloorRegistry.supportsNavigation("JMSB", "T");
    expect(jmsbTNav).toBe(false);

    // VE navigation support
    const ve1Nav = FloorRegistry.supportsNavigation("VanierExtension", "1");
    expect(ve1Nav).toBe(true);

    const ve2Nav = FloorRegistry.supportsNavigation("VanierExtension", "2");
    expect(ve2Nav).toBe(true);

    // VL navigation support
    const vl1Nav = FloorRegistry.supportsNavigation("VanierLibrary", "1");
    expect(vl1Nav).toBe(true);

    // EV navigation support
    const ev1Nav = FloorRegistry.supportsNavigation("EVBuilding", "1");
    expect(ev1Nav).toBe(false);

    const evTNav = FloorRegistry.supportsNavigation("EVBuilding", "T");
    expect(evTNav).toBe(false);
  });

  // Test SVG retrievals across multiple buildings
  test("SVG plans for all buildings", async () => {
    // JMSB SVGs
    const jmsb1SVG = await FloorRegistry.getFloorPlan("JMSB", "1");
    expect(jmsb1SVG).toBe("<svg>MB Floor 1</svg>");

    const jmsb2SVG = await FloorRegistry.getFloorPlan("JMSB", "S2");
    expect(jmsb2SVG).toBe("<svg>MB Floor 2</svg>");

    // VE SVGs
    const ve1SVG = await FloorRegistry.getFloorPlan("VanierExtension", "1");
    expect(ve1SVG).toBe("<svg>VE Floor 1</svg>");

    const ve2SVG = await FloorRegistry.getFloorPlan("VanierExtension", "2");
    expect(ve2SVG).toBe("<svg>VE Floor 2</svg>");

    // VL SVG
    const vl1SVG = await FloorRegistry.getFloorPlan("VanierLibrary", "1");
    expect(vl1SVG).toBe("<svg>VL Floor 1</svg>");
  });
});

describe("getAllBuildings comprehensive testing", () => {
  test("getAllBuildings returns complete building structure", () => {
    const allBuildings = FloorRegistry.getAllBuildings();

    // Check all expected buildings exist
    expect(allBuildings).toHaveProperty("HallBuilding");
    expect(allBuildings).toHaveProperty("JMSB");
    expect(allBuildings).toHaveProperty("VanierExtension");
    expect(allBuildings).toHaveProperty("VanierLibrary");
    expect(allBuildings).toHaveProperty("EVBuilding");
    expect(allBuildings).toHaveProperty("Library");

    // Check structure of one building fully
    const hall = allBuildings.HallBuilding;
    expect(hall.floors).toHaveProperty("T");
    expect(hall.floors).toHaveProperty("1");
    expect(hall.floors).toHaveProperty("8");
    expect(hall.floors).toHaveProperty("9");

    // Verify floor structure
    expect(hall.floors["1"].rooms).toBeDefined();
    expect(hall.floors["1"].graph).toBeDefined();
    expect(typeof hall.floors["1"].getSVG).toBe("function");
  });
});

describe("edge cases for building-specific features", () => {
  // Test supportsNavigation with a floor that has only a partial graph structure
  test("supportsNavigation with partial data structures", () => {
    const incompleteFloor = {
      id: "partial",
      name: "Partial Floor",
      rooms: { "ROOM-101": { name: "Room 101" } },
      // Graph exists but is empty
      graph: {},
    };

    const getFloorSpy = jest.spyOn(FloorRegistry, "getFloor");
    getFloorSpy.mockReturnValueOnce(incompleteFloor);

    const supportsNav = FloorRegistry.supportsNavigation(
      "TestBuilding",
      "partial"
    );
    expect(supportsNav).toBe(false);

    getFloorSpy.mockRestore();
  });

  // Make sure null check works in supportsNavigation
  test("supportsNavigation null floor handling", () => {
    const getFloorSpy = jest.spyOn(FloorRegistry, "getFloor");
    getFloorSpy.mockReturnValueOnce(null);

    const supportsNav = FloorRegistry.supportsNavigation(
      "TestBuilding",
      "null"
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
      "undefined"
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
    const emptyString = FloorRegistry.findBuildingByName("");
    expect(emptyString).toBeNull();

    const nullValue = FloorRegistry.findBuildingByName(null);
    expect(nullValue).toBeNull();

    const undefinedValue = FloorRegistry.findBuildingByName(undefined);
    expect(undefinedValue).toBeNull();
  });
});
