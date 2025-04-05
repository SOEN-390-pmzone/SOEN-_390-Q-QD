import pointInPolygon from "point-in-polygon";
import { coloringData } from "../data/coloringData"; // Import your polygon data
import { Building } from "../data/markersData";
import { useState, useContext, useEffect } from "react";
import { LocationContext } from "../contexts/LocationContext";
/*
this function determines whether the user is inside
one of the known to use buildings: points of interests or Concordia buildings
if a user is inside a concordia building and they are willing to go outside,
we will generate the internal navigation card to leave the building.
Such option won't be available for exiting the external point of interest. 
We will simply suggest "navigate to the exit of {current_building}"
 */
const findBuilding = (dataSet, location) => {
  for (const feature of dataSet.features) {
    const buildingDiffirentiator = feature.properties?.type === "OPI"; // if true it's an OPI: if false it's a Concordia building
    const polygon = feature.geometry.coordinates[0]; // Get the first polygon (outer boundary)
    const userPoint = [location.longitude, location.latitude]; // Convert user location to [longitude, latitude]
    const isPointInPolygon = pointInPolygon(userPoint, polygon);
    if (isPointInPolygon) {
      if (buildingDiffirentiator) {
        return {
          buildingName: feature.properties.name,
          latitude: feature.properties.latitude,
          longitude: feature.properties.longitude,
          type: feature.properties?.type,
          buildingDiffirentiator: buildingDiffirentiator,
          status: true,
        };
      } else
        return {
          buildingName: feature.properties.name,
          latitude: null,
          longitude: null,
          status: true,
          type: "CON",
          buildingDiffirentiator: buildingDiffirentiator,
        };
    }
  }

  // Return a default message if the user is not inside any building
  return { status: false };
};

const getData = (building) => {
  const isIndoors = building.status;

  // Find the matching building in Building.js
  if (isIndoors) {
    const buildingName = building.buildingName;
    const latitude = building.latitude;
    const longitude = building.longitude;
    const differentiator = building.buildingDiffirentiator;
    if (differentiator) {
      return {
        buildingName: buildingName,
        latitude: latitude,
        longitude: longitude,
        differentiator: differentiator, // Add coordinates
      };
    } else {
      const matchingBuilding = Building.find(
        (building) => building.name === buildingName,
      );

      // If a match is found, add the coordinate data
      if (matchingBuilding) {
        return {
          buildingName: matchingBuilding.name,
          latitude: matchingBuilding.coordinate.latitude,
          longitude: matchingBuilding.coordinate.longitude,
          differentiator: differentiator, // Add coordinates,
        };
      } else {
        console.error(
          "U are in the building, but the matching algo is failing",
        );
        return {
          buildingName: "Unknown",
          latitude: null,
          longitude: null,
          differentiator: null,
        };
      }
    }
  }

  return {
    buildingName: "Unknown",
    latitude: null,
    longitude: null,
  };
};
/*
    a user can be in either of three "locations"
    1. concordia building
    2. a point of interest
    3. street (pretty much anywhere)
    */
function useDataFlow() {
  const locationData = useContext(LocationContext);
  const location = {
    latitude: locationData?.latitude || null,
    longitude: locationData?.longitude || null,
  };
  const [name, setName] = useState("");
  const [indoors, setIndoors] = useState(false);
  const [startLocation, setStartLocation] = useState({
    latitude: location.latitude ?? 45.495304,
    longitude: location.longitude ?? -73.579044,
  });
  const [differentiator, setDifferentiator] = useState(null);

  useEffect(() => {
    // Only run if we have real location data
    if (locationData?.latitude && locationData?.longitude) {
      const currentLocation = {
        latitude: locationData.latitude,
        longitude: locationData.longitude,
      };

      // Update startLocation with real coordinates
      setStartLocation(currentLocation);

      let buildingData = findBuilding(coloringData, currentLocation);
      if (buildingData.status) {
        setIndoors(true);
        setDifferentiator(buildingData.buildingDiffirentiator);

        if (!buildingData.buildingDiffirentiator) {
          buildingData = getData(buildingData);
        }

        setName(buildingData.buildingName);
      } else {
        // We're outdoors
        setIndoors(false);
        setName("");
        setDifferentiator(null);
      }
    }
  }, [locationData?.latitude, locationData?.longitude]);

  return {
    location: {
      latitude: locationData?.latitude || startLocation.latitude,
      longitude: locationData?.longitude || startLocation.longitude,
    },
    isIndoors: indoors,
    buildingName: name,
    differentiator: differentiator,
  };
}

export default useDataFlow;
export { findBuilding, getData };
