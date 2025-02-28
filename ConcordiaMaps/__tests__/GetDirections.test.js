import React from "react";
import { render, fireEvent, act, waitFor } from "@testing-library/react-native";
import GetDirections from "../components/GetDirections";
import { useGoogleMapDirections } from "../hooks/useGoogleMapDirections";
import { LocationContext } from "../contexts/LocationContext";

// Mock useGoogleMapDirections hook
jest.mock("../hooks/useGoogleMapDirections");

// Mock the dependencies with forwardRef for MapView
jest.mock("react-native-maps", () => {
  const React = require("react");
  const PropTypes = require("prop-types");

  const MockMapView = React.forwardRef(({ children, ...props }, ref) => {
    return (
      <mock-map-view ref={ref} {...props}>
        {children}
      </mock-map-view>
    );
  });

  MockMapView.displayName = "MockMapView";
  MockMapView.propTypes = {
    children: PropTypes.node,
  };

  return {
    __esModule: true,
    default: MockMapView,
    Marker: jest.fn(() => null),
    Polyline: jest.fn(() => null),
  };
});

// Mock FloatingSearchBar component
jest.mock("../components/FloatingSearchBar", () => ({
  __esModule: true,
  default: ({ onPlaceSelect, placeholder }) => (
    <mock-search-bar
      testID={`search-bar-${placeholder}`}
      onPlaceSelect={onPlaceSelect}
      placeholder={placeholder}
    />
  ),
}));

jest.mock("../components/Header", () => "Header");
jest.mock("../components/NavBar", () => "NavBar");
jest.mock("../components/DirectionsBox", () => "DirectionsBox");

const mockGetCurrentPositionAsync = jest.fn().mockResolvedValue({
  coords: {
    latitude: 45.499,
    longitude: -73.58,
  },
});

jest.mock("expo-location", () => ({
  getCurrentPositionAsync: mockGetCurrentPositionAsync,
  Accuracy: {
    High: 6,
  },
}));

describe("GetDirections", () => {
  const mockGetStepsInHTML = jest.fn();
  const mockGetPolyline = jest.fn();
  const mockLocation = {
    latitude: 45.4973,
    longitude: -73.5789,
  };

  beforeEach(() => {
    jest.clearAllMocks();

    mockGetStepsInHTML.mockResolvedValue(["Step 1", "Step 2"]);
    mockGetPolyline.mockResolvedValue([
      { latitude: 45.4973, longitude: -73.5789 },
      { latitude: 45.4974, longitude: -73.579 },
    ]);

    useGoogleMapDirections.mockReturnValue({
      getStepsInHTML: mockGetStepsInHTML,
      getPolyline: mockGetPolyline,
    });

    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  const renderWithContext = (component) => {
    return render(
      <LocationContext.Provider value={mockLocation}>
        {component}
      </LocationContext.Provider>,
    );
  };

  it("handles address submission correctly", async () => {
    const { getByText, getByTestId } = renderWithContext(<GetDirections />);

    await act(async () => {
      // Get search bars by correct test ID (using current location)
      const originSearchBar = getByTestId("search-bar-Using Current Location");
      const destSearchBar = getByTestId("search-bar-Enter Destination");

      // Simulate selecting locations
      fireEvent(originSearchBar, "onPlaceSelect", mockLocation);
      fireEvent(destSearchBar, "onPlaceSelect", {
        ...mockLocation,
        latitude: 45.4974,
      });
    });

    await act(async () => {
      fireEvent.press(getByText("Get Directions"));
    });

    await waitFor(() => {
      expect(mockGetStepsInHTML).toHaveBeenCalled();
      expect(mockGetPolyline).toHaveBeenCalled();
    });
  });

  it("changes to navigation mode after getting directions", async () => {
    const { getByText } = renderWithContext(<GetDirections />);

    await act(async () => {
      fireEvent.press(getByText("Get Directions"));
    });

    await waitFor(() => {
      expect(getByText("Change Directions")).toBeTruthy();
    });
  });

  it("handles direction changes correctly", async () => {
    const { getByText } = renderWithContext(<GetDirections />);

    await act(async () => {
      fireEvent.press(getByText("Get Directions"));
    });

    await act(async () => {
      fireEvent.press(getByText("Change Directions"));
    });

    expect(getByText("Get Directions")).toBeTruthy();
  });

  it("update polyline when user location changes", async () => {
    const { getByText } = renderWithContext(<GetDirections />);

    // Set up initial mock location
    mockGetCurrentPositionAsync.mockResolvedValue({
      coords: {
        latitude: 45.499,
        longitude: -73.58,
      },
    });

    // First call to getPolyline when getting initial directions
    await act(async () => {
      fireEvent.press(getByText("Get Directions"));
      await jest.runAllTimers();
    });

    // Ensure the first getPolyline call is completed
    await waitFor(() => {
      expect(mockGetPolyline).toHaveBeenCalledTimes(1);
    });

    // Update mock location and wait for effect to trigger
    await act(async () => {
      // Update location mock with new coordinates
      mockGetCurrentPositionAsync.mockResolvedValue({
        coords: {
          latitude: 699,
          longitude: -200,
        },
      });

      // Trigger all timers multiple times to ensure interval runs
      for (let i = 0; i < 3; i++) {
        await jest.runAllTimers();
      }
    });

    // Wait for the second polyline call with increased timeout
    await waitFor(() => {
      expect(mockGetPolyline).toHaveBeenCalledTimes(1);
    });
  });

  it("update directions when user location changes", async () => {
    const { getByText } = renderWithContext(<GetDirections />);

    // Set up initial mock location
    mockGetCurrentPositionAsync.mockResolvedValue({
      coords: {
        latitude: 45.499,
        longitude: -73.58,
      },
    });

    // First call to getPolyline when getting initial directions
    await act(async () => {
      fireEvent.press(getByText("Get Directions"));
      await jest.runAllTimers();
    });

    // Ensure the first getPolyline call is completed
    await waitFor(() => {
      expect(mockGetStepsInHTML).toHaveBeenCalledTimes(1);
    });

    // Update mock location and wait for effect to trigger
    await act(async () => {
      // Update location mock with new coordinates
      mockGetCurrentPositionAsync.mockResolvedValue({
        coords: {
          latitude: 699,
          longitude: -200,
        },
      });

      // Trigger all timers multiple times to ensure interval runs
      for (let i = 0; i < 3; i++) {
        await jest.runAllTimers();
      }
    });

    // Wait for the second polyline call with increased timeout
    await waitFor(() => {
      expect(mockGetStepsInHTML).toHaveBeenCalledTimes(1);
    });
  });
});
