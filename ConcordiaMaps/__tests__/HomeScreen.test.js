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
            toggleModal: mockToggleModal,
            setModalData: mockSetModalData,
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
});
