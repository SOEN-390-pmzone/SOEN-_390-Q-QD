import { adjustGraphForAccessibility } from "../../services/AccessibilityGraphUtils";

describe("AccessibilityGraphUtils", () => {
  describe("adjustGraphForAccessibility", () => {
    // Base graph used across both tests
    const baseGraph = {
      A: { B: 1, stairs: 5 },
      B: { A: 1, stairs: 3 },
      stairs: { A: 5, B: 3, C: 2 },
      C: { stairs: 2 },
    };

    test("should remove stairs from graph when avoidStairs is true", () => {
      // Arrange
      const preferences = { avoidStairs: true };

      // Act
      const adjusted = adjustGraphForAccessibility(baseGraph, preferences);

      // Assert
      expect(adjusted).not.toHaveProperty("stairs");
      expect(adjusted.A).not.toHaveProperty("stairs");
      expect(adjusted.B).not.toHaveProperty("stairs");
    });

    test("should not modify graph when avoidStairs is false", () => {
      // Arrange
      const preferences = { avoidStairs: false };

      // Act
      const adjusted = adjustGraphForAccessibility(baseGraph, preferences);

      // Assert
      expect(adjusted).toEqual(baseGraph);
    });
  });
});
