import React from "react";
import { render, screen, fireEvent } from "@testing-library/react-native";
import PopupModal from "../../components/PopupModal";
import { Alert } from "react-native";

// Mock Alert to prevent actual pop-ups
jest.spyOn(Alert, "alert").mockImplementation(() => {});

describe("PopupModal Component", () => {
  const mockData = {
    name: "H Building",
    fullBuildingName: "Henry F. Hall Building",
    address: "1455 DeMaisonneuve W",
    coordinate: { latitude: 45.497092, longitude: -73.5788 },
  };

  const mockOnClose = jest.fn();

  test("renders correctly when visible", () => {
    render(
      <PopupModal isVisible={true} data={mockData} onClose={mockOnClose} />,
    );

    // Check if modal content is displayed
    expect(screen.getByText(mockData.name)).toBeTruthy();
    expect(screen.getByText(`${mockData.fullBuildingName}`)).toBeTruthy();
    expect(screen.getByText(mockData.address)).toBeTruthy();
  });

  test("does not render when not visible", () => {
    const { queryByText } = render(
      <PopupModal isVisible={false} data={mockData} onClose={mockOnClose} />,
    );

    // Ensure modal content is NOT present
    expect(queryByText(mockData.name)).toBeNull();
  });

  test("calls onClose when close button is pressed", () => {
    render(
      <PopupModal isVisible={true} data={mockData} onClose={mockOnClose} />,
    );

    const closeButton = screen.getByText("Close");
    fireEvent.press(closeButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  test("triggers alert when get directions button is pressed", () => {
    render(
      <PopupModal isVisible={true} data={mockData} onClose={mockOnClose} />,
    );

    const getDirectionsButton = screen.getByText("Get Directions");
    fireEvent.press(getDirectionsButton);

    expect(Alert.alert).toHaveBeenCalledWith(
      "Get Directions",
      "Directions pressed",
    );
  });

  test("triggers alert when get inner directions button is pressed", () => {
    render(
      <PopupModal isVisible={true} data={mockData} onClose={mockOnClose} />,
    );

    const getInnerDirectionsButton = screen.getByText(
      "Get in Building Directions",
    );
    fireEvent.press(getInnerDirectionsButton);

    expect(Alert.alert).toHaveBeenCalledWith(
      "Get Inner Directions",
      "Inner directions pressed",
    );
  });
});
