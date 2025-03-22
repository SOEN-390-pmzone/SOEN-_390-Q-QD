import { StyleSheet } from "react-native";
import { commonStyles, colors } from "./BuildingSelectorTunnelNavigationCommonStyles";

const styles = StyleSheet.create({
  container: commonStyles.container,
  title: commonStyles.title,
  subtitle: commonStyles.subtitle,
  buildingsContainer: {
    flex: 1,
    gap: 20,
  },
  buildingCard: commonStyles.buildingCard,
  buildingContent: commonStyles.buildingContent,
  textContainer: commonStyles.textContainer,
  buildingName: commonStyles.buildingName,
  buildingCode: commonStyles.buildingCode,
  buildingDescription: commonStyles.buildingDescription,
  buildingAddress: commonStyles.buildingAddress,
  scrollContainer: commonStyles.scrollContainer,
  contentContainer: {
    flex: 1,
    padding: 16,
  },
  // Add any BuildingSelector-specific styles below
  availableTag: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: colors.primary,
    color: "#fff",
    padding: 8,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: "bold",
  },
});

export default styles;