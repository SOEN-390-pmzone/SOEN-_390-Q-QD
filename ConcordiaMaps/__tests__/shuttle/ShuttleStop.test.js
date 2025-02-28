import React from "react";
import { render } from "@testing-library/react-native";
import ShuttleStop from "../../components/ShuttleStop";

describe("ShuttleStop Component", () => {
  it("renders both bus stop markers", () => {
    const { getByTestId } = render(<ShuttleStop />);

    expect(getByTestId("shuttle-stop-marker-0")).toBeTruthy();
    expect(getByTestId("shuttle-stop-marker-1")).toBeTruthy();
  });

  it("renders SGW Stop marker with correct title", () => {
    const { getByTestId } = render(<ShuttleStop />);
    const marker = getByTestId("shuttle-stop-marker-0");
    expect(marker.props.title).toBe("SGW Stop");
  });

  it("renders Loyola Stop marker with correct title", () => {
    const { getByTestId } = render(<ShuttleStop />);
    const marker = getByTestId("shuttle-stop-marker-1");
    expect(marker.props.title).toBe("Loyola Stop");
  });
});
