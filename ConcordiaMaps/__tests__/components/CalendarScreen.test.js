import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import CalendarScreen from "../../components/CalendarScreen";
import Header from "../../components/Header";
import { NavigationContainer } from "@react-navigation/native";

// Mock necessary modules
jest.mock("expo-calendar", () => ({
  requestCalendarPermissionsAsync: jest
    .fn()
    .mockResolvedValue({ status: "granted" }),
  getCalendarsAsync: jest.fn().mockResolvedValue([
    { id: "1", title: "Calendar 1" },
    { id: "2", title: "Calendar 2" },
  ]),
  getEventsAsync: jest.fn().mockResolvedValue([
    {
      id: "1",
      title: "Event 1",
      startDate: new Date(),
      endDate: new Date(),
      notes: "Room 101",
    },
  ]),
  EntityTypes: {
    EVENT: "event",
  },
}));

// Fix for "TypeError: loadedNativeFonts.forEach is not a function"
jest.mock("expo-font", () => ({
  loadAsync: jest.fn(),
}));

jest.mock("@expo/vector-icons", () => ({
  Ionicons: "Ionicons",
}));

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

// Test the calendarIcon button
describe("Header", () => {
  beforeEach(() => {
    // Clear the mock before each test
    mockNavigate.mockClear();
  });

  it("opens the CalendarScreen when clicking on the calendar icon", () => {
    const { getByTestId } = render(<Header />);

    const calendarButton = getByTestId("calendarButton");
    fireEvent.press(calendarButton);

    expect(mockNavigate).toHaveBeenCalledWith("Calendar");
  });
});

describe("CalendarScreen", () => {
  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Test the selecting multiple calendars functionality
  it("selects other calendars", async () => {
    const { getByText, getByTestId } = render(
      <NavigationContainer>
        <CalendarScreen />
      </NavigationContainer>
    );

    await waitFor(() => getByTestId("selectCalendarButton"));
    
    fireEvent.press(getByTestId("selectCalendarButton"));
    
    await waitFor(() => getByText("Select Calendars"));
    
    fireEvent.press(getByText("Calendar 1"));
    
    fireEvent.press(getByText("Done"));
    
    await waitFor(() => {
      expect(getByText("Select your calendars (1)")).toBeTruthy();
    });
  });

  // Test previous days view
  it("shows events from previous days", async () => {
    const { getByText } = render(
      <NavigationContainer>
        <CalendarScreen />
      </NavigationContainer>
    );
    
    await waitFor(() => getByText("Previous Day"));
    
    fireEvent.press(getByText("Previous Day"));
    
    await waitFor(() => {
      expect(getByText("No events for today.")).toBeTruthy();
    });
  });

  // Test upcoming days view
  it("shows events for upcoming days", async () => {
    const { getByText } = render(
      <NavigationContainer>
        <CalendarScreen />
      </NavigationContainer>
    );
    
    await waitFor(() => getByText("Next Day"));
    
    fireEvent.press(getByText("Next Day"));
    
    await waitFor(() => {
      expect(getByText("No events for today.")).toBeTruthy();
    });
  });

  // Test the Get Directions button
  it("clicks on the Get Directions button and closes the alert", async () => {
    // Mock the alert function
    const originalAlert = global.alert;
    global.alert = jest.fn();

    try {
      const { getByText } = render(
        <NavigationContainer>
          <CalendarScreen />
        </NavigationContainer>
      );
      
      await waitFor(() => getByText("Event 1"));
      
      fireEvent.press(getByText("Get Directions"));
      
      expect(global.alert).toHaveBeenCalledWith("Get directions to Room 101");
    } finally {
      // Always restore the original alert function
      global.alert = originalAlert;
    }
  });
});
