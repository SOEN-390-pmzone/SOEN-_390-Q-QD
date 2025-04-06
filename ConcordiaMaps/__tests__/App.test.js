import App from "../App";
import React from "react";
import { render, waitFor } from "@testing-library/react-native";

// Mock expo-font
jest.mock("expo-font", () => ({
  isLoaded: jest.fn(() => true),
  loadAsync: jest.fn(() => Promise.resolve()),
  __internal: {
    nativeFontFaceMap: {},
  },
  Font: {
    isLoaded: jest.fn(() => true),
    loadAsync: jest.fn(() => Promise.resolve()),
  },
}));

jest.mock("react-native-webview", () => ({
  WebView: () => null,
}));

// Mock expo-location
jest.mock("expo-location", () => ({
  requestForegroundPermissionsAsync: jest.fn(() =>
    Promise.resolve({ status: "granted" }),
  ),
  getCurrentPositionAsync: jest.fn(() =>
    Promise.resolve({
      coords: {
        latitude: 45.497,
        longitude: -73.579,
        accuracy: 5,
      },
    }),
  ),
}));

// Mock @expo/vector-icons
jest.mock("@expo/vector-icons", () => {
  const { View } = require("react-native");
  const MockIcon = () => <View />;
  return {
    Ionicons: MockIcon,
    FontAwesome: MockIcon,
    MaterialIcons: MockIcon,
    MaterialCommunityIcons: MockIcon,
  };
});

jest.mock("react-native-maps", () => {
  const { View } = require("react-native");
  const MockMapView = (props) => {
    return <View>{props.children}</View>;
  };

  const MockMarker = (props) => {
    return <View>{props.children}</View>;
  };

  MockMapView.propTypes = {
    children: require("prop-types").node,
  };

  MockMarker.propTypes = {
    children: require("prop-types").node,
  };

  return {
    __esModule: true,
    default: MockMapView,
    Marker: MockMarker,
  };
});

// Mock the PopupModal component but capture its props

const mockNavigate = jest.fn();

describe("App", () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it("renders correctly", async () => {
    const { getByTestId } = render(<App />);
    await waitFor(() => {
      expect(getByTestId("home-screen")).toBeTruthy();
    });
  });

  it("displays the app title", async () => {
    const { getByText } = render(<App />);
    await waitFor(() => {
      expect(getByText("ConcordiaMaps")).toBeTruthy();
    });
  });

  it("provides LocationProvider to child components", async () => {
    const { getByTestId } = render(<App />);
    await waitFor(() => {
      expect(getByTestId("home-screen")).toBeTruthy();
    });
  });
});
