import { generateMapHtml } from "../../services/MapGenerationService";

describe("MapGenerationService", () => {
  const mockApiKey = "test-api-key-123456";

  describe("generateMapHtml", () => {
    test("should return loading message when outdoorRoute is null", () => {
      const result = generateMapHtml(null, mockApiKey);

      expect(result).toContain("Loading map directions");
      expect(result).not.toContain("initMap");
      expect(result).not.toContain("google.maps.Map");
    });

    test("should return loading message when outdoorRoute is empty array", () => {
      const result = generateMapHtml([], mockApiKey);

      expect(result).toContain("Loading map directions");
      expect(result).not.toContain("initMap");
      expect(result).not.toContain("google.maps.Map");
    });

    test("should generate proper HTML with one coordinate point", () => {
      const route = [{ latitude: 45.497, longitude: -73.579 }];

      const result = generateMapHtml(route, mockApiKey);

      expect(result).toContain("<!DOCTYPE html>");
      expect(result).toContain("function initMap()");
      expect(result).toContain(
        `center: {lat: ${route[0].latitude}, lng: ${route[0].longitude}}`,
      );
      expect(result).toContain(
        `const routeCoordinates = [{lat: ${route[0].latitude}, lng: ${route[0].longitude}}]`,
      );
      expect(result).toContain(`new google.maps.Polyline`);
      expect(result).toContain(`strokeColor: "#800000"`);
      expect(result).toContain(
        `https://maps.googleapis.com/maps/api/js?key=${mockApiKey}`,
      );
    });

    test("should generate proper HTML with multiple coordinate points", () => {
      const route = [
        { latitude: 45.497, longitude: -73.579 },
        { latitude: 45.498, longitude: -73.58 },
        { latitude: 45.499, longitude: -73.581 },
      ];

      const result = generateMapHtml(route, mockApiKey);

      // Check for center calculation correctness
      const expectedCenter = {
        latitude:
          route.reduce((acc, point) => acc + point.latitude, 0) / route.length,
        longitude:
          route.reduce((acc, point) => acc + point.longitude, 0) / route.length,
      };

      expect(result).toContain(
        `center: {lat: ${expectedCenter.latitude}, lng: ${expectedCenter.longitude}}`,
      );

      // Check that all coordinates are included
      route.forEach((point) => {
        expect(result).toContain(
          `{lat: ${point.latitude}, lng: ${point.longitude}}`,
        );
      });

      // Check for markers
      expect(result).toContain("new google.maps.Marker");
      expect(result).toContain('title: "Start"');
      expect(result).toContain('title: "End"');

      // Check for map bounds
      expect(result).toContain("new google.maps.LatLngBounds()");
      expect(result).toContain("map.fitBounds(bounds)");
    });

    test("should include API key in the generated HTML", () => {
      const customApiKey = "custom-api-key-987654";
      const route = [
        { latitude: 45.497, longitude: -73.579 },
        { latitude: 45.499, longitude: -73.581 },
      ];

      const result = generateMapHtml(route, customApiKey);

      expect(result).toContain(
        `https://maps.googleapis.com/maps/api/js?key=${customApiKey}`,
      );
      expect(result).not.toContain(mockApiKey);
    });

    test("should generate HTML with proper styling and viewport settings", () => {
      const route = [
        { latitude: 45.497, longitude: -73.579 },
        { latitude: 45.499, longitude: -73.581 },
      ];

      const result = generateMapHtml(route, mockApiKey);

      // Check for viewport meta tag
      expect(result).toContain(
        '<meta name="viewport" content="width=device-width, initial-scale=1.0">',
      );

      // Check for styling
      expect(result).toContain("body, html, #map {");
      expect(result).toContain("height: 100%;");

      // Check for map options
      expect(result).toContain("zoomControl: true");
      expect(result).toContain("mapTypeControl: false");
      expect(result).toContain("streetViewControl: false");
    });

    test("should handle floating point coordinates properly", () => {
      const route = [
        { latitude: 45.49715234, longitude: -73.57912345 },
        { latitude: 45.49987654, longitude: -73.58155555 },
      ];

      const result = generateMapHtml(route, mockApiKey);

      route.forEach((point) => {
        expect(result).toContain(
          `{lat: ${point.latitude}, lng: ${point.longitude}}`,
        );
      });
    });
  });
});
