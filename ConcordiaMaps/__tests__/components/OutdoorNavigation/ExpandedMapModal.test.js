import React from "react";
import { render, fireEvent } from "@testing-library/react-native";

// Mock the WebView component
jest.mock("react-native-webview", () => {
  const { View } = require("react-native");
  const mockPropTypes = require("prop-types");

  const MockWebView = (props) => {
    return <View testID="webview" style={props.style} />;
  };

  MockWebView.propTypes = {
    style: mockPropTypes.object, // Use the locally imported PropTypes
  };

  return {
    WebView: MockWebView,
  };
});

// Mock the MapGenerationService
jest.mock("../../../services/MapGenerationService", () => ({
  generateMapHtml: jest
    .fn()
    .mockReturnValue("<html><body>Mock Map HTML</body></html>"),
}));

import ExpandedMapModal from "../../../components/OutdoorNavigation/ExpandedMapModal";
import MapGenerationService from "../../../services/MapGenerationService";

describe("ExpandedMapModal", () => {
  // Rest of your test remains the same
  const mockProps = {
    visible: true,
    onClose: jest.fn(),
    route: [
      { lat: 45.497, lng: -73.579 },
      { lat: 45.495, lng: -73.577 },
    ],
    apiKey: "mock-api-key",
    styles: {
      expandedModalOverlay: { flex: 1 },
      expandedModalContent: { flex: 1 },
      expandedHeader: { flexDirection: "row" },
      expandedTitle: { fontSize: 18 },
      closeExpandedButton: { padding: 10 },
      closeExpandedText: { fontSize: 24 },
      expandedWebView: { flex: 1 },
    },
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders correctly when visible is true", () => {
    const { getByText, getByTestId } = render(
      <ExpandedMapModal {...mockProps} />,
    );

    expect(getByText("Map Directions")).toBeTruthy();
    expect(getByTestId("webview")).toBeTruthy();
    expect(MapGenerationService.generateMapHtml).toHaveBeenCalledWith(
      mockProps.route,
      mockProps.apiKey,
    );
  });

  it("does not render when visible is false", () => {
    const { queryByText } = render(
      <ExpandedMapModal {...mockProps} visible={false} />,
    );

    expect(queryByText("Map Directions")).toBeNull();
  });

  it("calls onClose when close button is pressed", () => {
    const { getByText } = render(<ExpandedMapModal {...mockProps} />);

    const closeButton = getByText("×");
    fireEvent.press(closeButton);

    expect(mockProps.onClose).toHaveBeenCalledTimes(1);
  });

  it("passes the correct style props to components", () => {
    const { getByTestId } = render(<ExpandedMapModal {...mockProps} />);

    // Test that the WebView receives the correct style
    const webview = getByTestId("webview");
    expect(webview.props.style).toBe(mockProps.styles.expandedWebView);

    expect(MapGenerationService.generateMapHtml).toHaveBeenCalledWith(
      mockProps.route,
      mockProps.apiKey,
    );
    const modalOverlay = getByTestId("modal-overlay");
    expect(modalOverlay.props.style).toEqual(
      mockProps.styles.expandedModalOverlay,
    );
  });

  it("passes the correct HTML from MapGenerationService to WebView", () => {
    render(<ExpandedMapModal {...mockProps} />);

    expect(MapGenerationService.generateMapHtml).toHaveBeenCalledWith(
      mockProps.route,
      mockProps.apiKey,
    );
  });
});
