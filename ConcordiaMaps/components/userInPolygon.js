import pointInPolygon from "point-in-polygon";
import { coloringData } from "../data/coloringData"; // Import your polygon data
import { Building } from "../data/markersData";
import { ModalContext } from "../App";

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

const getData = (name) => {
    // Find the matching building in Building.js
    const matchingBuilding = Building.find(
        (building) => building.name === name
    );

    // If a match is found, add the coordinate data
    if (matchingBuilding) {
        return {
            buildingName: matchingBuilding.name,
            buildingCoordinates: matchingBuilding.coordinate, // Add coordinates
        };
    }

    // If no match is found, return the original entry
    return {
        buildingName: "Unknown",
        buildingCoordinates: null,
      };
};
const handleDirectionGeneration = () => {
    const locationDueContext = {longitude,latitude} = useContext(ModalContext);
    const result = findBuilding(locationDueContext)
    if (result === "Not inside any building"){
        
    }
    console.log(getData());
  }

export { findBuilding, getData };
