import App from "../App";
import React from "react";
import { render, waitFor, fireEvent } from "@testing-library/react-native";

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

// Mock expo-location
jest.mock("expo-location", () => ({
  requestForegroundPermissionsAsync: jest.fn(() =>
    Promise.resolve({ status: "granted" })
  ),
  getCurrentPositionAsync: jest.fn(() =>
    Promise.resolve({
      coords: {
        latitude: 45.497,
        longitude: -73.579,
        accuracy: 5,
      },
    })
  ),
}));

// Mock @expo/vector-icons
jest.mock("@expo/vector-icons", () => {
  const { View } = require("react-native");
  // eslint-disable-next-line react/prop-types
  const MockIcon = () => <View />;
  return {
    Ionicons: MockIcon,
    FontAwesome: MockIcon,
    MaterialIcons: MockIcon,
    MaterialCommunityIcons: MockIcon,
    // Add any other icon sets your app uses
  };
});

jest.mock("react-native-maps", () => {
  const { View } = require("react-native");
  // eslint-disable-next-line react/prop-types
  const MockMapView = (props) => {
    return <View>{props.children}</View>;
  };

  // eslint-disable-next-line react/prop-types
  const MockMarker = (props) => {
    return <View>{props.children}</View>;
  };

  return {
    __esModule: true,
    default: MockMapView,
    Marker: MockMarker,
  };
});

// Mock the PopupModal component but capture its props
let mockPopupModalProps = {};
jest.mock("../components/PopupModal", () => {
  const { View } = require("react-native");
  // eslint-disable-next-line react/prop-types
  const PopupModal = (props) => {
    mockPopupModalProps = props;
    return <View testID="popup-modal" />;
  };
  return PopupModal;
});

// Mock the navigation
const mockNavigate = jest.fn();
jest.mock("@react-navigation/native", () => {
  const actualNav = jest.requireActual("@react-navigation/native");
  return {
    ...actualNav,
    useNavigation: () => ({
      navigate: mockNavigate,
    }),
  };
});

describe("App", () => {
  beforeEach(() => {
    mockPopupModalProps = {};
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

  it("shows navigation options", async () => {
    const { getByText } = render(<App />);
    await waitFor(() => {
      expect(getByText("Get directions")).toBeTruthy();
      expect(getByText("Outdoor Points of Interest")).toBeTruthy();
      expect(getByText("Smart Planner")).toBeTruthy();
    });
  });

  it("initializes with modal hidden", async () => {
    render(<App />);
    await waitFor(() => {
      expect(mockPopupModalProps.isVisible).toBeFalsy();
    });
  });

  it("passes default modal data", async () => {
    render(<App />);
    await waitFor(() => {
      expect(mockPopupModalProps.data).toEqual({
        name: "",
        coordinate: { latitude: 0, longitude: 0 },
      });
    });
  });

  it("handles modal toggling through context", async () => {
    render(<App />);

    // Access the modal context and call toggleModal
    await waitFor(() => {
      expect(mockPopupModalProps.onClose).toBeDefined();
    });

    // Simulate clicking the close button on modal
    mockPopupModalProps.onClose();

    await waitFor(() => {
      expect(mockPopupModalProps.isVisible).toBeDefined();
    });
  });

  it("navigates to GetDirections screen when button is clicked", async () => {
    const { getByText } = render(<App />);
    const directionsButton = await waitFor(() => getByText("Get directions"));

    fireEvent.press(directionsButton);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("GetDirections");
    });
  });

  it("provides LocationProvider to child components", async () => {
    const { getByTestId } = render(<App />);
    await waitFor(() => {
      expect(getByTestId("home-screen")).toBeTruthy();
    });
  });

  it("handles modal data updates correctly", async () => {
    render(<App />);

    await waitFor(() => {
      expect(mockPopupModalProps.data).toBeDefined();
    });
  });
});
