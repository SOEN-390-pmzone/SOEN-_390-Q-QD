import { useState, useEffect } from "react";
import useDataFlow from "../components/userInPolygon";

/**
 * Custom hook that provides user location status information
 * @returns {Object} Location status information
 */
const useLocationStatus = () => {
  const [userLocationStatus, setUserLocationStatus] = useState("");
  const { location, isIndoors, buildingName } = useDataFlow();

  // Update location status whenever location data changes
  useEffect(() => {
    updateUserLocationStatus();
  }, [location, isIndoors, buildingName]);

  /**
   * Determines and updates the user's location status message
   */
  const updateUserLocationStatus = () => {
    if (!location || (!location.latitude && !location.longitude)) {
      setUserLocationStatus("Obtaining your location...");
    } else if (isIndoors && buildingName) {
      setUserLocationStatus(`You are currently inside: ${buildingName}`);
    } else {
      setUserLocationStatus("You are currently outdoors");
    }
  };

  return {
    userLocationStatus,
    location,
    isIndoors,
    buildingName,
  };
};

export default useLocationStatus;
