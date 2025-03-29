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

  describe("EVBuilding and Library functionality", () => {
    test("can access EV Building data correctly", () => {
      const evBuilding = FloorRegistry.getBuilding("EVBuilding");
      expect(evBuilding).toBeDefined();
      expect(evBuilding.id).toBe("ev");
      expect(evBuilding.name).toBe("EV Building");
      expect(evBuilding.code).toBe("EV");
      expect(evBuilding.address).toBe("1515 St. Catherine W.");
    });

    test("can access Library data correctly", () => {
      const library = FloorRegistry.getBuilding("Library");
      expect(library).toBeDefined();
      expect(library.id).toBe("library");
      expect(library.name).toBe("Webster Library");
      expect(library.code).toBe("LB");
    });

    test("EV Building has appropriate floors", () => {
      const evFloors = FloorRegistry.getFloors("EVBuilding");
      expect(evFloors).toBeInstanceOf(Array);
      expect(evFloors.length).toBeGreaterThan(0);
      expect(evFloors.some((floor) => floor.id === "T")).toBe(true);
      expect(evFloors.some((floor) => floor.id === "1")).toBe(true);
    });
  });

  describe("building address property", () => {
    test("returns correct address for buildings", () => {
      expect(FloorRegistry.getBuilding("HallBuilding").address).toBe(
        "1455 De Maisonneuve Blvd. W.",
      );
      expect(FloorRegistry.getBuilding("JMSB").address).toBe("1450 Guy Street");
      expect(FloorRegistry.getBuilding("VanierExtension").address).toBe(
        "7141 Sherbrooke St W",
      );
      expect(FloorRegistry.getBuilding("VanierLibrary").address).toBe(
        "7141 Sherbrooke St W",
      );
    });
  });

  describe("edge cases", () => {
    test("handles empty floor id parameter", () => {
      expect(FloorRegistry.getFloor("HallBuilding", "")).toBeUndefined();
      expect(FloorRegistry.getRooms("HallBuilding", "")).toEqual({});
      expect(FloorRegistry.getGraph("HallBuilding", "")).toEqual({});
    });

    test("handles undefined parameters", () => {
      expect(FloorRegistry.getFloor(undefined, "1")).toBeNull();
      expect(FloorRegistry.getFloor("HallBuilding", undefined)).toBeUndefined();
      expect(FloorRegistry.getRooms(undefined, "1")).toEqual({});
      expect(FloorRegistry.getGraph("HallBuilding", undefined)).toEqual({});
    });

    test("handles null parameters", () => {
      expect(FloorRegistry.getFloor(null, "1")).toBeNull();
      expect(FloorRegistry.getRooms(null, "1")).toEqual({});
      expect(FloorRegistry.getGraph("HallBuilding", null)).toEqual({});
    });
  });

  describe("tunnel level navigation", () => {
    test("tunnel level does not support navigation", () => {
      const supportsNav = FloorRegistry.supportsNavigation("HallBuilding", "T");
      expect(supportsNav).toBe(false);
    });

    test("tunnel level returns empty rooms and graph", () => {
      const tunnelRooms = FloorRegistry.getRooms("HallBuilding", "T");
      const tunnelGraph = FloorRegistry.getGraph("HallBuilding", "T");
      expect(tunnelRooms).toEqual({});
      expect(tunnelGraph).toEqual({});
    });
  });

  describe("getFloorPlan error handling", () => {
    test("handles floors with undefined getSVG function", async () => {
      // Mock a floor without getSVG function
      jest.spyOn(FloorRegistry, "getFloor").mockImplementationOnce(() => ({
        id: "mockFloor",
        rooms: {},
        graph: {},
        // No getSVG function
      }));

      const svg = await FloorRegistry.getFloorPlan("MockBuilding", "mockFloor");
      expect(svg).toBeNull();
    });

    test("handles floors with getSVG function that returns undefined", async () => {
      // Mock a floor with getSVG function that returns undefined
      jest.spyOn(FloorRegistry, "getFloor").mockImplementationOnce(() => ({
        id: "mockFloor",
        rooms: {},
        graph: {},
        getSVG: () => undefined,
      }));

      const svg = await FloorRegistry.getFloorPlan("MockBuilding", "mockFloor");
      expect(svg).toBeNull();
    });
  });

  describe("Library building details", () => {
    test("Webster Library has correct building information", () => {
      const library = FloorRegistry.getBuilding("Library");
      expect(library).toBeDefined();
      expect(library.id).toBe("library");
      expect(library.name).toBe("Webster Library");
      expect(library.code).toBe("LB");
      expect(library.description).toBe("Webster Library");
      expect(library.address).toBe("1400 De Maisonneuve Blvd. W.");
    });

    test("Webster Library has appropriate floors", () => {
      const libraryFloors = FloorRegistry.getFloors("Library");
      expect(libraryFloors).toBeInstanceOf(Array);
      expect(libraryFloors.length).toBeGreaterThan(0);
      expect(libraryFloors.some((floor) => floor.id === "T")).toBe(true);
      expect(libraryFloors.some((floor) => floor.id === "1")).toBe(true);
    });

    test("Webster Library floor details are correct", () => {
      const libraryFloor1 = FloorRegistry.getFloor("Library", "1");
      expect(libraryFloor1).toBeDefined();
      expect(libraryFloor1.id).toBe("1");
      expect(libraryFloor1.name).toBe("LB 1st Floor");
      expect(libraryFloor1.description).toBe("Main entrance, circulation desk");
    });
  });

  describe("EV Building details", () => {
    test("EV Building has correct building information", () => {
      const evBuilding = FloorRegistry.getBuilding("EVBuilding");
      expect(evBuilding).toBeDefined();
      expect(evBuilding.id).toBe("ev");
      expect(evBuilding.name).toBe("EV Building");
      expect(evBuilding.code).toBe("EV");
      expect(evBuilding.description).toBe(
        "Engineering, Computer Science and Visual Arts Integrated Complex",
      );
      expect(evBuilding.address).toBe("1515 St. Catherine W.");
    });

    test("EV Building floor details are correct", () => {
      const evFloorT = FloorRegistry.getFloor("EVBuilding", "T");
      expect(evFloorT).toBeDefined();
      expect(evFloorT.id).toBe("T");
      expect(evFloorT.name).toBe("Tunnel Level");
      expect(evFloorT.description).toBe("Underground tunnel level");

      const evFloor1 = FloorRegistry.getFloor("EVBuilding", "1");
      expect(evFloor1).toBeDefined();
      expect(evFloor1.id).toBe("1");
      expect(evFloor1.name).toBe("EV Ground Floor");
      expect(evFloor1.description).toBe("Main entrance, atrium");
    });

    test("EV Building floor plan returns null when no SVG is available", async () => {
      const evFloor1Plan = await FloorRegistry.getFloorPlan("EVBuilding", "1");
      expect(evFloor1Plan).toBeNull();
    });
  });

  describe("buildings with tunnel connections", () => {
    test("multiple buildings have tunnel level floors", () => {
      // Buildings that should have tunnel level
      const buildingsWithTunnels = [
        "HallBuilding",
        "JMSB",
        "EVBuilding",
        "Library",
      ];

      for (const building of buildingsWithTunnels) {
        const floors = FloorRegistry.getFloors(building);
        const hasTunnelLevel = floors.some((floor) => floor.id === "T");
        expect(hasTunnelLevel).toBe(true);
      }
    });

    test("tunnel levels have correct description", () => {
      const tunnelDescription = "Underground tunnel level";

      const hallTunnel = FloorRegistry.getFloor("HallBuilding", "T");
      expect(hallTunnel.description).toBe(tunnelDescription);

      const jmsbTunnel = FloorRegistry.getFloor("JMSB", "T");
      expect(jmsbTunnel.description).toBe(tunnelDescription);

      const evTunnel = FloorRegistry.getFloor("EVBuilding", "T");
      expect(evTunnel.description).toBe(tunnelDescription);
    });
  });

  describe("Loyola campus buildings", () => {
    test("Vanier Library has correct building code and address", () => {
      const vlBuilding = FloorRegistry.getBuilding("VanierLibrary");
      expect(vlBuilding.code).toBe("VL");
      expect(vlBuilding.address).toBe("7141 Sherbrooke St W");
      expect(vlBuilding.description).toBe("Vanier Library");
    });

    test("Vanier Extension has correct building code and address", () => {
      const veBuilding = FloorRegistry.getBuilding("VanierExtension");
      expect(veBuilding.code).toBe("VE");
      expect(veBuilding.address).toBe("7141 Sherbrooke St W");
      expect(veBuilding.description).toBe("Loyola Vanier Extension");
    });

    test("Loyola floors have correct SVG mapping", async () => {
      const ve1Plan = await FloorRegistry.getFloorPlan("VanierExtension", "1");
      expect(ve1Plan).toBe("<svg>VE Floor 1</svg>");

      const vl1Plan = await FloorRegistry.getFloorPlan("VanierLibrary", "1");
      expect(vl1Plan).toBe("<svg>VL Floor 1</svg>");
    });
  });

  describe("comprehensive building comparison", () => {
    test("buildings have consistent property structure", () => {
      const buildings = FloorRegistry.getBuildings();

      // Check that all buildings have required properties
      buildings.forEach((building) => {
        expect(building).toHaveProperty("id");
        expect(building).toHaveProperty("name");
        expect(building).toHaveProperty("code");
        expect(building).toHaveProperty("description");
        expect(building).toHaveProperty("address");
        expect(building).toHaveProperty("floors");

        // Check that id and code are not empty
        expect(building.id.length).toBeGreaterThan(0);
        expect(building.code.length).toBeGreaterThan(0);
      });
    });

    test("getSVG returns appropriate value for floors with and without SVGs", async () => {
      // Test floor with SVG
      const hallFloor1 = FloorRegistry.getFloor("HallBuilding", "1");
      expect(typeof hallFloor1.getSVG).toBe("function");
      expect(await hallFloor1.getSVG()).toBe("<svg>Floor 1</svg>");

      // Test floor without SVG
      const evFloor1 = FloorRegistry.getFloor("EVBuilding", "1");
      expect(typeof evFloor1.getSVG).toBe("function");
      expect(await evFloor1.getSVG()).toBeNull();
    });
  });
});
