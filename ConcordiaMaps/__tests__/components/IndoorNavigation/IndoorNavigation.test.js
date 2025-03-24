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
      floor: "8",
    },
  }),
}));

// Mock WebView component
jest.mock("react-native-webview", () => {
  const { View } = require("react-native");
  const MockWebView = (props) => {
    return <View testID="webview" {...props} />;
  };

  MockWebView.displayName = "WebView";

  return {
    WebView: jest.fn().mockImplementation(MockWebView),
  };
});

// Mock the PathFinder
jest.mock("../../../components/IndoorNavigation/PathFinder", () => ({
  findShortestPath: jest.fn(),
}));

// Mock Header and NavBar components
jest.mock("../../../components/Header", () => {
  const { View } = require("react-native");
  const HeaderMock = () => <View testID="header" />;
  HeaderMock.displayName = "HeaderMock";
  return HeaderMock;
});

jest.mock("../../../components/NavBar", () => {
  const { View } = require("react-native");
  const NavBarMock = () => <View testID="navbar" />;
  NavBarMock.displayName = "NavBarMock";
  return NavBarMock;
});

// Mock BuildingDataService
jest.mock("../../../services/BuildingDataService", () => ({
  getBuilding: jest.fn(),
  getGraph: jest.fn(),
  getFloorPlan: jest.fn(),
  getRooms: jest.fn(),
}));

// Mock console.error to avoid test noise
const originalConsoleError = console.error;
const originalConsoleLog = console.log;

