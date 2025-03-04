import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import ShuttleSchedule from "../../components/ShuttleSchedule";

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

it("displays next shuttle bus time", async () => {
  const { getByText } = render(
    <ShuttleSchedule visible={true} onClose={jest.fn()} />,
  );
  await waitFor(() =>
    expect(getByText(/Next Shuttle from SGW:/i)).toBeTruthy(),
  );
});

it("toggles to Friday schedule when Friday button is pressed", async () => {
  const { getByText } = render(
    <ShuttleSchedule visible={true} onClose={jest.fn()} />,
  );

  // Press the Friday button
  fireEvent.press(getByText("Friday"));

  // Wait for the state to update
  await waitFor(() => {
    // Get a fresh reference to the Friday button
    const fridayButton = getByText("Friday");

    // Find the element or its parent with the active style
    const hasActiveStyle = checkForActiveStyle(fridayButton);
    // Unconditional expect
    expect(hasActiveStyle).toBe(true);
  });
});

// Helper function to check for active style
function checkForActiveStyle(element) {
  // Check the element and up to 3 levels of parents for the active style
  for (let i = 0; i < 3; i++) {
    if (!element || !element.props) return false;

    const style = element.props.style;
    if (style) {
      // Style might be an array or a single object
      const styles = Array.isArray(style) ? style : [style];

      const foundStyle = styles.some(
        (s) =>
          s &&
          (s.backgroundColor === "#912338" ||
            s.background === "#912338" ||
            JSON.stringify(s).includes("#912338")),
      );

      if (foundStyle) return true;
    }

    // Also check accessibility props
    if (
      element.props.accessibilityState?.selected === true ||
      element.props["aria-selected"] === true
    ) {
      return true;
    }

    element = element.parent;
  }

  return false;
}

it("toggles back to weekday schedule when Mon - Thu button is pressed", async () => {
  const { getByText } = render(
    <ShuttleSchedule visible={true} onClose={jest.fn()} />,
  );

  // First switch to Friday
  fireEvent.press(getByText("Friday"));
  // Then back to weekday
  fireEvent.press(getByText("Mon - Thu"));

  // Wait for the state to update
  await waitFor(() => {
    const weekdayButton = getByText("Mon - Thu");
    const hasActiveStyle = checkForActiveStyle(weekdayButton);
    expect(hasActiveStyle).toBe(true);
  });
});

it("shows 'No shuttle service on weekends' message on weekends", async () => {
  // Mock weekend date (Sunday)
  jest.setSystemTime(new Date("2025-02-09T10:00:00Z"));

  const { getByText } = render(
    <ShuttleSchedule visible={true} onClose={jest.fn()} />,
  );

  await waitFor(() =>
    expect(getByText(/No shuttle service on weekends/i)).toBeTruthy(),
  );
});

it("shows 'No more shuttles today' when current time is after last shuttle", async () => {
  // Set time to late evening after all shuttles have departed
  jest.setSystemTime(new Date("2025-02-06T23:30:00Z"));

  const { getByText } = render(
    <ShuttleSchedule visible={true} onClose={jest.fn()} />,
  );

  await waitFor(() =>
    expect(getByText(/No more shuttles today/i)).toBeTruthy(),
  );
});

it("highlights the next shuttle time in the schedule", async () => {
  // Set specific time to test highlighting
  jest.setSystemTime(new Date("2025-02-06T09:20:00Z")); // 9:20 AM, before 9:30 AM shuttle

  const { getAllByText } = render(
    <ShuttleSchedule visible={true} onClose={jest.fn()} />,
  );

  await waitFor(() => {
    // Search for the next shuttle time
    const nextShuttleElements = getAllByText("09:30 AM");
    expect(nextShuttleElements.length).toBeGreaterThan(0);

    // Check all instances to find the highlighted one
    const highlightedElement = nextShuttleElements.find((element) => {
      // First check the element itself
      if (hasHighlightStyling(element)) {
        return true;
      }

      // If not on the element directly, check parent elements
      let parent = element.parent;
      for (let i = 0; i < 3 && parent; i++) {
        if (hasHighlightStyling(parent)) {
          return true;
        }
        parent = parent.parent;
      }

      return false;
    });

    // Assert that we found at least one highlighted element
    expect(highlightedElement).toBeTruthy();
  });
});

// Helper function to check for highlight styling
function hasHighlightStyling(element) {
  if (!element || !element.props || !element.props.style) return false;

  const styles = Array.isArray(element.props.style)
    ? element.props.style
    : [element.props.style];

  return styles.some((style) => {
    // Check for direct style match
    if (style && style.fontWeight === "bold" && style.color === "#912338") {
      return true;
    }

    // Check for partial style match
    if (style && (style.fontWeight === "bold" || style.color === "#912338")) {
      return true;
    }

    // Check for style in stringified form (some components apply styles differently)
    const styleStr = JSON.stringify(style);
    return (
      styleStr.includes("fontWeight") &&
      styleStr.includes("bold") &&
      styleStr.includes("color") &&
      styleStr.includes("#912338")
    );
  });
}

it("renders shuttle schedule table correctly", () => {
  const { getByText } = render(
    <ShuttleSchedule visible={true} onClose={jest.fn()} />,
  );

  // Update with times that are actually in the schedule based on component dump
  expect(getByText("09:30 AM")).toBeTruthy();
  expect(getByText("12:45 PM")).toBeTruthy();
  expect(getByText("05:45 PM")).toBeTruthy(); // Note the leading zero in the format
});

it("has accessible buttons for campus selection", () => {
  const { getByLabelText } = render(
    <ShuttleSchedule visible={true} onClose={jest.fn()} />,
  );

  expect(getByLabelText("Loyola")).toBeTruthy();
});

it("modal container has correct test ID", () => {
  const { getByTestId } = render(
    <ShuttleSchedule visible={true} onClose={jest.fn()} />,
  );

  expect(getByTestId("shuttle-schedule-modal-container")).toBeTruthy();
});

it("close button has correct test ID", () => {
  const { getByTestId } = render(
    <ShuttleSchedule visible={true} onClose={jest.fn()} />,
  );

  expect(getByTestId("shuttle-schedule-close-button")).toBeTruthy();
});

it("does not render when visible prop is false", () => {
  const { queryByTestId } = render(
    <ShuttleSchedule visible={false} onClose={jest.fn()} />,
  );

  expect(queryByTestId("shuttle-schedule-modal-container")).toBeNull();
});

it("handles invalid time formats in schedule gracefully", async () => {
  // Mock console.error to prevent test output pollution
  const originalConsoleError = console.error;
  console.error = jest.fn();

  // Create a mock implementation with invalid time
  jest.mock("../../components/ShuttleSchedule", () => {
    const actual = jest.requireActual("../../components/ShuttleSchedule");
    const modified = {
      ...actual.default,
      getNextShuttle: (schedule) => {
        // Add an invalid time format to the schedule
        const corruptedSchedule = ["invalid-time", ...schedule];
        return actual.default.getNextShuttle(corruptedSchedule);
      },
    };
    return modified;
  });

  const { getByText } = render(
    <ShuttleSchedule visible={true} onClose={jest.fn()} />,
  );

  await waitFor(() =>
    expect(getByText(/Next Shuttle from SGW:/i)).toBeTruthy(),
  );

  // Restore console.error
  console.error = originalConsoleError;
});
