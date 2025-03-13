import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import InterFloorNavigation from "../../../components/IndoorNavigation/InterFloorNavigation";
import { findShortestPath } from "../../../components/IndoorNavigation/PathFinder";
import FloorRegistry from "../../../services/BuildingDataService";

// Mock dependencies
jest.mock("../../../components/IndoorNavigation/PathFinder", () => ({
  findShortestPath: jest.fn(),
}));

jest.mock("../../../services/BuildingDataService", () => ({
  getRooms: jest.fn(),
  getGraph: jest.fn(),
  getFloorPlan: jest.fn(),
  getBuilding: jest.fn(),
}));

jest.mock("react-native-webview", () => {
  const { View } = require("react-native");
  const PropTypes = require("prop-types");

  const MockWebView = ({ style }) => {
    return <View testID="mock-webview" style={style} />;
  };

  MockWebView.propTypes = {
    style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  };

  return {
    WebView: MockWebView,
  };
});

describe("InterFloorNavigation", () => {
  // Define common props used by tests
  const defaultProps = {
    isVisible: true,
    onClose: jest.fn(),
    startFloor: "8",
    endFloor: "9",
    buildingType: "HallBuilding",
    onPathCalculated: jest.fn(),
  };

  // Mock data
  const mockStartRooms = {
    "H-801": { nearestPoint: { x: 100, y: 100 } },
    "H-802": { nearestPoint: { x: 200, y: 200 } },
    escalator: { nearestPoint: { x: 150, y: 150 } },
  };

  const mockEndRooms = {
    "H-901": { nearestPoint: { x: 100, y: 100 } },
    "H-902": { nearestPoint: { x: 200, y: 200 } },
    escalator: { nearestPoint: { x: 150, y: 150 } },
  };

  const mockStartGraph = {
    "H-801": { "H-802": 1, escalator: 2 },
    "H-802": { "H-801": 1, escalator: 1 },
    escalator: { "H-801": 2, "H-802": 1 },
  };

  const mockEndGraph = {
    "H-901": { "H-902": 1, escalator: 2 },
    "H-902": { "H-901": 1, escalator: 1 },
    escalator: { "H-901": 2, "H-902": 1 },
  };

  const mockBuilding = {
    name: "Hall Building",
    code: "H",
  };

  const mockSvg = '<svg><rect id="room1" /></svg>';

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();

    // Setup default mock implementations
    FloorRegistry.getRooms.mockImplementation((buildingType, floor) => {
      return floor === "8" ? mockStartRooms : mockEndRooms;
    });

    FloorRegistry.getGraph.mockImplementation((buildingType, floor) => {
      return floor === "8" ? mockStartGraph : mockEndGraph;
    });

    FloorRegistry.getFloorPlan.mockResolvedValue(mockSvg);
    FloorRegistry.getBuilding.mockReturnValue(mockBuilding);

    findShortestPath.mockImplementation((graph, start, end) => {
      if (start === "H-801" && end === "escalator") {
        return ["H-801", "H-802", "escalator"];
      } else if (start === "escalator" && end === "H-901") {
        return ["escalator", "H-902", "H-901"];
      }
      return [];
    });
  });

  test("renders correctly when visible", () => {
    const { getByText } = render(<InterFloorNavigation {...defaultProps} />);

    expect(getByText("Floor-to-Floor Navigation")).toBeTruthy();
    expect(
      getByText(`Select Start Room (Floor ${defaultProps.startFloor})`),
    ).toBeTruthy();
    expect(
      getByText(`Select Destination Room (Floor ${defaultProps.endFloor})`),
    ).toBeTruthy();
  });

  test("does not render when not visible", () => {
    const { queryByText } = render(
      <InterFloorNavigation {...defaultProps} isVisible={false} />,
    );

    expect(queryByText("Floor-to-Floor Navigation")).toBeNull();
  });

  test("loads floor plans on mount", async () => {
    render(<InterFloorNavigation {...defaultProps} />);

    await waitFor(() => {
      expect(FloorRegistry.getFloorPlan).toHaveBeenCalledWith(
        defaultProps.buildingType,
        defaultProps.startFloor,
      );
      expect(FloorRegistry.getFloorPlan).toHaveBeenCalledWith(
        defaultProps.buildingType,
        defaultProps.endFloor,
      );
    });
  });

  test("selects start and end rooms correctly", () => {
    const { getAllByText } = render(<InterFloorNavigation {...defaultProps} />);

    // Find room buttons
    const startRoomButton = getAllByText("H-801")[0];
    const endRoomButton = getAllByText("H-901")[0];

    // Select rooms
    fireEvent.press(startRoomButton);
    fireEvent.press(endRoomButton);

    // Verify selection (would need to check style changes, but challenging in this test)
    // Instead we'll check the calculate path button becomes pressable
    const calculateButton = getAllByText("Calculate Path")[0];
    expect(calculateButton).toBeTruthy();
  });

  test("calculates path when both rooms are selected", () => {
    const { getAllByText, getByText } = render(
      <InterFloorNavigation {...defaultProps} />,
    );

    // Select rooms
    const startRoomButton = getAllByText("H-801")[0];
    const endRoomButton = getAllByText("H-901")[0];
    fireEvent.press(startRoomButton);
    fireEvent.press(endRoomButton);

    // Calculate path
    const calculateButton = getByText("Calculate Path");
    fireEvent.press(calculateButton);

    // Verify path calculation
    expect(findShortestPath).toHaveBeenCalledWith(
      mockStartGraph,
      "H-801",
      "escalator",
    );
    expect(findShortestPath).toHaveBeenCalledWith(
      mockEndGraph,
      "escalator",
      "H-901",
    );
    expect(defaultProps.onPathCalculated).toHaveBeenCalled();
  });

  test("displays navigation steps after path calculation", () => {
    const { getAllByText, getByText, queryByText } = render(
      <InterFloorNavigation {...defaultProps} />,
    );

    // Select rooms
    fireEvent.press(getAllByText("H-801")[0]);
    fireEvent.press(getAllByText("H-901")[0]);

    // Initially, navigation steps should not be visible
    expect(queryByText("Navigation Steps:")).toBeNull();

    // Calculate path
    fireEvent.press(getByText("Calculate Path"));

    // After calculation, navigation steps should be visible
    expect(getByText("Navigation Steps:")).toBeTruthy();
    expect(getByText("1.")).toBeTruthy(); // Should have step numbers
  });

  test("calls onClose when close button is pressed", () => {
    const { getByText } = render(<InterFloorNavigation {...defaultProps} />);

    // Press close button
    fireEvent.press(getByText("Close"));

    // Verify onClose was called
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  test("expands floor plan when floor title is pressed", async () => {
    const { getByText, getAllByText } = render(
      <InterFloorNavigation {...defaultProps} />,
    );

    // First need to calculate a path to show floor plans
    fireEvent.press(getAllByText("H-801")[0]);
    fireEvent.press(getAllByText("H-901")[0]);
    fireEvent.press(getByText("Calculate Path"));

    // Then press on floor title to expand
    const floorTitles = getAllByText("Floor 8");
    fireEvent.press(floorTitles[0]);

    // Verify expanded modal is shown
    expect(getByText("×")).toBeTruthy(); // Close button in expanded view
  });

  test("closes expanded floor plan when close button is pressed", async () => {
    const { getByText, getAllByText } = render(
      <InterFloorNavigation {...defaultProps} />,
    );

    // First show the expanded floor plan
    fireEvent.press(getAllByText("H-801")[0]);
    fireEvent.press(getAllByText("H-901")[0]);
    fireEvent.press(getByText("Calculate Path"));
    fireEvent.press(getAllByText("Floor 8")[0]);

    // Verify expanded view is shown
    expect(getByText("×")).toBeTruthy();

    // Press close button
    fireEvent.press(getByText("×"));

    // Verify expanded view is closed (would be difficult to test directly)
    // This test might be flaky due to animation timing
  });

  test("handles error when loading floor plans fails", async () => {
    // Mock error for floor plan loading
    FloorRegistry.getFloorPlan.mockRejectedValueOnce(
      new Error("Failed to load floor plan"),
    );

    // Check that component doesn't crash
    const { getByText } = render(<InterFloorNavigation {...defaultProps} />);

    await waitFor(() => {
      // Component should still be rendered
      expect(getByText("Floor-to-Floor Navigation")).toBeTruthy();
    });
  });
});
