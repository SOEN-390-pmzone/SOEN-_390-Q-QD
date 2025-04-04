import { useState, useEffect } from "react";
import FloorRegistry from "../services/BuildingDataService";

export const useBuildingRoomSelection = () => {
  const [selectedBuilding, setSelectedBuilding] = useState("");
  const [selectedFloor, setSelectedFloor] = useState(""); // Add this state
  const [selectedRoom, setSelectedRoom] = useState("");
  const [buildings, setBuildings] = useState([]);
  const [availableFloors, setAvailableFloors] = useState([]); // Add this state
  const [availableRooms, setAvailableRooms] = useState([]);

  // Load buildings on mount
  useEffect(() => {
    setBuildings(FloorRegistry.getBuildings());
  }, []);

  // Update available floors when building changes
  useEffect(() => {
    if (selectedBuilding) {
      const buildingType = FloorRegistry.getBuildingTypeFromId(selectedBuilding);
      if (buildingType) {
        const building = FloorRegistry.getBuilding(buildingType);
        if (building && building.floors) {
          setAvailableFloors(Object.keys(building.floors));
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
      const buildingType = FloorRegistry.getBuildingTypeFromId(selectedBuilding);
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
    selectedFloor, // Add this
    setSelectedFloor, // Add this
    availableFloors, // Add this
    selectedRoom,
    setSelectedRoom,
    availableRooms,
    resetSelection,
  };
};