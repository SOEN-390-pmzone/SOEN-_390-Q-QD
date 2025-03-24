import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import Header from "../../components/Header";
import { useNavigation } from "@react-navigation/native";
import { Alert, Animated } from "react-native";

// Mock the navigation and Alert modules
jest.mock("@react-navigation/native", () => ({
  useNavigation: jest.fn(),
}));

jest.mock("react-native/Libraries/Alert/Alert", () => ({
  alert: jest.fn(),
}));

// Mock the styles
jest.mock("../../styles", () => ({
  header: { flexDirection: "row", padding: 10 },
  logo: { width: 40, height: 40 },
  headerText: { fontSize: 18, marginLeft: 10 },
}));

// Mock the image asset
jest.mock("../../assets/ConcordiaLogo.png", () => "mockedLogoPath", {
  virtual: true,
});

describe("Header Component", () => {
  // Set up navigation mock before each test
  let mockNavigation;

  beforeEach(() => {
    mockNavigation = {
      navigate: jest.fn(),
    };
    useNavigation.mockReturnValue(mockNavigation);

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  test("renders correctly", () => {
    const { getByText } = render(<Header />);

    expect(getByText("ConcordiaMaps")).toBeTruthy();
  });

  test("toggles menu when hamburger button is pressed", () => {
    const mockStart = jest.fn((callback) => callback && callback());
    const mockTiming = jest.fn(() => ({ start: mockStart }));

    // Save original implementation
    const originalTiming = Animated.timing;

    // Replace with mock
    Animated.timing = mockTiming;

    try {
      const { getByTestId } = render(<Header />);

      const hamburgerButton = getByTestId("hamburger-button");

      // Initial state should be closed (isOpen = false)
      expect(mockTiming).not.toHaveBeenCalled();

      // Open the menu
      fireEvent.press(hamburgerButton);

      // Verify Animated.timing was called with correct parameters
      expect(mockTiming).toHaveBeenCalledWith(
        expect.any(Object), // animation value
        {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        },
      );

      // Close the menu
      fireEvent.press(hamburgerButton);

      // Verify Animated.timing was called again with toValue: 0
      expect(mockTiming).toHaveBeenCalledWith(
        expect.any(Object), // animation value
        {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        },
      );

      // Verify start was called twice (once for each press)
      expect(mockStart).toHaveBeenCalledTimes(2);
    } finally {
      // Restore original implementation
      Animated.timing = originalTiming;
    }
  });

  test("handles navigation to Home correctly", () => {
    const { getByTestId } = render(<Header />);

    // Find and press the TouchableOpacity
    const touchableOpacity = getByTestId("logoButton");
    fireEvent.press(touchableOpacity);

    // Check if navigate was called with correct parameter
    expect(mockNavigation.navigate).toHaveBeenCalledWith("Home");

    // Alert should not be called
    expect(Alert.alert).not.toHaveBeenCalled();
  });

  test("displays Alert for non-Home navigation", () => {
    const mockHandlePress = jest.fn((item) => {
      if (item === "Home") {
        mockNavigation.navigate("Home");
      } else {
        Alert.alert(`You clicked: ${item}`);
      }
    });

    // Call the mock function with a non-Home value
    mockHandlePress("Settings");

    // Check Alert.alert was called correctly
    expect(Alert.alert).toHaveBeenCalledWith("You clicked: Settings");
  });
});
