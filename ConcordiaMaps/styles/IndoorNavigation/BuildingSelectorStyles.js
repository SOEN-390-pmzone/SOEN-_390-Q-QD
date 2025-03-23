import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  contentContainer: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 20,
    color: "#912338",
  },
  buildingsContainer: {
    flex: 1,
    gap: 20,
  },
  buildingCard: {
    backgroundColor: "#f5f5f5",
    borderRadius: 15,
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#000",
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
    fontWeight: "bold",
    color: "#333",
  },
  buildingCode: {
    fontSize: 18,
    fontWeight: "600",
    color: "#912338",
  },
  buildingDescription: {
    fontSize: 16,
    color: "#666",
    marginTop: 4,
  },
  buildingAddress: {
    fontSize: 14,
    color: "#888",
    marginTop: 4,
  },
  availableTag: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "#912338",
    color: "#fff",
    padding: 8,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: "bold",
  },
});

export default styles;
