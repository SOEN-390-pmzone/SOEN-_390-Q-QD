/* eslint-disable react/prop-types */
import React from "react";
import { render, waitFor } from "@testing-library/react-native";
import { NavigationContainer } from "@react-navigation/native";
import { useNavigation } from "@react-navigation/native";
import HomeScreen from "../screen/HomeScreen";

// Mock useNavigation
jest.mock("@react-navigation/native", () => ({
  ...jest.requireActual("@react-navigation/native"),
  useNavigation: jest.fn(),
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

describe("HomeScreen", () => {
  it("renders without crashing", async () => {
    useNavigation.mockReturnValue({ navigate: jest.fn() });

    const { getByTestId } = render(
      <NavigationContainer>
        <HomeScreen />
      </NavigationContainer>
    );

    await waitFor(() => expect(getByTestId("home-screen")).toBeTruthy());
  });
});
//s