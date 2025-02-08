 
import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import ShuttleStop from "../components/ShuttleStop";

describe("ShuttleStop Component", () => {
  it("renders both bus stop markers", () => {
    const { getByTestId } = render(<ShuttleStop />);

    expect(getByTestId("shuttle-stop-marker-0")).toBeTruthy();
    expect(getByTestId("shuttle-stop-marker-1")).toBeTruthy();
  });

  it("displays correct callout when SGW Stop is pressed", () => {
    const { getByText, getByTestId } = render(<ShuttleStop />);

    fireEvent.press(getByTestId("shuttle-stop-marker-0"));

    expect(getByText("SGW Stop")).toBeTruthy();
  });

  it("displays correct callout when Loyola Stop is pressed", () => {
    const { getByText, getByTestId } = render(<ShuttleStop />);

    fireEvent.press(getByTestId("shuttle-stop-marker-1"));

    expect(getByText("Loyola Stop")).toBeTruthy();
  });
});
