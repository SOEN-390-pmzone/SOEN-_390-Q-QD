import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { NavigationContainer } from "@react-navigation/native";
import TunnelNavigation from "../../../components/IndoorNavigation/TunnelNavigation";

const mockNavigate = jest.fn();
jest.mock("@react-navigation/native", () => {
  const actualNav = jest.requireActual("@react-navigation/native");
  return {
    ...actualNav,
    useNavigation: () => ({
      navigate: mockNavigate,
    }),
  };
});

// Mock FloorRegistry service
jest.mock("../../../services/BuildingDataService", () => ({
  getBuildings: jest.fn(() => [
    {
      id: "hall",
      name: "Hall Building",
      code: "H",
      description: "Description",
      address: "1455 De Maisonneuve Blvd W",
    },
    {
      id: "jmsb",
      name: "JMSB",
      code: "MB",
      description: "Description",
      address: "John Molson Building",
    },
    {
      id: "ev",
      name: "EV Building",
      code: "EV",
      description: "Description",
      address: "Engineering & Visual Arts",
    },
    {
      id: "library",
      name: "Library",
      code: "LB",
      description: "Description",
      address: "Concordia Library",
    },
    {
      id: "unknown",
      name: "Unknown",
      code: "U",
      description: "No access",
      address: "Somewhere",
    },
  ]),
  getAllBuildings: jest.fn(() => ({
    hall: { id: "hall" },
    jmsb: { id: "jmsb" },
    ev: { id: "ev" },
    library: { id: "library" },
  })),
  getBuilding: jest.fn((key) => {
    const buildings = {
      hall: { id: "hall" },
      jmsb: { id: "jmsb" },
      ev: { id: "ev" },
      library: { id: "library" },
    };
    return buildings[key] || undefined;
  }),
}));

describe("TunnelNavigation", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders correctly and displays tunnel buildings", () => {
    const { getByText } = render(
      <NavigationContainer>
        <TunnelNavigation />
      </NavigationContainer>,
    );

    // Check if buildings with tunnel access are displayed
    expect(getByText("Hall Building")).toBeTruthy();
    expect(getByText("JMSB")).toBeTruthy();
    expect(getByText("EV Building")).toBeTruthy();
    expect(getByText("Library")).toBeTruthy();

    // Ensure the "Unknown" building is NOT displayed
    expect(() => getByText("Unknown")).toThrow();
  });

  it("navigates to FloorSelector when a building is selected", () => {
    const { getByText } = render(
      <NavigationContainer>
        <TunnelNavigation />
      </NavigationContainer>,
    );

    // Click on Hall Building
    fireEvent.press(getByText("Hall Building"));

    // Ensure navigation is called with the correct params
    expect(mockNavigate).toHaveBeenCalledWith("FloorSelector", {
      buildingType: "hall",
    });
  });
});
