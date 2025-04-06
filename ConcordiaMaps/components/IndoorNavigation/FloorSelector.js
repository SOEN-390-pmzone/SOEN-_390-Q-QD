import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import Header from "../Header";
import NavBar from "../NavBar";
import FloorRegistry from "../../services/BuildingDataService";
import styles from "../../styles/IndoorNavigation/FloorSelectorStyles";

const FloorSelector = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const windowHeight = Dimensions.get("window").height;

  // Get buildingType from route params, default to HallBuilding if not specified
  const buildingType = route.params?.buildingType;
  // Get building data from FloorRegistry
  const building = FloorRegistry.getBuilding(buildingType);

  const handleFloorSelect = (floorId) => {
    // Check if the selected floor is a tunnel level
    if (floorId === "T") {
      navigation.navigate("TunnelNavigation");
      return;
    }

    // Check if floor has navigation data
    if (FloorRegistry.supportsNavigation(buildingType, floorId)) {
      navigation.navigate("IndoorNavigation", {
        buildingType: buildingType,
        floor: floorId,
      });
    } else {
      alert("Indoor navigation for this floor is coming soon!");
    }
  };

  return (
    <View style={styles.container}>
      <Header />
      <NavBar />
      <Text style={styles.title}>{building.name} Floors</Text>
      <Text style={styles.subtitle}>{building.code} Building</Text>
      <ScrollView
        style={styles.carousel}
        snapToInterval={windowHeight * 0.25}
        decelerationRate="fast"
        showsVerticalScrollIndicator={false}
      >
        {Object.values(building.floors).map((floor) => (
          <TouchableOpacity
            key={floor.id}
            style={[
              styles.floorCard,
              { height: windowHeight * 0.25 },
              FloorRegistry.supportsNavigation(buildingType, floor.id) &&
                styles.activeFloor,
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

export default FloorSelector;
