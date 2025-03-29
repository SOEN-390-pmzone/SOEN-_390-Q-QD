import React from "react";
import { render } from "@testing-library/react-native";
import { View, Text } from "react-native";

// Mock WebView
const MockWebView = (props) => (
  <View testID="mock-webview" {...props}>
    <Text>Mocked WebView</Text>
  </View>
);
jest.mock("react-native-webview", () => ({
  WebView: MockWebView,
}));

import ExpandedFloorPlanModal from "../../../components/IndoorNavigation/ExpandedFloorPlan";

describe("ExpandedFloorPlanModal", () => {
  const mockProps = {
    visible: true,
    floorNumber: "2",
    onClose: jest.fn(),
    htmlContent: "<html><body>Floor Plan</body></html>",
  };

  it("does not render when not visible", () => {
    const { queryByText } = render(
      <ExpandedFloorPlanModal {...mockProps} visible={false} />,
    );

    const floorTitle = queryByText("Floor 2");
    expect(floorTitle).toBeNull();
  });
});
