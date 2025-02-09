/* eslint-disable react/prop-types */
import React from "react";
import { render, waitFor } from "@testing-library/react-native";
import axios from "axios";
import { NavigationContainer } from "@react-navigation/native"; // Keep this import here
import { useNavigation } from "@react-navigation/native"; // Import as usual
import HomeScreen from "../screen/HomeScreen";

// Mock only the necessary part of @react-navigation/native
jest.mock("@react-navigation/native", () => ({
  ...jest.requireActual("@react-navigation/native"), // Keep the actual NavigationContainer
  useNavigation: jest.fn(), // Mock only useNavigation
}));

// Mock react-native-maps
jest.mock("react-native-maps", () => {
  const { View } = require("react-native");
  return {
    __esModule: true,
    default: (props) => <View>{props.children}</View>,
    Marker: (props) => <View>{props.children}</View>,
  };
});

// Mock UI components
jest.mock("../components/Header", () => "Header");
jest.mock("../components/NavBar", () => "NavBar");
jest.mock("../components/Footer", () => "Footer");
jest.mock("../components/Legend", () => "Legend");

// Mock axios
jest.mock("axios");

beforeAll(() => {
  jest.spyOn(console, "log").mockImplementation(() => {});
  jest.spyOn(console, "error").mockImplementation(() => {});
});

afterAll(() => {
  console.log.mockRestore();
  console.error.mockRestore();
});

describe("HomeScreen", () => {
  it("renders without crashing", async () => {
    useNavigation.mockReturnValue({ navigate: jest.fn() });

    const { getByTestId } = render(
      <NavigationContainer>
        <HomeScreen />
      </NavigationContainer>,
    );

    await waitFor(() => expect(getByTestId("home-screen")).toBeTruthy());
  });

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
        <HomeScreen />
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
        <HomeScreen />
      </NavigationContainer>,
    );

    await waitFor(() => {
      expect(getByTestId("error-message").props.children).toBe(
        "Something went wrong. Please try again later.",
      );
    });
  });
});
