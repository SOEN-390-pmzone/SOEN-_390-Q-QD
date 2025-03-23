import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import MultistepNavigationScreen from "../../../components/MultistepNavigation/MultistepNavigationScreen";
import NavigationStrategyService from "../../../services/NavigationStrategyService";
import PropTypes from "prop-types";

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

  const NavigationStepMock = ({
    title,
    description,
    type,
    buildingId,
    onPress,
  }) => (
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

  NavigationStepMock.propTypes = {
    title: PropTypes.string.isRequired,
    description: PropTypes.string,
    type: PropTypes.string,
    buildingId: PropTypes.string,
    onPress: PropTypes.func,
  };

  NavigationStepMock.displayName = "NavigationStep";

  return NavigationStepMock;
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

  it("handles step with missing properties gracefully", () => {
    const incompleteSteps = [
      {
        id: "incomplete-1",
        title: "Incomplete Step", // Missing description, type and buildingId
      },
    ];

    const { getByTestId } = render(
      <MultistepNavigationScreen
        route={{ params: { steps: incompleteSteps } }}
      />,
    );

    // Make sure the step is rendered despite missing props
    expect(getByTestId("step-incomplete-step")).toBeTruthy();
  });

  it("allows opening modal when indoor navigation is selected", () => {
    const indoorSteps = [
      {
        id: "indoor-1",
        title: "Indoor Navigation",
        description: "Navigate inside a building",
        type: "indoor",
        buildingId: "hall",
      },
    ];

    const { getByTestId } = render(
      <MultistepNavigationScreen route={{ params: { steps: indoorSteps } }} />,
    );

    // Press the indoor navigation step
    fireEvent.press(getByTestId("step-indoor-navigation"));

    // Verify navigation service was called with the right params
    expect(NavigationStrategyService.navigateToStep).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        id: "indoor-1",
        title: "Indoor Navigation",
        type: "indoor",
      }),
    );
  });

  it("handles steps with special characters in title", () => {
    const specialCharSteps = [
      {
        id: "special-1",
        title: "Special & Characters!",
        description: "Step with special chars in title",
        type: "indoor",
        buildingId: "hall",
      },
    ];

    const { getByTestId } = render(
      <MultistepNavigationScreen
        route={{ params: { steps: specialCharSteps } }}
      />,
    );

    // The test ID should have normalized the special characters
    expect(getByTestId("step-special-characters")).toBeTruthy();
  });
});
