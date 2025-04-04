import { useState } from "react";
import { Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import JourneyOptimizerService from "../services/JourneyOptimizer/JourneyOptimizerService";

//The goal of the file is to decouple The task list management from the JourneyOptimizerScreen.
// This file stores the information about which tasks have been selected and how to rearrange them.
export const useJourneyPlanner = () => {
  const navigation = useNavigation();
  const [tasks, setTasks] = useState([]);
  const [avoidOutdoor, setAvoidOutdoor] = useState(false);

  const addAddressTask = (title, location) => {
    if (title.trim() === "") {
      Alert.alert("Error", "Please enter a title for this location");
      return false;
    }

    const newTask = {
      id: `task-${Date.now()}`,
      title: title,
      latitude: location.latitude,
      longitude: location.longitude,
      description: `Visit ${title} at this address`,
    };

    setTasks([...tasks, newTask]);
    return true;
  };

  const addBuildingRoomTask = (title, buildingId, room) => {
    if (title.trim() === "") {
      Alert.alert("Error", "Please enter a title for this location");
      return false;
    }

    if (!buildingId) {
      Alert.alert("Error", "Please select a building");
      return false;
    }

    if (!room) {
      Alert.alert("Error", "Please select a room");
      return false;
    }

    const newTask = {
      id: `task-${Date.now()}`,
      title: title,
      buildingId: buildingId,
      room: room,
      description: `Visit ${title} in ${buildingId}, room ${room}`,
    };

    setTasks([...tasks, newTask]);
    return true;
  };

  const removeTask = (id) => {
    setTasks(tasks.filter((task) => task.id !== id));
  };

  const moveTaskUp = (index) => {
    if (index === 0) return;
    const updatedTasks = [...tasks];
    const temp = updatedTasks[index];
    updatedTasks[index] = updatedTasks[index - 1];
    updatedTasks[index - 1] = temp;
    setTasks(updatedTasks);
  };

  const moveTaskDown = (index) => {
    if (index === tasks.length - 1) return;
    const updatedTasks = [...tasks];
    const temp = updatedTasks[index];
    updatedTasks[index] = updatedTasks[index + 1];
    updatedTasks[index + 1] = temp;
    setTasks(updatedTasks);
  };

  const generateJourney = () => {
    if (tasks.length < 2) {
      Alert.alert("Error", "Please add at least two locations for a journey");
      return false;
    }
    // TODO : Implement this vvvvv

    // try {
    //   // Call the JourneyOptimizerService to get optimized navigation steps
    //   const steps = JourneyOptimizerService.generateOptimalJourney(
    //     tasks,
    //     avoidOutdoor,
    //   );

    //   // Navigate to the MultistepNavigationScreen with the generated steps
    //   navigation.navigate('MultistepNavigationScreen', { steps });
    //   return true;
    // } catch (error) {
    //   console.error('Error generating journey:', error);
    //   Alert.alert(
    //     'Error',
    //     'Failed to generate journey. Please check your locations and try again.',
    //   );
    //   return false;
    // }
  };

  return {
    tasks,
    avoidOutdoor,
    setAvoidOutdoor,
    addAddressTask,
    addBuildingRoomTask,
    removeTask,
    moveTaskUp,
    moveTaskDown,
    generateJourney,
  };
};
