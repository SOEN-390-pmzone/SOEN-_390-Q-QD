import styles from "../../../styles/MultistepNavigation/DirectionArrowStyles.js"; // Adjust the import path as needed

describe("Styles Test Suite", () => {
  describe("container style", () => {
    it("should have center aligned items", () => {
      expect(styles.container.alignItems).toBe("center");
    });

    it("should have vertical padding of 8", () => {
      expect(styles.container.paddingVertical).toBe(8);
    });
  });

  describe("icon style", () => {
    it("should have correct text shadow color", () => {
      expect(styles.icon.textShadowColor).toBe("rgba(0, 0, 0, 0.2)");
    });

    it("should have correct text shadow offset", () => {
      expect(styles.icon.textShadowOffset).toEqual({ width: 1, height: 1 });
    });

    it("should have correct text shadow radius", () => {
      expect(styles.icon.textShadowRadius).toBe(1);
    });
  });
});
