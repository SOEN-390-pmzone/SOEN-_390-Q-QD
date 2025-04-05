import React, { useState } from "react";
import { View, Text, ScrollView } from "react-native";
import Header from "../Header";
import NavBar from "../NavBar";
import InputTypeSwitcher from "./InputTypeSwitcher";
import LocationTitleInput from "./LocationTitleInput";
import AddressSelector from "./AddressSelector";
import BuildingRoomSelector from "./BuildingRoomSelector";
import LocationsSection from "./LocationsSection";
import PreferencesSection from "./PreferencesSection";
import GenerateButton from "./GenerateButton";
import { useJourneyPlanner } from "../../hooks/useJourneyPlanner";
import { useBuildingRoomSelection } from "../../hooks/useBuildingRoomSelection";
import styles from "../../styles/JourneyPlanner/JourneyPlannerScreenStyles";

const JourneyPlannerScreen = () => {
  const [inputMode, setInputMode] = useState("address");
  const [taskTitle, setTaskTitle] = useState("");

  const {
    tasks,
    avoidOutdoor,
    setAvoidOutdoor,
    addAddressTask,
    addBuildingRoomTask,
    removeTask,
    moveTaskUp,
    moveTaskDown,
    generateJourney,
  } = useJourneyPlanner();

  const {
    buildings,
    selectedBuilding,
    selectedFloor,
    availableFloors,
    selectedRoom,
    availableRooms,
    setSelectedBuilding,
    setSelectedFloor,
    setSelectedRoom,
    resetSelection,
  } = useBuildingRoomSelection();

  const handleAddressSelect = (location) => {
    if (addAddressTask(taskTitle, location)) {
      setTaskTitle("");
    }
  };

  const handleBuildingRoomAdd = () => {
    if (
      addBuildingRoomTask(
        taskTitle,
        selectedBuilding,
        selectedRoom,
        selectedFloor,
      )
    ) {
      setTaskTitle("");
      resetSelection();
    }
  };

  return (
    <View style={styles.container}>
      <Header />
      <NavBar />

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        testID="journey-planner-scrollview"
      >
        <Text style={styles.title}>Journey Planner</Text>
        <Text style={styles.subtitle}>
          Plan your optimal route across campus
        </Text>

        <InputTypeSwitcher inputMode={inputMode} setInputMode={setInputMode} />

        <View style={styles.inputContainer}>
          <LocationTitleInput
            taskTitle={taskTitle}
            setTaskTitle={setTaskTitle}
          />

          {inputMode === "address" ? (
            <AddressSelector onAddressSelect={handleAddressSelect} />
          ) : (
            <BuildingRoomSelector
              buildings={buildings}
              selectedBuilding={selectedBuilding}
              setSelectedBuilding={setSelectedBuilding}
              selectedFloor={selectedFloor}
              setSelectedFloor={setSelectedFloor}
              availableFloors={availableFloors}
              selectedRoom={selectedRoom}
              setSelectedRoom={setSelectedRoom}
              availableRooms={availableRooms}
              onAddLocation={handleBuildingRoomAdd}
            />
          )}
        </View>

        <LocationsSection
          tasks={tasks}
          onMoveUp={moveTaskUp}
          onMoveDown={moveTaskDown}
          onRemove={removeTask}
        />

        <PreferencesSection
          avoidOutdoor={avoidOutdoor}
          setAvoidOutdoor={setAvoidOutdoor}
        />

        <GenerateButton disabled={tasks.length < 2} onPress={generateJourney} />
      </ScrollView>
    </View>
  );
};

export default JourneyPlannerScreen;
