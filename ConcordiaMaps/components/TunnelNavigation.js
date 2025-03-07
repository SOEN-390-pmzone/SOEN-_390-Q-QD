import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Header from './Header';
import NavBar from './NavBar';

const TUNNEL_BUILDINGS = [
  {
    id: 'ev',
    name: 'EV Building',
    code: 'EV',
    description: 'Engineering, Computer Science and Visual Arts Integrated Complex',
    address: '1515 St. Catherine W.'
  },
  {
    id: 'library',
    name: 'Webster Library',
    code: 'LB',
    description: 'Webster Library',
    address: '1400 De Maisonneuve Blvd. W.'
  },
  {
    id: 'hall',
    name: 'Hall Building',
    code: 'H',
    description: 'Henry F. Hall Building',
    address: '1455 De Maisonneuve Blvd. W.'
  },
  {
    id: 'jmsb',
    name: 'JMSB',
    code: 'MB',
    description: 'John Molson School of Business',
    address: '1450 Guy Street'
  }
];

const TunnelNavigation = () => {
  const navigation = useNavigation();

  const handleBuildingSelect = (building) => {
    // Navigate to FloorSelector with the appropriate building type
    let buildingType;
    switch (building.id) {
      case 'hall':
        buildingType = 'HallBuilding';
        break;
      case 'jmsb':
        buildingType = 'JMSB';
        break;
      case 'ev':
        buildingType = 'EVBuilding';
        break;
      case 'library':
        buildingType = 'Library';
        break;
    }
    navigation.navigate('FloorSelector', { buildingType });
  };

  return (
    <View style={styles.container}>
      <Header />
      <NavBar />
      <ScrollView style={styles.scrollContainer}>
        <Text style={styles.title}>Tunnel Navigation</Text>
        <Text style={styles.subtitle}>Select a building to view its floors</Text>
        
        <View style={styles.buildingsGrid}>
          {TUNNEL_BUILDINGS.map((building) => (
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