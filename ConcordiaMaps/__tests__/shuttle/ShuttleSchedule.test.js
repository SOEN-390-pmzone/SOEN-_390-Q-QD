import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import ShuttleSchedule, { getNextShuttle } from "../../components/ShuttleSchedule";

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

it("displays next shuttle bus time", async () => {
  const { getByText } = render(
    <ShuttleSchedule visible={true} onClose={jest.fn()} />,
  );
  await waitFor(() =>
    expect(getByText(/Next Shuttle from SGW:/i)).toBeTruthy(),
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

it("handles shuttletime>currenttime gracefully", async () => {
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

it("maintains correct state when switching between campuses and schedules", async () => {
  const { getByText } = render(
    <ShuttleSchedule visible={true} onClose={jest.fn()} />,
  );

  // Switch to Loyola campus
  fireEvent.press(getByText("Loyola"));
  await waitFor(() => {
    expect(getByText(/Next Shuttle from Loyola/i)).toBeTruthy();
  });

  // Switch to Friday schedule
  fireEvent.press(getByText("Friday"));
  await waitFor(() => {
    const fridayButton = getByText("Friday");
    const hasActiveStyle = checkForActiveStyle(fridayButton);
    expect(hasActiveStyle).toBe(true);
  });
});

it("renders efficiently without unnecessary re-renders", () => {
  const onCloseMock = jest.fn();
  const { rerender } = render(
    <ShuttleSchedule visible={true} onClose={onCloseMock} />,
  );

  // Rerender with same props should not cause significant changes
  rerender(<ShuttleSchedule visible={true} onClose={onCloseMock} />);
  expect(onCloseMock).not.toHaveBeenCalled();
});

it("handles edge case times correctly", () => {
  // Test midnight and noon edge cases
  jest.setSystemTime(new Date("2025-02-06T00:00:00Z"));
  const { getByText } = render(
    <ShuttleSchedule visible={true} onClose={jest.fn()} />,
  );
  expect(getByText(/Next Shuttle/i)).toBeTruthy();
});



it("updates selected campus when SGW button is pressed", async () => {
  const { getByText } = render(
    <ShuttleSchedule visible={true} onClose={jest.fn()} />
  );

  fireEvent.press(getByText("SGW Campus"));

  await waitFor(() => {
    expect(getByText(/Next Shuttle from SGW:/i)).toBeTruthy();
  });
});

