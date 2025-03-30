import FloorRegistry, { CONCORDIA_BUILDINGS } from "./BuildingDataService";

export const parseOriginClassroom = (
  text,
  setOrigin,
  setOriginBuilding,
  setOriginRoom,
  filterOriginBuildingSuggestions,
) => {
  setOrigin(text);

  const parsedRoom = FloorRegistry.parseRoomFormat(text);
  if (parsedRoom) {
    const foundBuilding = FloorRegistry.findBuildingByCode(
      parsedRoom.buildingCode,
    );

    if (foundBuilding) {
      setOriginBuilding(foundBuilding);
      setOriginRoom(parsedRoom.formatted);
      return true;
    }
  } else {
    // If not in standard format, try to match building name
    filterOriginBuildingSuggestions(text);
  }
  return false;
};

export const parseDestination = (
  text,
  setDestination,
  setBuilding,
  setRoom,
  filterBuildingSuggestions,
) => {
  setDestination(text);

  // Common formats: "H-920", "H 920", "Hall Building 920"
  const buildingMatch = text.match(/^([A-Za-z]+)[-\s]?(\d+)/);

  if (buildingMatch) {
    const buildingCode = buildingMatch[1].toUpperCase();
    const roomNumber = buildingMatch[2];

    // Find building details
    const foundBuilding = CONCORDIA_BUILDINGS.find(
      (b) => b.id === buildingCode,
    );

    if (foundBuilding) {
      setBuilding(foundBuilding);
      setRoom(`${buildingCode}-${roomNumber}`);
      return true;
    }
  } else {
    // If not in standard format, try to match building name
    filterBuildingSuggestions(text);
  }
  return false;
};

export const handleBuildingSelect = (
  building,
  setBuilding,
  setBuildingText,
  setShowBuildingSuggestions,
  setAvailableRooms,
  setInvalidRoom,
) => {
  // Set the selected building
  setBuilding(building);

  // Set the building text (display name)
  setBuildingText(building.name);

  // Hide suggestions after selection
  setShowBuildingSuggestions(false);

  // Only try to set available rooms if the function is provided
  if (typeof setAvailableRooms === "function") {
    // Load available rooms for this building
    const validRooms = FloorRegistry.getValidRoomsForBuilding(building.id);
    setAvailableRooms(validRooms);
  }

  // Reset invalid room flag if the function exists
  if (typeof setInvalidRoom === "function") {
    setInvalidRoom(false);
  }
};
