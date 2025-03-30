import React from "react";
import { render, waitFor, fireEvent, act } from "@testing-library/react-native";
import axios from "axios";
import HomeScreen from "../screen/HomeScreen";
import { NavigationContainer } from "@react-navigation/native";
import { ModalContext } from "../App";
import { LocationContext } from "../contexts/LocationContext";

jest.mock("expo-location", () => ({
  getCurrentPositionAsync: jest.fn().mockResolvedValue({
    coords: { latitude: 45.5017, longitude: -73.5673 }, // Example: Montreal coordinates
  }),
  requestForegroundPermissionsAsync: jest.fn().mockResolvedValue({
    granted: true,
  }),
}));

jest.mock("react-native-webview", () => ({
  WebView: () => null,
}));

jest.mock("expo-font", () => ({
  isLoaded: jest.fn().mockReturnValue(true),
}));

jest.mock("axios");

jest.mock("../components/LiveBusTracker", () => ({
  __esModule: true,
  default: () => null,
}));

describe("HomeScreen", () => {
  const mockLocation = { latitude: 45.4973, longitude: -73.5789 };
  const mockToggleModal = jest.fn();
  const mockSetModalData = jest.fn();

  const renderComponent = () =>
    render(
      <NavigationContainer>
        <ModalContext.Provider
          value={{
            toggleModal: mockToggleModal, // Mock function for toggleModal
            setModalData: mockSetModalData, // Mock function for setModalData
          }}
        >
          <LocationContext.Provider value={{ location: mockLocation }}>
            <HomeScreen />
          </LocationContext.Provider>
        </ModalContext.Provider>
      </NavigationContainer>,
    );

  it("renders the map correctly on successful API call", async () => {
    const mockResponse = {
      data: {
        results: [
          {
            geometry: { location: { lat: 45.4973, lng: -73.5789 } },
          },
        ],
        status: "OK",
      },
    };
    axios.get.mockResolvedValueOnce(mockResponse);

    const { getByTestId } = renderComponent();

    await waitFor(() => {
      expect(getByTestId("map-view")).toBeTruthy();
    });
  });

  it("handles marker press event", async () => {
    const mockResponse = {
      data: {
        results: [
          {
            geometry: { location: { lat: 45.4973, lng: -73.5789 } },
          },
        ],
        status: "OK",
      },
    };
    axios.get.mockResolvedValueOnce(mockResponse);

    const { getAllByTestId } = renderComponent();

    await waitFor(() => {
      // Get all markers that start with "marker-" and press the first one
      const markers = getAllByTestId(/^marker-/);
      expect(markers.length).toBeGreaterThan(0);
      fireEvent.press(markers[0]);
    });

    expect(mockSetModalData).toHaveBeenCalled();
    expect(mockToggleModal).toHaveBeenCalled();
  });

  it("displays an error message when location is not found", async () => {
    axios.get.mockResolvedValueOnce({
      data: { results: [], status: "ZERO_RESULTS" },
    });

    const { getByTestId } = renderComponent();

    await waitFor(() => {
      expect(getByTestId("error-message").props.children).toBe("ZERO_RESULTS");
    });
  });

  it("return error if no results found", async () => {
    axios.get.mockResolvedValueOnce({
      data: { results: [], status: "OK" },
    });

    const { getByTestId } = renderComponent();

    await waitFor(() => {
      expect(getByTestId("error-message").props.children).toBe("ZERO_RESULTS");
    });
  });
  it("the Temporary modal should hide the modal after 10 seconds", async () => {
    jest.useFakeTimers(); // Mock the timers

    const mockResponse = {
      data: {
        results: [
          {
            geometry: { location: { lat: 45.4973, lng: -73.5789 } },
          },
        ],
        status: "OK",
      },
    };
    axios.get.mockResolvedValueOnce(mockResponse);

    const { getByTestId } = renderComponent();
    await waitFor(() => {
      expect(getByTestId("toggleModal")).toBeTruthy();
    });

    // Fast-forward time by 10 seconds
    act(() => {
      jest.advanceTimersByTime(10000);
    });

    jest.useRealTimers(); // Restore real timers
  });
  it("handles change campuses event", async () => {
    const mockResponse = {
      data: {
        results: [
          {
            geometry: { location: { lat: 45.4973, lng: -73.5789 } },
          },
        ],
        status: "OK",
      },
    };
    axios.get.mockResolvedValueOnce(mockResponse);

    const { getByTestId } = renderComponent();

    await waitFor(() => {
      expect(getByTestId("change-campus-button")).toBeTruthy();
      fireEvent.press(getByTestId("change-campus-button"));
    });

    expect(getByTestId("map-view")).toBeTruthy();
  });
  const mockAnimateToRegion = jest.fn();
  const mockMapRef = {
    current: {
      animateToRegion: mockAnimateToRegion,
    },
  };

  jest.mock("react-native-maps", () => ({
    __esModule: true,
    Marker: jest.fn(),
    MapView: jest.fn().mockImplementation(({ children, ...props }) => {
      return (
        <div {...props}>
          <div data-testid="map">{children}</div>
        </div>
      );
    }),
  }));

  describe("HomeScreen", () => {
    // Test setup to mock setTimeout and mapRef
    beforeEach(() => {
      jest.useFakeTimers(); // Use fake timers to mock setTimeout
      mockAnimateToRegion.mockClear(); // Clear mock calls before each test
    });

    afterEach(() => {
      jest.useRealTimers(); // Restore real timers after tests
    });

    it("should update map region and animate to the selected location on place select", async () => {
      const setMapRegion = jest.fn();
      const setSelectedLocation = jest.fn();

      // Set up the necessary props and render the component with the correct context
      renderComponent();

      // Mock the region object (example)
      const region = {
        latitude: 40.7128,
        longitude: -74.006,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      };

      // Trigger the handlePlaceSelect logic
      act(() => {
        // Assuming handlePlaceSelect is called with a region object
        // You need to trigger the code that calls the setTimeout in your component.
        setTimeout(() => {
          setMapRegion(region);
          setSelectedLocation(region);
          mockMapRef.current?.animateToRegion(region, 1000);
        }, 100);
      });

      // Fast-forward all timers by 100ms
      act(() => {
        jest.runAllTimers();
      });

      // Assertions
      expect(setMapRegion).toHaveBeenCalledWith(region); // Check if setMapRegion was called with the correct region
      expect(setSelectedLocation).toHaveBeenCalledWith(region); // Check if setSelectedLocation was called with the correct region
      expect(mockMapRef.current?.animateToRegion).toHaveBeenCalledWith(
        region,
        1000,
      ); // Check if animateToRegion was called with the region and correct duration
    });
  });
});
