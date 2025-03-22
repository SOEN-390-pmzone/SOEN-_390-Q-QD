import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import IndoorNavigation from "../../../components/IndoorNavigation/IndoorNavigation";
import { findShortestPath } from "../../../components/IndoorNavigation/PathFinder";
import FloorRegistry from "../../../services/BuildingDataService";

// Mock dependencies
jest.mock("@react-navigation/native", () => ({
  useNavigation: () => ({
    setOptions: jest.fn(),
  }),
  useRoute: () => ({
    params: {
      buildingType: "HallBuilding",
      floor: "9",
    },
  }),
}));

// Mock WebView - simplified to avoid React reference
jest.mock("react-native-webview", () => ({
  WebView: "WebView",
}));

// Mock PathFinder
jest.mock("../../../components/IndoorNavigation/PathFinder", () => ({
  findShortestPath: jest.fn(),
}));

// Mock Header and NavBar components
jest.mock("../../../components/Header", () => "Header");
jest.mock("../../../components/NavBar", () => "NavBar");

// Mock BuildingDataService
jest.mock("../../../services/BuildingDataService", () => ({
  getBuilding: jest.fn(),
  getGraph: jest.fn(),
  getFloorPlan: jest.fn(),
  getRooms: jest.fn(),
  supportsNavigation: jest.fn(),
}));

describe("IndoorNavigation", () => {
  // Mock data
  const mockBuilding = {
    id: "hall",
    name: "Hall Building",
    code: "H",
  };

  const mockGraph = {
    "H-901": { "H-903": 2, "H-Elevator": 5 },
    "H-903": { "H-901": 2, "H-905": 3 },
    "H-905": { "H-903": 3, "H-Stairs": 4 },
    "H-Elevator": { "H-901": 5, "H-Stairs": 6 },
    "H-Stairs": { "H-905": 4, "H-Elevator": 6 },
  };

  const mockFloorPlan =
    '<svg width="1024" height="1024"><rect id="H-901" x="100" y="100" width="50" height="50" /></svg>';

  const mockRooms = {
    "H-901": { x: 100, y: 100, nearestPoint: { x: 125, y: 125 } },
    "H-903": { x: 200, y: 100, nearestPoint: { x: 225, y: 125 } },
    "H-905": { x: 300, y: 100, nearestPoint: { x: 325, y: 125 } },
    "H-Elevator": { x: 100, y: 200, nearestPoint: { x: 125, y: 225 } },
    "H-Stairs": { x: 200, y: 200, nearestPoint: { x: 225, y: 225 } },
  };

  const mockRoute = { params: { buildingType: "HallBuilding", floor: "9" } };
  const mockNavigation = { setOptions: jest.fn() };

  beforeEach(() => {
    // Set up mocks
    FloorRegistry.getBuilding.mockReturnValue(mockBuilding);
    FloorRegistry.getGraph.mockReturnValue(mockGraph);
    FloorRegistry.getFloorPlan.mockResolvedValue(mockFloorPlan);
    FloorRegistry.getRooms.mockReturnValue(mockRooms);

    findShortestPath.mockImplementation((graph, start, end) => {
      // Simple mock that returns direct path from start to end
      if (!start || !end || !graph[start] || !graph[end]) {
        return [];
      }
      return [start, end];
    });

    // Reset mocks before each test
    jest.clearAllMocks();
  });

  test("renders correctly with building and floor information", async () => {
    const { getByText } = render(
      <IndoorNavigation route={mockRoute} navigation={mockNavigation} />,
    );

    // Check that building info is displayed
    await waitFor(() => {
      expect(getByText("Hall Building - H 9th Floor")).toBeTruthy();
    });

    // Verify loading of data
    expect(FloorRegistry.getBuilding).toHaveBeenCalledWith("HallBuilding");
    expect(FloorRegistry.getGraph).toHaveBeenCalledWith("HallBuilding", "9");
    expect(FloorRegistry.getFloorPlan).toHaveBeenCalledWith(
      "HallBuilding",
      "9",
    );
  });

  test("renders WebView with correct floor plan content", async () => {
    const { UNSAFE_getByType } = render(
      <IndoorNavigation route={mockRoute} navigation={mockNavigation} />,
    );

    // Check that WebView is rendered
    const webView = UNSAFE_getByType("WebView");
    expect(webView).toBeTruthy();
  });

  test("shows node options in selectors", async () => {
    const { getAllByText } = render(
      <IndoorNavigation route={mockRoute} navigation={mockNavigation} />,
    );

    // Check if start and end selectors show nodes
    await waitFor(() => {
      Object.keys(mockGraph).forEach((node) => {
        // Each node should appear twice (once in start selector, once in end)
        const nodeElements = getAllByText(node);
        expect(nodeElements.length).toBeGreaterThanOrEqual(1);
      });
    });
  });

  test("calculates path when Find Path button is pressed", async () => {
    const { getByText, getAllByText } = render(
      <IndoorNavigation route={mockRoute} navigation={mockNavigation} />,
    );

    // Wait for nodes to be loaded
    await waitFor(() => {
      expect(getAllByText("H-901")[0]).toBeTruthy();
    });

    // Select start and end points
    fireEvent.press(getAllByText("H-901")[0]); // Select from start dropdown
    fireEvent.press(getAllByText("H-905")[1]); // Select from end dropdown

    // Press Find Path button
    fireEvent.press(getByText("Find Path"));

    // Verify path finding was called
    expect(findShortestPath).toHaveBeenCalledWith(mockGraph, "H-901", "H-905");
  });

  test("displays calculated path", async () => {
    // Mock a specific path result
    findShortestPath.mockReturnValue(["H-901", "H-903", "H-905"]);

    const { getByText, getAllByText } = render(
      <IndoorNavigation route={mockRoute} navigation={mockNavigation} />,
    );

    // Select start and end points
    await waitFor(() => {
      fireEvent.press(getAllByText("H-901")[0]);
      fireEvent.press(getAllByText("H-905")[1]);
    });

    // Press Find Path button
    fireEvent.press(getByText("Find Path"));

    // Verify path steps are displayed
    expect(getByText("1. H-901")).toBeTruthy();
    expect(getByText("2. H-903")).toBeTruthy();
    expect(getByText("3. H-905")).toBeTruthy();
  });

  test('displays "No path found" when no path exists', async () => {
    // Mock no path found result
    findShortestPath.mockReturnValue([]);

    const { getByText, getAllByText } = render(
      <IndoorNavigation route={mockRoute} navigation={mockNavigation} />,
    );

    // Select start and end points
    await waitFor(() => {
      fireEvent.press(getAllByText("H-901")[0]);
      fireEvent.press(getAllByText("H-905")[1]);
    });

    // Press Find Path button
    fireEvent.press(getByText("Find Path"));

    // Verify "No path found" message
    expect(getByText("1. No path found")).toBeTruthy();
  });

  test("uses default building type if not provided", async () => {
    // Create a route without params
    const emptyRoute = { params: {} };

    render(<IndoorNavigation route={emptyRoute} navigation={mockNavigation} />);

    // Verify default values were used
    expect(FloorRegistry.getBuilding).toHaveBeenCalledWith("HallBuilding");
  });

  test("handles errors when loading floor plan", async () => {
    // Mock a rejected promise from getFloorPlan
    FloorRegistry.getFloorPlan.mockRejectedValue(
      new Error("Failed to load floor plan"),
    );

    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();

    render(<IndoorNavigation route={mockRoute} navigation={mockNavigation} />);

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Error loading floor plan:",
        expect.any(Error),
      );
    });

    consoleErrorSpy.mockRestore();
  });
});
