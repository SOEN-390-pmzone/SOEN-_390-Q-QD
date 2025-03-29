import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import CalendarScreen from "../../components/CalendarScreen";
import Header from "../../components/Header";
import { NavigationContainer } from "@react-navigation/native";
import * as Calendar from "expo-calendar";

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
      location: "Room 101",
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

  // Test the fetching of calendars
  it("shows alert when calendar permissions are denied", async () => {
    // Mock the alert function
    const originalAlert = global.alert;
    global.alert = jest.fn();

    // Directly modify the mock implementation for this test only
    Calendar.requestCalendarPermissionsAsync.mockImplementationOnce(() =>
      Promise.resolve({ status: "denied" }),
    );

    try {
      render(
        <NavigationContainer>
          <CalendarScreen />
        </NavigationContainer>,
      );

      // Wait for the alert to be called with a longer timeout
      await waitFor(
        () => {
          expect(global.alert).toHaveBeenCalledWith(
            "Permission to access the calendar was denied.",
          );
        },
        { timeout: 3000 },
      ); // Increase timeout to give enough time
    } finally {
      // Restore original alert
      global.alert = originalAlert;

      // Reset the mock to return granted for other tests
      Calendar.requestCalendarPermissionsAsync.mockImplementation(() =>
        Promise.resolve({ status: "granted" }),
      );
    }
  });

  // Test the selecting multiple calendars functionality
  it("selects other calendars", async () => {
    const { getByText, getByTestId } = render(
      <NavigationContainer>
        <CalendarScreen />
      </NavigationContainer>,
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
      </NavigationContainer>,
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
      </NavigationContainer>,
    );

    await waitFor(() => getByText("Next Day"));

    fireEvent.press(getByText("Next Day"));

    await waitFor(() => {
      expect(getByText("No events for today.")).toBeTruthy();
    });
  });

  // Test the Get Directions button
  it("clicks on the Get Directions button and closes the alert", async () => {
    const originalAlert = global.alert;
    global.alert = jest.fn();

    try {
      const { getByText } = render(
        <NavigationContainer>
          <CalendarScreen />
        </NavigationContainer>,
      );

      await waitFor(() => getByText("Event 1"));

      fireEvent.press(getByText("Get Directions"));

      expect(global.alert).toHaveBeenCalledWith("Get directions to Room 101");
    } finally {
      global.alert = originalAlert;
    }
  });

  it("toggles calendar selection correctly (remove then add)", async () => {
    const { getByText, getByTestId } = render(
      <NavigationContainer>
        <CalendarScreen />
      </NavigationContainer>,
    );

    await waitFor(() => getByTestId("selectCalendarButton"));

    fireEvent.press(getByTestId("selectCalendarButton"));

    await waitFor(() => getByText("Select Calendars"));

    expect(getByText("Select your calendars (2)")).toBeTruthy();

    fireEvent.press(getByText("Calendar 1"));

    fireEvent.press(getByText("Done"));

    await waitFor(() => {
      expect(getByText("Select your calendars (1)")).toBeTruthy();
    });

    fireEvent.press(getByTestId("selectCalendarButton"));
    await waitFor(() => getByText("Select Calendars"));

    fireEvent.press(getByText("Calendar 1"));
    fireEvent.press(getByText("Done"));

    await waitFor(() => {
      expect(getByText("Select your calendars (2)")).toBeTruthy();
    });
  });

  it("alerts with fallback when event location is undefined", async () => {
    const originalAlert = global.alert;
    global.alert = jest.fn();

    Calendar.getEventsAsync.mockResolvedValueOnce([
      {
        id: "test-event",
        title: "Test Event",
        startDate: new Date(),
        endDate: new Date(new Date().getTime() + 3600000),
      },
    ]);

    const { getByTestId, getByText } = render(
      <NavigationContainer>
        <CalendarScreen />
      </NavigationContainer>,
    );

    await waitFor(() => getByText("Test Event"));

    fireEvent.press(getByTestId("getClassDirectionsButton"));

    expect(global.alert).toHaveBeenCalledWith("Get directions to ");

    global.alert = originalAlert;
  });
});
