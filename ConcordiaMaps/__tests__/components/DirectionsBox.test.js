import React, { useState } from "react";
import { render, fireEvent, waitFor, act } from "@testing-library/react-native";
import DirectionsBox from "../../components/OutdoorNavigation/DirectionsBox";
import PropTypes from "prop-types";

// Wrapper component to manage state for testing
const DirectionsBoxWrapper = ({ directions }) => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  return (
    <DirectionsBox
      directions={directions}
      isCollapsed={isCollapsed}
      setIsCollapsed={setIsCollapsed}
    />
  );
};

// Add PropTypes for the wrapper component
DirectionsBoxWrapper.propTypes = {
  directions: PropTypes.arrayOf(
    PropTypes.shape({
      html_instructions: PropTypes.string.isRequired,
      distance: PropTypes.string.isRequired,
    }),
  ),
};

// Add default props
DirectionsBoxWrapper.defaultProps = {
  directions: [],
};

describe("DirectionsBox", () => {
  const directions = [
    {
      html_instructions: "Turn <b>left</b> at the next intersection",
      distance: "200m",
    },
    {
      html_instructions: "Continue <b>straight</b> for 500m",
      distance: "500m",
    },
  ];

  it("toggles collapse state on handle press", async () => {
    const { getByTestId } = render(
      <DirectionsBoxWrapper directions={directions} />,
    );
    const handle = getByTestId("handle");

    // Open the directions box
    await act(async () => {
      fireEvent.press(handle);
    });

    await waitFor(() => {
      expect(getByTestId("directionsBox")).toHaveStyle({
        transform: [{ translateY: 0 }],
      });
    });

    // Close the directions box
    await act(async () => {
      fireEvent.press(handle);
    });

    await waitFor(() => {
      expect(getByTestId("directionsBox")).toHaveStyle({
        transform: [{ translateY: 300 }],
      });
    });
  });

  it("opens the directions box when the handle is pressed", async () => {
    const { getByTestId } = render(
      <DirectionsBoxWrapper directions={directions} />,
    );
    const handle = getByTestId("handle");

    await act(async () => {
      fireEvent.press(handle);
    });

    expect(getByTestId("directionsBox")).toBeTruthy();
  });

  it("closes the directions box when the handle is pressed twice", async () => {
    const { getByTestId } = render(
      <DirectionsBoxWrapper directions={directions} />,
    );
    const handle = getByTestId("handle");

    await act(async () => {
      fireEvent.press(handle);
    });

    await waitFor(() => {
      expect(getByTestId("directionsBox")).toHaveStyle({
        transform: [{ translateY: 0 }],
      });
    });

    await act(async () => {
      fireEvent.press(handle);
    });

    await waitFor(() => {
      expect(getByTestId("directionsBox")).toHaveStyle({
        transform: [{ translateY: 300 }],
      });
    });
  });
});
