import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import FloorSelector from "../../../components/IndoorNavigation/FloorSelector";
import FloorRegistry from "../../../services/BuildingDataService";

// Mock dependencies
const mockNavigate = jest.fn();
const mockRoute = { params: { buildingType: "HallBuilding" } };

jest.mock("@react-navigation/native", () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
  }),
  useRoute: () => mockRoute,
}));

jest.mock("react-native", () => {
  const rn = jest.requireActual("react-native");

  return rn;
});

jest.mock("../../../components/Header", () => "Header");
jest.mock("../../../components/NavBar", () => "NavBar");
jest.mock("../../../services/BuildingDataService", () => ({
  getBuilding: jest.fn(),
  supportsNavigation: jest.fn(),
}));

describe("FloorSelector", () => {
  // Mock data for testing
  const mockBuilding = {
    id: "hall",
    name: "Hall Building",
    code: "H",
    floors: {
      1: { id: "1", name: "First Floor", description: "Main entrance" },
      2: { id: "2", name: "Second Floor", description: "Classrooms" },
      T: {
        id: "T",
        name: "Tunnel Level",
        description: "Underground connections",
      },
    },
  };

  beforeEach(() => {
    // Setup mock implementations
    FloorRegistry.getBuilding.mockReturnValue(mockBuilding);
    FloorRegistry.supportsNavigation.mockImplementation((building, floor) => {
      // Mock that only floor 1 supports navigation for testing
      return floor === "1";
    });

    // Clear mocks before each test
    mockNavigate.mockClear();
  });

  test("renders building title and floors correctly", () => {
    const { getByText } = render(<FloorSelector />);

    // Check if building info is rendered
    expect(getByText("Hall Building Floors")).toBeTruthy();
    expect(getByText("H Building")).toBeTruthy();

    // Check if all floors are rendered
    expect(getByText("Floor 1")).toBeTruthy();
    expect(getByText("First Floor")).toBeTruthy();
    expect(getByText("Main entrance")).toBeTruthy();

    expect(getByText("Floor 2")).toBeTruthy();
    expect(getByText("Second Floor")).toBeTruthy();
    expect(getByText("Classrooms")).toBeTruthy();

    expect(getByText("Floor T")).toBeTruthy();
    expect(getByText("Tunnel Level")).toBeTruthy();
    expect(getByText("Underground connections")).toBeTruthy();
  });

  test("navigates to IndoorNavigation when supported floor is selected", () => {
    const { getByText } = render(<FloorSelector />);

    // Click on floor 1 which supports navigation
    fireEvent.press(getByText("Floor 1"));

    // Verify navigation occurred with correct params
    expect(mockNavigate).toHaveBeenCalledWith("IndoorNavigation", {
      buildingType: "HallBuilding",
      floor: "1",
    });
  });

  test("displays alert when unsupported floor is selected", () => {
    // Mock the alert function
    global.alert = jest.fn();

    const { getByText } = render(<FloorSelector />);

    // Click on floor 2 which doesn't support navigation
    fireEvent.press(getByText("Floor 2"));

    // Check alert was called
    expect(global.alert).toHaveBeenCalledWith(
      "Indoor navigation for this floor is coming soon!",
    );

    // Verify navigation was not called
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  test("navigates to TunnelNavigation when tunnel floor is selected", () => {
    const { getByText } = render(<FloorSelector />);

    // Click on tunnel floor
    fireEvent.press(getByText("Floor T"));

    // Verify navigation to tunnel screen
    expect(mockNavigate).toHaveBeenCalledWith("TunnelNavigation");
  });

  test("renders scroll view for floors", () => {
    const { UNSAFE_getByType } = render(<FloorSelector />);
    const scrollView = UNSAFE_getByType("RCTScrollView");
    expect(scrollView).toBeTruthy();
    expect(scrollView.props.showsVerticalScrollIndicator).toBe(false);
  });

  test("applies active styling to floors that support navigation", () => {
    const { getByText } = render(<FloorSelector />);

    // The floor with navigation support should have the active class
    const floor1Element = getByText("Floor 1").parent.parent;
    const floor2Element = getByText("Floor 2").parent.parent;

    // Instead of using toContainEqual, check the specific style properties
    const floor1Styles = floor1Element.props.style;

    // Check that active floor has the correct styles
    expect(floor1Styles).toEqual(
      expect.objectContaining({
        backgroundColor: "#e6f3ff",
        borderColor: "#912338",
        borderWidth: 2,
      }),
    );

    // Check non-active floor doesn't have those styles
    const floor2Styles = floor2Element.props.style;

    // Check that at least one of these styles is different
    expect(
      floor2Styles.backgroundColor !== "#e6f3ff" ||
        floor2Styles.borderColor !== "#912338" ||
        !Object.prototype.hasOwnProperty.call(floor2Styles, "borderWidth"),
    ).toBe(true);
  });

  test("uses default buildingType if not provided in route params", () => {
    // Temporarily modify the route mock to remove params
    mockRoute.params = undefined;

    // Re-render with the modified route
    render(<FloorSelector />);

    // Check that getBuilding was called with the default building type
    expect(FloorRegistry.getBuilding).toHaveBeenCalledWith("HallBuilding");

    // Reset the route for other tests
    mockRoute.params = { buildingType: "HallBuilding" };
  });
});
