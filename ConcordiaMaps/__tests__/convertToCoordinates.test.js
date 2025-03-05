import axios from "axios";
import convertToCoordinates from "../components/convertToCoordinates";

jest.mock("axios");

describe("convertToCoordinates", () => {
  const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;

  it("returns coordinates for a valid postal code", async () => {
    const mockResponse = {
      data: {
        status: "OK",
        results: [
          {
            geometry: {
              location: {
                lat: 45.4972159,
                lng: -73.6103642,
              },
            },
          },
        ],
      },
    };

    axios.get.mockResolvedValueOnce(mockResponse);

    const result = await convertToCoordinates("H3G 1M8");

    expect(result).toEqual({ latitude: 45.4972159, longitude: -73.6103642 });
    expect(axios.get).toHaveBeenCalledWith(
      `https://maps.googleapis.com/maps/api/geocode/json?address=H3G 1M8&key=${GOOGLE_MAPS_API_KEY}`,
    );
  });

  it("returns an error for zero results", async () => {
    const mockResponse = {
      data: {
        status: "OK",
        results: [],
      },
    };

    axios.get.mockResolvedValueOnce(mockResponse);

    const result = await convertToCoordinates("INVALID_POSTAL_CODE");

    expect(result).toEqual({ error: "ZERO_RESULTS" });
    expect(axios.get).toHaveBeenCalledWith(
      `https://maps.googleapis.com/maps/api/geocode/json?address=INVALID_POSTAL_CODE&key=${GOOGLE_MAPS_API_KEY}`,
    );
  });

  it("returns an error for a non-OK status", async () => {
    const mockResponse = {
      data: {
        status: "REQUEST_DENIED",
        results: [],
      },
    };

    axios.get.mockResolvedValueOnce(mockResponse);

    const result = await convertToCoordinates("H3G 1M8");

    expect(result).toEqual({ error: "REQUEST_DENIED" });
    expect(axios.get).toHaveBeenCalledWith(
      `https://maps.googleapis.com/maps/api/geocode/json?address=H3G 1M8&key=${GOOGLE_MAPS_API_KEY}`,
    );
  });

  it("handles network errors", async () => {
    axios.get.mockRejectedValueOnce(new Error("Network Error"));

    const result = await convertToCoordinates("H3G 1M8");

    expect(result).toEqual({
      error: "Something went wrong. Please try again later.",
    });
    expect(axios.get).toHaveBeenCalledWith(
      `https://maps.googleapis.com/maps/api/geocode/json?address=H3G 1M8&key=${GOOGLE_MAPS_API_KEY}`,
    );
  });
});
