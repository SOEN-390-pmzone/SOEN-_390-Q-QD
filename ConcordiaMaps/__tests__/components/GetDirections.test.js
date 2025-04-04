import React from "react";
import {
  render,
  fireEvent,
  act,
  waitFor,
  cleanup,
} from "@testing-library/react-native";
import GetDirections from "../../components/OutdoorNavigation/GetDirections";
import { useGoogleMapDirections } from "../../hooks/useGoogleMapDirections";
import { LocationContext } from "../../contexts/LocationContext";

const mockNavigate = jest.fn();

jest.mock("@react-navigation/native", () => {
  const actualNav = jest.requireActual("@react-navigation/native");
  return {
    ...actualNav,
    useRoute: jest.fn(() => ({ params: {} })),
    useNavigation: jest.fn(() => ({ navigate: mockNavigate })),
  };
});

jest.mock("../../hooks/useGoogleMapDirections");

jest.mock("react-native-maps", () => {
  const React = require("react");
  const PropTypes = require("prop-types");
  const MockMapView = React.forwardRef(({ children, ...props }, ref) => (
    <mock-map-view ref={ref} {...props}>
      {children}
    </mock-map-view>
  ));
  MockMapView.displayName = "MockMapView";
  MockMapView.propTypes = { children: PropTypes.node };
  return {
    __esModule: true,
    default: MockMapView,
    Marker: jest.fn(() => null),
    Polyline: jest.fn(() => null),
  };
});

jest.mock("../../Components/OutdoorNavigation/FloatingSearchBar", () => {
  const React = require("react");
  const PropTypes = require("prop-types");
  const MockFloatingSearchBar = ({ onPlaceSelect, placeholder, value }) => (
    <mock-search-bar
      testID={`search-bar-${placeholder}`}
      onPlaceSelect={onPlaceSelect}
      placeholder={placeholder}
      value={value}
    />
  );
  MockFloatingSearchBar.propTypes = {
    onPlaceSelect: PropTypes.func,
    placeholder: PropTypes.string,
    value: PropTypes.string,
  };
  return { __esModule: true, default: MockFloatingSearchBar };
});

jest.mock("../../Components/Header", () => "Header");
jest.mock("../../Components/NavBar", () => "NavBar");
jest.mock(
  "../../Components/OutdoorNavigation/DirectionsBox",
  () => "DirectionsBox",
);

const mockGetCurrentPositionAsync = jest.fn().mockResolvedValue({
  coords: { latitude: 45.5017, longitude: -73.5673 },
});
const mockGeocodeAsync = jest
  .fn()
  .mockResolvedValue([{ latitude: 1, longitude: 2 }]);
jest.mock("expo-location", () => ({
  getCurrentPositionAsync: mockGetCurrentPositionAsync,
  Accuracy: { High: 6 },
  geocodeAsync: mockGeocodeAsync,
  requestForegroundPermissionsAsync: jest
    .fn()
    .mockResolvedValue({ granted: true }),
}));

const renderWithContext = (
  component,
  contextValue = { latitude: 45.4973, longitude: -73.5789 },
) =>
  render(
    <LocationContext.Provider value={contextValue}>
      {component}
    </LocationContext.Provider>,
  );

describe("GetDirections", () => {
  let mockGetStepsInHTML;
  let mockGetPolyline;
  let mockRouteParams;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();

    // Default route params.
    mockRouteParams = {};
    const { useRoute } = require("@react-navigation/native");
    useRoute.mockReturnValue({ params: mockRouteParams });

    // Reset mockNavigate.
    const { useNavigation } = require("@react-navigation/native");
    useNavigation.mockReturnValue({ navigate: mockNavigate });

    mockGetStepsInHTML = jest.fn().mockResolvedValue(["Step 1", "Step 2"]);
    mockGetPolyline = jest.fn().mockResolvedValue([
      { latitude: 45.4973, longitude: -73.5789 },
      { latitude: 45.4974, longitude: -73.579 },
    ]);
    useGoogleMapDirections.mockReturnValue({
      getStepsInHTML: mockGetStepsInHTML,
      getPolyline: mockGetPolyline,
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("handles address submission correctly", async () => {
    const { getByText, getByTestId } = renderWithContext(<GetDirections />);

    await act(async () => {
      const destSearchBar = getByTestId("search-bar-Enter Destination");
      fireEvent(destSearchBar, "onPlaceSelect", {
        latitude: 45.4974,
        longitude: -73.579,
      });
    });

    await act(async () => {
      fireEvent.press(getByText("Get Directions"));
      await jest.runAllTimers();
    });

    await waitFor(() => {
      expect(mockGetStepsInHTML).toHaveBeenCalledWith(
        expect.any(Object),
        expect.any(Object),
        "walking",
      );
      expect(mockGetPolyline).toHaveBeenCalledWith(
        expect.any(Object),
        expect.any(Object),
        "walking",
      );
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

  it("calls onChangeDirections to cancel navigation", async () => {
    const { getByText } = renderWithContext(<GetDirections />);
    await act(async () => {
      fireEvent.press(getByText("Get Directions"));
    });
    await waitFor(() => {
      expect(getByText("Change Directions")).toBeTruthy();
    });
    await act(async () => {
      fireEvent.press(getByText("Change Directions"));
    });
    expect(getByText("Get Directions")).toBeTruthy();
  });

  it("handles error in onAddressSubmit gracefully", async () => {
    mockGetStepsInHTML.mockRejectedValueOnce(new Error("Steps error"));
    const consoleSpy = jest.spyOn(console, "error").mockImplementation();

    const { getByText } = renderWithContext(<GetDirections />);
    await act(async () => {
      fireEvent.press(getByText("Get Directions"));
      await jest.runAllTimers();
    });
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        "Error getting directions:",
        expect.any(Error),
      );
    });
    consoleSpy.mockRestore();
  });

  it("disables live location tracking when disableLiveLocation is true", async () => {
    mockRouteParams = {
      origin: { latitude: 10, longitude: 20 },
      disableLiveLocation: true,
    };
    const { useRoute } = require("@react-navigation/native");
    useRoute.mockReturnValue({ params: mockRouteParams });

    const { getByTestId } = renderWithContext(<GetDirections />);
    const originSearchBar = getByTestId("search-bar-Enter Origin");
    expect(originSearchBar).toBeTruthy();
  });

  it("updates location during navigation if live tracking is enabled", async () => {
    mockRouteParams = {};
    const { useRoute } = require("@react-navigation/native");
    useRoute.mockReturnValue({ params: mockRouteParams });

    const { getByText } = renderWithContext(<GetDirections />);
    await act(async () => {
      fireEvent.press(getByText("Get Directions"));
      await jest.runAllTimers();
    });
    mockGetCurrentPositionAsync.mockResolvedValueOnce({
      coords: { latitude: 50, longitude: -80 },
    });
    await act(async () => {
      jest.advanceTimersByTime(20000);
    });
    expect(mockGetStepsInHTML).toHaveBeenCalled();
  });

  it("handles errors during location update gracefully", async () => {
    mockGetCurrentPositionAsync.mockRejectedValueOnce(
      new Error("Tracking error"),
    );
    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();

    const { getByText, getByTestId } = renderWithContext(<GetDirections />);
    await act(async () => {
      const destSearchBar = getByTestId("search-bar-Enter Destination");
      fireEvent(destSearchBar, "onPlaceSelect", {
        latitude: 45.5017,
        longitude: -73.5673,
      });
    });
    await act(async () => {
      fireEvent.press(getByText("Get Directions"));
      await jest.runAllTimers();
    });
    await act(async () => {
      jest.advanceTimersByTime(20000);
    });
    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Error updating location",
        expect.any(Error),
      );
    });
    consoleErrorSpy.mockRestore();
  });
});

