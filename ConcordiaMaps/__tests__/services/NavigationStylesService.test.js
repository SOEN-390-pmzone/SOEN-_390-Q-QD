import {
  getStepColor,
  getStepIcon,
  formatFloorName,
} from "../../services/NavigationStylesService";

describe("NavigationStylesService", () => {
  describe("getStepColor", () => {
    test("should return green color for start step", () => {
      expect(getStepColor("start")).toBe("#4CAF50");
    });

    test("should return red color for end step", () => {
      expect(getStepColor("end")).toBe("#F44336");
    });

    test("should return blue color for escalator step", () => {
      expect(getStepColor("escalator")).toBe("#2196F3");
    });

    test("should return purple color for elevator step", () => {
      expect(getStepColor("elevator")).toBe("#9C27B0");
    });

    test("should return orange color for stairs step", () => {
      expect(getStepColor("stairs")).toBe("#FF9800");
    });

    test("should return maroon color for default (walk) step", () => {
      expect(getStepColor("walk")).toBe("#912338");
    });

    test("should return maroon color for unknown step types", () => {
      expect(getStepColor("unknown")).toBe("#912338");
    });
  });

  describe("getStepIcon", () => {
    test("should return flag icon for start step", () => {
      expect(getStepIcon("start")).toBe("flag");
    });

    test("should return location-pin icon for end step", () => {
      expect(getStepIcon("end")).toBe("location-pin");
    });

    test("should return git-compare icon for escalator step", () => {
      expect(getStepIcon("escalator")).toBe("git-compare");
    });

    test("should return arrow-up-circle icon for elevator step", () => {
      expect(getStepIcon("elevator")).toBe("arrow-up-circle");
    });

    test("should return layers icon for stairs step", () => {
      expect(getStepIcon("stairs")).toBe("layers");
    });

    test("should return chevron-forward icon for default (walk) step", () => {
      expect(getStepIcon("walk")).toBe("chevron-forward");
    });

    test("should return chevron-forward icon for unknown step types", () => {
      expect(getStepIcon("unknown")).toBe("chevron-forward");
    });
  });

  describe("formatFloorName", () => {
    test("should format tunnel level correctly", () => {
      expect(formatFloorName("T")).toBe("Tunnel Level");
    });

    test("should format ground floor correctly", () => {
      expect(formatFloorName("G")).toBe("Ground Floor");
    });

    test("should format 1st floor correctly", () => {
      expect(formatFloorName("1")).toBe("1st Floor");
    });

    test("should format 2nd floor correctly", () => {
      expect(formatFloorName("2")).toBe("2nd Floor");
    });

    test("should format 3rd floor correctly", () => {
      expect(formatFloorName("3")).toBe("3rd Floor");
    });

    test("should format other floors with th suffix", () => {
      expect(formatFloorName("4")).toBe("4th Floor");
      expect(formatFloorName("11")).toBe("11th Floor");
      expect(formatFloorName("22")).toBe("22th Floor");
    });

    test("should handle non-numeric floor IDs", () => {
      expect(formatFloorName("B1")).toBe("Floor B1");
      expect(formatFloorName("M")).toBe("Floor M");
    });
  });
});
