import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import PopupOPI from "../../components/PopupOPI";

jest.mock("@react-navigation/native", () => {
  return {
    useNavigation: jest.fn(),
  };
});
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

  //const mockNavigation = { navigate: jest.fn() };

  // const defaultProps = {
  //   isVisible: true,
  //   data: {
  //     name: "Cafe/Restaurant Name",
  //     address: "Address not available",
  //     coordinate: {
  //       latitude: 12.34,
  //       longitude: 56.78,
  //     },
  //     targetLocation: "1455 DeMaisonneuve W"
  //   },
  //   onClose: mockOnClose,
  //   navigation: mockNavigation,
  // };

  it("handles completely omitted data prop by using defaults", () => {
    const { getByText } = render(
      <PopupOPI isVisible={true} onClose={mockOnClose} />,
    );

    expect(getByText("Cafe/Restaurant Name")).toBeTruthy();
    expect(getByText("Address not available")).toBeTruthy();
  });
});
