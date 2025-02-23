import React from "react";
import { render, waitFor } from "@testing-library/react-native";
import axios from "axios";
import LiveBusTracker from "../../components/LiveBusTracker";

jest.mock("axios");

beforeAll(() => {
  jest.spyOn(console, "error").mockImplementation(() => {});
});

afterAll(() => {
  console.error.mockRestore();
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

    const { getByTestId } = render(<LiveBusTracker />);

    await waitFor(() => {
      expect(getByTestId("bus-marker-BUS123")).toBeTruthy();
      expect(getByTestId("bus-marker-BUS456")).toBeTruthy();
    });
  });

  it("handles API fetch error gracefully", async () => {
    axios.get.mockRejectedValue(new Error("API Error"));
    axios.post.mockRejectedValue(new Error("API Error"));

    const { queryByTestId } = render(<LiveBusTracker />);

    await waitFor(() => {
      expect(queryByTestId("bus-marker-BUS123")).toBeNull();
    });
  });
});
