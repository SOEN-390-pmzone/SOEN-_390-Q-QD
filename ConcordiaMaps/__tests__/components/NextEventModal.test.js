import React from "react";
import { render, fireEvent, waitFor, act } from "@testing-library/react-native";
import NextEventModal from "../../components/NextEventModal";
import * as Calendar from "expo-calendar";
import { ActivityIndicator } from "react-native";


jest.mock("expo-calendar", () => ({
  requestCalendarPermissionsAsync: jest.fn(),
  getCalendarsAsync: jest.fn(),
  getEventsAsync: jest.fn(),
  EntityTypes: {
    EVENT: "event",
  },
}));

const mockNavigate = jest.fn();
jest.mock("@react-navigation/native", () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
  }),
}));

describe("NextEventModal", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("shows loading indicator while loading", async () => {
    Calendar.requestCalendarPermissionsAsync.mockResolvedValue({ status: "granted" });
    Calendar.getCalendarsAsync.mockResolvedValue([]);
    Calendar.getEventsAsync.mockResolvedValue([]);
    
    const { UNSAFE_getByType } = render(
      <NextEventModal isVisible={true} onClose={jest.fn()} />
    );
    
    expect(UNSAFE_getByType(ActivityIndicator)).toBeTruthy();
    
    await act(async () => {});
  });

  it("renders event details when an allowed upcoming event exists", async () => {
    Calendar.requestCalendarPermissionsAsync.mockResolvedValue({ status: "granted" });
    Calendar.getCalendarsAsync.mockResolvedValue([{ id: "1" }]);
    
    const now = new Date();
    const future = new Date(now.getTime() + 3600000); // 1 hour later
    const futureEnd = new Date(future.getTime() + 3600000);
    Calendar.getEventsAsync.mockResolvedValue([
      {
        id: "1",
        title: "SOEN 390",
        startDate: future.toISOString(),
        endDate: futureEnd.toISOString(),
        location: "Room 101",
      },
      // This event will be filtered out because title doesn't start with allowed prefixes.
      {
        id: "2",
        title: "ENGL 206",
        startDate: future.toISOString(),
        endDate: futureEnd.toISOString(),
        location: "Room 102",
      },
    ]);
    
    const { getByText } = render(
      <NextEventModal isVisible={true} onClose={jest.fn()} />
    );
    
    // Wait for the event details to appear.
    await waitFor(() => {
      expect(getByText("SOEN 390")).toBeTruthy();
      expect(getByText(/Room 101/)).toBeTruthy();
    });
  });

  it('renders "No upcoming events today." when no events are available', async () => {
    Calendar.requestCalendarPermissionsAsync.mockResolvedValue({ status: "granted" });
    Calendar.getCalendarsAsync.mockResolvedValue([{ id: "1" }]);
    Calendar.getEventsAsync.mockResolvedValue([]);
    
    const { getByText } = render(
      <NextEventModal isVisible={true} onClose={jest.fn()} />
    );
    
    await waitFor(() => {
      expect(getByText("No upcoming events today.")).toBeTruthy();
    });
  });

  it("calls onClose when the Close button is pressed", async () => {
    const onCloseMock = jest.fn();
    Calendar.requestCalendarPermissionsAsync.mockResolvedValue({ status: "granted" });
    Calendar.getCalendarsAsync.mockResolvedValue([{ id: "1" }]);
    
    const now = new Date();
    const future = new Date(now.getTime() + 3600000);
    const futureEnd = new Date(future.getTime() + 3600000);
    Calendar.getEventsAsync.mockResolvedValue([
      {
        id: "1",
        title: "COMP 248",
        startDate: future.toISOString(),
        endDate: futureEnd.toISOString(),
        location: "Building A",
      },
    ]);
    
    const { getByText } = render(
      <NextEventModal isVisible={true} onClose={onCloseMock} />
    );
    
    await waitFor(() => {
      expect(getByText("COMP 248")).toBeTruthy();
    });
    
    fireEvent.press(getByText("Close"));
    expect(onCloseMock).toHaveBeenCalled();
  });

  it("calls navigation.navigate with default origin and event location when Get Directions is pressed", async () => {
    const onCloseMock = jest.fn();
    Calendar.requestCalendarPermissionsAsync.mockResolvedValue({ status: "granted" });
    Calendar.getCalendarsAsync.mockResolvedValue([{ id: "1" }]);
    
    const now = new Date();
    const future = new Date(now.getTime() + 3600000);
    const futureEnd = new Date(future.getTime() + 3600000);
    Calendar.getEventsAsync.mockResolvedValue([
      {
        id: "1",
        title: "ENGR 233",
        startDate: future.toISOString(),
        endDate: futureEnd.toISOString(),
        location: "Room 303",
      },
    ]);
    
    const { getByText } = render(
      <NextEventModal isVisible={true} onClose={onCloseMock} />
    );
    
    await waitFor(() => {
      expect(getByText("ENGR 233")).toBeTruthy();
    });
    
    fireEvent.press(getByText("Get Directions"));
    
    expect(onCloseMock).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith("GetDirections", {
      origin: { latitude: 45.494971642137095, longitude: -73.57791280320929 },
      destination: "Room 303",
      disableLiveLocation: true,
    });
  });
});
