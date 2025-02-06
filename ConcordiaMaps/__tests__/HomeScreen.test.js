import React from "react";
import { render, waitFor } from "@testing-library/react-native";
import axios from "axios";
import HomeScreen from "../screen/HomeScreen";

jest.mock("axios");
describe("HomeScreen", () => {
  it("handles no results found", async () => {
    const mockResponse = {
      data: {
        results: [],
        status: "ZERO_RESULTS",
      },
    };

    axios.get.mockResolvedValueOnce(mockResponse);

    const { getByTestId } = render(<HomeScreen />);

    await waitFor(() => {
      expect(getByTestId("error-message").props.children).toBe("ZERO_RESULTS");
    });
  });

  it("handles API errors", async () => {
    axios.get.mockRejectedValueOnce(new Error("Network Error"));

    const { getByTestId } = render(<HomeScreen />);

    await waitFor(() => {
      expect(getByTestId("error-message").props.children).toBe(
        "Something went wrong. Please try again later.",
      );
    });
  });
});
