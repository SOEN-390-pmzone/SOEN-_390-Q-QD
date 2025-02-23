import React from "react";
import { render, act } from "@testing-library/react-native";
import TemporaryModal from "../components/temporaryModal"; // Adjust the import path as needed

describe("TemporaryModal", () => {
  it("should render the modal with the provided text", () => {
    const { getByText } = render(
      <TemporaryModal text="Hello, World!" my_state={true} time={3000} />,
    );

    // Check if the modal text is rendered
    expect(getByText("Hello, World!")).toBeTruthy();
  });

  it("should hide the modal after 3 seconds", () => {
    jest.useFakeTimers(); // Mock the timers

    const { queryByText } = render(
      <TemporaryModal text="Hello, World!" my_state={true} time={3000} />,
    );

    // Check if the modal is initially visible
    expect(queryByText("Hello, World!")).toBeTruthy();

    // Fast-forward time by 3 seconds
    act(() => {
      jest.advanceTimersByTime(3000);
    });

    // Check if the modal is no longer visible
    expect(queryByText("Hello, World!")).toBeNull();

    jest.useRealTimers(); // Restore real timers
  });
});
