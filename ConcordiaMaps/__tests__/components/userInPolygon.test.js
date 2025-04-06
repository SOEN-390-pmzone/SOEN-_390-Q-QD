/**
 * @jest-environment jsdom
 */
import { findBuilding, getData } from "../../components/userInPolygon";
import pointInPolygon from "point-in-polygon";
import { coloringData } from "../../data/coloringData";
import { renderHook } from "@testing-library/react-native"; // Updated import
import useDataFlow from "../../components/userInPolygon";
import { LocationContext } from "../../contexts/LocationContext";
import React from "react";

// Mock the imported dependencies
jest.mock("point-in-polygon", () => jest.fn());
jest.mock("../../data/coloringData", () => ({
  coloringData: {
    features: [
      {
        properties: {
          name: "Hall Building",
          type: "CON",
        },
        geometry: {
          coordinates: [
            [
              [0, 0],
              [1, 0],
              [1, 1],
              [0, 1],
            ],
          ],
        },
      },
      {
        properties: {
          name: "Starbucks",
          type: "OPI",
          latitude: 45.49,
          longitude: -73.57,
        },
        geometry: {
          coordinates: [
            [
              [2, 2],
              [3, 2],
              [3, 3],
              [2, 3],
            ],
          ],
        },
      },
    ],
  },
}));

jest.mock("../../data/markersData", () => ({
  Building: [
    {
      name: "Hall Building",
      coordinate: {
        latitude: 45.497163,
        longitude: -73.579557,
      },
    },
  ],
}));

describe("findBuilding", () => {
  beforeEach(() => {
    pointInPolygon.mockReset();
  });

  test("should return building info when user is inside a Concordia building", () => {
    pointInPolygon.mockReturnValueOnce(true);

    const location = { latitude: 45.497, longitude: -73.579 };
    const result = findBuilding(coloringData, location);

    expect(result).toEqual({
      buildingName: "Hall Building",
      latitude: null,
      longitude: null,
      status: true,
      type: "CON",
      buildingDiffirentiator: false,
    });
    expect(pointInPolygon).toHaveBeenCalledWith(
      [location.longitude, location.latitude],
      coloringData.features[0].geometry.coordinates[0],
    );
  });

  test("should return point of interest info when user is inside an OPI", () => {
    pointInPolygon.mockReturnValueOnce(false).mockReturnValueOnce(true);

    const location = { latitude: 45.49, longitude: -73.57 };
    const result = findBuilding(coloringData, location);

    expect(result).toEqual({
      buildingName: "Starbucks",
      latitude: 45.49,
      longitude: -73.57,
      type: "OPI",
      buildingDiffirentiator: true,
      status: true,
    });
  });

  test("should return status false when user is not inside any building", () => {
    pointInPolygon.mockReturnValue(false);

    const location = { latitude: 45.5, longitude: -73.6 };
    const result = findBuilding(coloringData, location);

    expect(result).toEqual({ status: false });
  });

  test("should handle empty location data", () => {
    const location = {};
    const result = findBuilding(coloringData, location);

    expect(result).toEqual({ status: false });
  });
});

describe("getData", () => {
  test("should return data for a point of interest (differentiator=true)", () => {
    const building = {
      buildingName: "Starbucks",
      latitude: 45.49,
      longitude: -73.57,
      status: true,
      buildingDiffirentiator: true,
    };

    const result = getData(building);

    expect(result).toEqual({
      buildingName: "Starbucks",
      latitude: 45.49,
      longitude: -73.57,
      differentiator: true,
    });
  });

  test("should return data for a Concordia building with matching name", () => {
    const building = {
      buildingName: "Hall Building",
      status: true,
      buildingDiffirentiator: false,
    };

    const result = getData(building);

    expect(result).toEqual({
      buildingName: "Hall Building",
      latitude: 45.497163,
      longitude: -73.579557,
      differentiator: false,
    });
  });

  test("should handle a building with no match", () => {
    const building = {
      buildingName: "Non-existent Building",
      status: true,
      buildingDiffirentiator: false,
    };

    const consoleSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    const result = getData(building);

    expect(consoleSpy).toHaveBeenCalled();
    expect(result).toEqual({
      buildingName: "Unknown",
      latitude: null,
      longitude: null,
      differentiator: null,
    });

    consoleSpy.mockRestore();
  });

  test("should handle outdoors (status=false)", () => {
    const building = { status: false };

    const result = getData(building);

    expect(result).toEqual({
      buildingName: "Unknown",
      latitude: null,
      longitude: null,
    });
  });
});

