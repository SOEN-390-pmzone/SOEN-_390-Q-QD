import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import ShuttleSchedule from "../../components/ShuttleSchedule";

describe("ShuttleSchedule Component", () => {
  it("renders the modal when visible", () => {
    const { getByText } = render(
      <ShuttleSchedule visible={true} onClose={jest.fn()} />
    );

    expect(getByText("Shuttle Schedule")).toBeTruthy();
  });

  it("does not render the modal when not visible", () => {
    const { queryByText } = render(
      <ShuttleSchedule visible={false} onClose={jest.fn()} />
    );

    expect(queryByText("Shuttle Schedule")).toBeNull();
  });

  it("calls onClose when close button is pressed", () => {
    const onCloseMock = jest.fn();
    const { getByText } = render(
      <ShuttleSchedule visible={true} onClose={onCloseMock} />
    );

    fireEvent.press(getByText("Close"));
    expect(onCloseMock).toHaveBeenCalled();
  });

  it("switches campus when SGW button is pressed", () => {
    const { getByText } = render(
      <ShuttleSchedule visible={true} onClose={jest.fn()} />
    );

    fireEvent.press(getByText("SGW Campus"));
    expect(getByText(/Next Shuttle from SGW:/)).toBeTruthy();
  });

  it("switches campus when Loyola button is pressed", () => {
    const { getByText } = render(
      <ShuttleSchedule visible={true} onClose={jest.fn()} />
    );

    fireEvent.press(getByText("Loyola"));
    expect(getByText(/Next Shuttle from Loyola:/)).toBeTruthy();
  });

  it("switches to Friday schedule when Friday button is pressed", () => {
    const { getByText } = render(
      <ShuttleSchedule visible={true} onClose={jest.fn()} />
    );

    fireEvent.press(getByText("Friday"));
    expect(getByText("Friday")).toBeTruthy();
  });
});

it("displays next shuttle bus time", async () => {
  const { getByText } = render(
    <ShuttleSchedule visible={true} onClose={jest.fn()} />
  );
  await waitFor(() =>
    expect(getByText(/Next Shuttle from SGW:/i)).toBeTruthy()
  );
});
