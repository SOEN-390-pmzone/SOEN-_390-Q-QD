import React from "react";
import { render } from "@testing-library/react-native";
import NavigationSteps from "../../../components/IndoorNavigation/NavigationSteps";

// Mock the NavigationStylesService
jest.mock("../../../services/NavigationStylesService", () => ({
  getStepColor: jest.fn((type) => {
    switch (type) {
      case "start":
        return "#4CAF50"; // Green
      case "end":
        return "#F44336"; // Red
      case "elevator":
        return "#9C27B0"; // Purple
      default:
        return "#912338"; // Maroon
    }
  }),
}));

describe("NavigationSteps", () => {
  // Sample navigation steps for testing
  const mockSteps = [
    { type: "start", text: "Start at room H801 on floor 8 of Hall Building" },
    { type: "walk", text: "Go to H803" },
    { type: "elevator", text: "Take elevator to floor 9" },
    { type: "walk", text: "Go to H903" },
    { type: "end", text: "Arrive at destination: H905" },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders correctly with steps", () => {
    const { getByText } = render(<NavigationSteps steps={mockSteps} />);

    // Check title is displayed
    expect(getByText("Navigation Steps")).toBeTruthy();

    // Check all steps are rendered
    expect(
      getByText("Start at room H801 on floor 8 of Hall Building"),
    ).toBeTruthy();
    expect(getByText("Go to H803")).toBeTruthy();
    expect(getByText("Take elevator to floor 9")).toBeTruthy();
    expect(getByText("Go to H903")).toBeTruthy();
    expect(getByText("Arrive at destination: H905")).toBeTruthy();
  });

  it("renders message when no steps are provided", () => {
    const { getByText } = render(<NavigationSteps steps={[]} />);

    // Check title is displayed
    expect(getByText("Navigation Steps")).toBeTruthy();

    // Check no steps message is displayed
    expect(getByText("No navigation steps available")).toBeTruthy();
  });

  it("renders with custom styles", () => {
    const customStyles = {
      stepsContainer: { marginTop: 24 },
      stepsTitle: { fontSize: 20 },
      stepsList: { maxHeight: 300 },
      stepItem: { paddingVertical: 12 },
      stepDot: { width: 16, height: 16 },
      stepText: { fontSize: 16 },
    };

    // This test simply verifies the component doesn't crash with custom styles
    const { getByText } = render(
      <NavigationSteps steps={mockSteps} customStyles={customStyles} />,
    );

    expect(getByText("Navigation Steps")).toBeTruthy();
  });

  it("handles undefined steps gracefully", () => {
    const { getByText } = render(<NavigationSteps />);

    // Check no steps message is displayed
    expect(getByText("No navigation steps available")).toBeTruthy();
  });

  it("provides accessibility labels for step items", () => {
    const { getAllByLabelText } = render(<NavigationSteps steps={mockSteps} />);

    // Check accessibility labels for steps
    expect(
      getAllByLabelText("Start at room H801 on floor 8 of Hall Building")
        .length,
    ).toBeGreaterThan(0);
    expect(getAllByLabelText("Go to H803").length).toBeGreaterThan(0);
    expect(
      getAllByLabelText("Take elevator to floor 9").length,
    ).toBeGreaterThan(0);
    expect(getAllByLabelText("Go to H903").length).toBeGreaterThan(0);
    expect(
      getAllByLabelText("Arrive at destination: H905").length,
    ).toBeGreaterThan(0);
  });
});