describe("useDataFlow", () => {
  const locationContextValue = {
    latitude: 45.497,
    longitude: -73.579,
  };

  const wrapper = ({ children }) => (
    <LocationContext.Provider value={locationContextValue}>
      {children}
    </LocationContext.Provider>
  );

  beforeEach(() => {
    pointInPolygon.mockReset();
  });

  test("should handle user in a Concordia building", () => {
    pointInPolygon.mockReturnValueOnce(true);

    const { result } = renderHook(() => useDataFlow(), { wrapper });

    expect(result.current).toEqual({
      location: {
        latitude: locationContextValue.latitude,
        longitude: locationContextValue.longitude,
      },
      isIndoors: true,
      buildingName: "Hall Building",
      differentiator: false,
    });
  });

  test("should handle user in a point of interest", () => {
    pointInPolygon.mockReturnValueOnce(false).mockReturnValueOnce(true);

    const opiLocation = { latitude: 45.49, longitude: -73.57 };
    const wrapper = ({ children }) => (
      <LocationContext.Provider value={opiLocation}>
        {children}
      </LocationContext.Provider>
    );

    const { result } = renderHook(() => useDataFlow(), { wrapper });

    expect(result.current).toEqual({
      location: {
        latitude: opiLocation.latitude,
        longitude: opiLocation.longitude,
      },
      isIndoors: true,
      buildingName: "Starbucks",
      differentiator: true,
    });
  });

  test("should handle user outdoors", () => {
    pointInPolygon.mockReturnValue(false);

    const outdoorsLocation = { latitude: 45.5, longitude: -73.6 };
    const wrapper = ({ children }) => (
      <LocationContext.Provider value={outdoorsLocation}>
        {children}
      </LocationContext.Provider>
    );

    const { result } = renderHook(() => useDataFlow(), { wrapper });

    expect(result.current).toEqual({
      location: {
        latitude: outdoorsLocation.latitude,
        longitude: outdoorsLocation.longitude,
      },
      isIndoors: false,
      buildingName: "",
      differentiator: null,
    });
  });

  test("should handle missing location data", () => {
    const wrapper = ({ children }) => (
      <LocationContext.Provider value={{}}>{children}</LocationContext.Provider>
    );

    const { result } = renderHook(() => useDataFlow(), { wrapper });

    expect(result.current.location).toEqual({
      latitude: 45.495304,
      longitude: -73.579044,
    });
    expect(result.current.isIndoors).toBe(false);
  });

  test("should handle null location context", () => {
    const wrapper = ({ children }) => (
      <LocationContext.Provider value={null}>
        {children}
      </LocationContext.Provider>
    );

    const { result } = renderHook(() => useDataFlow(), { wrapper });

    expect(result.current.location).toEqual({
      latitude: 45.495304,
      longitude: -73.579044,
    });
    expect(result.current.isIndoors).toBe(false);
  });

  test("should react to location changes", () => {
    pointInPolygon.mockReturnValueOnce(false);

    let locationValue = { latitude: 45.5, longitude: -73.6 };
    const wrapper = ({ children }) => (
      <LocationContext.Provider value={locationValue}>
        {children}
      </LocationContext.Provider>
    );

    const { result, rerender } = renderHook(() => useDataFlow(), { wrapper });

    // Initial render - outdoors
    expect(result.current.isIndoors).toBe(false);

    // Update location to be inside a building
    locationValue = { latitude: 45.497, longitude: -73.579 };
    pointInPolygon.mockReturnValueOnce(true);
    rerender();

    expect(result.current.isIndoors).toBe(true);
    expect(result.current.buildingName).toBe("Hall Building");
  });

  test("should handle location with only partial coordinates", () => {
    const partialLocation = { latitude: 45.497 }; // missing longitude
    const wrapper = ({ children }) => (
      <LocationContext.Provider value={partialLocation}>
        {children}
      </LocationContext.Provider>
    );

    const { result } = renderHook(() => useDataFlow(), { wrapper });

    expect(result.current.location).toEqual({
      latitude: 45.497,
      longitude: -73.579044, // default longitude
    });
  });
});
