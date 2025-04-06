import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import NavBar from "../../components/NavBar";
import { Alert } from "react-native";

jest.mock("@react-navigation/native", () => ({
  useNavigation: () => ({ navigate: jest.fn() }),
}));

jest.spyOn(Alert, "alert").mockImplementation(() => {});

describe("NavBar Component", () => {
  it("toggles the menu when hamburger button is pressed", () => {
    const { getByTestId, getByText } = render(<NavBar />);

    const hamburgerButton = getByTestId("hamburger-button");
    fireEvent.press(hamburgerButton);

    expect(getByText("Login")).toBeTruthy();
    expect(getByText("Get directions")).toBeTruthy();
  });

  it("navigates to GetDirections when clicked", () => {
    const navigate = jest.fn();
    jest
      .spyOn(require("@react-navigation/native"), "useNavigation")
      .mockReturnValue({ navigate });

    const { getByText } = render(<NavBar />);
    fireEvent.press(getByText("Get directions"));

    expect(navigate).toHaveBeenCalledWith("GetDirections");
  });



  it("opens the shuttle schedule when Shuttle Schedule is pressed", async () => {
    const { getAllByText, queryByTestId } = render(<NavBar />);

    // Get the menu button
    const shuttleButton = getAllByText("Shuttle Schedule")[0]; // First instance in the menu
    fireEvent.press(shuttleButton);

    // Wait for the modal to be rendered
    await waitFor(() =>
      expect(queryByTestId("shuttle-schedule-modal-container")).toBeTruthy(),
    );
  });

  it("opens the login screen when Login is pressed", () => {
    const { getByText } = render(<NavBar />);
    fireEvent.press(getByText("Login"));

    expect(Alert.alert).toHaveBeenCalledWith("You clicked: Login");
  });

  it("closes the shuttle schedule when the close button is pressed", async () => {
    const { getAllByText, queryByTestId, getByTestId } = render(<NavBar />);

    // Get the menu button
    const shuttleButton = getAllByText("Shuttle Schedule")[0]; // First instance in the menu
    fireEvent.press(shuttleButton);

    // Wait for the modal to be rendered - use a more unique testID for the modal
    await waitFor(() =>
      expect(queryByTestId("shuttle-schedule-modal-container")).toBeTruthy(),
    );

    // Close the modal - use getByTestId to ensure finding the element
    const closeButton = getByTestId("shuttle-schedule-close-button");
    fireEvent.press(closeButton);

    // Wait for the modal to be removed
    await waitFor(() =>
      expect(queryByTestId("shuttle-schedule-modal-container")).toBeFalsy(),
    );
  });
});
