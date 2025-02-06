import React from "react";
import { render, waitFor } from "@testing-library/react-native";
import { LocationProvider, LocationContext } from "../contexts/LocationContext";
import * as Location from "expo-location";

jest.mock("expo-location", () => ({
  requestForegroundPermissionsAsync: jest.fn(),
  getCurrentPositionAsync: jest.fn(),
}));

describe("LocationProvider", () => {
  it("fetches and provides location", async () => {
    const mockCoords = { latitude: 37.7749, longitude: -122.4194 };

    Location.requestForegroundPermissionsAsync.mockResolvedValue({
      status: "granted",
    });
    Location.getCurrentPositionAsync.mockResolvedValue({ coords: mockCoords });

    let contextValue;
    render(
      <LocationProvider>
        <LocationContext.Consumer>
          {(value) => {
            contextValue = value;
            return null;
          }}
        </LocationContext.Consumer>
      </LocationProvider>,
    );

    await waitFor(() => expect(contextValue).toEqual(mockCoords));
  });

  it("handles permission denied case", async () => {
    Location.requestForegroundPermissionsAsync.mockResolvedValue({
      status: "denied",
    });
    Location.getCurrentPositionAsync.mockResolvedValue(null);

    let contextValue;
    render(
      <LocationProvider>
        <LocationContext.Consumer>
          {(value) => {
            contextValue = value;
            return null;
          }}
        </LocationContext.Consumer>
      </LocationProvider>,
    );

    await waitFor(() => expect(contextValue).toBeNull());
  });
});
