import React from "react";
import pointInPolygon from "point-in-polygon";
import { coloringData } from "../data/coloringData"; // Import your polygon data
import { View, Text } from "react-native";

const findBuilding = () => {
  const { latitude, longitude } = {
    latitude: 45.4974, // A latitude value within the polygon
    longitude: -73.5788, // A longitude value within the polygon
  };

  for (const feature of coloringData.features) {
    const polygon = feature.geometry.coordinates[0]; // Get the first polygon (outer boundary)
    const userPoint = [longitude, latitude]; // Convert user location to [longitude, latitude]

    if (pointInPolygon(userPoint, polygon)) {
      return feature.properties.name; // Return the building name if the user is inside
    }
  }

  return "Not inside any building"; // Return a default message if the user is not inside any building
};

export default findBuilding;
