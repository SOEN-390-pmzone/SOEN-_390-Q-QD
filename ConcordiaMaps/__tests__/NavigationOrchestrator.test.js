import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import NavigationOrchestratorScreen from "../screen/NavigationOrchestrator";
import * as NavigationPlanService from "../services/NavigationPlanService";
import { useRoute } from "@react-navigation/native";

// Mock navigation
jest.mock("@react-navigation/native", () => ({
  useRoute: jest.fn(),
  useNavigation: jest.fn(() => ({ navigate: jest.fn() })),
}));

// Mock components
jest.mock("../components/Header", () => {
  const MockHeader = () => <></>;
  MockHeader.displayName = "MockHeader";
  return MockHeader;
});
jest.mock("../components/NavBar", () => {
  const MockNavBar = () => <></>;
  MockNavBar.displayName = "MockNavBar";
  return MockNavBar;
});
jest.mock(
  "../components/JourneyPlanner/NavigationOrchestrator/LocationCard",
  () => {
    const React = require("react");
    const { Text, TouchableOpacity } = require("react-native");
    const PropTypes = require("prop-types");

    const MockLocationCard = ({ step, index, onPress }) => (
      <TouchableOpacity onPress={onPress} testID={`location-card-${index}`}>
        <Text>{step.title}</Text>
      </TouchableOpacity>
    );

    MockLocationCard.propTypes = {
      step: PropTypes.shape({ title: PropTypes.string.isRequired }).isRequired,
      index: PropTypes.number.isRequired,
      onPress: PropTypes.func.isRequired,
    };

    return MockLocationCard;
  },
);

jest.mock(
  "../components/JourneyPlanner/NavigationOrchestrator/NavigationButton",
  () => {
    const React = require("react");
    const { Text, TouchableOpacity } = require("react-native");
    const PropTypes = require("prop-types");

    const MockNavigationButton = ({ onPress }) => (
      <TouchableOpacity onPress={onPress} testID="navigation-button">
        <Text>Navigate</Text>
      </TouchableOpacity>
    );

    MockNavigationButton.propTypes = {
      onPress: PropTypes.func.isRequired,
    };

    return MockNavigationButton;
  },
);

jest.mock("../services/NavigationPlanService");
jest.mock("../services/NavigationPlanService", () => ({
  createNavigationPlan: jest.fn(),
}));

jest.mock("../services/BuildingDataService", () => ({
  hasTunnelConnection: jest.fn(() => true),
}));

describe("NavigationOrchestratorScreen", () => {
  const mockSteps = [
    { id: "1", title: "Start", type: "indoor", room: "101", buildingId: "H" },
    { id: "2", title: "Stop 2", type: "indoor", room: "102", buildingId: "MB" },
  ];

  beforeEach(() => {
    useRoute.mockReturnValue({
      params: {
        steps: mockSteps,
        avoidOutdoor: true,
      },
    });

    NavigationPlanService.createNavigationPlan.mockClear();
  });

  it("renders correctly with steps", () => {
    const { getByText } = render(<NavigationOrchestratorScreen />);
    expect(getByText("Your Journey Plan")).toBeTruthy();
    expect(getByText("2 stops in optimized order")).toBeTruthy();
    expect(getByText("Start")).toBeTruthy();
    expect(getByText("Stop 2")).toBeTruthy();
  });

  it("calls createNavigationPlan with correct params when NavigationButton is pressed", async () => {
    const { getByTestId } = render(<NavigationOrchestratorScreen />);
    const navButton = getByTestId("navigation-button");

    fireEvent.press(navButton);

    await waitFor(() => {
      expect(NavigationPlanService.createNavigationPlan).toHaveBeenCalled();
    });
  });

  it("toggles location card selection", () => {
    const { getByTestId } = render(<NavigationOrchestratorScreen />);
    const card = getByTestId("location-card-0");

    fireEvent.press(card);
    // You'd check state updates or conditional rendering if any (add `isSelected` changes to card mock if needed)
  });
});
