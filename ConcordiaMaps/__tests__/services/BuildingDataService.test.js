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
      expect(hallFloors.length).toBe(4); // T, 1, 8, 9
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
});
