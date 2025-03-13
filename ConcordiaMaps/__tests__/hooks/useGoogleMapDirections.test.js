import { useGoogleMapDirections } from "../../hooks/useGoogleMapDirections";
import polyline from "@mapbox/polyline";

// Mock the polyline.decode function
jest.mock("@mapbox/polyline", () => ({
  decode: jest.fn(),
}));

// Mock fetch globally
global.fetch = jest.fn();

describe("useGoogleMapDirections", () => {
  let hook;

  beforeEach(() => {
    hook = useGoogleMapDirections();
    // Clear all mocks before each test
    jest.clearAllMocks();
    fetch.mockClear();
  });

  describe("geocodeAddress", () => {
    it("should successfully geocode an address", async () => {
      const mockResponse = {
        status: "OK",
        results: [
          {
            geometry: {
              location: {
                lat: 45.497,
                lng: -73.579,
              },
            },
          },
        ],
      };

      fetch.mockImplementationOnce(() =>
        Promise.resolve({
          json: () => Promise.resolve(mockResponse),
        }),
      );

      const result = await hook.geocodeAddress(
        "1455 Boulevard de Maisonneuve O",
      );

      expect(result).toEqual({
        latitude: 45.497,
        longitude: -73.579,
      });
      expect(fetch).toHaveBeenCalledTimes(1);
    });

    it("should throw error when geocoding fails", async () => {
      fetch.mockImplementationOnce(() =>
        Promise.resolve({
          json: () => Promise.resolve({ status: "ZERO_RESULTS" }),
        }),
      );

      await expect(hook.geocodeAddress("Invalid Address")).rejects.toThrow(
        "Geocoding failed: ZERO_RESULTS",
      );
    });
  });

  describe("getStepsInHTML", () => {
    const mockOrigin = { latitude: 45.497, longitude: -73.579 };
    const mockDestination = { latitude: 45.496, longitude: -73.578 };

    it("should return steps with instructions", async () => {
      const mockDirectionsResponse = {
        status: "OK",
        routes: [
          {
            legs: [
              {
                steps: [
                  {
                    html_instructions: "Walk north",
                    distance: { text: "100 m" },
                  },
                ],
              },
            ],
          },
        ],
      };

      fetch.mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockDirectionsResponse),
        }),
      );

      const result = await hook.getStepsInHTML(mockOrigin, mockDestination);

      expect(result).toEqual([
        {
          html_instructions: "Walk north",
          distance: "100 m",
        },
      ]);
    });
  });

  describe("getPolyline", () => {
    const mockOrigin = { latitude: 45.497, longitude: -73.579 };
    const mockDestination = { latitude: 45.496, longitude: -73.578 };

    it("should return coordinates array from polyline", async () => {
      const mockDirectionsResponse = {
        status: "OK",
        routes: [
          {
            overview_polyline: {
              points: "mock_polyline",
            },
          },
        ],
      };

      const mockDecodedPoints = [
        [45.497, -73.579],
        [45.496, -73.578],
      ];

      fetch.mockImplementationOnce(() =>
        Promise.resolve({
          json: () => Promise.resolve(mockDirectionsResponse),
        }),
      );

      polyline.decode.mockReturnValue(mockDecodedPoints);

      const result = await hook.getPolyline(mockOrigin, mockDestination);

      expect(result).toEqual([
        { latitude: 45.497, longitude: -73.579 },
        { latitude: 45.496, longitude: -73.578 },
      ]);
      expect(polyline.decode).toHaveBeenCalledWith("mock_polyline");
    });

    it("should return empty array when API call fails", async () => {
      fetch.mockImplementationOnce(() =>
        Promise.resolve({
          json: () => Promise.resolve({ status: "ZERO_RESULTS" }),
        }),
      );

      const result = await hook.getPolyline(mockOrigin, mockDestination);

      expect(result).toEqual([]);
    });

    it("should log error when no routes are found", async () => {
      const mockDirectionsResponse = {
        status: "ZERO_RESULTS",
      };

      fetch.mockImplementationOnce(() =>
        Promise.resolve({
          json: () => Promise.resolve(mockDirectionsResponse),
        }),
      );

      const result = await hook.getPolyline(mockOrigin, mockDestination);

      expect(result).toEqual([]);
    });

    it("should log error when no overview polyline is found", async () => {
      const mockDirectionsResponse = {
        status: "OK",
        routes: [
          {
            overview_polyline: null,
          },
        ],
      };

      fetch.mockImplementationOnce(() =>
        Promise.resolve({
          json: () => Promise.resolve(mockDirectionsResponse),
        }),
      );

      const result = await hook.getPolyline(mockOrigin, mockDestination);

      expect(result).toEqual([]);
    });
  });
});
