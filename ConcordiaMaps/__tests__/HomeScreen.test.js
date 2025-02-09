/* eslint-disable react/prop-types */
import React from "react";
import { render, waitFor } from "@testing-library/react-native";
import axios from "axios";
import { useNavigation, NavigationContainer } from "@react-navigation/native";
import HomeScreen from "../screen/HomeScreen";

// Mock navigation and components
jest.mock("@react-navigation/native", () => ({
  ...jest.requireActual("@react-navigation/native"),
  useNavigation: jest.fn(),
}));

jest.mock("react-native-maps", () => {
  const { View } = require("react-native");
  return {
    __esModule: true,
    default: (props) => <View>{props.children}</View>,
    Marker: (props) => <View>{props.children}</View>,
  };
});

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