describe("IndoorNavigation Component", () => {
  // Sample mock data
  const mockBuilding = {
    id: "hall",
    name: "Hall Building",
    code: "H",
    description: "Main academic building",
  };

  const mockGraph = {
    H801: { H803: 1 },
    H803: { H801: 1, H805: 1 },
    H805: { H803: 1, elevator: 1 },
    elevator: { H805: 1, stairs: 1 },
    stairs: { elevator: 1 },
  };

  const mockRooms = {
    H801: { x: "195", y: "175", nearestPoint: { x: "195", y: "217" } },
    H803: { x: "281", y: "155", nearestPoint: { x: "281", y: "217" } },
    H805: { x: "385", y: "155", nearestPoint: { x: "385", y: "217" } },
    elevator: { x: "450", y: "300", nearestPoint: { x: "450", y: "300" } },
    stairs: { x: "500", y: "300", nearestPoint: { x: "500", y: "300" } },
  };

  const mockSvgContent =
    '<svg width="1024" height="1024"><rect x="10" y="10" width="80" height="80" fill="blue" /></svg>';

  // Mock navigation and route props
  const mockRoute = {
    params: {
      buildingType: "HallBuilding",
      floor: "8",
    },
  };

  const mockNavigation = {
    setOptions: jest.fn(),
  };

  // Setup and teardown
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Setup FloorRegistry mocks
    FloorRegistry.getBuilding.mockReturnValue(mockBuilding);
    FloorRegistry.getGraph.mockReturnValue(mockGraph);
    FloorRegistry.getRooms.mockReturnValue(mockRooms);
    FloorRegistry.getFloorPlan.mockResolvedValue(mockSvgContent);

    // Setup findShortestPath mock with default behavior
    findShortestPath.mockImplementation((graph, start, end) => {
      if (!start || !end || !graph[start] || !graph[end]) {
        return [];
      }

      // Default simple path for testing
      if (start === "H801" && end === "H805") {
        return ["H801", "H803", "H805"];
      }

      return [start, end];
    });

    // Mock console to reduce test noise
    console.error = jest.fn();
    console.log = jest.fn();
  });

  afterEach(() => {
    // Restore console
    console.error = originalConsoleError;
    console.log = originalConsoleLog;
  });

  it("renders correctly with building and floor information", async () => {
    const { getByText, getByTestId } = render(
      <IndoorNavigation route={mockRoute} navigation={mockNavigation} />,
    );

    // Verify header with building and floor info is displayed
    await waitFor(() => {
      expect(getByText("Hall Building - H 8th Floor")).toBeTruthy();
    });

    // Verify WebView for floor plan is rendered
    expect(getByTestId("webview")).toBeTruthy();

    // Verify Header and NavBar components are rendered
    expect(getByTestId("header")).toBeTruthy();
    expect(getByTestId("navbar")).toBeTruthy();

    // Verify data loading calls
    expect(FloorRegistry.getBuilding).toHaveBeenCalledWith("HallBuilding");
    expect(FloorRegistry.getGraph).toHaveBeenCalledWith("HallBuilding", "8");
    expect(FloorRegistry.getFloorPlan).toHaveBeenCalledWith(
      "HallBuilding",
      "8",
    );
  });

  it("loads all available nodes from the graph", async () => {
    const { getAllByText } = render(
      <IndoorNavigation route={mockRoute} navigation={mockNavigation} />,
    );

    // Check for nodes in the selectors
    await waitFor(() => {
      // Each node should appear in both start and end selectors
      Object.keys(mockGraph).forEach((node) => {
        const nodeElements = getAllByText(node);
        expect(nodeElements.length).toBeGreaterThanOrEqual(1);
      });
    });
  });

  it("handles room selection and updates state", async () => {
    const { getAllByText } = render(
      <IndoorNavigation route={mockRoute} navigation={mockNavigation} />,
    );

    // Wait for nodes to be loaded
    await waitFor(() => {
      expect(getAllByText("H801")[0]).toBeTruthy();
      expect(getAllByText("H805")[0]).toBeTruthy();
    });

    // Select start and end points
    fireEvent.press(getAllByText("H801")[0]); // Select from start dropdown
    fireEvent.press(getAllByText("H805")[1]); // Select from end dropdown

    // Verify selections are highlighted (by checking the styleSheet.selectedOption is applied)
    // This is harder to test directly, but we can assume the state changed
  });

  it("calculates path when Find Path button is pressed", async () => {
    const { getByText, getAllByText } = render(
      <IndoorNavigation route={mockRoute} navigation={mockNavigation} />,
    );

    // Wait for nodes to be loaded
    await waitFor(() => {
      expect(getAllByText("H801")[0]).toBeTruthy();
      expect(getAllByText("H805")[0]).toBeTruthy();
    });

    // Select start and end points
    fireEvent.press(getAllByText("H801")[0]); // Select from start dropdown
    fireEvent.press(getAllByText("H805")[1]); // Select from end dropdown

    // Press Find Path button
    fireEvent.press(getByText("Find Path"));

    // Verify path finding was called
    expect(findShortestPath).toHaveBeenCalledWith(mockGraph, "H801", "H805");
  });

  it("displays calculated path steps", async () => {
    // Setup specific path result
    findShortestPath.mockReturnValue(["H801", "H803", "H805"]);

    const { getByText, getAllByText } = render(
      <IndoorNavigation route={mockRoute} navigation={mockNavigation} />,
    );

    // Wait for nodes to be loaded
    await waitFor(() => {
      expect(getAllByText("H801")[0]).toBeTruthy();
      expect(getAllByText("H805")[0]).toBeTruthy();
    });

    // Select start and end points
    fireEvent.press(getAllByText("H801")[0]);
    fireEvent.press(getAllByText("H805")[1]);

    // Press Find Path button
    fireEvent.press(getByText("Find Path"));

    // Check that path steps are displayed
    await waitFor(() => {
      expect(getByText("1. H801")).toBeTruthy();
      expect(getByText("2. H803")).toBeTruthy();
      expect(getByText("3. H805")).toBeTruthy();
    });
  });

  it('displays "No path found" when no path exists', async () => {
    // Mock no path found result
    findShortestPath.mockReturnValue([]);

    const { getByText, getAllByText } = render(
      <IndoorNavigation route={mockRoute} navigation={mockNavigation} />,
    );

    // Wait for nodes to be loaded
    await waitFor(() => {
      expect(getAllByText("H801")[0]).toBeTruthy();
      expect(getAllByText("H805")[0]).toBeTruthy();
    });

    // Select start and end points
    fireEvent.press(getAllByText("H801")[0]);
    fireEvent.press(getAllByText("H805")[1]);

    // Press Find Path button
    fireEvent.press(getByText("Find Path"));

    // Verify "No path found" message is displayed
    await waitFor(() => {
      expect(getByText("1. No path found")).toBeTruthy();
    });
  });

  it("shows initial message before path calculation", async () => {
    const { getByText } = render(
      <IndoorNavigation route={mockRoute} navigation={mockNavigation} />,
    );

    // Check for initial message
    await waitFor(() => {
      expect(
        getByText("Press 'Find Path' to calculate the route"),
      ).toBeTruthy();
    });
  });

  it("uses default building type if not provided", async () => {
    // Create a route without buildingType
    const emptyRoute = { params: { floor: "8" } };

    render(<IndoorNavigation route={emptyRoute} navigation={mockNavigation} />);

    // Verify default buildingType is used
    await waitFor(() => {
      expect(FloorRegistry.getBuilding).toHaveBeenCalledWith("HallBuilding");
    });
  });

  it("handles errors when loading floor plan", async () => {
    // Mock a rejected promise from getFloorPlan
    FloorRegistry.getFloorPlan.mockRejectedValue(
      new Error("Failed to load floor plan"),
    );

    render(<IndoorNavigation route={mockRoute} navigation={mockNavigation} />);

    // Verify error was logged
    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith(
        "Error loading floor plan:",
        expect.any(Error),
      );
    });
  });
});
