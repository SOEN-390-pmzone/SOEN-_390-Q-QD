import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Header from '../Header';
import NavBar from '../NavBar';
import FloatingSearchBar from '../OutdoorNavigation/FloatingSearchBar';
import JourneyOptimizerService from '../../services/JourneyOptimizer/JourneyOptimizerService';
import { Ionicons } from '@expo/vector-icons';
import FloorRegistry from '../../services/BuildingDataService';
import { Picker } from '@react-native-picker/picker';
import styles from '../../styles/JourneyPlanner/JourneyPlannerScreenStyles'

const JourneyPlannerScreen = () => {
  const navigation = useNavigation();
  const [inputMode, setInputMode] = useState('address'); // 'address' or 'building'
  const [selectedBuilding, setSelectedBuilding] = useState('');
  const [selectedRoom, setSelectedRoom] = useState('');
  const [taskTitle, setTaskTitle] = useState('');
  const [avoidOutdoor, setAvoidOutdoor] = useState(false);
  const [tasks, setTasks] = useState([]);

  // Get all buildings from the FloorRegistry
  const buildings = FloorRegistry.getBuildings();
  
  // Get rooms for the selected building
  const getRoomsForBuilding = () => {
    if (!selectedBuilding) return [];
    
    const buildingType = Object.keys(FloorRegistry.getAllBuildings()).find(
      key => FloorRegistry.getBuilding(key).id === selectedBuilding
    );
    
    if (!buildingType) return [];
    
    // Get all floors for this building
    const building = FloorRegistry.getBuilding(buildingType);
    if (!building || !building.floors) return [];
    
    // Collect rooms from all floors
    let allRooms = [];
    Object.values(building.floors).forEach(floor => {
      const floorRooms = FloorRegistry.getRooms(buildingType, floor.id);
      if (floorRooms) {
        allRooms = [...allRooms, ...Object.keys(floorRooms)];
      }
    });
    
    return allRooms;
  };

  const handleAddressSelect = (location) => {
    if (taskTitle.trim() === '') {
      Alert.alert('Error', 'Please enter a title for this location');
      return;
    }
    
    const newTask = {
      id: `task-${Date.now()}`,
      title: taskTitle,
      latitude: location.latitude,
      longitude: location.longitude,
      description: `Visit ${taskTitle} at this address`
    };
    
    setTasks([...tasks, newTask]);
    setTaskTitle('');
  };

  const handleBuildingRoomAdd = () => {
    if (taskTitle.trim() === '') {
      Alert.alert('Error', 'Please enter a title for this location');
      return;
    }
    
    if (!selectedBuilding) {
      Alert.alert('Error', 'Please select a building');
      return;
    }
    
    if (!selectedRoom) {
      Alert.alert('Error', 'Please select a room');
      return;
    }
    
    const newTask = {
      id: `task-${Date.now()}`,
      title: taskTitle,
      buildingId: selectedBuilding,
      room: selectedRoom,
      description: `Visit ${taskTitle} in ${selectedBuilding}, room ${selectedRoom}`
    };
    
    setTasks([...tasks, newTask]);
    setTaskTitle('');
    setSelectedRoom('');
  };

  const removeTask = (id) => {
    setTasks(tasks.filter(task => task.id !== id));
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
      Alert.alert('Error', 'Please add at least two locations for a journey');
      return;
    }
    
    try {
      // Call the JourneyOptimizerService to get optimized navigation steps
      const steps = JourneyOptimizerService.generateOptimalJourney(tasks, avoidOutdoor);
      
      // Navigate to the MultistepNavigationScreen with the generated steps
      navigation.navigate('MultistepNavigationScreen', { steps });
    } catch (error) {
      console.error('Error generating journey:', error);
      Alert.alert('Error', 'Failed to generate journey. Please check your locations and try again.');
    }
  };

  const availableRooms = getRoomsForBuilding();

  return (
    <View style={styles.container}>
      <Header />
      <NavBar />
      
      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Journey Planner</Text>
        <Text style={styles.subtitle}>Plan your optimal route across campus</Text>
        
        {/* Input mode selector */}
        <View style={styles.inputTypeContainer}>
          <TouchableOpacity 
            style={[styles.tabButton, inputMode === 'address' && styles.activeTab]}
            onPress={() => setInputMode('address')}
          >
            <Text style={styles.tabText}>Address</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tabButton, inputMode === 'building' && styles.activeTab]}
            onPress={() => setInputMode('building')}
          >
            <Text style={styles.tabText}>Building & Room</Text>
          </TouchableOpacity>
        </View>
        
        {/* Location input fields */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            placeholder="Location Title"
            value={taskTitle}
            onChangeText={setTaskTitle}
          />
          
          {inputMode === 'address' ? (
            <View style={styles.searchBarContainer}>
              <Text style={styles.inputLabel}>Search for an address:</Text>
              <FloatingSearchBar 
                onPlaceSelect={handleAddressSelect}
                placeholder="Enter an address or landmark"
              />
            </View>
          ) : (
            <View>
              <Text style={styles.inputLabel}>Select building:</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={selectedBuilding}
                  onValueChange={(value) => {
                    setSelectedBuilding(value);
                    setSelectedRoom('');
                  }}
                  style={styles.picker}
                >
                  <Picker.Item label="Select a building" value="" />
                  {buildings.map(building => (
                    <Picker.Item 
                      key={building.id} 
                      label={`${building.name} (${building.code})`} 
                      value={building.id} 
                    />
                  ))}
                </Picker>
              </View>
              
              <Text style={styles.inputLabel}>Select room:</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={selectedRoom}
                  onValueChange={setSelectedRoom}
                  style={styles.picker}
                  enabled={selectedBuilding !== ''}
                >
                  <Picker.Item label="Select a room" value="" />
                  {availableRooms.map(room => (
                    <Picker.Item key={room} label={room} value={room} />
                  ))}
                </Picker>
              </View>
              
              <TouchableOpacity 
                style={styles.addButton}
                onPress={handleBuildingRoomAdd}
              >
                <Text style={styles.addButtonText}>Add Location</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
        
        {/* Task list */}
        <View style={styles.tasksContainer}>
          <Text style={styles.sectionTitle}>Your Locations ({tasks.length})</Text>
          {tasks.length === 0 ? (
            <Text style={styles.emptyText}>No locations added yet. Add at least two locations to create a journey.</Text>
          ) : (
            <View style={styles.taskList}>
              {tasks.map((item, index) => (
                <View key={item.id} style={styles.taskItem}>
                  <View style={styles.taskInfo}>
                    <Text style={styles.taskTitle}>{item.title}</Text>
                    <Text style={styles.taskDescription}>
                      {item.buildingId ? 
                        `${item.buildingId}, Room ${item.room}` : 
                        `Outdoor location`}
                    </Text>
                  </View>
                  <View style={styles.taskActions}>
                    <TouchableOpacity onPress={() => moveTaskUp(index)} style={styles.actionButton}>
                      <Ionicons name="arrow-up" size={24} color="#555" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => moveTaskDown(index)} style={styles.actionButton}>
                      <Ionicons name="arrow-down" size={24} color="#555" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => removeTask(item.id)} style={styles.actionButton}>
                      <Ionicons name="trash-outline" size={24} color="#ff3b30" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
        
        {/* Preferences */}
        <View style={styles.preferencesContainer}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <TouchableOpacity 
            style={styles.preferenceRow}
            onPress={() => setAvoidOutdoor(!avoidOutdoor)}
          >
            <Text style={styles.preferenceText}>Prefer indoor paths (tunnels/bridges)</Text>
            <View style={[styles.checkbox, avoidOutdoor && styles.checkboxChecked]}>
              {avoidOutdoor && <Ionicons name="checkmark" size={18} color="white" />}
            </View>
          </TouchableOpacity>
        </View>
        
        {/* Generate button */}
        <TouchableOpacity 
          style={[styles.generateButton, tasks.length < 2 && styles.disabledButton]}
          onPress={generateJourney}
          disabled={tasks.length < 2}
        >
          <Text style={styles.generateButtonText}>Generate Optimal Route</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};


export default JourneyPlannerScreen;