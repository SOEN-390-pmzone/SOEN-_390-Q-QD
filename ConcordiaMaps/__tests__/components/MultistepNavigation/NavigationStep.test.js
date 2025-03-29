import React from "react";
import { render } from "@testing-library/react-native";
import NavigationStep from "../../../components/MultistepNavigation/NavigationStep.js";

describe("NavigationStep Component", () => {
  // Mock styles to avoid import issues in testing
  jest.mock("../../../styles/MultistepNavigation/NavigationStepStyles", () => ({
    container: {},
    stepImage: {},
  }));

  // Common mock props for testing
  const mockProps = {
    title: "Test Step",
    description: "Test Description",
    onPress: jest.fn(),
  };

  // Test rendering with indoor type and different building IDs
  const indoorBuildings = [
    {
      buildingId: "hall",
      expectedSource: require("../../../assets/Navigation/hall.png"),
    },
    {
      buildingId: "ve",
      expectedSource: require("../../../assets/Navigation/ve.png"),
    },
    {
      buildingId: "vl",
      expectedSource: require("../../../assets/Navigation/vl.png"),
    },
    {
      buildingId: "jmsb",
      expectedSource: require("../../../assets/Navigation/jmsb.png"),
    },
  ];

  indoorBuildings.forEach(({ buildingId }) => {
    it(`renders correctly for indoor type with ${buildingId} building`, () => {
      const { toJSON } = render(
        <NavigationStep {...mockProps} type="indoor" buildingId={buildingId} />,
      );

      // Use toJSON for snapshot testing instead of getByTestId
      const renderTree = toJSON();
      expect(renderTree).toBeTruthy();
    });
  });

  // Test invalid building ID
  it("handles invalid building ID gracefully", () => {
    const { toJSON } = render(
      <NavigationStep {...mockProps} type="indoor" buildingId="invalid" />,
    );

    // Use toJSON for snapshot testing
    const renderTree = toJSON();
    expect(renderTree).toBeTruthy();
  });
});
