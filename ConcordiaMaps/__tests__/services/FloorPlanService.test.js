import { generateFloorHtml } from "../../services/FloorPlanService";

describe("FloorPlanService", () => {
  describe("generateFloorHtml", () => {
    test("should generate HTML with SVG content when floor plan is provided", () => {
      // Arrange
      const mockFloorPlan = '<svg width="100" height="100"></svg>';
      const mockPathNodes = [];
      const mockRooms = {};

      // Act
      const result = generateFloorHtml(mockFloorPlan, mockPathNodes, mockRooms);

      // Assert
      expect(result).toContain("<!DOCTYPE html>");
      expect(result).toContain(mockFloorPlan);
      expect(result).toContain("svg-container");
      expect(result).toContain("navigation-path");
    });

    test("should include fallback content when no floor plan is provided", () => {
      // Arrange
      const mockFloorPlan = null;
      const mockPathNodes = [];
      const mockRooms = {};

      // Act
      const result = generateFloorHtml(mockFloorPlan, mockPathNodes, mockRooms);

      // Assert
      expect(result).toContain("No SVG loaded");
    });

    test("should include path data when path nodes are provided", () => {
      // Arrange
      const mockFloorPlan = '<svg width="100" height="100"></svg>';
      const mockPathNodes = ["room1", "room2", "room3"];
      const mockRooms = {
        room1: {
          nearestPoint: { x: "10", y: "20" },
        },
        room2: {
          nearestPoint: { x: "30", y: "40" },
        },
        room3: {
          nearestPoint: { x: "50", y: "60" },
        },
      };

      // Act
      const result = generateFloorHtml(mockFloorPlan, mockPathNodes, mockRooms);

      // Assert
      expect(result).toContain(
        JSON.stringify(mockPathNodes.map((node) => mockRooms[node])),
      );
    });

    test("should filter out invalid path nodes", () => {
      // Arrange
      const mockFloorPlan = '<svg width="100" height="100"></svg>';
      const mockPathNodes = ["room1", "invalidRoom", "room3"];
      const mockRooms = {
        room1: {
          nearestPoint: { x: "10", y: "20" },
        },
        room3: {
          nearestPoint: { x: "50", y: "60" },
        },
      };

      // Act
      const result = generateFloorHtml(mockFloorPlan, mockPathNodes, mockRooms);

      // Assert
      const expectedPathCoordinates = [mockRooms.room1, mockRooms.room3];
      expect(result).toContain(JSON.stringify(expectedPathCoordinates));
      expect(result).not.toContain('"invalidRoom"');
    });

    test("should handle empty path nodes", () => {
      // Arrange
      const mockFloorPlan = '<svg width="100" height="100"></svg>';
      const mockPathNodes = [];
      const mockRooms = {
        room1: {
          nearestPoint: { x: "10", y: "20" },
        },
      };

      // Act
      const result = generateFloorHtml(mockFloorPlan, mockPathNodes, mockRooms);

      // Assert
      expect(result).toContain("[]"); // Empty path data JSON
    });

    test("should include all necessary script functions", () => {
      // Arrange
      const mockFloorPlan = '<svg width="100" height="100"></svg>';

      // Act
      const result = generateFloorHtml(mockFloorPlan);

      // Assert
      expect(result).toContain("function initializeSVG()");
      expect(result).toContain("function visualizePath(coordinates)");
      expect(result).toContain("document.addEventListener('DOMContentLoaded'");
      expect(result).toContain("window.addEventListener('resize'");
    });

    test("should include all required CSS styles", () => {
      // Arrange
      const mockFloorPlan = '<svg width="100" height="100"></svg>';

      // Act
      const result = generateFloorHtml(mockFloorPlan);

      // Assert
      expect(result).toContain(".navigation-path");
      expect(result).toContain(".room-highlight");
      expect(result).toContain("#loader");
      expect(result).toContain("@keyframes spin");
      expect(result).toContain("@keyframes dash");
    });
  });
});
