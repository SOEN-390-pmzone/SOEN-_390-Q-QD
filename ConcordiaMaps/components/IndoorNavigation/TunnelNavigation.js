import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import Header from "../Header";
import NavBar from "../NavBar";
import FloorRegistry from "../../services/BuildingDataService";
import { tunnelNavigationStyles } from "../../styles";

const TunnelNavigation = () => {
  const styles = tunnelNavigationStyles;
  const navigation = useNavigation();
  // Filter only buildings with tunnel access
  const buildings = FloorRegistry.getBuildings().filter((building) =>
    ["hall", "jmsb", "ev", "library"].includes(building.id),
  );

  const handleBuildingSelect = (building) => {
    // Get the buildingType key directly from FloorRegistry
    const buildingTypes = Object.keys(FloorRegistry.getAllBuildings());
    const buildingType = buildingTypes.find(
      (key) => FloorRegistry.getBuilding(key).id === building.id,
    );

    if (buildingType) {
      navigation.navigate("FloorSelector", { buildingType });
    }
  };

  return (
    <View style={styles.container}>
      <Header />
      <NavBar />
      <ScrollView style={styles.scrollContainer}>
        <Text style={styles.title}>Tunnel Navigation</Text>
        <Text style={styles.subtitle}>
          Select a building to view its floors
        </Text>

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
                  <Text style={styles.buildingDescription}>
                    {building.description}
                  </Text>
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

export default TunnelNavigation;
