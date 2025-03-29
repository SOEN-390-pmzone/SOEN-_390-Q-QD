import styles from "../../../styles/MultistepNavigation/NavigationStepStyles";

describe("NavigationStepStyles", () => {
  it("should export a StyleSheet object", () => {
    expect(styles).toBeDefined();
    expect(typeof styles).toBe("object");
  });

  it("should have stepCard style with correct properties", () => {
    expect(styles.stepCard).toBeDefined();
    expect(styles.stepCard.backgroundColor).toBe("#ffffff");
    expect(styles.stepCard.borderRadius).toBe(12);
    expect(styles.stepCard.elevation).toBe(2);
  });

  it("should have properly defined text styles", () => {
    expect(styles.stepTitle.fontSize).toBe(16);
    expect(styles.stepTitle.fontWeight).toBe("bold");
    expect(styles.directionText.fontSize).toBe(15);
    expect(styles.indoorNavButtonText.color).toBe("#fff");
  });

  it("should have consistent styling for containers", () => {
    expect(styles.indoorInfoContainer.backgroundColor).toBe("#f0f0f0");
    expect(styles.directionsContainer.backgroundColor).toBe("#ffffff");
    expect(styles.stepProgressContainer.borderWidth).toBe(1);
  });

  it("should use Concordia brand color for key UI elements", () => {
    const concordiaRed = "#912338";
    expect(styles.indoorNavButton.backgroundColor).toBe(concordiaRed);
    expect(styles.directionNumber.backgroundColor).toBe(concordiaRed);
    expect(styles.expandButtonText.color).toBe(concordiaRed);
  });

  it("should have responsive map styles", () => {
    expect(styles.mapContainer.height).toBe(200);
    expect(styles.mapWrapper.flex).toBe(1);
    expect(styles.mapContainer.overflow).toBe("hidden");
  });

  it("should have proper list styling for directions", () => {
    expect(styles.directionsList.maxHeight).toBe(200);
    expect(styles.directionItem.flexDirection).toBe("row");
    expect(styles.directionItem.borderBottomWidth).toBe(1);
  });
});
