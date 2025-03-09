import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Header from '../Header';
import NavBar from '../NavBar';
import FloorRegistry from '../../services/BuildingDataService';

const TunnelNavigation = () => {
  const navigation = useNavigation();
  // Filter only buildings with tunnel access
  const buildings = FloorRegistry.getBuildings().filter(building => 
    ['hall', 'jmsb', 'ev', 'library'].includes(building.id)
  );

  const handleBuildingSelect = (building) => {
    // Get the buildingType key directly from FloorRegistry
    const buildingTypes = Object.keys(FloorRegistry.getAllBuildings());
    const buildingType = buildingTypes.find(key => 
      FloorRegistry.getBuilding(key).id === building.id
    );
    
    if (buildingType) {
      navigation.navigate('FloorSelector', { buildingType });
    }
  };

  return (
    <View style={styles.container}>
      <Header />
      <NavBar />
      <ScrollView style={styles.scrollContainer}>
        <Text style={styles.title}>Tunnel Navigation</Text>
        <Text style={styles.subtitle}>Select a building to view its floors</Text>
        
        <View style={styles.buildingsGrid}>
          {buildings.map((building) => (
            <TouchableOpacity
              key={building.id}
              style={styles.buildingCard}
              onPress={() => handleBuildingSelect(building)}
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
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
    color: '#912338',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  buildingsGrid: {
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
  scrollContainer: {
    flex: 1,
  },
});

export default TunnelNavigation; 