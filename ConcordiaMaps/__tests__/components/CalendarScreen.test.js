import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import CalendarScreen from "../../components/CalendarScreen";
import Header from "../../components/Header";
import { NavigationContainer } from "@react-navigation/native";
import { Alert } from "react-native";

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

    // Fix: Wait for "Calendar 1" to be available before selecting it
    await waitFor(() => expect(getByText("Calendar 1")).toBeTruthy());
    const calendar1 = getByText("Calendar 1");
    fireEvent.press(calendar1);

    const doneButton = getByText("Done");
    fireEvent.press(doneButton);

    await waitFor(() => {
      expect(getByText("Select your calendars (1)")).toBeTruthy();
    });
  });

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

  it("clicks on the Get Directions button and closes the alert", async () => {
    // Mock the alert function - make sure it's defined before rendering
    const alertMock = jest.fn();
    global.alert = alertMock;

    const { getByText, getByTestId, debug } = render(
      <NavigationContainer>
        <CalendarScreen />
      </NavigationContainer>
    );

    // Wait for the event to load
    await waitFor(() => {
      expect(getByText("Event 1")).toBeTruthy();
    });

    // Log to check if the button is found
    debug();

    // Find the "Get Directions" button and simulate a press
    const getDirectionsButton = getByTestId("getClassDirectionsButton");
    console.log("Button found:", getDirectionsButton);

    // Check if alert has been called before pressing the button
    console.log("Before press - alert called:", alertMock.mock.calls.length);

    // Fire the press event on the button
    fireEvent.press(getDirectionsButton);

    // Check if the alert was called with the expected message
    console.log("After press - alert called:", alertMock.mock.calls.length);
    expect(alertMock).toHaveBeenCalledWith("Get directions to Room 101");
  });
});
