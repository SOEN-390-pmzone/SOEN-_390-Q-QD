import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import BuildingSelector from "../../../components/IndoorNavigation/BuildingSelector";
import FloorRegistry from "../../../services/BuildingDataService";
import { expect } from "@jest/globals";

// Mock dependencies with a mocked navigation function we can access
const mockNavigate = jest.fn();
jest.mock("@react-navigation/native", () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
  }),
}));

jest.mock("../../../components/Header", () => "Header");
jest.mock("../../../components/NavBar", () => "NavBar");
jest.mock("../../../services/BuildingDataService", () => ({
  getBuildings: jest.fn(),
  getAllBuildings: jest.fn(),
  getBuilding: jest.fn(),
}));

jest.mock("react-native", () => {
  const rn = jest.requireActual("react-native");
  rn.ScrollView = "ScrollView"; // This makes the component identifiable in tests
  return rn;
});

describe("BuildingSelector", () => {
  // Mock data for testing
  const mockBuildings = [
    {
      id: "hall",
      name: "Hall Building",
      code: "H",
      description: "The main building on SGW campus",
      address: "1455 De Maisonneuve Blvd. W.",
    },
    {
      id: "library",
      name: "Webster Library",
      code: "LB",
      description: "The main library on SGW campus",
      address: "1400 De Maisonneuve Blvd. W.",
    },
    {
      id: "jmsb",
      name: "John Molson Building",
      code: "MB",
      description: "Business school building",
      address: "1450 Guy St.",
    },
  ];

  // Mock building types mapping
  const mockBuildingTypes = {
    HallBuilding: { id: "hall", name: "Hall Building" },
    WebsterLibrary: { id: "library", name: "Webster Library" },
    JMSBBuilding: { id: "jmsb", name: "John Molson Building" },
  };

  beforeEach(() => {
    // Setup mock implementations for each test
    FloorRegistry.getBuildings.mockReturnValue(mockBuildings);
    FloorRegistry.getAllBuildings.mockReturnValue(mockBuildingTypes);
    FloorRegistry.getBuilding.mockImplementation((buildingType) => {
      return mockBuildingTypes[buildingType];
    });

    // Clear the navigation mock before each test
    mockNavigate.mockClear();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("renders building list correctly", () => {
    const { getByText } = render(<BuildingSelector />);

    // Check if the title is rendered
    expect(getByText("Select Building")).toBeTruthy();

    // Check if all buildings are rendered
    mockBuildings.forEach((building) => {
      expect(getByText(building.name)).toBeTruthy();
      expect(getByText(building.code)).toBeTruthy();
      expect(getByText(building.description)).toBeTruthy();
      expect(getByText(building.address)).toBeTruthy();
    });
  });

  test("navigates to FloorSelector with correct params when a building is selected", () => {
    const { getByText } = render(<BuildingSelector />);

    // Click on the Hall Building card
    fireEvent.press(getByText("Hall Building"));

    // Verify that navigation.navigate was called with correct parameters
    expect(mockNavigate).toHaveBeenCalledWith("FloorSelector", {
      buildingType: "HallBuilding",
    });
  });

  test("handles building selection when building type is found", () => {
    const { getByText } = render(<BuildingSelector />);

    // Click on the library card
    fireEvent.press(getByText("Webster Library"));

    // Verify the correct navigation
    expect(mockNavigate).toHaveBeenCalledWith("FloorSelector", {
      buildingType: "WebsterLibrary",
    });
  });

  test("does not navigate when building type is not found", () => {
    // Modify the implementation for this specific test to return undefined buildingType
    FloorRegistry.getAllBuildings.mockReturnValue({});

    const { getByText } = render(<BuildingSelector />);

    // Click on a building
    fireEvent.press(getByText("Hall Building"));

    // Verify that navigation.navigate was not called
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  test("renders all building information in the correct format", () => {
    const { getAllByText } = render(<BuildingSelector />);

    // Check specific content format and style (through snapshot)
    expect(getAllByText("Hall Building")[0]).toBeTruthy();
    expect(getAllByText("H")[0]).toBeTruthy();
    expect(getAllByText("The main building on SGW campus")[0]).toBeTruthy();
  });

  test("renders scrollview", () => {
    const { getByTestId } = render(<BuildingSelector />);
    const scrollView = getByTestId("buildings-scroll-view");
    expect(scrollView).toBeTruthy();
  });

  test("handles empty building list gracefully", () => {
    // Mock an empty building list
    FloorRegistry.getBuildings.mockReturnValue([]);

    const { queryByText } = render(<BuildingSelector />);

    // Title should still be rendered
    expect(queryByText("Select Building")).toBeTruthy();

    // But no building cards should be rendered
    expect(queryByText("Hall Building")).toBeNull();
  });
});
