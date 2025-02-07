import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import PopupModal from "../../components/PopupModal";


jest.mock("react-native-modal", () => (props) => {
  return props.isVisible ? <>{props.children}</> : null;
});

describe("PopupModal", () => {
  const mockData = {
    name: "Building A",
    coordinate: {
      latitude: 45.5017,
      longitude: -73.5673,
    },
  };

  it("should render the modal with the correct data", () => {
    const { getByText } = render(
      <PopupModal isVisible={true} data={mockData} onClose={jest.fn()} />
    );

    expect(getByText("Building A")).toBeTruthy();
    expect(getByText("Latitude: 45.5017")).toBeTruthy();
    expect(getByText("Longitude: -73.5673")).toBeTruthy();
  });

  it("should call onClose when the close button is pressed", () => {
    const onCloseMock = jest.fn();
    const { getByText } = render(
      <PopupModal isVisible={true} data={mockData} onClose={onCloseMock} />
    );

    fireEvent.press(getByText("Close"));
    expect(onCloseMock).toHaveBeenCalled();
  });

  // TODO: make a test for the "Get Direction" button
});
