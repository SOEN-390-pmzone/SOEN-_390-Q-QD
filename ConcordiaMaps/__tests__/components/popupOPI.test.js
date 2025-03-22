import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import PopupOPI from "../../components/PopupOPI";
import "@testing-library/jest-native/extend-expect";
import { Alert } from "react-native";

describe("<PopupOPI/>", () => {
  const mockOnClose = jest.fn();
  //Creating mock data
  const mockData = {
    name: "Test Cafe",
    address: "123 Test St.",
  };
  it("renders correctly when visible", () => {
    const { getByText } = render(
      <PopupOPI isVisible={true} data={mockData} onClose={mockOnClose} />,
    );

    expect(getByText("Test Cafe")).toBeTruthy();
    expect(getByText("123 Test St.")).toBeTruthy();
    expect(getByText("Close")).toBeTruthy();
    expect(getByText("Get Directions")).toBeTruthy();
  });
  it("displays default test when data is missing", () => {
    const { getByText } = render(
      <PopupOPI isVisible={true} data={{}} onClose={mockOnClose} />,
    );

    expect(getByText("Cafe/Restaurant Name")).toBeTruthy();
    expect(getByText("Address not available")).toBeTruthy();
  });
  it("calls onClose when Close button is pressed", () => {
    const { getByText } = render(
      <PopupOPI isVisible={true} data={mockData} onClose={mockOnClose} />,
    );

    fireEvent.press(getByText("Close"));

    expect(mockOnClose).toHaveBeenCalled();
  });
  it("displays the modal when visible is true", () => {
    const { getByText } = render(
      <PopupOPI isVisible={true} data={mockData} onClose={mockOnClose} />,
    );
    expect(getByText("Test Cafe")).toBeTruthy();
    expect(getByText("123 Test St.")).toBeTruthy();
  });
  it("does not display the modal when visible is false", () => {
    const { queryByText } = render(
      <PopupOPI isVisible={false} data={mockData} onClose={mockOnClose} />,
    );
    expect(queryByText("Test Cafe")).toBeNull();
    expect(queryByText("123 Test St.")).toBeNull();
  });
  it("Get Directions alert appears when Get Directions is pressed", () => {
    const alertSpy = jest.spyOn(Alert, "alert"); // Spy on Alert.alert

    const { getByText } = render(
      <PopupOPI isVisible={true} data={mockData} onClose={mockOnClose} />,
    );

    fireEvent.press(getByText("Get Directions"));

    // Check if Alert.alert was called with correct arguments
    expect(alertSpy).toHaveBeenCalledWith(
      "Get Directions",
      "Directions pressed",
    );

    alertSpy.mockRestore(); // Restore original Alert.alert function
  });
});
