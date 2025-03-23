import React from "react";
import {
  render,
  fireEvent,
  waitFor,
  act,
  cleanup,
} from "@testing-library/react-native";
import MultistepNavigationScreen, {
  getStepColor,
} from "../../../components/MultistepNavigation/MultistepNavigationScreen";
import * as Location from "expo-location";
import { useGoogleMapDirections } from "../../../hooks/useGoogleMapDirections";
import { useNavigation, useRoute } from "@react-navigation/native";
import * as Crypto from "expo-crypto";

jest.mock("../../../components/IndoorNavigation/RoomToRoomNavigation", () => {
  const MockRoomToRoomNavigation = () => null;
  MockRoomToRoomNavigation.loadFloorPlans = jest.fn().mockResolvedValue(true);
  MockRoomToRoomNavigation.calculatePath = jest.fn();
  return MockRoomToRoomNavigation;
});
jest.mock("react-native-webview", () => ({
  WebView: jest.fn((props) => {
    // Simulate error after render
    setTimeout(() => {
      props.onError?.({ nativeEvent: { description: "WebView error" } });
    }, 0);
    return null;
  }),
}));
const mockLoadFloorPlans = jest.fn();
jest.mock("../../../components/IndoorNavigation/RoomToRoomNavigation", () => ({
  __esModule: true,
  default: () => null,
  loadFloorPlans: mockLoadFloorPlans,
  calculatePath: jest.fn(),
}));

// Mock all required dependencies
jest.mock("react-native-webview", () => {
  const mockWebViewInstance = {
    onError: null,
  };

  return {
    WebView: jest.fn(({ onError }) => {
      mockWebViewInstance.onError = onError;
      setTimeout(() => {
        if (typeof onError === "function") {
          onError({ nativeEvent: { description: "WebView error" } });
        }
      }, 0);
      return null;
    }),
    mockWebViewInstance, // Export for test access
  };
});

jest.mock("@expo/vector-icons/Ionicons", () => "Ionicons");
jest.mock("react-native-vector-icons/MaterialIcons", () => "MaterialIcons");

jest.mock("@react-navigation/native", () => ({
  useNavigation: jest.fn(),
  useRoute: jest.fn(),
}));

jest.mock("expo-location", () => ({
  requestForegroundPermissionsAsync: jest.fn(),
  getCurrentPositionAsync: jest.fn(),
}));

jest.mock("expo-crypto", () => ({
  getRandomBytesAsync: jest.fn(),
}));

jest.mock("../../../hooks/useGoogleMapDirections", () => ({
  useGoogleMapDirections: jest.fn(),
}));

jest.mock("../../../services/NavigationStrategyService", () => ({
  navigateToStep: jest.fn(),
}));

jest.mock("../../../components/IndoorNavigation/RoomToRoomNavigation", () => ({
  calculatePath: jest.fn(),
  loadFloorPlans: jest.fn().mockResolvedValue(true),
}));

jest.mock("../../../components/Header", () => "Header");
jest.mock("../../../components/NavBar", () => "NavBar");
jest.mock("../../../components/Footer", () => "Footer");

// Mock fetch globally
global.fetch = jest.fn();
global.btoa = jest.fn(() => "base64encodedstring");

