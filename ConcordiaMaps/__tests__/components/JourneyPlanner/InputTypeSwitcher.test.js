import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import InputTypeSwitcher from "../../../components/JourneyPlanner/InputTypeSwitcher";

// Mock the styles object
jest.mock("../../../styles/JourneyPlanner/JourneyPlannerScreenStyles", () => ({
  inputTypeContainer: { flexDirection: "row" },
  tabButton: { padding: 10 },
  activeTab: { backgroundColor: "blue" },
  tabText: { fontSize: 16 },
}));

describe("InputTypeSwitcher", () => {
  const mockSetInputMode = jest.fn();

  const getProps = (overrides = {}) => ({
    inputMode: "address",
    setInputMode: mockSetInputMode,
    ...overrides,
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders correctly with initial props", () => {
    const props = getProps();
    const { getByText, getByTestId } = render(<InputTypeSwitcher {...props} />);
    expect(getByText("Address")).toBeTruthy();
    expect(getByText("Building & Room")).toBeTruthy();
    expect(getByTestId("address-tab")).toBeTruthy();
    expect(getByTestId("building-tab")).toBeTruthy();
  });

  it("calls setInputMode with 'address' when the Address tab is pressed", () => {
    const props = getProps({ inputMode: "building" });
    const { getByTestId } = render(<InputTypeSwitcher {...props} />);
    const addressTab = getByTestId("address-tab");

    fireEvent.press(addressTab);

    expect(mockSetInputMode).toHaveBeenCalledTimes(1);
    expect(mockSetInputMode).toHaveBeenCalledWith("address");
  });

  it("calls setInputMode with 'building' when the Building & Room tab is pressed", () => {
    const props = getProps({ inputMode: "address" });
    const { getByTestId } = render(<InputTypeSwitcher {...props} />);
    const buildingTab = getByTestId("building-tab");

    fireEvent.press(buildingTab);

    expect(mockSetInputMode).toHaveBeenCalledTimes(1);
    expect(mockSetInputMode).toHaveBeenCalledWith("building");
  });

  it("applies the activeTab style to the selected tab", () => {
    const props = getProps({ inputMode: "building" });
    const { getByTestId } = render(<InputTypeSwitcher {...props} />);
    const buildingTab = getByTestId("building-tab");
    const addressTab = getByTestId("address-tab");
  
    // Check if the activeTab style is applied to the building tab
    expect(buildingTab.props.style).toEqual(
      expect.objectContaining({ backgroundColor: "blue" })
    );
  
    // Check if the activeTab style is not applied to the address tab
    expect(addressTab.props.style).not.toEqual(
      expect.objectContaining({ backgroundColor: "blue" })
    );
  });
});