import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import FloatingSearchBar from "../components/FloatingSearchBar";
import { act } from "react-test-renderer";

jest.mock("expo-location", () => ({
  getCurrentPositionAsync: jest.fn().mockResolvedValue({
    coords: { latitude: 45.5017, longitude: -73.5673 }, // Example: Montreal coordinates
  }),
  requestForegroundPermissionsAsync: jest.fn().mockResolvedValue({
    granted: true,
  }),
}));

jest.mock("@expo/vector-icons/Ionicons", () => "Ionicons");

global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({ predictions: [] }),
  }),
);

describe("FloatingSearchBar", () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  it("renders and updates search query", async () => {
    const { getByPlaceholderText } = render(
      <FloatingSearchBar onPlaceSelect={() => {}} />,
    );
    const input = getByPlaceholderText("Search for a place...");
    expect(input).toBeTruthy();
    await act(() => fireEvent.changeText(input, "Montreal"));
    expect(input.props.value).toBe("Montreal");
  });

  it("fetches predictions and clears input", async () => {
    const mockPredictions = [
      { place_id: "1", description: "Montreal, QC, Canada" },
    ];
    fetch.mockResolvedValueOnce({
      json: () => Promise.resolve({ predictions: mockPredictions }),
    });

    const { getByPlaceholderText, getByText, queryByText } = render(
      <FloatingSearchBar />,
    );
    const input = getByPlaceholderText("Search for a place...");

    await act(() => fireEvent.changeText(input, "Mont"));
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("autocomplete/json"),
    );

    await waitFor(() => expect(getByText("Montreal, QC, Canada")).toBeTruthy());

    // Directly clear input instead of interacting with close button for simplicity
    await act(() => fireEvent.changeText(input, ""));
    expect(input.props.value).toBe("");
    expect(queryByText("Montreal, QC, Canada")).toBeNull();
  });

  it("does not fetch predictions when search query is less than 3 characters", async () => {
    const { getByPlaceholderText } = render(
      <FloatingSearchBar onPlaceSelect={() => {}} />,
    );
    const input = getByPlaceholderText("Search for a place...");

    await act(() => {
      fireEvent.changeText(input, "ab");
    });
    expect(fetch).not.toHaveBeenCalled();
  });

  it("calls onPlaceSelect with coordinates", async () => {
    const mockPredictions = [
      { place_id: "1", description: "Montreal, QC, Canada" },
    ];
    const mockDetails = {
      result: { geometry: { location: { lat: 45.5, lng: -73.6 } } },
    };

    fetch
      .mockResolvedValueOnce({
        json: () => Promise.resolve({ predictions: mockPredictions }),
      })
      .mockResolvedValueOnce({ json: () => Promise.resolve(mockDetails) });

    const onPlaceSelectMock = jest.fn();
    const { getByPlaceholderText, getByText } = render(
      <FloatingSearchBar onPlaceSelect={onPlaceSelectMock} />,
    );

    await act(() =>
      fireEvent.changeText(
        getByPlaceholderText("Search for a place..."),
        "Montreal",
      ),
    );
    await waitFor(() => getByText("Montreal, QC, Canada"));
    await act(() => fireEvent.press(getByText("Montreal, QC, Canada")));

    expect(fetch).toHaveBeenCalledWith(expect.stringContaining("details/json"));
    await waitFor(() =>
      expect(onPlaceSelectMock).toHaveBeenCalledWith({
        latitude: 45.5,
        longitude: -73.6,
      }),
    );
  });

  it("handles fetch errors gracefully", async () => {
    fetch.mockRejectedValueOnce("API error");
    const consoleErrorSpy = jest.spyOn(console, "error");

    const { getByPlaceholderText } = render(<FloatingSearchBar />);

    await act(() =>
      fireEvent.changeText(
        getByPlaceholderText("Search for a place..."),
        "Error",
      ),
    );
    expect(consoleErrorSpy).toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
  });
});
