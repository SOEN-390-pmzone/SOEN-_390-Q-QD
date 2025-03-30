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
          building_name: feature.properties.name,
          latitude: feature.properties.latitude,
          longitude: feature.properties.longitude,
          type: feature.properties?.type,
          buildingDiffirentiator: buildingDiffirentiator,
          status: true,
        };
      } else
        return {
          building_name: feature.properties.name,
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
    const building_name = building.building_name;
    const latitude = building.latitude;
    const longitude = building.longitude;
    const differentiator = building.buildingDiffirentiator;
    if (differentiator) {
      return {
        building_name: building_name,
        latitude: latitude,
        longitude: longitude, // Add coordinates
      };
    } else {
      const matchingBuilding = Building.find(
        (building) => building.name === building_name,
      );

      // If a match is found, add the coordinate data
      if (matchingBuilding) {
        return {
          buildingName: matchingBuilding.name,
          latitude: matchingBuilding.coordinate.latitude,
          longitude: matchingBuilding.coordinate.longitude, // Add coordinates
        };
      } else {
        console.error(
          "U are in the building, but the matching algo is failing",
        );
        return {
          buildingName: "Unknown",
          latitude: null,
          longitude: null,
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

function useDataFlow() {
  /*
    a user can be in either of three "locations"
    1. concordia building
    2. a point of interest
    3. street (pretty much anywhere)
    */
  const locationData = useContext(LocationContext);
  const location = {
    latitude: locationData?.latitude || null,
    longitude: locationData?.longitude || null,
  };
  const [name, setName] = useState("");
  const [indoors, setIndoors] = useState(false);
  const [startLocation, setStartLocation] = useState(
    location || {
      latitude: 45.456134, // A latitude value within the polygon
      longitude: -73.640921, // A longitude value within the polygon
    },
  );
  //  null;
  //Second cup : [-73.640921, 45.456134]
  useEffect(() => {
    let buildingData = findBuilding(coloringData, startLocation);
    //console.log(startLocation)
    if (buildingData.status) {
      setIndoors(true);
      //const buildingType = buildingData.type;
      if (!buildingData.differentiator) {
        buildingData = getData(buildingData);
        setStartLocation(buildingData);
      } else {
        setStartLocation(buildingData);
      }
    }
  }, []);

  return {
    location: startLocation,
    isIndoors: indoors,
    buildingName: name,
    // You might also want to add other useful data or methods here
  };
}

export default useDataFlow;
