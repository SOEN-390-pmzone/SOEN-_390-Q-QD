import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import ShuttleSchedule from "../components/ShuttleSchedule";

jest.useFakeTimers().setSystemTime(new Date("2025-02-06T15:00:00Z")); // Mock current time

describe("ShuttleSchedule Component", () => {
  it("updates next shuttle time when campus is switched", async () => {
    const { getByText, getByLabelText } = render(
      <ShuttleSchedule visible={true} onClose={jest.fn()} />,
    );

    fireEvent.press(getByLabelText("Loyola"));

    await waitFor(() =>
      expect(getByText(/Next Shuttle from Loyola/i)).toBeTruthy(),
    );
  });
});

it("updates next shuttle time when campus is switched", async () => {
  const { getByText, getByRole } = render(
    <ShuttleSchedule visible={true} onClose={jest.fn()} />,
  );
  fireEvent.press(getByRole("button", { name: /Loyola/i }));
  await waitFor(() =>
    expect(getByText(/Next Shuttle from Loyola/i)).toBeTruthy(),
  );
});

it("displays Friday schedule on Fridays", async () => {
  jest.setSystemTime(new Date("2025-02-07T10:00:00Z")); // Friday
  const { getByText } = render(
    <ShuttleSchedule visible={true} onClose={jest.fn()} />,
  );
  await waitFor(() =>
    expect(getByText(/Next Shuttle from SGW:/i)).toBeTruthy(),
  );
});

it("closes the modal when close button is pressed", () => {
  const onCloseMock = jest.fn();
  const { getByText } = render(
    <ShuttleSchedule visible={true} onClose={onCloseMock} />,
  );
  fireEvent.press(getByText("Close"));
  expect(onCloseMock).toHaveBeenCalled();
});
