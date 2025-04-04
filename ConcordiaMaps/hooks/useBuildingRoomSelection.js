import { useState, useMemo } from "react";
import FloorRegistry from "../services/BuildingDataService";

export const useBuildingRoomSelection = () => {
  const [selectedBuilding, setSelectedBuilding] = useState("");
  const [selectedRoom, setSelectedRoom] = useState("");

  // Get all buildings from the FloorRegistry
  const buildings = useMemo(() => FloorRegistry.getBuildings(), []);

  // Get rooms for the selected building
  const availableRooms = useMemo(() => {
    if (!selectedBuilding) return [];

    const buildingType = Object.keys(FloorRegistry.getAllBuildings()).find(
      (key) => FloorRegistry.getBuilding(key).id === selectedBuilding,
    );

    if (!buildingType) return [];

    // Get all floors for this building
    const building = FloorRegistry.getBuilding(buildingType);
    if (!building || !building.floors) return [];

    // Collect rooms from all floors
    let allRooms = [];
    Object.values(building.floors).forEach((floor) => {
      const floorRooms = FloorRegistry.getRooms(buildingType, floor.id);
      if (floorRooms) {
        allRooms = [...allRooms, ...Object.keys(floorRooms)];
      }
    });

    return allRooms;
  }, [selectedBuilding]);

  const handleBuildingChange = (value) => {
    setSelectedBuilding(value);
    setSelectedRoom("");
  };

  const resetSelection = () => {
    setSelectedRoom("");
  };

  return {
    buildings,
    selectedBuilding,
    selectedRoom,
    availableRooms,
    setSelectedBuilding: handleBuildingChange,
    setSelectedRoom,
    resetSelection,
  };
};
