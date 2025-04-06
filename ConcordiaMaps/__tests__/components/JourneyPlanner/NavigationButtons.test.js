import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import NavigationButton from "../../../components/JourneyPlanner/NavigationOrchestrator/NavigationButton";
describe("NavigationButton", () => {
  const mockOnPress = jest.fn();

  beforeEach(() => {
    mockOnPress.mockClear();
  });

  test("renders with default props", () => {
    const { getByText, getByTestId } = render(
      <NavigationButton onPress={mockOnPress} />,
    );

    expect(getByText("Get Directions")).toBeTruthy();
    expect(getByTestId("directionButton")).toBeTruthy();
  });

  test("renders with indoor path text when avoidOutdoor is true", () => {
    const { getByText, getByTestId } = render(
      <NavigationButton onPress={mockOnPress} avoidOutdoor={true} />,
    );

    expect(getByText("Indoor Path")).toBeTruthy();
    expect(getByTestId("directionButton")).toBeTruthy();
  });

  test("renders with tunnel button when both hasTunnel and avoidOutdoor are true", () => {
    const { getByText, getByTestId } = render(
      <NavigationButton
        onPress={mockOnPress}
        hasTunnel={true}
        avoidOutdoor={true}
      />,
    );

    expect(getByText("Use Tunnel")).toBeTruthy();
    expect(getByTestId("tunnelButton")).toBeTruthy();
  });

  test("does not show tunnel button when only hasTunnel is true", () => {
    const { getByText, getByTestId } = render(
      <NavigationButton
        onPress={mockOnPress}
        hasTunnel={true}
        avoidOutdoor={false}
      />,
    );

    expect(getByText("Get Directions")).toBeTruthy();
    expect(getByTestId("directionButton")).toBeTruthy();
  });

  test("calls onPress when button is pressed", () => {
    const { getByTestId } = render(<NavigationButton onPress={mockOnPress} />);

    fireEvent.press(getByTestId("directionButton"));
    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });

  test("applies custom style when provided", () => {
    const customStyle = { backgroundColor: "#ff0000" };
    const { getByTestId } = render(
      <NavigationButton onPress={mockOnPress} style={customStyle} />,
    );

    const button = getByTestId("directionButton");
    // Fix: Check if customStyle is contained in the button's style
    expect(button.props.style).toMatchObject(
      expect.objectContaining(customStyle),
    );
  });

  test("calls onPress when tunnel button is pressed", () => {
    const { getByTestId } = render(
      <NavigationButton
        onPress={mockOnPress}
        hasTunnel={true}
        avoidOutdoor={true}
      />,
    );

    fireEvent.press(getByTestId("tunnelButton"));
    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });

  test("renders the correct icon based on button type", () => {
    // Regular direction button
    const { getByTestId, rerender } = render(
      <NavigationButton onPress={mockOnPress} />,
    );

    let button = getByTestId("directionButton");
    expect(button).toBeTruthy();

    // For tunnel button
    rerender(
      <NavigationButton
        onPress={mockOnPress}
        hasTunnel={true}
        avoidOutdoor={true}
      />,
    );

    button = getByTestId("tunnelButton");
    expect(button).toBeTruthy();

    // Check that it has the purple background
    expect(button.props.style).toEqual(
      expect.objectContaining({
        backgroundColor: "#673AB7",
      }),
    );
  });

  test("handles undefined style prop gracefully", () => {
    const { getByTestId } = render(
      <NavigationButton onPress={mockOnPress} style={undefined} />,
    );

    const button = getByTestId("directionButton");
    expect(button).toBeTruthy();
  });
});
