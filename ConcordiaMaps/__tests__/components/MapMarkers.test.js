import React from "react";
import { render, fireEvent, waitFor, act } from "@testing-library/react-native";
import MapMarkers from "../../components/MapMarkers";
import PopupModal from "../../components/PopupModal";

jest.mock("react-native-maps", () => {
    const React = require("react");
    const { View } = require("react-native");
    return {
        Marker: ({ children, onPress }) => (
            <View testID="marker" onTouchEnd={onPress}>
                {children}
            </View>
        ),
        Callout: ({ children }) => <View testID="callout">{children}</View>,
    };
});

jest.mock("../../components/PopupModal", () => {
    const React = require("react");
    const { View } = require("react-native");
    return jest.fn((props) => <View testID="close-button" {...props} />);
    
});


describe("MapMarkers Component", () => {
    const mockMarkers = [
        {
            name: "Test Building",
            coordinate: { latitude: 45.497092, longitude: -73.5788 },
            address: "1455 De Maisonneuve W, Montreal, QC H3G 1M8",
            fullBuildingName: "Test Building Full Name",
        },
    ];

    it("renders correctly with markers", () => {
        const { getAllByTestId } = render(<MapMarkers markers={mockMarkers} />);
        expect(getAllByTestId("marker").length).toBe(mockMarkers.length);
    });

    it("does not render when markers are empty", () => {
        const { queryByTestId } = render(<MapMarkers markers={[]} />);
        expect(queryByTestId("marker")).toBeNull();
    });

    it("opens popup modal on marker press", () => {
        const { getByTestId, rerender } = render(<MapMarkers markers={mockMarkers} />);
        fireEvent(getByTestId("marker"), "touchEnd");

        rerender(<MapMarkers markers={mockMarkers} />);
        expect(PopupModal).toHaveBeenCalledWith(
            expect.objectContaining({ isVisible: true, data: mockMarkers[0] }),
            {}
        );
    });


    test("PopupModal should close when close button is pressed", async () => {
        const { getByTestId } = render(<PopupModal isVisible={true} onClose={() => {}} />);
        const closeButton = getByTestId("close-button");

        fireEvent.press(closeButton);
        await waitFor(() => expect(PopupModal).toHaveBeenCalledWith(
            expect.objectContaining({ isVisible: false }),
            {}
        ));
    });
});
