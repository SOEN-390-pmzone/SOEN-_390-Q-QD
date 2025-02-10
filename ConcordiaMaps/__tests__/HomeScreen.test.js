import React from "react";
import { render, waitFor } from "@testing-library/react-native";
import axios from "axios";
import HomeScreen from "../screen/HomeScreen";
import { NavigationContainer } from "@react-navigation/native";
import { ModalContext } from "../App";
import { LocationContext } from "../contexts/LocationContext";

jest.mock("axios");

describe("HomeScreen", () => {
  const mockLocation = { latitude: 45.4973, longitude: -73.5789 };
  const mockToggleModal = jest.fn();
  const mockSetModalData = jest.fn();

  it("handles no results found", async () => {
    const mockResponse = {
      data: {
        results: [],
        status: "ZERO_RESULTS",
      },
    };
    axios.get.mockResolvedValueOnce(mockResponse);

    const { getByTestId } = render(
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

    await waitFor(() => {
      expect(getByTestId("error-message").props.children).toBe("ZERO_RESULTS");
    });
  });

  it("handles API errors", async () => {
    axios.get.mockRejectedValueOnce(new Error("Network Error"));

    const { getByTestId } = render(
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

    await waitFor(() => {
      expect(getByTestId("error-message").props.children).toBe(
        "Something went wrong. Please try again later.",
      );
    });
  });
});
