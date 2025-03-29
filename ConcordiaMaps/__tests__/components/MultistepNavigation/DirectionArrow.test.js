import React from "react";
import { render } from "@testing-library/react-native";
// import { Ionicons } from '@expo/vector-icons';
import DirectionArrow from "../../../components/MultistepNavigation/DirectionArrow"; // Adjust import path as needed

// Mock the Ionicons component
jest.mock("@expo/vector-icons", () => ({
  Ionicons: () => null, // Return a simple null component for testing
}));

describe("DirectionArrow Component", () => {
  it("renders correctly", () => {
    const { getByTestId } = render(<DirectionArrow />);

    const directionArrowContainer = getByTestId("direction-arrow-container");
    expect(directionArrowContainer).toBeTruthy();
  });

  it("matches snapshot", () => {
    const { toJSON } = render(<DirectionArrow />);

    expect(toJSON()).toMatchSnapshot();
  });
});
