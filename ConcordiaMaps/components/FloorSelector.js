import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

const BUILDINGS_DATA = {
  HallBuilding: {
    name: 'Hall Building',
    code: 'H',
    floors: [
      { id: '13', name: '13th Floor', description: 'Floor description placeholder' },
      { id: '12', name: '12th Floor', description: 'Floor description placeholder' },
      { id: '11', name: '11th Floor', description: 'Floor description placeholder' },
      { id: '10', name: '10th Floor', description: 'Floor description placeholder' },
      { id: '9', name: '9th Floor', description: 'Floor description placeholder' },
      { id: '8', name: '8th Floor', description: 'Floor description placeholder' },
      { id: '7', name: '7th Floor', description: 'Floor description placeholder' },
      { id: '6', name: '6th Floor', description: 'Floor description placeholder' },
      { id: '5', name: '5th Floor', description: 'Floor description placeholder' },
      { id: '4', name: '4th Floor', description: 'Floor description placeholder' },
      { id: '3', name: '3rd Floor', description: 'Floor description placeholder' },
      { id: '2', name: '2nd Floor', description: 'Floor description placeholder' },
      { id: '1', name: '1st Floor', description: 'Floor description placeholder' },
      { id: 'T', name: 'Tunnel', description: 'Floor description placeholder' },
    ]
  },
  JMSB: {
    name: 'John Molson Building',
    code: 'MB',
    floors: [
      { id: '15', name: '15th Floor', description: 'Floor description placeholder' },
      { id: '14', name: '14th Floor', description: 'Floor description placeholder' },
      { id: '13', name: '13th Floor', description: 'Floor description placeholder' },
      { id: '12', name: '12th Floor', description: 'Floor description placeholder' },
      { id: '11', name: '11th Floor', description: 'Floor description placeholder' },
      { id: '10', name: '10th Floor', description: 'Floor description placeholder' },
      { id: '9', name: '9th Floor', description: 'Floor description placeholder' },
      { id: '8', name: '8th Floor', description: 'Floor description placeholder' },
      { id: '7', name: '7th Floor', description: 'Floor description placeholder' },
      { id: '6', name: '6th Floor', description: 'Floor description placeholder' },
      { id: '5', name: '5th Floor', description: 'Floor description placeholder' },
      { id: '4', name: '4th Floor', description: 'Floor description placeholder' },
      { id: '3', name: '3rd Floor', description: 'Floor description placeholder' },
      { id: '2', name: '2nd Floor', description: 'Floor description placeholder' },
      { id: 'S2', name: 'S2 Level', description: 'Floor description placeholder' },
      { id: 'S1', name: 'S1 Level', description: 'Floor description placeholder' },
    ]
  }
};

const FloorSelector = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const windowHeight = Dimensions.get('window').height;
  
  // Get buildingType from route params, default to HallBuilding if not specified
  const buildingType = route.params?.buildingType || 'HallBuilding';
  const building = BUILDINGS_DATA[buildingType];

  const handleFloorSelect = (floorId) => {
    // For Hall Building 8th floor
    if (buildingType === 'HallBuilding' && floorId === '8') {
      navigation.navigate('IndoorNavigation');
    } 
    // For JMSB (you can add specific floor conditions here)
    else if (buildingType === 'JMSB') {
      // Add JMSB specific navigation logic here
      alert('JMSB indoor navigation coming soon!');
    }
    else {
      alert('Indoor navigation for this floor is coming soon!');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{building.name} Floors</Text>
      <Text style={styles.subtitle}>{building.code} Building</Text>
      <ScrollView
        style={styles.carousel}
        snapToInterval={windowHeight * 0.25}
        decelerationRate="fast"
        showsVerticalScrollIndicator={false}
      >
        {building.floors.map((floor) => (
          <TouchableOpacity
            key={floor.id}
            style={[
              styles.floorCard,
              { height: windowHeight * 0.25 },
              (buildingType === 'HallBuilding' && floor.id === '8') && styles.activeFloor
            ]}
            onPress={() => handleFloorSelect(floor.id)}
          >
            <Text style={styles.floorNumber}>Floor {floor.id}</Text>
            <Text style={styles.floorName}>{floor.name}</Text>
            <Text style={styles.floorDescription}>{floor.description}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 16,
    color: '#912338',
  },
  subtitle: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 16,
    color: '#666',
  },
  carousel: {
    flex: 1,
  },
  floorCard: {
    margin: 10,
    padding: 20,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  activeFloor: {
    backgroundColor: '#e6f3ff',
    borderColor: '#912338',
    borderWidth: 2,
  },
  floorNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  floorName: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
    color: '#444',
  },
  floorDescription: {
    fontSize: 16,
    color: '#666',
  },
});

export default FloorSelector; 