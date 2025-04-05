// MapMarkers.test.js
import { NavigationContainer } from "@react-navigation/native";
import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import MapMarkers from "../../components/MapMarkers";
import { Building } from "../../constants/Building";
import { ModalContext } from "../../screen/HomeScreen";
import axios from "axios";
import { LocationContext } from "../../contexts/LocationContext";
import HomeScreen from "../../screen/HomeScreen";
// Mock the context

const mockLocation = { latitude: 45.4973, longitude: -73.5789 };
const mockToggleModal = jest.fn();
const mockSetModalData = jest.fn();

const mockModalContext = {
  toggleModal: mockToggleModal,
  setModalData: mockSetModalData,
};
jest.mock("react-native-webview");
jest.mock("axios");
jest.mock("expo-font", () => ({
  isLoaded: jest.fn().mockReturnValue(true),
}));
describe("MapMarkers Component", () => {
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
  it("renders markers for each building", () => {
    const { getAllByTestId } = render(
      <ModalContext.Provider value={mockModalContext}>
        <MapMarkers />
      </ModalContext.Provider>,
    );

    const markers = getAllByTestId(/marker-/);
    expect(markers.length).toBe(Building.length);
  });

  it("calls toggleModal and setModalData when a marker is pressed", () => {
    const { getByTestId } = render(
      <ModalContext.Provider value={mockModalContext}>
        <MapMarkers />
      </ModalContext.Provider>,
    );

    const firstMarker = getByTestId(
      `marker-${Building[0].name.toLowerCase().replace(/\s+/g, "-")}`,
    );
    fireEvent.press(firstMarker);

    expect(mockSetModalData).toHaveBeenCalledWith({
      name: Building[0].name,
      coordinate: Building[0].coordinate,
      address: Building[0].address,
      fullBuildingName: Building[0].fullBuildingName,
    });

    expect(mockToggleModal).toHaveBeenCalled();
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
});
