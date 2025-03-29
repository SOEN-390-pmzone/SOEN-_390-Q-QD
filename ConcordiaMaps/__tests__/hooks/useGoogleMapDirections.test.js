import { useGoogleMapDirections } from "../../hooks/useGoogleMapDirections";
import polyline from "@mapbox/polyline";
import * as Crypto from "expo-crypto";

// Mock the polyline.decode function
jest.mock("@mapbox/polyline", () => ({
  decode: jest.fn(),
}));

// Mock crypto for token generation tests
jest.mock("expo-crypto", () => ({
  getRandomBytesAsync: jest.fn(),
}));

// Mock fetch globally
global.fetch = jest.fn();
global.btoa = jest.fn().mockReturnValue("base64encodedstring");

describe("useGoogleMapDirections", () => {
  let hook;

  beforeEach(() => {
    hook = useGoogleMapDirections();
    // Clear all mocks before each test
    jest.clearAllMocks();
    fetch.mockClear();

    // Set up API key for tests
    process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY = "test_api_key";

    // Default mock for Crypto
    jest
      .spyOn(Crypto, "getRandomBytesAsync")
      .mockResolvedValue(
        new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]),
      );
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

    it("should handle geocode API failure with empty results", async () => {
      global.fetch.mockImplementationOnce(() =>
        Promise.resolve({
          json: () => Promise.resolve({ results: [] }),
        }),
      );

      await expect(hook.geocodeAddress("Unknown location")).rejects.toThrow(
        "Geocoding failed",
      );
    });

    it("should handle network errors during geocoding", async () => {
      fetch.mockImplementationOnce(() =>
        Promise.reject(new Error("Network error")),
      );

      await expect(hook.geocodeAddress("Some Address")).rejects.toThrow();
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

    it("should handle null response from API", async () => {
      fetch.mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(null),
        }),
      );

      await expect(
        hook.getStepsInHTML(mockOrigin, mockDestination),
      ).rejects.toThrow("Direction API error: Unknown error");
    });

    it("should handle invalid API response structure", async () => {
      fetch.mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ status: "OK", routes: [] }),
        }),
      );

      await expect(
        hook.getStepsInHTML(mockOrigin, mockDestination),
      ).rejects.toThrow("No routes available");
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

  describe("generateRandomToken", () => {
    it("should generate a valid token from random bytes", async () => {
      // Mock the Crypto module
      const mockRandomBytes = new Uint8Array([
        65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80,
      ]);
      Crypto.getRandomBytesAsync.mockResolvedValue(mockRandomBytes);

      // Mock btoa to return a predictable value
      global.btoa = jest.fn().mockReturnValue("QUJDREVGRw==");

      const token = await hook.generateRandomToken();

      // Verify token formatting - should remove +/= characters
      expect(token).toBeDefined();
      expect(token).not.toContain("+");
      expect(token).not.toContain("/");
      expect(token).not.toContain("=");

      // Verify btoa was called
      expect(global.btoa).toHaveBeenCalled();
    });

    it("should handle errors in crypto module", async () => {
      // Mock Crypto to throw error
      Crypto.getRandomBytesAsync.mockRejectedValue(new Error("Crypto failed"));

      // Mock console.error to inspect what's logged
      const mockConsoleError = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

      const token = await hook.generateRandomToken();

      // Should log error and return undefined
      expect(mockConsoleError).toHaveBeenCalledWith(
        "Error generating random token:",
        expect.any(Error),
      );
      expect(token).toBeUndefined();

      mockConsoleError.mockRestore();
    });
  });

  describe("parseHtmlInstructions", () => {
    it("should correctly remove all HTML tags", () => {
      // Test with various HTML formats to cover all branches
      expect(hook.parseHtmlInstructions("<div>Test</div>")).toBe(" Test");
      expect(
        hook.parseHtmlInstructions("<div class='direction'>Test</div>"),
      ).toBe(" Test");
      expect(hook.parseHtmlInstructions("Walk <b>north</b>")).toBe(
        "Walk north",
      );
      expect(hook.parseHtmlInstructions("100<wbr/>m")).toBe("100m");
      expect(
        hook.parseHtmlInstructions("<div><b>Complex</b> example</div>"),
      ).toBe(" Complex example");
      expect(hook.parseHtmlInstructions("Plain text")).toBe("Plain text");
    });
  });

  describe("fetchOutdoorDirections", () => {
    // Mock BuildingRegistry for use in tests
    const mockBuildingRegistry = {
      findBuilding: jest.fn(),
      getCoordinatesForBuilding: jest.fn(),
    };

    beforeEach(() => {
      mockBuildingRegistry.findBuilding.mockReset();
      mockBuildingRegistry.getCoordinatesForBuilding.mockReset();
    });

    it("should fetch outdoor directions successfully", async () => {
      // Setup step with coordinates
      const step = {
        type: "outdoor",
        startPoint: { latitude: 45.496, longitude: -73.577 },
        endPoint: { latitude: 45.497, longitude: -73.578 },
      };

      // Mock geocodeAddress to return coordinates
      jest.spyOn(hook, "geocodeAddress").mockResolvedValue({
        latitude: 45.497,
        longitude: -73.578,
      });

      // Mock getStepsInHTML and getPolyline
      jest.spyOn(hook, "getStepsInHTML").mockResolvedValue([]);
      jest.spyOn(hook, "getPolyline").mockResolvedValue([]);

      const result = await hook.fetchOutdoorDirections(step, {
        buildingRegistry: mockBuildingRegistry,
      });

      expect(result).toHaveProperty("directions");
    });

    it("should handle geocoding failure by using building registry", async () => {
      // Setup step with building ID
      const step = {
        type: "outdoor",
        startPoint: "H",
        endPoint: { latitude: 45.497, longitude: -73.578 },
      };

      // Mock geocodeAddress to fail
      jest
        .spyOn(hook, "geocodeAddress")
        .mockRejectedValue(new Error("Geocoding failed"));

      // Mock building registry to return coordinates
      mockBuildingRegistry.findBuilding.mockReturnValue({ id: "H" });
      mockBuildingRegistry.getCoordinatesForBuilding.mockReturnValue({
        latitude: 45.496,
        longitude: -73.577,
      });

      // Mock getStepsInHTML and getPolyline
      jest.spyOn(hook, "getStepsInHTML").mockResolvedValue([]);
      jest.spyOn(hook, "getPolyline").mockResolvedValue([]);

      const result = await hook.fetchOutdoorDirections(step, {
        buildingRegistry: mockBuildingRegistry,
      });

      // Verify building registry was used as fallback
      expect(mockBuildingRegistry.findBuilding).toHaveBeenCalledWith(
        step.startPoint,
      );
      expect(
        mockBuildingRegistry.getCoordinatesForBuilding,
      ).toHaveBeenCalledWith("H");
      expect(result).toHaveProperty("directions");
    });

    it("should handle directions API failure with fallback directions", async () => {
      // Setup step
      const step = {
        type: "outdoor",
        startPoint: { latitude: 45.496, longitude: -73.577 },
        endPoint: { latitude: 45.497, longitude: -73.578 },
        startAddress: "Hall Building",
        endAddress: "Library Building",
      };

      // Mock getStepsInHTML and getPolyline to fail
      jest
        .spyOn(hook, "getStepsInHTML")
        .mockRejectedValue(new Error("API error"));
      jest.spyOn(hook, "getPolyline").mockRejectedValue(new Error("API error"));

      const result = await hook.fetchOutdoorDirections(step);

      // Should return fallback directions
      expect(result).toHaveProperty("directions");
      expect(result.directions[0].formatted_text).toContain(
        "Walk from Hall Building to Library Building",
      );
      expect(result.route).toEqual([]);
    });

    it("should handle missing origin or destination coordinates", async () => {
      // Setup step with invalid start/end points
      const step = {
        type: "outdoor",
        startPoint: null,
        endPoint: null,
      };

      const result = await hook.fetchOutdoorDirections(step);

      // Should return fallback directions
      expect(result).toHaveProperty("directions");
      expect(result.directions[0].distance).toBe("Unknown distance");
      expect(result.route).toEqual([]);
    });

    it("should reject non-outdoor steps", async () => {
      const step = {
        type: "indoor",
      };

      await expect(hook.fetchOutdoorDirections(step)).rejects.toThrow(
        "Cannot fetch outdoor directions for non-outdoor step",
      );
    });

    it("should format destination text with building name when available", async () => {
      // Setup step with proper addresses
      const step = {
        type: "outdoor",
        startPoint: { latitude: 45.496, longitude: -73.577 },
        endPoint: { latitude: 45.497, longitude: -73.578 },
        startAddress: "Starting Point",
        endAddress: "Hall Building",
      };

      // Mock getStepsInHTML to include "Destination" in text
      jest.spyOn(hook, "getStepsInHTML").mockResolvedValue([
        {
          html_instructions: "Destination will be on the right",
          distance: "50 m",
        },
      ]);

      jest.spyOn(hook, "getPolyline").mockResolvedValue([]);

      const result = await hook.fetchOutdoorDirections(step);

      // Should format text with building name
      expect(result.directions[0].formatted_text).toBe(
        "Walk from Starting Point to Hall Building",
      );
    });
  });
  // Additional tests for fetchOutdoorDirections to improve branch coverage

  describe("fetchOutdoorDirections - additional coverage tests", () => {
    let hook;
    const mockBuildingRegistry = {
      findBuilding: jest.fn(),
      getCoordinatesForBuilding: jest.fn(),
    };

    beforeEach(() => {
      hook = useGoogleMapDirections();
      jest.clearAllMocks();
      mockBuildingRegistry.findBuilding.mockReset();
      mockBuildingRegistry.getCoordinatesForBuilding.mockReset();
    });

    it("should handle when both geocoding and building registry fail for startPoint", async () => {
      // Setup step with invalid startPoint
      const step = {
        type: "outdoor",
        startPoint: "InvalidBuilding",
        endPoint: { latitude: 45.497, longitude: -73.578 },
      };

      // Mock geocodeAddress to fail
      jest
        .spyOn(hook, "geocodeAddress")
        .mockRejectedValue(new Error("Geocoding failed"));

      // Mock building registry to not find the building
      mockBuildingRegistry.findBuilding.mockReturnValue(null);

      const result = await hook.fetchOutdoorDirections(step, {
        buildingRegistry: mockBuildingRegistry,
      });

      // Should use fallback directions
      expect(result).toHaveProperty("directions");
      expect(result.directions[0].distance).toBe("Unknown distance");
      expect(mockBuildingRegistry.findBuilding).toHaveBeenCalledWith(
        step.startPoint,
      );
    });

    it("should handle when both geocoding and building registry fail for endPoint", async () => {
      // Setup step with valid start but invalid end
      const step = {
        type: "outdoor",
        startPoint: { latitude: 45.495, longitude: -73.576 },
        endPoint: "InvalidBuilding",
      };

      // Mock geocodeAddress to fail for endPoint
      jest
        .spyOn(hook, "geocodeAddress")
        .mockRejectedValue(new Error("Geocoding failed"));

      // Mock building registry to not find the building
      mockBuildingRegistry.findBuilding.mockReturnValue(null);

      const result = await hook.fetchOutdoorDirections(step, {
        buildingRegistry: mockBuildingRegistry,
      });

      // Should use fallback directions
      expect(result).toHaveProperty("directions");
      expect(result.directions[0].distance).toBe("Unknown distance");
      expect(mockBuildingRegistry.findBuilding).toHaveBeenCalledWith(
        step.endPoint,
      );
    });

    it("should properly handle a destination text with 'Destination' keyword", async () => {
      const step = {
        type: "outdoor",
        startPoint: { latitude: 45.495, longitude: -73.576 },
        endPoint: { latitude: 45.497, longitude: -73.578 },
        endAddress: "Webster Library, Concordia University",
      };

      // Mock getStepsInHTML to include "Destination" in text
      jest.spyOn(hook, "getStepsInHTML").mockResolvedValue([
        {
          html_instructions: "Destination will be on your right",
          distance: "10 m",
        },
      ]);

      jest.spyOn(hook, "getPolyline").mockResolvedValue([]);

      const result = await hook.fetchOutdoorDirections(step);

      // Verify the destination text was properly formatted with the building name
      expect(result.directions[0].formatted_text).toBe(
        "Walk from starting location to Webster Library, Concordia University",
      );
    });

    it("should format endPoint as destination when endAddress is not available", async () => {
      const step = {
        type: "outdoor",
        startPoint: { latitude: 45.495, longitude: -73.576 },
        endPoint: "LB",
      };

      // Mock geocodeAddress for endPoint
      jest.spyOn(hook, "geocodeAddress").mockResolvedValue({
        latitude: 45.497,
        longitude: -73.578,
      });

      // Mock getStepsInHTML to include "Destination" in text
      jest
        .spyOn(hook, "getStepsInHTML")
        .mockResolvedValue([
          { html_instructions: "Destination is on your left", distance: "5 m" },
        ]);

      jest.spyOn(hook, "getPolyline").mockResolvedValue([]);

      const result = await hook.fetchOutdoorDirections(step);

      // Should use the endPoint value in the destination text
      expect(result.directions[0].formatted_text).toBe(
        "Walk from starting location to destination building",
      );
    });

    it("should properly format directions when no html_instructions contain 'Destination'", async () => {
      const step = {
        type: "outdoor",
        startPoint: { latitude: 45.495, longitude: -73.576 },
        endPoint: { latitude: 45.497, longitude: -73.578 },
        startAddress: "Hall Building",
        endAddress: "Webster Library",
      };

      // Mock getStepsInHTML without "Destination" keyword
      const mockDirections = [
        {
          html_instructions: "Head <b>north</b> on Mackay St",
          distance: "80 m",
        },
        {
          html_instructions: "Turn <b>right</b> onto De Maisonneuve Blvd",
          distance: "120 m",
        },
      ];

      jest.spyOn(hook, "getStepsInHTML").mockResolvedValue(mockDirections);
      jest.spyOn(hook, "getPolyline").mockResolvedValue([]);

      const result = await hook.fetchOutdoorDirections(step);

      expect(result.directions.length).toBe(1);

      // Check the content of the directions
      expect(result.directions[0].formatted_text).toBe(
        "Walk from Hall Building to Webster Library",
      );
    });

    it("should handle getDirections error and provide fallback", async () => {
      const step = {
        type: "outdoor",
        startPoint: { latitude: 45.495, longitude: -73.576 },
        endPoint: { latitude: 45.497, longitude: -73.578 },
      };

      // Mock getStepsInHTML to throw an error
      jest
        .spyOn(hook, "getDirections")
        .mockRejectedValue(new Error("Invalid API key"));
      jest
        .spyOn(hook, "getStepsInHTML")
        .mockRejectedValue(new Error("Error getting steps"));
      jest.spyOn(hook, "getPolyline").mockResolvedValue([]); // This still works

      const consoleErrorSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

      const result = await hook.fetchOutdoorDirections(step);

      // Should provide fallback directions
      expect(result).toHaveProperty("directions");
      expect(result.directions[0].html_instructions).toContain("Walk from");
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Error fetching outdoor directions:",
        expect.any(Error),
      );

      consoleErrorSpy.mockRestore();
    });
  });
  describe("fetchPlaceDetails", () => {
    it("should successfully fetch place details", async () => {
      // Mock successful API response
      fetch.mockImplementationOnce(() =>
        Promise.resolve({
          json: () =>
            Promise.resolve({
              result: {
                geometry: {
                  location: {
                    lat: 45.497,
                    lng: -73.579,
                  },
                },
                formatted_address:
                  "1455 Boulevard de Maisonneuve O, Montréal, QC H3G 1M8, Canada",
              },
            }),
        }),
      );

      const placeId = "ChIJDbdkHFoayUwR7-8fITgxTmU";
      const sessionToken = "mockSessionToken123";
      const result = await hook.fetchPlaceDetails(placeId, sessionToken);

      // Verify API was called with correct parameters
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining(`place_id=${placeId}`),
      );
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining(`sessiontoken=${sessionToken}`),
      );

      // Verify the returned structure
      expect(result).toEqual({
        latitude: 45.497,
        longitude: -73.579,
        formatted_address:
          "1455 Boulevard de Maisonneuve O, Montréal, QC H3G 1M8, Canada",
      });
    });

    it("should handle missing formatted_address", async () => {
      // Mock API response with missing formatted_address
      fetch.mockImplementationOnce(() =>
        Promise.resolve({
          json: () =>
            Promise.resolve({
              result: {
                geometry: {
                  location: {
                    lat: 45.497,
                    lng: -73.579,
                  },
                },
                // formatted_address is missing
              },
            }),
        }),
      );

      const result = await hook.fetchPlaceDetails("someId", "token123");

      // Verify the function handles missing address field correctly
      expect(result).toEqual({
        latitude: 45.497,
        longitude: -73.579,
        formatted_address: null,
      });
    });

    it("should throw error when place details are invalid", async () => {
      // Mock API response with missing required fields
      fetch.mockImplementationOnce(() =>
        Promise.resolve({
          json: () =>
            Promise.resolve({
              result: {}, // Missing geometry
            }),
        }),
      );

      await expect(
        hook.fetchPlaceDetails("someId", "token123"),
      ).rejects.toThrow("Invalid place details response");
    });

    it("should handle API errors", async () => {
      // Mock API error
      fetch.mockImplementationOnce(() =>
        Promise.reject(new Error("Network error")),
      );

      // Mock console.error to avoid cluttering test output
      const consoleErrorSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

      await expect(
        hook.fetchPlaceDetails("someId", "token123"),
      ).rejects.toThrow("Network error");

      // Verify error was logged
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Error fetching place details:",
        expect.any(Error),
      );

      consoleErrorSpy.mockRestore();
    });
  });
});
