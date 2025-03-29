import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import NavigationStep from "../../../components/MultistepNavigation/NavigationStep";
import { WebView } from "react-native-webview";

import FloorRegistry from "../../../services/BuildingDataService";

jest.mock("expo-font", () => ({
  isLoaded: jest.fn(() => true),
  loadAsync: jest.fn(() => Promise.resolve()),
}));

// You might also need to mock @expo/vector-icons
jest.mock("@expo/vector-icons", () => ({
  MaterialIcons: "MaterialIcons",
  Ionicons: "Ionicons",
}));

// Mock dependencies
jest.mock("react-native-webview", () => ({
  WebView: jest.fn(() => null),
}));

jest.mock("../../../services/BuildingDataService", () => ({
  getReadableBuildingName: jest.fn((buildingId) => {
    const buildingNames = {
      H: "Hall Building",
      MB: "John Molson Building",
      LB: "Library Building",
      EV: "Engineering & Visual Arts Complex",
    };
    return buildingNames[buildingId] || buildingId;
  }),
}));

describe("NavigationStep", () => {
  // Common props
  const onNavigateMock = jest.fn();
  const onExpandMapMock = jest.fn();

  // Clear mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders indoor navigation step correctly", () => {
    const indoorStep = {
      type: "indoor",
      title: "Navigate to room H-920",
      buildingId: "H",
      startRoom: "entrance",
      endRoom: "H-920",
      startFloor: "1",
      endFloor: "9",
    };

    const { getByText, getByTestId } = render(
      <NavigationStep step={indoorStep} onNavigate={onNavigateMock} />,
    );

    // Check title and building info is displayed
    expect(getByText("Navigate to room H-920")).toBeTruthy();
    expect(getByText(/Navigate from entrance to room H-920/)).toBeTruthy();

    // Check floor information
    const startFloorElement = getByTestId("start-floor");
    const endFloorElement = getByTestId("end-floor");
    expect(startFloorElement.props.children).toBe("1");
    expect(endFloorElement.props.children).toBe("9");

    // Check building name is displayed
    expect(getByText(/Building: Hall Building/)).toBeTruthy();

    // Check navigate button exists
    const navigateButton = getByText("Navigate");
    expect(navigateButton).toBeTruthy();

    // Test navigate button click
    fireEvent.press(navigateButton);
    expect(onNavigateMock).toHaveBeenCalledWith(indoorStep);
  });

  test("renders indoor navigation step with room as starting point", () => {
    const indoorStep = {
      type: "indoor",
      title: "Navigate between rooms",
      buildingId: "H",
      startRoom: "H-820",
      endRoom: "H-920",
      startFloor: "8",
      endFloor: "9",
    };

    const { getByText } = render(
      <NavigationStep step={indoorStep} onNavigate={onNavigateMock} />,
    );

    expect(getByText(/Navigate from room H-820 to room H-920/)).toBeTruthy();
  });

  test("renders outdoor navigation step correctly", () => {
    const outdoorStep = {
      type: "outdoor",
      title: "Walk to Hall Building",
      startAddress: "Current Location, Montreal",
      endAddress: "Hall Building, Montreal",
      startPoint: { latitude: 45.496, longitude: -73.577 },
      endPoint: { latitude: 45.497, longitude: -73.578 },
    };

    const directions = [
      { html_instructions: "Head <b>north</b>", distance: "100 m" },
      {
        html_instructions: "Turn <b>right</b> onto <b>Boulevard</b>",
        distance: "250 m",
      },
    ];

    const mapHtml = "<html><body>Map content</body></html>";

    const { getByText } = render(
      <NavigationStep
        step={outdoorStep}
        outdoorDirections={directions}
        mapHtml={mapHtml}
        onExpandMap={onExpandMapMock}
      />,
    );

    // Check title and addresses
    expect(getByText("Walk to Hall Building")).toBeTruthy();
    expect(getByText("Current Location")).toBeTruthy();
    expect(getByText("Hall Building")).toBeTruthy();

    // Check directions are displayed
    expect(getByText("Head north")).toBeTruthy();
    expect(getByText("Turn right onto Boulevard")).toBeTruthy();
    expect(getByText("100 m")).toBeTruthy();
    expect(getByText("250 m")).toBeTruthy();

    // Check expand map button exists and works
    const expandMapButton = getByText("Expand Map");
    fireEvent.press(expandMapButton);
    expect(onExpandMapMock).toHaveBeenCalled();
  });

  test("renders outdoor navigation step with loading state", () => {
    const outdoorStep = {
      type: "outdoor",
      title: "Walk to Hall Building",
      startAddress: "Current Location, Montreal",
      endAddress: "Hall Building, Montreal",
    };

    const { getByText } = render(
      <NavigationStep
        step={outdoorStep}
        outdoorDirections={[]}
        loadingDirections={true}
      />,
    );

    expect(getByText("Getting directions...")).toBeTruthy();
  });

  test("renders outdoor navigation step with no directions", () => {
    const outdoorStep = {
      type: "outdoor",
      title: "Walk to Hall Building",
      startAddress: "Current Location, Montreal",
      endAddress: "Hall Building, Montreal",
    };

    const { getByText } = render(
      <NavigationStep
        step={outdoorStep}
        outdoorDirections={[]}
        loadingDirections={false}
      />,
    );

    expect(
      getByText("Walk from Current Location to Hall Building"),
    ).toBeTruthy();
  });

  test("handles indoor navigation in progress state", () => {
    const indoorStep = {
      type: "indoor",
      title: "Navigate to room H-920",
      buildingId: "H",
      startRoom: "entrance",
      endRoom: "H-920",
      startFloor: "1",
      endFloor: "9",
      started: true,
    };

    const { getByText } = render(
      <NavigationStep step={indoorStep} onNavigate={onNavigateMock} />,
    );

    expect(
      getByText("Indoor navigation in progress. Return here when finished."),
    ).toBeTruthy();
  });

  test("properly parses HTML instructions", () => {
    const outdoorStep = {
      type: "outdoor",
      title: "Walk to Hall Building",
      startAddress: "Current Location",
      endAddress: "Hall Building",
    };

    const complexHtmlDirections = [
      {
        html_instructions:
          "Head <b>north</b> on <div>De Maisonneuve Blvd</div>",
        distance: "100 m",
      },
      {
        html_instructions: "Turn <b>right</b> at <wbr/>the corner",
        distance: "50 m",
      },
    ];

    const { getByText } = render(
      <NavigationStep
        step={outdoorStep}
        outdoorDirections={complexHtmlDirections}
      />,
    );

    // Check that HTML is properly parsed
    expect(getByText("Head north on De Maisonneuve Blvd")).toBeTruthy();
    // Fix the test by checking for what's actually rendered
    expect(getByText("Turn right at the corner")).toBeTruthy();
  });

  test("handles WebView errors gracefully", () => {
    const outdoorStep = {
      type: "outdoor",
      title: "Walk to Hall Building",
      startAddress: "Current Location",
      endAddress: "Hall Building",
    };

    const consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    render(
      <NavigationStep
        step={outdoorStep}
        mapHtml="<html><body>Test</body></html>"
      />,
    );

    // Simulate WebView error
    const webViewProps = WebView.mock.calls[0][0];
    webViewProps.onError({ nativeEvent: { description: "Test error" } });

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "WebView error:",
      expect.any(Object),
    );
    consoleErrorSpy.mockRestore();
  });

  test("handles different building types correctly", () => {
    const buildingTypes = ["H", "MB", "LB", "EV"];

    buildingTypes.forEach((buildingId) => {
      // Reset mock to get fresh calls
      FloorRegistry.getReadableBuildingName.mockClear();

      const indoorStep = {
        type: "indoor",
        title: `Navigate in ${buildingId}`,
        buildingId: buildingId,
        startRoom: "entrance",
        endRoom: `${buildingId}-101`,
        startFloor: "1",
        endFloor: "1",
      };

      const { unmount } = render(
        <NavigationStep step={indoorStep} onNavigate={onNavigateMock} />,
      );

      // Verify building name was requested
      expect(FloorRegistry.getReadableBuildingName).toHaveBeenCalledWith(
        buildingId,
      );
      unmount();
    });
  });

  test("handles when directions have formatted_text instead of html_instructions", () => {
    const outdoorStep = {
      type: "outdoor",
      title: "Walk to Hall Building",
      startAddress: "Current Location",
      endAddress: "Hall Building",
    };

    const formattedTextDirections = [
      {
        formatted_text: "Walk straight ahead",
        distance: "100 m",
      },
    ];

    const { getByText } = render(
      <NavigationStep
        step={outdoorStep}
        outdoorDirections={formattedTextDirections}
      />,
    );

    expect(getByText("Walk straight ahead")).toBeTruthy();
  });
});
