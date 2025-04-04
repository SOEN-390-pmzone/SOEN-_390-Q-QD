import {
    OutdoorToOutdoor,
    RoomToExit,
    ExitToRoom,
    BaseCalculation,
  } from "../../../services/JourneyOptimizer/RouteDecorators";
  import { useGoogleMapDirections } from "../../../hooks/useGoogleMapDirections";
  
  // Mock the useGoogleMapDirections hook
  jest.mock("../../../hooks/useGoogleMapDirections", () => ({
    useGoogleMapDirections: jest.fn(),
  }));
  
  describe("RouteDecorators", () => {
    let mockGetDirections;
  
    beforeEach(() => {
      // Reset mocks before each test
      mockGetDirections = jest.fn();
      useGoogleMapDirections.mockReturnValue({
        getDirections: mockGetDirections,
      });
    });
  
    it("calculates outdoor-to-outdoor distance using Google Maps API", async () => {
      const mockResponse = {
        routes: [
          {
            legs: [
              {
                distance: { value: 1000 }, // 1000 meters
              },
            ],
          },
        ],
      };
  
      mockGetDirections.mockResolvedValue(mockResponse);
  
      const baseCalculation = BaseCalculation();
      const calculateOutdoorDistance = OutdoorToOutdoor(baseCalculation);
  
      const locationA = { latitude: 45.497, longitude: -73.579 };
      const locationB = { latitude: 45.496, longitude: -73.578 };
  
      const distance = await calculateOutdoorDistance(locationA, locationB);
  
      expect(mockGetDirections).toHaveBeenCalledWith(locationA, locationB, "walking");
      expect(distance).toBe(1000); // Only the walking distance since baseCalculation returns 0
    });
  
    it("falls back to base calculation if Google Maps API fails", async () => {
      mockGetDirections.mockRejectedValue(new Error("API error"));
  
      const baseCalculation = jest.fn().mockReturnValue(50); // Base calculation returns 50
      const calculateOutdoorDistance = OutdoorToOutdoor(baseCalculation);
  
      const locationA = { latitude: 45.497, longitude: -73.579 };
      const locationB = { latitude: 45.496, longitude: -73.578 };
  
      const distance = await calculateOutdoorDistance(locationA, locationB);
  
      expect(mockGetDirections).toHaveBeenCalledWith(locationA, locationB, "walking");
      expect(distance).toBe(50); // Fallback to base calculation
    });
  
 
    it("returns 0 for base calculation", () => {
      const baseCalculation = BaseCalculation();
  
      const distance = baseCalculation();
  
      expect(distance).toBe(0); // Base calculation always returns 0
    });
  });