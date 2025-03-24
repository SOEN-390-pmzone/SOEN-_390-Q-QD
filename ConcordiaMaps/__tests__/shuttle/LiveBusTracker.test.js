import React from "react";
import { render, waitFor } from "@testing-library/react-native";
import axios from "axios";
import LiveBusTracker from "../../components/LiveBusTracker";

jest.mock("axios");

beforeAll(() => {
  jest.spyOn(console, "error").mockImplementation(() => {});
  jest.spyOn(console, "warn").mockImplementation(() => {});
});

afterAll(() => {
  console.error.mockRestore();
  console.warn.mockRestore();
});

describe("LiveBusTracker Component", () => {
  it("fetches and displays bus markers correctly", async () => {
    const mockBusData = {
      data: {
        d: {
          Points: [
            {
              ID: "BUS123",
              Latitude: "45.497",
              Longitude: "-73.578",
            },
            {
              ID: "BUS456",
              Latitude: "45.500",
              Longitude: "-73.580",
            },
          ],
        },
      },
    };

    axios.get.mockResolvedValue({});
    axios.post.mockResolvedValue(mockBusData);

    const { findByTestId } = render(<LiveBusTracker />);

    // Using findByTestId which waits for the element to appear
    const marker1 = await findByTestId("bus-marker-BUS123");
    const marker2 = await findByTestId("bus-marker-BUS456");

    expect(marker1).toBeTruthy();
    expect(marker2).toBeTruthy();
  });

  it("handles API fetch error gracefully", async () => {
    axios.get.mockRejectedValue(new Error("API Error"));
    axios.post.mockRejectedValue(new Error("API Error"));

    const { queryByTestId } = render(<LiveBusTracker />);

    await waitFor(() => {
      expect(queryByTestId("bus-marker-BUS123")).toBeNull();
    });
  });

  it("api response missing expected data structure", async () => {
    axios.get.mockResolvedValue({});
    axios.post.mockResolvedValue({ data: { d: {} } });

    const { findByTestId } = render(<LiveBusTracker />);

    await waitFor(() => {
      expect(findByTestId("bus-marker-BUS123")).toBeTruthy();
      expect(findByTestId("bus-marker-BUS456")).toBeTruthy();
    });
  });
});
