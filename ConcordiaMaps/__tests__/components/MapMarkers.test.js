// MapMarkers.test.js
jest.mock("react-native-webview");

import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import MapMarkers from "../../components/MapMarkers";
import { Building } from "../../constants/Building";
import { ModalContext } from "../../App";

// Mock the context
const mockToggleModal = jest.fn();
const mockSetModalData = jest.fn();

const mockModalContext = {
  toggleModal: mockToggleModal,
  setModalData: mockSetModalData,
};

describe("MapMarkers Component", () => {
  it("renders markers for each building", () => {
    const { getAllByTestId } = render(
      <ModalContext.Provider value={mockModalContext}>
        <MapMarkers />
      </ModalContext.Provider>
    );

    const markers = getAllByTestId(/marker-/);
    expect(markers.length).toBe(Building.length);
  });

  it("calls toggleModal and setModalData when a marker is pressed", () => {
    const { getByTestId } = render(
      <ModalContext.Provider value={mockModalContext}>
        <MapMarkers />
      </ModalContext.Provider>
    );

    const firstMarker = getByTestId(
      `marker-${Building[0].name.toLowerCase().replace(/\s+/g, "-")}`
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

  
});