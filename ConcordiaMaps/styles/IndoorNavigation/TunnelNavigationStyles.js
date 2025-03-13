import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 20,
    color: "#912338",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 24,
  },
  buildingsGrid: {
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
  scrollContainer: {
    flex: 1,
  },
});

export default styles;
