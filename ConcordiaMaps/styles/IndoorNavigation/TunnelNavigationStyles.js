import { StyleSheet } from "react-native";
import { commonStyles } from "./BuildingSelectorTunnelNavigationCommonStyles";

const styles = StyleSheet.create({
  container: {
    ...commonStyles.container,
    padding: 16, // This is specific to TunnelNavigationStyles
  },
  title: commonStyles.title,
  subtitle: commonStyles.subtitle,
  buildingsGrid: {
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
});

export default styles;