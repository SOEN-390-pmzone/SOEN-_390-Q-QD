import React from "react";
import { render, screen, fireEvent } from "@testing-library/react-native";
import PopupModal from "../../components/PopupModal";
import { Alert } from "react-native";

// Mock Alert to prevent actual pop-ups
jest.spyOn(Alert, "alert").mockImplementation(() => {});

describe("PopupModal Component", () => {
  const mockData = {
    name: "Building A",
    fullBuildingName: "Full Building Name A",
    address: "123 Street, City",
    coordinate: { latitude: 37.7749, longitude: -122.4194 },
  };

  const mockOnClose = jest.fn();

  test("renders correctly when visible", () => {
    render(
      <PopupModal isVisible={true} data={mockData} onClose={mockOnClose} />,
    );

    // Check if modal content is displayed
    expect(screen.getByText(mockData.name)).toBeTruthy();
    expect(screen.getByText(`•••${mockData.fullBuildingName}•••`)).toBeTruthy();
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
});
