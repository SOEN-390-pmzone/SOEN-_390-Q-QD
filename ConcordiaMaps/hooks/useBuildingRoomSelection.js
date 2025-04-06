import { useState, useEffect } from "react";
import FloorRegistry from "../services/BuildingDataService";

export const useBuildingRoomSelection = () => {
  const [selectedBuilding, setSelectedBuilding] = useState("");
  const [selectedFloor, setSelectedFloor] = useState("");
  const [selectedRoom, setSelectedRoom] = useState("");
  const [buildings, setBuildings] = useState([]);
  const [availableFloors, setAvailableFloors] = useState([]);
  const [availableRooms, setAvailableRooms] = useState([]);

  // Helper function to get building type from building ID
  const getBuildingType = (buildingId) => {
    return FloorRegistry.getBuildingTypeFromId(buildingId);
  };

  // Load buildings on mount
  useEffect(() => {
    setBuildings(FloorRegistry.getBuildings());
  }, []);

  // Update available floors when building changes
  useEffect(() => {
    if (selectedBuilding) {
      console.log("Getting available floors from building");
      const buildingType = getBuildingType(selectedBuilding);
      if (buildingType) {
        const building = FloorRegistry.getBuilding(buildingType);
        if (building?.floors) {
          setAvailableFloors(Object.keys(building.floors));
          console.log("Getting available floors from building");
        }
      }
      // Reset floor and room when building changes
      setSelectedFloor("");
      setSelectedRoom("");
    } else {
      setAvailableFloors([]);
    }
  }, [selectedBuilding]);

  // Update available rooms when floor changes
  useEffect(() => {
    if (selectedBuilding && selectedFloor) {
      const buildingType = getBuildingType(selectedBuilding);
      if (buildingType) {
        const rooms = FloorRegistry.getRooms(buildingType, selectedFloor);
        if (rooms) {
          setAvailableRooms(Object.keys(rooms));
        }
      }
    } else {
      setAvailableRooms([]);
    }
  }, [selectedBuilding, selectedFloor]);

  const resetSelection = () => {
    setSelectedBuilding("");
    setSelectedFloor("");
    setSelectedRoom("");
  };

  return {
    buildings,
    selectedBuilding,
    setSelectedBuilding,
    selectedFloor,
    setSelectedFloor,
    availableFloors,
    selectedRoom,
    setSelectedRoom,
    availableRooms,
    resetSelection,
  };
};
