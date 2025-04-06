import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import LocationCard from "../../../components/JourneyPlanner/NavigationOrchestrator/LocationCard";

// Mocking expo-font
jest.mock("expo-font", () => ({
  isLoaded: jest.fn(() => true), // Always return true for isLoaded
  loadAsync: jest.fn(() => Promise.resolve()), // Mock loading fonts as resolved
}));
// Mocking @expo/vector-icons
jest.mock("@expo/vector-icons", () => {
  return {
    MaterialIcons: "MaterialIcons",
  };
});

describe("LocationCard", () => {
  const mockStep = {
    type: "outdoor",
    title: "Park",
    description: "Central Park",
    latitude: 40.785091,
    longitude: -73.968285,
    buildingId: "N/A",
    room: "N/A",
    floor: "N/A",
  };

  const mockOnPress = jest.fn();

  it("renders correctly with outdoor step type", () => {
    const { getByText, getByTestId } = render(
      <LocationCard
        step={mockStep}
        index={0}
        isSelected={false}
        onPress={mockOnPress}
      />,
    );

    expect(getByText("1. Park")).toBeTruthy(); // Check if the title is correct
    expect(getByText("Central Park (40.785091, -73.968285)")).toBeTruthy(); // Check if the description is correct

    fireEvent.press(getByTestId("location-card")); // Simulate a press event
    expect(mockOnPress).toHaveBeenCalled(); // Check if the onPress handler was called
  });

  it("displays the 'View Details' button when selected", () => {
    const { getByText } = render(
      <LocationCard
        step={mockStep}
        index={0}
        isSelected={true}
        onPress={mockOnPress}
      />,
    );

    expect(getByText("View Details")).toBeTruthy(); // Check if the View Details button is visible when selected
  });
});
