import React from "react";
import { render } from "@testing-library/react-native";
import BuildingColoring from "../components/buildingColoring.js";
import { Polygon, Marker } from "react-native-maps";

// Mock the coloringData
jest.mock("../data/coloringData.js", () => ({
  coloringData: {
    features: [
      {
        geometry: {
          type: "Polygon",
          coordinates: [
            [
              [-73.579, 45.497],
              [-73.578, 45.497],
              [-73.578, 45.496],
              [-73.579, 45.496],
            ],
          ],
        },
        properties: {},
      },
      {
        geometry: {
          type: "Point",
          coordinates: [-73.579, 45.497],
        },
        properties: {
          name: "Test Building",
        },
      },
    ],
  },
}));

// Mock react-native-maps components
jest.mock("react-native-maps", () => ({
  Polygon: jest.fn(() => null),
  Marker: jest.fn(() => null),
}));

describe("BuildingColoring", () => {
  beforeEach(() => {
    // Clear mock calls before each test
    Polygon.mockClear();
    Marker.mockClear();
  });

  it("renders polygons correctly", () => {
    render(<BuildingColoring />);

    expect(Polygon).toHaveBeenCalledWith(
      expect.objectContaining({
        coordinates: [
          { latitude: 45.497, longitude: -73.579 },
          { latitude: 45.497, longitude: -73.578 },
          { latitude: 45.496, longitude: -73.578 },
          { latitude: 45.496, longitude: -73.579 },
        ],
        fillColor: "rgba(255, 0, 0, 0.5)",
        strokeColor: "rgba(255, 0, 0, 1)",
        strokeWidth: 1,
      }),
      expect.any(Object), // for the key prop
    );
  });

  it("renders markers correctly", () => {
    render(<BuildingColoring />);

    expect(Marker).toHaveBeenCalledWith(
      expect.objectContaining({
        coordinate: {
          latitude: 45.497,
          longitude: -73.579,
        },
        title: "Test Building",
      }),
      expect.any(Object), // for the key prop
    );
  });

  it("renders correct number of polygons and markers", () => {
    render(<BuildingColoring />);

    expect(Polygon).toHaveBeenCalledTimes(1);
    expect(Marker).toHaveBeenCalledTimes(1);
  });
});
