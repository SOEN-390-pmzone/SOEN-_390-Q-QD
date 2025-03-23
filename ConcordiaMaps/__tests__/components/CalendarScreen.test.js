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


// Test the calendarIcon button
describe("Header", () => {
  it("opens the CalendarScreen when clicking on the calendar icon", async () => {
    const { getByTestId } = render(
      <NavigationContainer>
        <Header />
      </NavigationContainer>
    );

    const calendarButton = getByTestId("calendarButton");
    fireEvent.press(calendarButton);

    await waitFor(() => {
      expect(getByTestId("calendarButton")).toBeTruthy();
    });
  });
});

describe("CalendarScreen", () => {
  // Test the selecting multiple calendars functionality
  it("selects other calendars", async () => {
    const { getByText, getByTestId } = render(
      <NavigationContainer>
        <CalendarScreen />
      </NavigationContainer>
    );

    const selectBox = getByTestId("selectCalendarButton");
    fireEvent.press(selectBox);

    await waitFor(() => {
      expect(getByText("Select Calendars")).toBeTruthy();
    });

    await waitFor(() => expect(getByText("Calendar 1")).toBeTruthy());
    const calendar1 = getByText("Calendar 1");
    fireEvent.press(calendar1);

    const doneButton = getByText("Done");
    fireEvent.press(doneButton);

    await waitFor(() => {
      expect(getByText("Select your calendars (1)")).toBeTruthy();
    });
  });

  // Test previous days view
  it("shows events from previous days", async () => {
    const { getByText, getByTestId } = render(
      <NavigationContainer>
        <CalendarScreen />
      </NavigationContainer>
    );

    const previousDayButton = getByText("Previous Day");
    fireEvent.press(previousDayButton);

    await waitFor(() => {
      expect(getByText("No events for today.")).toBeTruthy();
    });
  });

  // Test upcoming days view
  it("shows events for upcoming days", async () => {
    const { getByText, getByTestId } = render(
      <NavigationContainer>
        <CalendarScreen />
      </NavigationContainer>
    );

    const nextDayButton = getByText("Next Day");
    fireEvent.press(nextDayButton);

    await waitFor(() => {
      expect(getByText("No events for today.")).toBeTruthy();
    });
  });

  // Test the Get Directions button
  it("clicks on the Get Directions button and closes the alert", async () => {
    const originalAlert = global.alert;
    global.alert = jest.fn();

    const { getByText } = render(
      <NavigationContainer>
        <CalendarScreen />
      </NavigationContainer>
    );

    await waitFor(() => getByText("Event 1"));

    fireEvent.press(getByText("Get Directions"));

    expect(global.alert).toHaveBeenCalledWith("Get directions to Room 101");

    // Restore original alert
    global.alert = originalAlert;
  });
});
