import { useState } from "react";
import { Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import FloorRegistry, {
  CONCORDIA_BUILDINGS,
} from "../services/BuildingDataService";
import convertToCoordinates from "../components/convertToCoordinates";
import { findBuilding, getData } from "../components/userInPolygon";
import { coloringData } from "../data/coloringData";

/**
 * Custom hook for handling navigation directions between locations
 * @param {Object} userContext - Information about the user's current location
 * @param {Object} userContext.location - User's GPS coordinates
 * @param {boolean} userContext.isIndoors - Whether user is inside a building
 * @param {string} userContext.buildingName - Name of building user is in (if indoors)
 */
const useDirectionsHandler = ({ location, isIndoors, buildingName }) => {
  const [destinationLocation, setDestinationLocation] = useState(null);
  const navigation = useNavigation();

  /**
   * Prepares navigation to a destination from the user's current location
   * @param {string} loc - Destination location (address or room number)
   * @returns {void}
   */
  const getDirectionsTo = (loc) => {
    if (loc === null || loc === undefined) {
      console.log("Make sure the address is included in the calendar event");
      return;
    }

    console.log("Origin location status:", isIndoors ? "indoors" : "outdoors");
    console.log("Origin building:", buildingName || "Not in a building");
    console.log("Destination location:", loc);
    setDestinationLocation(loc);
    Alert.alert(`Get directions to ${loc}`);

    // Create navigation parameters that will be used for both room and address cases
    const navigationParams = {
      prefillNavigation: true, // Flag to ensure params are processed
    };

    // Set up origin parameters based on user's current location
    prepareOriginParams(navigationParams);

    // Handle destination - either a room or an address
    processDestination(loc, navigationParams);
  };

  /**
   * Prepares the origin parameters for navigation
   * @param {Object} navigationParams - Navigation parameters to be populated
   * @returns {void}
   */
  const prepareOriginParams = (navigationParams) => {
    if (isIndoors && buildingName) {
      // We know the user is in a Concordia building
      const knownBuildings = FloorRegistry.KNOWN_BUILDINGS || {};

      // Fix building name mapping
      let mappedBuildingName = buildingName;

      // Special handling for JMSB (John Molson School Of Business)
      if (
        buildingName.includes("John Molson") ||
        buildingName.includes("JMSB")
      ) {
        mappedBuildingName = "John Molson Building";
      } else {
        mappedBuildingName = knownBuildings[buildingName] || buildingName;
      }

      console.log(`Mapped building name: ${mappedBuildingName}`);

      // Find the building ID using FloorRegistry's robust name matching
      let startBuildingId =
        FloorRegistry.findBuildingByName(mappedBuildingName);

      // If no match found, try with the original building name
      if (!startBuildingId && buildingName !== mappedBuildingName) {
        startBuildingId = FloorRegistry.findBuildingByName(buildingName);
      }

      let startBuilding = null;
      if (startBuildingId) {
        startBuilding = CONCORDIA_BUILDINGS.find(
          (b) => b.id === startBuildingId,
        );
      }

      if (startBuilding) {
        const startAddress = FloorRegistry.getAddressByID(startBuildingId);

        console.log(
          `Setting origin to building: ${startBuilding.name} (${startBuildingId})`,
        );

        navigationParams.originInputType = "classroom";
        navigationParams.origin = startBuilding.name;
        navigationParams.originRoom = ""; // No specific room, just the building
        navigationParams.originBuilding = {
          id: startBuildingId,
          name: startBuilding.name,
        };
        navigationParams.originDetails = {
          latitude: location.latitude,
          longitude: location.longitude,
          formatted_address: startAddress || startBuilding.name,
        };
      } else {
        console.log(
          `Could not find building data for: ${buildingName} (mapped to: ${mappedBuildingName})`,
        );
        // Fallback to using current location if building data isn't found
        setOutdoorOrigin(navigationParams);
      }
    } else {
      // User is outdoors or location is unknown, use current coordinates
      setOutdoorOrigin(navigationParams);
    }
  };

  /**
   * Sets origin to user's current outdoor location
   * @param {Object} navigationParams - Navigation parameters to be populated
   * @returns {void}
   */
  const setOutdoorOrigin = (navigationParams) => {
    console.log(
      "User is outdoors, using current GPS coordinates as starting point",
    );
    navigationParams.originInputType = "location";
    navigationParams.origin = "Current Location";
    navigationParams.originDetails = {
      latitude: location?.latitude || 0,
      longitude: location?.longitude || 0,
      formatted_address: "Current Location",
    };
  };

  /**
   * Process the destination and set up appropriate navigation params
   * @param {string} loc - Destination location
   * @param {Object} navigationParams - Navigation parameters to be populated
   * @returns {void}
   */
  const processDestination = (loc, navigationParams) => {
    // Check if the location is a room number like "H-920"
    const roomInfo = FloorRegistry.parseRoomFormat(loc);

    if (roomInfo) {
      // Process as a classroom destination
      processRoomDestination(roomInfo, navigationParams);
    } else {
      // Process as an address destination
      processAddressDestination(loc, navigationParams);
    }
  };

  /**
   * Process a classroom/room number destination
   * @param {Object} roomInfo - Parsed room information
   * @param {Object} navigationParams - Navigation parameters to be populated
   * @returns {void}
   */
  const processRoomDestination = (roomInfo, navigationParams) => {
    console.log("Processing room format:", roomInfo);
    const buildingCode = roomInfo.buildingCode;

    // Find the building by code
    const targetBuilding = CONCORDIA_BUILDINGS.find(
      (building) => building.id === buildingCode,
    );

    if (!targetBuilding) {
      console.log("Could not find building with code:", buildingCode);
      return;
    }

    // Add destination information
    navigationParams.destinationInputType = "classroom";
    navigationParams.destination = targetBuilding.name;
    navigationParams.room = `${buildingCode}-${roomInfo.roomNumber}`;
    navigationParams.building = {
      id: targetBuilding.id,
      name: targetBuilding.name,
    };
    navigationParams.destinationDetails = {
      latitude: targetBuilding.latitude,
      longitude: targetBuilding.longitude,
      formatted_address: targetBuilding.address,
    };

    // Navigate with parameters
    navigation.navigate("MultistepNavigationScreen", navigationParams);
  };

  /**
   * Process an address destination
   * @param {string} loc - Address string
   * @param {Object} navigationParams - Navigation parameters to be populated
   * @returns {void}
   */
  const processAddressDestination = (loc, navigationParams) => {
    convertToCoordinates(loc)
      .then((coordinates) => {
        if (!coordinates) {
          console.log("Could not convert address to coordinates");
          return;
        }

        let targetBuilding = findBuilding(coloringData, coordinates);
        targetBuilding = getData(targetBuilding); // fetches the information about the destination Concordia building

        if (!targetBuilding) {
          console.log("Could not find target building");
          return;
        }

        const endBuildingId =
          FloorRegistry.findBuildingByName(targetBuilding.buildingName) ||
          targetBuilding.buildingName;

        if (!endBuildingId) {
          console.log(
            "Could not find end building ID for:",
            targetBuilding.buildingName,
          );
          return;
        }

        const endBuildingName = targetBuilding.buildingName;
        const endAddress = FloorRegistry.getAddressByID(endBuildingId);

        // Add destination information
        navigationParams.destinationInputType = "location";
        navigationParams.destination = endBuildingName;
        navigationParams.destinationDetails = {
          latitude: coordinates.latitude,
          longitude: coordinates.longitude,
          formatted_address: endAddress,
        };
        navigationParams.building = {
          id: endBuildingId,
          name: endBuildingName,
        };

        // Navigate with parameters
        navigation.navigate("MultistepNavigationScreen", navigationParams);
      })
      .catch((error) => {
        console.error("Error getting directions:", error);
      });
  };

  return {
    getDirectionsTo,
    destinationLocation,
  };
};

export default useDirectionsHandler;
