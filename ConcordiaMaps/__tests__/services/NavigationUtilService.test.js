import {
  getEntranceOptions,
  validateNodeExists,
  mapGenericNodeToBuildingSpecific,
  normalizeRoomId,
} from "../../services/NavigationUtilsService";

describe("NavigationUtilsService", () => {
  describe("getEntranceOptions", () => {
    it("should find entrance-related nodes in the nodes list", () => {
      // Arrange
      const nodes = [
        "H801",
        "H820",
        "ENTRANCE-EAST",
        "Main lobby",
        "stairs",
        "elevator",
        "main hall",
        "H-DOOR-101",
        "random-node",
      ];

      // Act
      const result = getEntranceOptions(nodes);

      // Assert
      expect(result).toContain("ENTRANCE-EAST");
      expect(result).toContain("Main lobby");
      expect(result).toContain("elevator");
      expect(result).toContain("main hall");
      expect(result).toContain("H-DOOR-101");
      expect(result).not.toContain("H801");
      expect(result).not.toContain("H820");
      expect(result).not.toContain("random-node");
    });

    it("should return empty array when no entrance nodes are found", () => {
      // Arrange
      const nodes = ["H801", "H820", "random-node"];

      // Act
      const result = getEntranceOptions(nodes);

      // Assert
      expect(result).toEqual([]);
    });

    it("should handle case insensitivity correctly", () => {
      // Arrange
      const nodes = ["MAIN LOBBY", "main Hall", "Entrance", "ELEVATOR"];

      // Act
      const result = getEntranceOptions(nodes);

      // Assert
      expect(result).toEqual([
        "MAIN LOBBY",
        "main Hall",
        "Entrance",
        "ELEVATOR",
      ]);
    });
  });

  describe("validateNodeExists", () => {
    it("should return true if node exists in the graph", () => {
      // Arrange
      const graph = {
        H801: { H803: 1 },
        H803: { H801: 1, H805: 1 },
        H805: { H803: 1 },
      };

      // Act & Assert
      expect(validateNodeExists(graph, "H801")).toBe(true);
      expect(validateNodeExists(graph, "H803")).toBe(true);
      expect(validateNodeExists(graph, "H805")).toBe(true);
    });

    it("should return false if node does not exist in the graph", () => {
      // Arrange
      const graph = {
        H801: { H803: 1 },
        H803: { H801: 1, H805: 1 },
        H805: { H803: 1 },
      };

      // Act & Assert
      expect(validateNodeExists(graph, "H820")).toBe(false);
      expect(validateNodeExists(graph, "Main lobby")).toBe(false);
      expect(validateNodeExists(graph, "")).toBe(false);
    });

    it("should handle empty graph correctly", () => {
      // Arrange
      const graph = {};

      // Act & Assert
      expect(validateNodeExists(graph, "H801")).toBe(false);
    });
  });

  describe("mapGenericNodeToBuildingSpecific", () => {
    it("should map entrance nodes to JMSB specific nodes", () => {
      // Act & Assert
      expect(mapGenericNodeToBuildingSpecific("JMSB", "entrance")).toBe(
        "main hall",
      );
      expect(mapGenericNodeToBuildingSpecific("MB", "main entrance")).toBe(
        "main hall",
      );
      expect(mapGenericNodeToBuildingSpecific("JMSB", "lobby")).toBe(
        "main hall",
      );
      expect(mapGenericNodeToBuildingSpecific("MB", "main lobby")).toBe(
        "main hall",
      );
    });

    it("should map entrance nodes to Hall Building specific nodes", () => {
      // Act & Assert
      expect(mapGenericNodeToBuildingSpecific("HallBuilding", "entrance")).toBe(
        "Main lobby",
      );
      expect(mapGenericNodeToBuildingSpecific("H", "main entrance")).toBe(
        "Main lobby",
      );
      expect(mapGenericNodeToBuildingSpecific("HallBuilding", "lobby")).toBe(
        "Main lobby",
      );
      expect(mapGenericNodeToBuildingSpecific("H", "main lobby")).toBe(
        "Main lobby",
      );
    });

    it("should map entrance nodes to EV Building specific nodes", () => {
      // Act & Assert
      expect(mapGenericNodeToBuildingSpecific("EVBuilding", "entrance")).toBe(
        "main entrance",
      );
      expect(mapGenericNodeToBuildingSpecific("EV", "main lobby")).toBe(
        "main entrance",
      );
    });

    it("should return node as is for non-entrance nodes", () => {
      // Act & Assert
      expect(mapGenericNodeToBuildingSpecific("HallBuilding", "H801")).toBe(
        "H801",
      );
      expect(mapGenericNodeToBuildingSpecific("JMSB", "elevator")).toBe(
        "elevator",
      );
      expect(mapGenericNodeToBuildingSpecific("EV", "stairs")).toBe("stairs");
    });

    it("should use default fallback for unknown building types", () => {
      // Act & Assert
      expect(mapGenericNodeToBuildingSpecific("Unknown", "entrance")).toBe(
        "Main lobby",
      );
      expect(mapGenericNodeToBuildingSpecific("LB", "lobby")).toBe(
        "Main lobby",
      );
    });
  });

  describe("normalizeRoomId", () => {
    it("should return mapped entrance node for entrance-related terms", () => {
      // Act & Assert
      expect(normalizeRoomId("H", "entrance")).toBe("Main lobby");
      expect(normalizeRoomId("MB", "main lobby")).toBe("main hall");
    });

    it("should return room ID as is if it already has building prefix", () => {
      // Act & Assert
      expect(normalizeRoomId("H", "H-801")).toBe("H-801");
      expect(normalizeRoomId("MB", "MB-1.293")).toBe("MB-1.293");
    });

    it("should handle JMSB rooms with floor.room format correctly", () => {
      // Act & Assert
      expect(normalizeRoomId("MB", "1.293")).toBe("1.293");
      expect(normalizeRoomId("MB", "2.210")).toBe("2.210");
    });

    it("should add building prefix to numeric room IDs", () => {
      // Act & Assert
      expect(normalizeRoomId("H", "801")).toBe("H-801");
      expect(normalizeRoomId("MB", "123")).toBe("MB-123");
      expect(normalizeRoomId("EV", "101")).toBe("EV-101");
    });

    it("should add building prefix to other room IDs", () => {
      // Act & Assert
      expect(normalizeRoomId("H", "classroom")).toBe("H-classroom");
      expect(normalizeRoomId("VE", "lab")).toBe("VE-lab");
    });

    it("should handle case insensitivity for building IDs", () => {
      // Act & Assert
      expect(normalizeRoomId("h", "801")).toBe("H-801");
      expect(normalizeRoomId("mb", "123")).toBe("MB-123");
    });
  });
});