describe("GetDirections - Transport Mode Tests", () => {
  afterEach(() => {
    cleanup();
  });
  const mockLocation = { latitude: 45.4973, longitude: -73.5789 };

  let mockGetStepsInHTML;
  let mockGetPolyline;

  const renderWithContext = (component) =>
    render(
      <LocationContext.Provider value={mockLocation}>
        {component}
      </LocationContext.Provider>,
    );

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetStepsInHTML = jest.fn().mockResolvedValue(["Step 1", "Step 2"]);
    mockGetPolyline = jest.fn().mockResolvedValue([
      { latitude: 45.4973, longitude: -73.5789 },
      { latitude: 45.4974, longitude: -73.579 },
    ]);
    useGoogleMapDirections.mockReturnValue({
      getStepsInHTML: mockGetStepsInHTML,
      getPolyline: mockGetPolyline,
    });
  });

  it("sets mode to walking and fetches walking directions", async () => {
    const { getByText } = renderWithContext(<GetDirections />);
    await act(async () => {
      fireEvent.press(getByText("Walking"));
      fireEvent.press(getByText("Get Directions"));
    });
    await waitFor(() => {
      expect(mockGetStepsInHTML).toHaveBeenCalledWith(
        expect.any(Object),
        expect.any(Object),
        "walking",
      );
    });
  });

  it("sets mode to driving and fetches driving directions", async () => {
    const { getByText } = renderWithContext(<GetDirections />);
    await act(async () => {
      fireEvent.press(getByText("Car"));
    });
    await act(async () => {
      fireEvent.press(getByText("Get Directions"));
    });
    await waitFor(() => {
      expect(mockGetStepsInHTML).toHaveBeenCalledWith(
        expect.any(Object),
        expect.any(Object),
        "driving",
      );
    });
  });

  it("sets mode to transit and fetches transit directions", async () => {
    const { getByText } = renderWithContext(<GetDirections />);
    await act(async () => {
      fireEvent.press(getByText("Transit"));
    });
    await act(async () => {
      fireEvent.press(getByText("Get Directions"));
    });
    await waitFor(() => {
      expect(mockGetStepsInHTML).toHaveBeenCalledWith(
        expect.any(Object),
        expect.any(Object),
        "transit",
      );
    });
  });

  it("sets mode to biking and fetches biking directions", async () => {
    const { getByText } = renderWithContext(<GetDirections />);
    await act(async () => {
      fireEvent.press(getByText("Biking"));
    });
    await act(async () => {
      fireEvent.press(getByText("Get Directions"));
    });
    await waitFor(() => {
      expect(mockGetStepsInHTML).toHaveBeenCalledWith(
        expect.any(Object),
        expect.any(Object),
        "biking",
      );
    });
  });
});

describe("FloatingSearchBar onPlaceSelect", () => {
  const defaultLocation = { latitude: 45.4973, longitude: -73.5789 };
  const renderWithContext = (component) =>
    render(
      <LocationContext.Provider value={defaultLocation}>
        {component}
      </LocationContext.Provider>,
    );

  it("updates origin when onPlaceSelect is called on the origin search bar", async () => {
    const { getByTestId } = renderWithContext(<GetDirections />);
    const originSearchBar = await waitFor(() =>
      getByTestId("search-bar-Using Current Location"),
    );

    const newOrigin = { latitude: 50, longitude: 60 };
    const newDisplayName = "50, 60";
    act(() => {
      fireEvent(originSearchBar, "onPlaceSelect", newOrigin, newDisplayName);
    });

    expect(originSearchBar.props.value).toBe(newDisplayName);
  });
});
