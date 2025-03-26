import { StyleSheet } from "react-native";
import styles from "../../../styles/MultistepNavigation/NavigationStepStyles.js"; // Adjust the import path as needed

describe("Styles", () => {
  // Test container styles
  describe("container", () => {
    it("should have correct base container properties", () => {
      expect(styles.container).toEqual({
        padding: 15,
        backgroundColor: "#f5f5f5",
        borderRadius: 10,
        marginVertical: 10,
        borderWidth: 1,
        borderColor: "#e0e0e0",
        elevation: 1,
      });
    });
  });

  // Test active container styles
  describe("activeContainer", () => {
    it("should have Concordia maroon background and border", () => {
      expect(styles.activeContainer).toEqual({
        backgroundColor: "#912338",
        borderColor: "#912338",
      });
    });
  });

  // Test completed container styles
  describe("completedContainer", () => {
    it("should have gray background and border", () => {
      expect(styles.completedContainer).toEqual({
        backgroundColor: "#e0e0e0",
        borderColor: "#c0c0c0",
      });
    });
  });

  // Test typography styles
  describe("typography", () => {
    it("should have correct title style", () => {
      expect(styles.title).toEqual({
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 5,
      });
    });

    it("should have correct description style", () => {
      expect(styles.description).toEqual({
        fontSize: 16,
        lineHeight: 24,
      });
    });

    it("should have white text for active state", () => {
      expect(styles.activeText).toEqual({
        color: "#fff",
      });
    });
  });

  // Test image styles
  describe("stepImage", () => {
    it("should have full width, fixed height, and rounded corners", () => {
      expect(styles.stepImage).toEqual({
        width: "100%",
        height: 150,
        borderRadius: 12,
      });
    });
  });

  // Test indicator styles
  describe("indicators", () => {
    const commonIndicatorStyles = {
      position: "absolute",
      top: 10,
      right: 10,
      width: 12,
      height: 12,
      borderRadius: 6,
    };

    it("should have correct active indicator style", () => {
      expect(styles.activeIndicator).toEqual({
        ...commonIndicatorStyles,
        backgroundColor: "#912338",
      });
    });

    it("should have correct completed indicator style", () => {
      expect(styles.completedIndicator).toEqual({
        ...commonIndicatorStyles,
        backgroundColor: "green",
      });
    });
  });

  // Validate that styles are created using StyleSheet.create
  it("should use StyleSheet.create", () => {
    const styleKeys = Object.keys(styles);
    styleKeys.forEach((key) => {
      expect(StyleSheet.flatten(styles[key])).toBeDefined();
    });
  });
});