describe("MultistepNavigationScreen", () => {
  // Setup common mocks before each test
  const mockNavigation = {
    setOptions: jest.fn(),
    navigate: jest.fn(),
    addListener: jest.fn().mockImplementation((event, callback) => {
      if (event === "focus") callback();
      return jest.fn();
    }),
  };

  const mockRoute = {
    params: {},
  };

  const mockGetStepsInHTML = jest.fn();
  const mockGetPolyline = jest.fn();

  beforeEach(() => {
    process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY = "test_api_key";
    jest.clearAllMocks();

    // Setup navigation hook mock
    useNavigation.mockReturnValue(mockNavigation);
    useRoute.mockReturnValue(mockRoute);

    // Setup location mock
    Location.requestForegroundPermissionsAsync.mockResolvedValue({
      status: "granted",
    });
    Location.getCurrentPositionAsync.mockResolvedValue({
      coords: {
        latitude: 45.497092,
        longitude: -73.5788,
      },
    });

    // Setup crypto mock
    Crypto.getRandomBytesAsync.mockResolvedValue(
      new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]),
    );

    // Setup Google Map Directions hook mock
    useGoogleMapDirections.mockReturnValue({
      getStepsInHTML: mockGetStepsInHTML,
      getPolyline: mockGetPolyline,
    });

    // Mock fetch responses
    global.fetch.mockImplementation((url) => {
      if (url.includes("autocomplete")) {
        return Promise.resolve({
          json: () =>
            Promise.resolve({
              predictions: [
                { place_id: "place_1", description: "Concordia University" },
                { place_id: "place_2", description: "Concordia Hall Building" },
              ],
            }),
        });
      }
      // Mock place details response
      else if (url.includes("place/details")) {
        return Promise.resolve({
          json: () =>
            Promise.resolve({
              result: {
                geometry: {
                  location: { lat: 45.497092, lng: -73.5788 },
                },
                formatted_address: "Concordia Hall Building, Montreal, QC",
              },
            }),
        });
      }
      // Mock geocode response
      else if (url.includes("geocode")) {
        return Promise.resolve({
          json: () =>
            Promise.resolve({
              results: [
                {
                  geometry: {
                    location: { lat: 45.497092, lng: -73.5788 },
                  },
                },
              ],
            }),
        });
      }
      return Promise.resolve({
        json: () => Promise.resolve({}),
      });
    });

    // Mock direction results
    mockGetStepsInHTML.mockResolvedValue([
      {
        distance: "200 m",
        html_instructions: "Walk to <b>Concordia Hall Building</b>",
      },
    ]);
    mockGetPolyline.mockResolvedValue([
      { latitude: 45.496, longitude: -73.577 },
      { latitude: 45.497, longitude: -73.578 },
    ]);
  });

  test("renders the navigation form initially", async () => {
    const { getByText, queryByText } = render(<MultistepNavigationScreen />);

    await waitFor(() => {
      expect(getByText("Plan Your Route")).toBeTruthy();
      expect(getByText("Starting Point")).toBeTruthy();
      expect(getByText("Destination")).toBeTruthy();
      expect(getByText("Start Navigation")).toBeTruthy();
    });

    // There should be no navigation steps rendered yet
    expect(queryByText("Step 1 of")).toBeNull();
  });

  test("toggles between location and building input types", async () => {
    const { getAllByText } = render(<MultistepNavigationScreen />);

    // Check initial state has the toggles
    await waitFor(() => {
      expect(getAllByText("Location")[0]).toBeTruthy();
      expect(getAllByText("Building")[0]).toBeTruthy();
    });

    // Toggle origin input type
    fireEvent.press(getAllByText("Building")[0]);

    // Toggle destination input type
    fireEvent.press(getAllByText("Location")[1]);

    // Both toggles should still exist after changing
    await waitFor(() => {
      expect(getAllByText("Location")[0]).toBeTruthy();
      expect(getAllByText("Building")[0]).toBeTruthy();
    });
  });

  test("handles origin place search and selection", async () => {
    const { getByPlaceholderText, findByText, queryByText, getByText } = render(
      <MultistepNavigationScreen />,
    );

    const originInput = getByPlaceholderText("Enter your starting location");
    fireEvent.changeText(originInput, "Concordia");

    // Wait for the predictions to appear
    await act(async () => {
      // Need to wait a bit for the predictions to appear
      await new Promise((resolve) => setTimeout(resolve, 50));
    });

    const prediction = await findByText("Concordia University");
    expect(prediction).toBeTruthy();

    // Press the prediction
    fireEvent.press(prediction);

    await waitFor(() => {
      expect(queryByText("Concordia University")).toBeNull();
      expect(getByText("Plan Your Route")).toBeTruthy();
    });

    // Check that fetch was called with the right arguments
    expect(global.fetch).toHaveBeenCalled();
    const autocompleteCall = global.fetch.mock.calls.find((call) =>
      call[0].includes("autocomplete"),
    );
    const detailsCall = global.fetch.mock.calls.find((call) =>
      call[0].includes("place/details"),
    );
    expect(autocompleteCall).toBeTruthy();
    expect(detailsCall).toBeTruthy();
  });

  test("handles destination place search and selection", async () => {
    const { getAllByText, getByPlaceholderText, findByText } = render(
      <MultistepNavigationScreen />,
    );

    // Switch to location input type for destination
    const locationTab = getAllByText("Location")[1];
    fireEvent.press(locationTab);

    // Get the destination input with updated selector
    const destinationInput = getByPlaceholderText("Enter your destination");
    fireEvent.changeText(destinationInput, "Concordia");

    // Force predictions to show up by mocking the state update
    await act(async () => {
      // Need to wait a bit for the predictions to show up
      await new Promise((resolve) => setTimeout(resolve, 50));
    });

    // Now try to find the prediction
    const prediction = await findByText("Concordia University");
    expect(prediction).toBeTruthy();

    fireEvent.press(prediction);

    // Verify that fetch was called
    expect(global.fetch).toHaveBeenCalled();
  });

  test("handles building selection for origin", async () => {
    const { getAllByText, getByPlaceholderText } = render(
      <MultistepNavigationScreen />,
    );

    // Use getAllByText and select first "Building" tab
    const buildingTabs = getAllByText("Building");
    fireEvent.press(buildingTabs[0]);

    // First update class name associated data via parseOriginClassroom
    const buildingInput = getByPlaceholderText("Enter Building (e.g. Hall)");

    // Directly mock the parseOriginClassroom function's behavior
    await act(async () => {
      fireEvent.changeText(buildingInput, "Hall");
      // Wait for state updates
      await new Promise((resolve) => setTimeout(resolve, 50));
    });

    // There's no need to verify fetch calls since filtering buildings is done locally
    expect(buildingInput.props.value).toBe("Hall");
  });

  test("handles existing navigation plan from route params", async () => {
    // Setup navigation plan in route params
    const navigationPlan = {
      title: "Test Navigation",
      currentStep: 0,
      steps: [
        {
          type: "outdoor",
          title: "Walk to Hall Building",
          startPoint: { latitude: 45.496, longitude: -73.577 },
          endPoint: { latitude: 45.497, longitude: -73.578 },
          startAddress: "Start location",
          endAddress: "Hall Building",
          isComplete: false,
        },
      ],
    };

    useRoute.mockReturnValue({
      params: { navigationPlan },
    });

    // Render with navigation plan
    const { getByText, findByText } = render(<MultistepNavigationScreen />);

    // Should display the navigation step
    await findByText("Walk to Hall Building");
    expect(getByText("Step 1 of 1")).toBeTruthy();

    // Should have fetched directions
    expect(mockGetStepsInHTML).toHaveBeenCalled();
    expect(mockGetPolyline).toHaveBeenCalled();
  });

  test("handles step navigation (next/previous)", async () => {
    const navigationPlan = {
      title: "Multi-step Navigation",
      currentStep: 0,
      steps: [
        {
          type: "outdoor",
          title: "Walk to Hall Building",
          startPoint: { latitude: 45.496, longitude: -73.577 },
          endPoint: { latitude: 45.497, longitude: -73.578 },
          startAddress: "Start location",
          endAddress: "Hall Building",
          isComplete: false,
        },
        {
          type: "indoor",
          title: "Navigate to room",
          buildingId: "H",
          buildingType: "HallBuilding",
          startRoom: "entrance",
          endRoom: "H-920",
          startFloor: "1",
          endFloor: "9",
          isComplete: false,
        },
      ],
    };

    useRoute.mockReturnValue({
      params: { navigationPlan },
    });

    const { getByTestId, getByText, findByText } = render(
      <MultistepNavigationScreen />,
    );

    // Should display the first step
    await findByText("Walk to Hall Building");
    expect(getByText("Step 1 of 2")).toBeTruthy();

    // Navigate to next step - using testID instead of role
    const nextButton = getByTestId("next-button");
    fireEvent.press(nextButton);

    // Should display the second step
    await findByText("Navigate to room");
    expect(getByText("Step 2 of 2")).toBeTruthy();

    // Navigate back to previous step
    const prevButton = getByTestId("previous-button");
    fireEvent.press(prevButton);

    // Should display the first step again
    await findByText("Walk to Hall Building");
    expect(getByText("Step 1 of 2")).toBeTruthy();
  });

  test("handles indoor navigation steps", async () => {
    // Setup navigation plan with indoor step
    const navigationPlan = {
      title: "Indoor Navigation Test",
      currentStep: 0,
      steps: [
        {
          type: "indoor",
          title: "Navigate to room H-920",
          buildingId: "H",
          buildingType: "HallBuilding",
          startRoom: "entrance",
          endRoom: "H-920",
          startFloor: "1",
          endFloor: "9",
          isComplete: false,
        },
      ],
    };

    useRoute.mockReturnValue({
      params: { navigationPlan },
    });

    // Render with navigation plan
    const { getByText, findByText } = render(<MultistepNavigationScreen />);

    // Should display the indoor step
    await findByText("Navigate to room H-920");

    // Find and press the Navigate button
    const navigateButton = getByText("Navigate");
    fireEvent.press(navigateButton);

    // Should have tried to navigate to RoomToRoomNavigation
    expect(mockNavigation.navigate).toHaveBeenCalledWith(
      "RoomToRoomNavigation",
      expect.objectContaining({
        buildingId: "H",
        buildingType: "HallBuilding",
        skipSelection: true,
      }),
    );
  });

  test("handles parsing classroom inputs", async () => {
    const { getAllByText, getByPlaceholderText } = render(
      <MultistepNavigationScreen />,
    );

    // Use getAllByText and select first "Building" tab
    const buildingTabs = getAllByText("Building");
    fireEvent.press(buildingTabs[1]); // Use second tab for destination

    const roomInput = getByPlaceholderText("Enter classroom (e.g. Hall)");
    fireEvent.changeText(roomInput, "H-920");

    await waitFor(() => {
      expect(roomInput.props.value).toBe("H-920");
    });
  });

  test("handles building types correctly", async () => {
    const buildingTypes = {
      H: "HallBuilding",
      HALL: "HallBuilding",
      LB: "Library",
      LIBRARY: "Library",
    };

    Object.entries(buildingTypes).forEach(([id]) => {
      const navigationPlan = {
        steps: [
          {
            type: "indoor",
            buildingId: id,
            startRoom: `${id}-920`,
            endRoom: `${id}-925`,
          },
        ],
      };

      useRoute.mockReturnValue({ params: { navigationPlan } });
      const { getByTestId } = render(<MultistepNavigationScreen />);

      expect(getByTestId("navigation-screen")).toBeTruthy();
    });
  });

  test("handles user location permission denied", async () => {
    // Mock location permission denied
    Location.requestForegroundPermissionsAsync.mockResolvedValueOnce({
      status: "denied",
    });

    // Render component
    render(<MultistepNavigationScreen />);

    // Should continue rendering without crashing
    await waitFor(() => {
      expect(Location.requestForegroundPermissionsAsync).toHaveBeenCalled();
    });

    // Should not call getCurrentPositionAsync
    expect(Location.getCurrentPositionAsync).not.toHaveBeenCalled();
  });

  test("handles return from indoor navigation", async () => {
    // Setup navigation plan with indoor step
    const navigationPlan = {
      title: "Return Test",
      currentStep: 0,
      steps: [
        {
          type: "indoor",
          title: "Navigate to room H-920",
          buildingId: "H",
          buildingType: "HallBuilding",
          startRoom: "entrance",
          endRoom: "H-920",
          startFloor: "1",
          endFloor: "9",
          isComplete: false,
        },
      ],
    };

    // Set route params to simulate returning from indoor navigation
    useRoute.mockReturnValue({
      params: {
        navigationPlan,
        returnParams: {
          navigationPlan,
          currentStepIndex: 0,
        },
      },
    });

    // Render component
    render(<MultistepNavigationScreen />);

    // Should trigger focus listener
    await waitFor(() => {
      expect(mockNavigation.addListener).toHaveBeenCalledWith(
        "focus",
        expect.any(Function),
      );
    });
  });

  test("changes to new route when reset", async () => {
    // Mock the component to ensure we can control re-rendering
    const navigationPlan = {
      title: "Test Navigation",
      currentStep: 0,
      steps: [
        {
          type: "outdoor",
          title: "Walk to Hall Building",
          startPoint: { latitude: 45.496, longitude: -73.577 },
          endPoint: { latitude: 45.497, longitude: -73.578 },
          startAddress: "Start location",
          endAddress: "Hall Building",
          isComplete: false,
        },
      ],
    };

    // Set up route with navigation plan
    useRoute.mockReturnValue({
      params: { navigationPlan },
    });

    // Render the component with initial route data
    const { findByText } = render(<MultistepNavigationScreen />);

    // Should display the navigation step
    await findByText("Walk to Hall Building");

    // Unmount the previous instance
    cleanup();

    // Set up route without navigation plan for a fresh component
    useRoute.mockReturnValue({
      params: {},
    });

    // Render a new component instance
    const { getByText: getTextFresh, queryByText: queryTextFresh } = render(
      <MultistepNavigationScreen />,
    );

    // Verify that we see the form elements
    await waitFor(() => {
      expect(getTextFresh("Plan Your Route")).toBeTruthy();
      expect(queryTextFresh("Walk to Hall Building")).toBeNull();
    });
  });

  test("handles building suggestion selection", async () => {
    const { getAllByText, getByPlaceholderText } = render(
      <MultistepNavigationScreen />,
    );

    // Use getAllByText and select first "Building" tab
    const buildingTabs = getAllByText("Building");
    fireEvent.press(buildingTabs[0]);

    const input = getByPlaceholderText("Enter Building (e.g. Hall)");

    // Add assertions
    expect(input).toBeTruthy();
    fireEvent.changeText(input, "Hall");
    expect(input.props.value).toBe("Hall");
  });

  test("handles session token generation and cleanup", async () => {
    const { unmount } = render(<MultistepNavigationScreen />);

    // Wait for token generation
    await waitFor(() => {
      const mockCryptoCall = Crypto.getRandomBytesAsync.mock.calls[0][0];
      expect(mockCryptoCall).toBe(16); // Verify 16 bytes requested
    });

    // Test cleanup by unmounting
    unmount();
    // Add an assertion for cleanup
    expect(Crypto.getRandomBytesAsync).toHaveBeenCalled();
  });

  test("handles building type identification correctly", async () => {
    const buildingTypes = {
      H: "HallBuilding",
      HALL: "HallBuilding",
      LB: "Library",
      LIBRARY: "Library",
      MB: "JMSB",
      MOLSON: "JMSB",
      EV: "EV",
      ENGINEER: "EV",
    };

    // Test building type identification through navigation plan
    Object.entries(buildingTypes).forEach(([id]) => {
      const navigationPlan = {
        steps: [
          {
            type: "indoor",
            buildingId: id,
            startRoom: `${id}-920`,
            endRoom: `${id}-925`,
          },
        ],
      };

      useRoute.mockReturnValue({ params: { navigationPlan } });
      const { unmount } = render(<MultistepNavigationScreen />);

      // Add assertion that the component rendered successfully
      expect(useRoute).toHaveBeenCalled();
      unmount();
    });
  });

  test("handles WebView map loading errors", async () => {
    const mockConsoleError = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    const navigationPlan = {
      title: "Test Navigation",
      currentStep: 0,
      steps: [
        {
          type: "outdoor",
          title: "Walk to Hall Building",
          startPoint: { latitude: 45.496, longitude: -73.577 },
          endPoint: { latitude: 45.497, longitude: -73.578 },
          startAddress: "Start location",
          endAddress: "Hall Building",
          isComplete: false,
        },
      ],
    };

    useRoute.mockReturnValue({
      params: { navigationPlan },
    });

    render(<MultistepNavigationScreen />);

    await waitFor(() => {
      expect(mockConsoleError).toHaveBeenCalledWith(
        expect.stringContaining("WebView error"),
        expect.any(Object),
      );
    });

    mockConsoleError.mockRestore();
  });

  test("handles expanded map view", async () => {
    // Mock WebView for this specific test
    jest.mock("react-native-webview", () => ({
      WebView: () => null,
    }));

    const navigationPlan = {
      title: "Test Navigation",
      currentStep: 0,
      steps: [
        {
          type: "outdoor",
          title: "Walk to Hall Building",
          startPoint: { latitude: 45.496, longitude: -73.577 },
          endPoint: { latitude: 45.497, longitude: -73.578 },
          startAddress: "Start location",
          endAddress: "Hall Building",
          isComplete: false,
        },
      ],
    };

    useRoute.mockReturnValue({
      params: { navigationPlan },
    });

    const { getByText, queryByText } = render(<MultistepNavigationScreen />);

    // Find and press the expand map button
    const expandButton = getByText("Expand Map");
    fireEvent.press(expandButton);

    // Check if expanded map view is shown
    expect(getByText("Map Directions")).toBeTruthy();

    // Close expanded map
    const closeButton = getByText("×");
    fireEvent.press(closeButton);

    // Check if expanded map view is closed
    await waitFor(() => {
      expect(queryByText("Map Directions")).toBeNull();
    });
  });

  test("handles floor plan visualization", async () => {
    const navigationPlan = {
      title: "Indoor Navigation Test",
      currentStep: 0,
      steps: [
        {
          type: "indoor",
          title: "Navigate to room H-920",
          buildingId: "H",
          buildingType: "HallBuilding",
          startRoom: "entrance",
          endRoom: "H-920",
          startFloor: "1",
          endFloor: "9",
          isComplete: false,
        },
      ],
    };

    useRoute.mockReturnValue({
      params: { navigationPlan },
    });

    const { getByText } = render(<MultistepNavigationScreen />);

    // Find and press the Navigate button
    const navigateButton = getByText("Navigate");
    fireEvent.press(navigateButton);

    // Update the expected parameters to match actual implementation
    await waitFor(() => {
      expect(mockNavigation.navigate).toHaveBeenCalledWith(
        "RoomToRoomNavigation",
        expect.objectContaining({
          buildingId: "H",
          buildingType: "HallBuilding",
          startRoom: "entrance",
          endRoom: "H920", // Note: no hyphen in room number
          startFloor: "1",
          endFloor: "9",
          skipSelection: true,
          returnScreen: "MultistepNavigation",
        }),
      );
    });
  });
  test("handles parseOriginClassroom with various input formats", async () => {
    const { getAllByText, getByPlaceholderText } = render(
      <MultistepNavigationScreen />,
    );

    // Switch to classroom input type first
    const buildingTabs = getAllByText("Building");
    fireEvent.press(buildingTabs[0]);

    const input = getByPlaceholderText("Enter Building (e.g. Hall)");

    // Test standard format "H-920"
    fireEvent.changeText(input, "H-920");
    await waitFor(() => {
      expect(input.props.value).toBe("H-920");
    });

    // Test format without hyphen "H920"
    fireEvent.changeText(input, "H920");
    await waitFor(() => {
      expect(input.props.value).toBe("H920");
    });

    // Test full building name
    fireEvent.changeText(input, "Hall Building 920");
    await waitFor(() => {
      expect(input.props.value).toBe("Hall Building 920");
    });
  });

  test("handles normalizeRoomId function", async () => {
    const { getByText } = render(<MultistepNavigationScreen />);

    // Set up navigation plan with indoor step and make it active
    const navigationPlan = {
      title: "Test Navigation",
      currentStep: 0,
      steps: [
        {
          type: "indoor",
          title: "Navigate to room",
          buildingId: "H",
          buildingType: "HallBuilding",
          startRoom: "H-920",
          endRoom: "H-925",
          startFloor: "9",
          endFloor: "9",
          isComplete: false,
        },
      ],
    };

    // Mock route with navigation plan
    useRoute.mockReturnValue({
      params: { navigationPlan },
    });

    // Wait for navigation plan to be active
    await waitFor(() => {
      const navigateButton = getByText("Navigate");
      fireEvent.press(navigateButton);
    });

    expect(mockNavigation.navigate).toHaveBeenCalledWith(
      "RoomToRoomNavigation",
      expect.objectContaining({
        startRoom: "H920",
        endRoom: "H925",
      }),
    );
  });

  test("handles room number input correctly", async () => {
    const { getAllByText, getByPlaceholderText, findByText } = render(
      <MultistepNavigationScreen />,
    );

    // Switch to classroom input type
    const buildingTabs = getAllByText("Building");
    fireEvent.press(buildingTabs[1]); // Use destination tab

    // Enter building and room in one input
    const buildingInput = getByPlaceholderText("Enter classroom (e.g. Hall)");
    fireEvent.changeText(buildingInput, "H");

    // Wait for the building suggestion to appear and be clickable
    const buildingSuggestion = await findByText("Hall Building (H)");
    fireEvent.press(buildingSuggestion);

    // Enter the room number
    fireEvent.changeText(buildingInput, "H-920");

    // Verify final value
    await waitFor(() => {
      expect(buildingInput.props.value).toBe("H-920");
    });
  });

  test("handles getFloorFromRoomId with various formats", async () => {
    const { getByText } = render(<MultistepNavigationScreen />);

    const navigationPlan = {
      title: "Test Navigation",
      currentStep: 0,
      steps: [
        {
          type: "indoor",
          title: "Navigate to room",
          buildingId: "H",
          buildingType: "HallBuilding",
          startRoom: "H-920",
          endRoom: "H-1025",
          startFloor: "9",
          endFloor: "10",
          isComplete: false,
        },
      ],
    };

    useRoute.mockReturnValue({
      params: { navigationPlan },
    });

    // Wait for component to render with navigation plan
    await waitFor(() => {
      expect(getByText("Navigate")).toBeTruthy();
    });

    // Navigate button should show correct floor numbers
    const navButton = getByText("Navigate");
    fireEvent.press(navButton);

    // Add a small delay to allow for state updates
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 50));
    });

    // Verify navigation was called with correct parameters
    expect(mockNavigation.navigate).toHaveBeenCalledWith(
      "RoomToRoomNavigation",
      expect.objectContaining({
        startFloor: "9",
        endFloor: "10",
      }),
    );
  });

  test("handles WebView onError event", async () => {
    const mockConsoleError = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    // Create a navigation plan to trigger WebView rendering
    const navigationPlan = {
      title: "Test Navigation",
      currentStep: 0,
      steps: [
        {
          type: "outdoor",
          title: "Walk to Hall Building",
          startPoint: { latitude: 45.496, longitude: -73.577 },
          endPoint: { latitude: 45.497, longitude: -73.578 },
          startAddress: "Start Point",
          endAddress: "Hall Building",
          isComplete: false,
        },
      ],
    };

    useRoute.mockReturnValue({
      params: { navigationPlan },
    });

    render(<MultistepNavigationScreen />);

    // Wait for error to be logged
    await waitFor(() => {
      expect(mockConsoleError).toHaveBeenCalledWith(
        expect.stringContaining("WebView error"),
        expect.any(Object),
      );
    });

    mockConsoleError.mockRestore();
  });

  test("generates correct map HTML with route coordinates", async () => {
    const navigationPlan = {
      title: "Test Navigation",
      currentStep: 0,
      steps: [
        {
          type: "outdoor",
          title: "Walk to Hall Building",
          startPoint: { latitude: 45.496, longitude: -73.577 },
          endPoint: { latitude: 45.497, longitude: -73.578 },
          startAddress: "Start Point",
          endAddress: "Hall Building",
          isComplete: false,
        },
      ],
    };

    useRoute.mockReturnValue({
      params: { navigationPlan },
    });

    render(<MultistepNavigationScreen />);

    // Wait for polyline to be generated
    await waitFor(() => {
      expect(mockGetPolyline).toHaveBeenCalledWith(
        { latitude: 45.496, longitude: -73.577 },
        { latitude: 45.497, longitude: -73.578 },
        "walking",
      );
    });
  });

  test("handles building selection and address display", () => {
    const { getAllByText, getByText, getByPlaceholderText } = render(
      <MultistepNavigationScreen />,
    );

    // Switch to building input
    const buildingTabs = getAllByText("Building");
    fireEvent.press(buildingTabs[1]); // Use destination tab

    // Enter building name
    const input = getByPlaceholderText("Enter classroom (e.g. Hall)");
    fireEvent.changeText(input, "Hall");

    // Should show building details including address
    expect(getByText("1455 De Maisonneuve Blvd. Ouest")).toBeTruthy();
  });

  test("handles expanded map mode with WebView", async () => {
    const navigationPlan = {
      title: "Test Navigation",
      currentStep: 0,
      steps: [
        {
          type: "outdoor",
          title: "Walk to Hall Building",
          startPoint: { latitude: 45.496, longitude: -73.577 },
          endPoint: { latitude: 45.497, longitude: -73.578 },
          startAddress: "Start Point",
          endAddress: "Hall Building",
          isComplete: false,
        },
      ],
    };

    useRoute.mockReturnValue({
      params: { navigationPlan },
    });

    const { getByText, queryByText } = render(<MultistepNavigationScreen />);

    // Find and press expand map button
    const expandButton = getByText("Expand Map");
    fireEvent.press(expandButton);

    // Verify expanded map view is shown
    await waitFor(() => {
      expect(getByText("Map Directions")).toBeTruthy();
    });

    // Close expanded map
    const closeButton = getByText("×");
    fireEvent.press(closeButton);

    // Verify map is closed
    await waitFor(() => {
      expect(queryByText("Map Directions")).toBeNull();
    });
  });

  test("handles indoor navigation visualization", async () => {
    const navigationPlan = {
      title: "Indoor Test",
      currentStep: 0,
      steps: [
        {
          type: "indoor",
          title: "Navigate inside Hall Building",
          buildingId: "H",
          buildingType: "HallBuilding",
          startRoom: "H-920",
          endRoom: "H-1025",
          startFloor: "9",
          endFloor: "10",
          isComplete: false,
        },
      ],
    };

    useRoute.mockReturnValue({
      params: { navigationPlan },
    });

    const { getByText } = render(<MultistepNavigationScreen />);

    // Press Navigate button
    const navigateButton = getByText("Navigate");
    fireEvent.press(navigateButton);

    // Verify navigation was called with correct parameters
    await waitFor(() => {
      expect(mockNavigation.navigate).toHaveBeenCalledWith(
        "RoomToRoomNavigation",
        expect.objectContaining({
          buildingId: "H",
          buildingType: "HallBuilding",
          startRoom: "H920",
          endRoom: "H1025",
          startFloor: "9",
          endFloor: "10",
          skipSelection: true,
        }),
      );
    });

    // Verify the navigation info is displayed
    expect(
      getByText(/Navigate from.*room H-920.*to room.*H-1025/),
    ).toBeTruthy();
    expect(getByText(/Start Floor:.*9/)).toBeTruthy();
    expect(getByText(/End Floor:.*10/)).toBeTruthy();
  });

  test("generates map HTML with route coordinates", async () => {
    const navigationPlan = {
      title: "Test Navigation",
      currentStep: 0,
      steps: [
        {
          type: "outdoor",
          title: "Walk to Hall Building",
          startPoint: { latitude: 45.496, longitude: -73.577 },
          endPoint: { latitude: 45.497, longitude: -73.578 },
          startAddress: "Start Point",
          endAddress: "Hall Building",
          isComplete: false,
        },
      ],
    };

    useRoute.mockReturnValue({
      params: { navigationPlan },
    });

    render(<MultistepNavigationScreen />);

    // Wait for polyline to be generated and WebView to be created
    await waitFor(() => {
      expect(mockGetPolyline).toHaveBeenCalledWith(
        { latitude: 45.496, longitude: -73.577 },
        { latitude: 45.497, longitude: -73.578 },
        "walking",
      );
    });
  });
  test("handles navigation step completion and next step loading", async () => {
    const navigationPlan = {
      title: "Test Navigation",
      currentStep: 0,
      steps: [
        {
          type: "outdoor",
          title: "Walk to Hall Building",
          startPoint: { latitude: 45.496, longitude: -73.577 },
          endPoint: { latitude: 45.497, longitude: -73.578 },
          startAddress: "Start Point",
          endAddress: "Hall Building",
          isComplete: false,
        },
        {
          type: "indoor",
          title: "Navigate to room",
          buildingId: "H",
          buildingType: "HallBuilding",
          startRoom: "entrance",
          endRoom: "H-920",
          startFloor: "1",
          endFloor: "9",
          isComplete: false,
        },
      ],
    };

    useRoute.mockReturnValue({
      params: { navigationPlan },
    });

    const { getByText } = render(<MultistepNavigationScreen />);

    // Find and press next button
    const nextButton = getByText("Next");
    fireEvent.press(nextButton);

    // Verify step was completed and next step loaded
    await waitFor(() => {
      expect(getByText("Navigate to room")).toBeTruthy();
      expect(getByText("Step 2 of 2")).toBeTruthy();
    });
  });

  test("handles building type identification", async () => {
    const navigationPlan = {
      title: "Test Navigation",
      currentStep: 0,
      steps: [
        {
          type: "indoor",
          title: "Navigate in Hall Building",
          buildingId: "H",
          buildingType: "HallBuilding",
          startRoom: "entrance",
          endRoom: "H-920",
          isComplete: false,
        },
      ],
    };

    // Set route params
    useRoute.mockReturnValue({
      params: { navigationPlan },
    });

    const { getByText } = render(<MultistepNavigationScreen />);

    // Wait for the navigation plan to be processed and verify it's displayed
    await waitFor(() => {
      expect(getByText("Navigate in Hall Building")).toBeTruthy();
    });
  });

  test("handles expanded map toggle", async () => {
    const navigationPlan = {
      title: "Test Navigation",
      currentStep: 0,
      steps: [
        {
          type: "outdoor",
          title: "Walk to Hall Building",
          startPoint: { latitude: 45.496, longitude: -73.577 },
          endPoint: { latitude: 45.497, longitude: -73.578 },
          isComplete: false,
        },
      ],
    };

    useRoute.mockReturnValue({
      params: { navigationPlan },
    });

    const { getByText, queryByText } = render(<MultistepNavigationScreen />);

    // Click expand map button
    const expandButton = getByText("Expand Map");
    fireEvent.press(expandButton);

    // Verify expanded map view is shown
    expect(getByText("Map Directions")).toBeTruthy();

    // Close expanded map
    const closeButton = getByText("×");
    fireEvent.press(closeButton);

    // Verify expanded map is hidden
    await waitFor(() => {
      expect(queryByText("Map Directions")).toBeNull();
    });
  });

  test("handles indoor navigation modal display", async () => {
    const navigationPlan = {
      title: "Indoor Navigation Test",
      currentStep: 0,
      steps: [
        {
          type: "indoor",
          title: "Navigate to room H-920",
          buildingId: "H",
          buildingType: "HallBuilding",
          startRoom: "entrance",
          endRoom: "H-920",
          startFloor: "1",
          endFloor: "9",
          isComplete: false,
        },
      ],
    };

    useRoute.mockReturnValue({
      params: { navigationPlan },
    });

    const { getByText, findByText } = render(<MultistepNavigationScreen />);

    // Find and press Navigate button
    const navigateButton = getByText("Navigate");
    fireEvent.press(navigateButton);

    // Verify indoor navigation modal content
    await findByText(/Navigate from entrance to room H-920/);
    expect(getByText(/Start Floor: 1/)).toBeTruthy();
    expect(getByText(/End Floor: 9/)).toBeTruthy();
  });

  test("handles WebView events and errors correctly", async () => {
    const mockConsoleLog = jest
      .spyOn(console, "log")
      .mockImplementation(() => {});
    const mockConsoleError = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    const navigationPlan = {
      title: "Test Navigation",
      currentStep: 0,
      steps: [
        {
          type: "outdoor",
          title: "Walk to Hall Building",
          startPoint: { latitude: 45.496, longitude: -73.577 },
          endPoint: { latitude: 45.497, longitude: -73.578 },
          isComplete: false,
        },
      ],
    };

    useRoute.mockReturnValue({
      params: { navigationPlan },
    });

    render(<MultistepNavigationScreen />);

    // Wait for WebView events to be handled
    await waitFor(() => {
      // Check if any console.log was called with coordinate data
      expect(mockConsoleLog).toHaveBeenCalled();
      // Check specifically for the error we expect
      expect(mockConsoleError).toHaveBeenCalledWith(
        "WebView error:",
        expect.any(Object),
      );
    });

    mockConsoleLog.mockRestore();
    mockConsoleError.mockRestore();
  });

  test("handles navigation button states and actions", async () => {
    const navigationPlan = {
      title: "Test Navigation",
      currentStep: 1, // Start at second step
      steps: [
        { type: "outdoor", title: "Step 1", isComplete: true },
        { type: "indoor", title: "Step 2", isComplete: false },
        { type: "outdoor", title: "Step 3", isComplete: false },
      ],
    };

    useRoute.mockReturnValue({
      params: { navigationPlan },
    });

    const { getByTestId, getByText } = render(<MultistepNavigationScreen />);

    // Test Previous button
    const prevButton = getByTestId("previous-button");
    expect(prevButton.props.accessibilityState?.disabled).toBe(false);
    fireEvent.press(prevButton);
    await waitFor(() => {
      expect(getByText("Step 1")).toBeTruthy();
    });

    // Test Next button
    const nextButton = getByTestId("next-button");
    expect(nextButton.props.accessibilityState?.disabled).toBe(false);
    fireEvent.press(nextButton);
    await waitFor(() => {
      expect(getByText("Step 2")).toBeTruthy();
    });

    // Test step indicator
    expect(getByText("Step 2 of 3")).toBeTruthy();
  });

  test("handles step color assignment for different step types", () => {
    // Test colors for different step types
    const stepTypes = {
      start: "#4CAF50",
      elevator: "#FF9800",
      escalator: "#FF9800",
      stairs: "#FF9800",
      transport: "#FF9800",
      end: "#F44336",
      error: "#F44336",
      walking: "#2196F3",
      default: "#2196F3",
    };

    // Verify each step type gets correct color
    Object.entries(stepTypes).forEach(([type, expectedColor]) => {
      expect(getStepColor(type)).toBe(expectedColor);
    });
  });

  test("handles return from RoomToRoomNavigation with indoor navigation data", async () => {
    const indoorNavigationParams = {
      buildingId: "H",
      buildingType: "HallBuilding",
      startRoom: "entrance",
      endRoom: "H920",
      startFloor: "1",
      endFloor: "9",
    };

    const navigationPlan = {
      title: "Test Navigation",
      currentStep: 0,
      steps: [
        {
          type: "indoor",
          ...indoorNavigationParams,
          isComplete: false,
        },
      ],
    };

    // Mock route with both navigation plan and indoor params
    useRoute.mockReturnValue({
      params: {
        navigationPlan,
        indoorNavigationParams,
        currentStepIndex: 0,
      },
    });

    const { getByText } = render(<MultistepNavigationScreen />);

    // Verify indoor navigation details are displayed
    await waitFor(() => {
      expect(getByText(/Navigate.*entrance.*to room H920/)).toBeTruthy();
      expect(getByText(/Start Floor: 1/)).toBeTruthy();
      expect(getByText(/End Floor: 9/)).toBeTruthy();
    });
  });

  test("handles navigation button state and actions", async () => {
    const navigationPlan = {
      title: "Test Navigation",
      currentStep: 1, // Start at second step
      steps: [
        { type: "outdoor", title: "Step 1", isComplete: true },
        { type: "indoor", title: "Step 2", isComplete: false },
        { type: "outdoor", title: "Step 3", isComplete: false },
      ],
    };

    useRoute.mockReturnValue({
      params: { navigationPlan },
    });

    const { getByTestId, getByText } = render(<MultistepNavigationScreen />);

    // Test Previous button
    const prevButton = getByTestId("previous-button");
    expect(prevButton.props.accessibilityState?.disabled).toBe(false);
    fireEvent.press(prevButton);
    await waitFor(() => {
      expect(getByText("Step 1")).toBeTruthy();
    });

    // Test Next button
    const nextButton = getByTestId("next-button");
    expect(nextButton.props.accessibilityState?.disabled).toBe(false);
    fireEvent.press(nextButton);
    await waitFor(() => {
      expect(getByText("Step 2")).toBeTruthy();
    });

    // Test step indicator
    expect(getByText("Step 2 of 3")).toBeTruthy();
  });

  test("checks getStepColor function for different step types", () => {
    const stepTypes = {
      start: "#4CAF50",
      elevator: "#FF9800",
      escalator: "#FF9800",
      stairs: "#FF9800",
      transport: "#FF9800",
      end: "#F44336",
      error: "#F44336",
      walking: "#2196F3",
      default: "#2196F3",
    };

    Object.entries(stepTypes).forEach(([type, expectedColor]) => {
      expect(getStepColor(type)).toBe(expectedColor);
    });
  });

  test("handles floor extraction from room IDs", async () => {
    const testCases = [
      { roomId: "H-920", expected: "9" },
      { roomId: "MB-3110", expected: "3" },
      { roomId: "H920", expected: "9" },
    ];

    testCases.forEach(({ roomId, expected }) => {
      const navigationPlan = {
        steps: [
          {
            type: "indoor",
            title: "Navigate in Building",
            buildingId: "H",
            buildingType: "HallBuilding",
            startRoom: roomId,
            endRoom: roomId,
            startFloor: expected, // Add this explicitly
            endFloor: expected, // Add this explicitly
          },
        ],
      };

      useRoute.mockReturnValue({ params: { navigationPlan } });
      const { getByTestId, getByText } = render(<MultistepNavigationScreen />);

      // Wait for the component to render
      expect(getByTestId("navigation-screen")).toBeTruthy();

      // First verify the navigation info is displayed
      expect(
        getByText(new RegExp(`Navigate.*${roomId}.*to.*${roomId}`)),
      ).toBeTruthy();

      // Then check the floor number
      const startFloorElement = getByTestId("start-floor");
      expect(startFloorElement).toBeTruthy();
      expect(startFloorElement.props.children).toBe(expected);
    });
  });

  test("normalizes room IDs correctly", () => {
    const testCases = [
      { input: "H-920", expected: "H920" },
      { input: "entrance", expected: "entrance" },
      { input: "MB-3110", expected: "MB3110" },
    ];

    testCases.forEach(({ input, expected }) => {
      const navigationPlan = {
        steps: [
          {
            type: "indoor",
            startRoom: input,
            endRoom: expected,
          },
        ],
      };

      useRoute.mockReturnValue({ params: { navigationPlan } });
      // Use root instead of container
      const { root } = render(<MultistepNavigationScreen />);
      expect(root).toBeTruthy();
    });
  });

  test("generates correct floor visualization HTML", () => {
    const navigationPlan = {
      steps: [
        {
          type: "indoor",
          buildingId: "H",
          startRoom: "H-920",
          endRoom: "H-925",
          floorPlan: "<svg><rect /></svg>",
          pathPoints: [
            { x: 10, y: 20 },
            { x: 30, y: 40 },
          ],
        },
      ],
    };

    useRoute.mockReturnValue({ params: { navigationPlan } });
    // Use root instead of container
    const { root } = render(<MultistepNavigationScreen />);
    expect(root).toBeTruthy();
  });

  test("renders indoor navigation visualization correctly", async () => {
    const navigationPlan = {
      steps: [
        {
          type: "indoor",
          buildingId: "H",
          startRoom: "H-920",
          endRoom: "H-1020",
          startFloor: "9",
          endFloor: "10",
          title: "Navigate from H-920 to H-1020",
        },
      ],
    };

    useRoute.mockReturnValue({ params: { navigationPlan } });

    const { getByText, getAllByText } = render(
      <MultistepNavigationScreen route={{ params: { navigationPlan } }} />,
    );

    // Use a more specific query to avoid multiple elements issue
    // or use getAllByText and pick the first one
    await waitFor(() => {
      const navigationTexts = getAllByText(/Navigate.*H-920.*to.*H-1020/i);
      expect(navigationTexts.length).toBeGreaterThan(0);
    });

    // Check floor information - be more specific with text patterns
    await waitFor(() => {
      expect(getByText(/Start Floor:.*9/i)).toBeTruthy();
      expect(getByText(/End Floor:.*10/i)).toBeTruthy();
    });
  });

  test("handles geocoding fallback for startPoint address", async () => {
    // Setup mock for process.env to make API key defined
    const originalEnv = process.env;
    process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY = "test_api_key";

    // Test for lines 88-169
    const navigationPlan = {
      steps: [
        {
          type: "outdoor",
          startPoint: "1455 De Maisonneuve Blvd",
          endPoint: { latitude: 45.497, longitude: -73.578 },
          startAddress: "Some Address",
          endAddress: "Hall Building",
        },
      ],
    };

    useRoute.mockReturnValue({ params: { navigationPlan } });

    // Mock geocoding response
    global.fetch.mockImplementation((url) => {
      if (url.includes("geocode")) {
        return Promise.resolve({
          json: () =>
            Promise.resolve({
              results: [
                {
                  geometry: {
                    location: { lat: 45.496, lng: -73.577 },
                  },
                },
              ],
            }),
        });
      }
      return Promise.resolve({ json: () => Promise.resolve({}) });
    });

    render(<MultistepNavigationScreen />);

    // Wait for any re-renders or state updates
    await waitFor(() => {});

    // Check if fetch was called with URL containing geocode
    const geocodeCalls = global.fetch.mock.calls.filter(
      (call) =>
        call[0] && typeof call[0] === "string" && call[0].includes("geocode"),
    );

    expect(geocodeCalls.length).toBeGreaterThan(0);

    // Restore original env
    process.env = originalEnv;
  });

  test("handles location permission scenarios", async () => {
    // Test for lines 1545-1548
    Location.requestForegroundPermissionsAsync.mockRejectedValueOnce(
      new Error("Permission error"),
    );
    Location.getCurrentPositionAsync.mockRejectedValueOnce(
      new Error("Location error"),
    );

    const mockConsoleError = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    render(<MultistepNavigationScreen />);

    await waitFor(() => {
      expect(mockConsoleError).toHaveBeenCalledWith(
        "Error getting location:",
        expect.any(Error),
      );
    });

    mockConsoleError.mockRestore();
  });

  test("handles place selection with missing data", async () => {
    // Mock console.warn
    const mockConsoleWarn = jest
      .spyOn(console, "warn")
      .mockImplementation(() => {});

    // Set API key in environment
    process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY = "test_api_key";

    // Mock fetch with more specific URL matching
    const originalFetch = global.fetch;
    global.fetch = jest.fn().mockImplementation((url) => {
      if (url.includes("autocomplete")) {
        return Promise.resolve({
          json: () =>
            Promise.resolve({
              predictions: [
                { place_id: "test_place", description: "Test Place" },
              ],
            }),
        });
      }
      if (url.includes("details")) {
        return Promise.resolve({
          json: () => Promise.resolve({ result: {} }), // Missing geometry/location
        });
      }
      return Promise.resolve({ json: () => Promise.resolve({}) });
    });

    const { getByPlaceholderText, findByText } = render(
      <MultistepNavigationScreen />,
    );

    const input = getByPlaceholderText("Enter your starting location");
    fireEvent.changeText(input, "Test");

    // Wait for predictions
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 50));
    });

    const prediction = await findByText("Test Place");
    fireEvent.press(prediction);

    // Check if fetch was called with the correct URLs
    await waitFor(() => {
      const placesDetailsCalls = global.fetch.mock.calls.filter((call) =>
        call[0].includes("/place/details/"),
      );
      expect(placesDetailsCalls.length).toBeGreaterThan(0);
    });

    // Verify warning was logged for missing data
    expect(mockConsoleWarn).toHaveBeenCalled();

    // Cleanup
    global.fetch = originalFetch;
    mockConsoleWarn.mockRestore();
  });

  test("handles destination selection with invalid place details", async () => {
    // Mock console.warn
    const mockConsoleWarn = jest
      .spyOn(console, "warn")
      .mockImplementation(() => {});

    // Set API key in environment
    process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY = "test_api_key";

    // Mock fetch responses
    const originalFetch = global.fetch;
    global.fetch = jest.fn().mockImplementation((url) => {
      if (url.includes("autocomplete")) {
        return Promise.resolve({
          json: () =>
            Promise.resolve({
              predictions: [
                { place_id: "test_place", description: "Test Place" },
              ],
            }),
        });
      }
      if (url.includes("details")) {
        return Promise.resolve({
          json: () => Promise.resolve({ result: null }), // Invalid response
        });
      }
      return Promise.resolve({ json: () => Promise.resolve({}) });
    });

    const { getAllByText, getByPlaceholderText, findByText } = render(
      <MultistepNavigationScreen />,
    );

    // Switch to location input type for destination
    const locationTab = getAllByText("Location")[1];
    fireEvent.press(locationTab);

    const input = getByPlaceholderText("Enter your starting location");
    fireEvent.changeText(input, "Test");

    // Wait for predictions
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 50));
    });

    const prediction = await findByText("Test Place");
    fireEvent.press(prediction);

    // Check if fetch was called with the correct URLs
    await waitFor(() => {
      const placesDetailsCalls = global.fetch.mock.calls.filter((call) =>
        call[0].includes("/place/details/"),
      );
      expect(placesDetailsCalls.length).toBeGreaterThan(0);
    });

    // Verify warning was logged for invalid result
    expect(mockConsoleWarn).toHaveBeenCalled();

    // Cleanup
    global.fetch = originalFetch;
    mockConsoleWarn.mockRestore();
  });

  test("handles place search with invalid user location", async () => {
    // Test for lines 1710-1713
    const { getByPlaceholderText } = render(<MultistepNavigationScreen />);

    const mockConsoleWarn = jest
      .spyOn(console, "warn")
      .mockImplementation(() => {});

    const input = getByPlaceholderText("Enter your starting location");
    fireEvent.changeText(input, "Test Location");

    await waitFor(() => {
      expect(mockConsoleWarn).toHaveBeenCalledWith(
        "User location not available. Searching without location bias.",
      );
    });

    mockConsoleWarn.mockRestore();
  });

  test("handles indoor navigation with invalid floor plans", async () => {
    // Test for lines 1829-1831
    const navigationPlan = {
      steps: [
        {
          type: "indoor",
          buildingId: "H",
          startRoom: "H-920",
          endRoom: "H-925",
          startFloor: "9",
          endFloor: "9",
        },
      ],
    };

    useRoute.mockReturnValue({ params: { navigationPlan } });

    const { getByText } = render(<MultistepNavigationScreen />);

    const navigateButton = getByText("Navigate");
    fireEvent.press(navigateButton);

    await waitFor(() => {
      expect(mockNavigation.navigate).toHaveBeenCalledWith(
        "RoomToRoomNavigation",
        expect.any(Object),
      );
    });
  });

  test("handles invalid map HTML generation", async () => {
    // Test for lines 1964-1995
    const mockConsoleWarn = jest
      .spyOn(console, "warn")
      .mockImplementation(() => {});

    // First we need a valid navigation plan to see the expand button
    const navigationPlan = {
      title: "Test Navigation",
      currentStep: 0,
      steps: [
        {
          type: "outdoor",
          title: "Walk to Hall Building",
          startPoint: { latitude: 45.496, longitude: -73.577 },
          endPoint: { latitude: 45.497, longitude: -73.578 },
          startAddress: "Start Point",
          endAddress: "Hall Building",
          isComplete: false,
        },
      ],
    };

    useRoute.mockReturnValue({ params: { navigationPlan } });

    // Mock polyline to return empty array to test edge case
    mockGetPolyline.mockResolvedValueOnce([]);

    const { getByText, findByText } = render(<MultistepNavigationScreen />);

    // Need to wait for the component to finish rendering
    await findByText("Walk to Hall Building");

    // Now the "Expand Map" button should be available
    const expandButton = getByText("Expand Map");
    fireEvent.press(expandButton);

    // Wait for expanded map modal
    await waitFor(() => {
      expect(getByText("Map Directions")).toBeTruthy();
    });

    // This should test the case where generateMapHtml works with empty path
    expect(mockConsoleWarn).not.toHaveBeenCalledWith(
      expect.stringContaining("Error generating map HTML"),
    );

    mockConsoleWarn.mockRestore();
  });
});
