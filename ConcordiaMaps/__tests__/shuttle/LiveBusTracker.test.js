import React from "react";
import { render, waitFor } from "@testing-library/react-native";
import axios from "axios";
import LiveBusTracker from "../../components/LiveBusTracker";

jest.mock("axios");

describe("LiveBusTracker Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

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

    await waitFor(
      async () => {
        expect(await findByTestId("bus-marker-BUS123")).toBeTruthy();
        expect(await findByTestId("bus-marker-BUS456")).toBeTruthy();
      },
      { timeout: 5000 },
    );
  });

  it("handles API fetch error gracefully", async () => {
    axios.get.mockRejectedValue(new Error("API Error"));
    axios.post.mockRejectedValue(new Error("API Error"));

    const { queryByTestId } = render(<LiveBusTracker />);

    await waitFor(
      () => {
        expect(queryByTestId("bus-marker-BUS123")).toBeNull();
      },
      { timeout: 5000 },
    );
  });

  it("handles missing data structure in API response", async () => {
    axios.get.mockResolvedValue({});
    axios.post.mockResolvedValue({ data: { d: {} } });

    const { queryByTestId } = render(<LiveBusTracker />);

    await waitFor(
      () => {
        expect(queryByTestId("bus-marker-BUS123")).toBeNull();
        expect(queryByTestId("bus-marker-BUS456")).toBeNull();
      },
      { timeout: 5000 },
    );
  });
});
