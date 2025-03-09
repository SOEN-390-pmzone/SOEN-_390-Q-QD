import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Header from '../Header';
import NavBar from '../NavBar';
import FloorRegistry from '../../services/BuildingDataService';



const BuildingSelector = () => {
  const navigation = useNavigation();
  //To get the data from the list of all available buildings
  const BUILDINGS = FloorRegistry.getBuildings();

  const handleBuildingSelect = (buildingId) => {
    // Find the corresponding key in the FloorRegistry by matching the building data
    const buildingTypes = Object.keys(FloorRegistry.getAllBuildings());
    const buildingType = buildingTypes.find(key => 
      FloorRegistry.getBuilding(key).id === buildingId
    );
    
    if (buildingType) {
      navigation.navigate('FloorSelector', { buildingType });
    }
  };

  return (
    <View style={styles.container}>
      <Header />
      <NavBar />
      <View style={styles.contentContainer}>
        <Text style={styles.title}>Select Building</Text>
        <ScrollView 
          style={styles.buildingsContainer}
          showsVerticalScrollIndicator={true}
        >
          {BUILDINGS.map((building) => (
            <TouchableOpacity
              key={building.id}
              style={styles.buildingCard}
              onPress={() => handleBuildingSelect(building.id)}
            >
              <View style={styles.buildingContent}>
                <View style={styles.textContainer}>
                  <Text style={styles.buildingName}>{building.name}</Text>
                  <Text style={styles.buildingCode}>{building.code}</Text>
                  <Text style={styles.buildingDescription}>{building.description}</Text>
                  <Text style={styles.buildingAddress}>{building.address}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  contentContainer: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
    color: '#912338',
  },
  buildingsContainer: {
    flex: 1,
    gap: 20,
  },
  buildingCard: {
    backgroundColor: '#f5f5f5',
    borderRadius: 15,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  buildingContent: {
    padding: 20,
  },
  textContainer: {
    gap: 8,
  },
  buildingName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  buildingCode: {
    fontSize: 18,
    fontWeight: '600',
    color: '#912338',
  },
  buildingDescription: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  buildingAddress: {
    fontSize: 14,
    color: '#888',
    marginTop: 4,
  },
  availableTag: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#912338',
    color: '#fff',
    padding: 8,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default BuildingSelector;