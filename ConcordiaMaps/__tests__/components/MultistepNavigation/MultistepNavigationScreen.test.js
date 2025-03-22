import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import MultistepNavigationScreen from "../../../components/MultistepNavigation/MultistepNavigationScreen";
import NavigationStrategyService from "../../../services/NavigationStrategyService";

// Mock dependencies
jest.mock("@react-navigation/native", () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
  }),
}));

jest.mock("../../../services/NavigationStrategyService", () => ({
  navigateToStep: jest.fn(),
}));

jest.mock("../../../components/Header", () => "Header");
jest.mock("../../../components/NavBar", () => "NavBar");
jest.mock("../../../components/MultistepNavigation/NavigationStep", () => {
  const React = require("react");
  const { TouchableOpacity, Text } = require("react-native");

  return ({ title, description, type, buildingId, onPress }) => (
    <TouchableOpacity
      onPress={onPress}
      testID={`step-${title.replace(/\s+/g, "-").toLowerCase()}`}
    >
      <Text testID="step-title">{title}</Text>
      <Text testID="step-description">{description}</Text>
      <Text testID="step-type">{type}</Text>
      <Text testID="step-building">{buildingId}</Text>
    </TouchableOpacity>
  );
});

jest.mock(
  "../../../components/MultistepNavigation/DirectionArrow",
  () => "DirectionArrow",
);

describe("MultistepNavigationScreen Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders correctly with default steps", () => {
    const { getByText, getAllByTestId } = render(<MultistepNavigationScreen />);

    // Check if the title and subtitle are rendered
    expect(getByText("Multistep Navigation")).toBeTruthy();
    expect(
      getByText("Plan your journey across multiple buildings"),
    ).toBeTruthy();

    // Check if the description is rendered
    expect(
      getByText(
        /This feature allows you to navigate between different buildings/,
      ),
    ).toBeTruthy();

    // Check if all default steps are rendered (there should be 5 steps)
    const stepTitles = getAllByTestId("step-title").map(
      (node) => node.props.children,
    );
    expect(stepTitles).toContain("Hall Building");
    expect(stepTitles).toContain("Use Sky Bridge");
    expect(stepTitles).toContain("Vanier Library");
    expect(stepTitles).toContain("Walk to Vanier Extension");
    expect(stepTitles).toContain("JMSB");
  });

  it("renders correctly with custom steps from route params", () => {
    const customSteps = [
      {
        id: "custom-1",
        title: "Custom Step 1",
        description: "Custom description 1",
        type: "indoor",
        buildingId: "custom-building-1",
      },
      {
        id: "custom-2",
        title: "Custom Step 2",
        description: "Custom description 2",
        type: "outdoor",
        buildingId: "custom-building-2",
      },
    ];

    const { getAllByTestId, queryByText } = render(
      <MultistepNavigationScreen route={{ params: { steps: customSteps } }} />,
    );

    // Check if custom steps are rendered
    const stepTitles = getAllByTestId("step-title").map(
      (node) => node.props.children,
    );
    expect(stepTitles).toContain("Custom Step 1");
    expect(stepTitles).toContain("Custom Step 2");

    // Check if default steps are not rendered
    expect(queryByText("Hall Building")).toBeNull();
  });

  it("handles step press correctly", () => {
    const { getByTestId } = render(<MultistepNavigationScreen />);

    // Press the first step (Hall Building)
    const hallBuildingStep = getByTestId("step-hall-building");
    fireEvent.press(hallBuildingStep);

    // Check if NavigationStrategyService.navigateToStep was called with correct params
    expect(NavigationStrategyService.navigateToStep).toHaveBeenCalledWith(
      expect.anything(), // navigation object
      expect.objectContaining({
        id: "1",
        title: "Hall Building",
        type: "indoor",
        buildingId: "hall",
      }),
    );
  });

  it("handles type fallback correctly for bridge buildings", () => {
    const customSteps = [
      {
        id: "bridge-1",
        title: "Bridge Step",
        description: "Cross the bridge",
        building: "bridge", // Note: no type, but building is 'bridge'
      },
    ];

    const { getAllByTestId } = render(
      <MultistepNavigationScreen route={{ params: { steps: customSteps } }} />,
    );

    // Check if the step is rendered with the correct type
    const stepTypes = getAllByTestId("step-type").map(
      (node) => node.props.children,
    );
    expect(stepTypes[0]).toBe("outdoor");
  });

  it("handles type fallback correctly for non-bridge buildings", () => {
    const customSteps = [
      {
        id: "building-1",
        title: "Building Step",
        description: "Enter the building",
        building: "hall", // Note: no type, but building is not 'bridge'
      },
    ];

    const { getAllByTestId } = render(
      <MultistepNavigationScreen route={{ params: { steps: customSteps } }} />,
    );

    // Check if the step is rendered with the correct type
    const stepTypes = getAllByTestId("step-type").map(
      (node) => node.props.children,
    );
    expect(stepTypes[0]).toBe("indoor");
  });

  it("renders direction arrows between steps but not after the last step", () => {
    const { UNSAFE_getAllByType } = render(<MultistepNavigationScreen />);

    // There should be 4 DirectionArrow components (one less than the number of steps)
    const directionArrows = UNSAFE_getAllByType("DirectionArrow");
    expect(directionArrows).toHaveLength(4);
  });
});
