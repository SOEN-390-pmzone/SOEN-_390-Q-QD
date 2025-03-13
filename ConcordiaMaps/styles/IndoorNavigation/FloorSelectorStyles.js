import { StyleSheet } from "react-native";



const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 16,
    color: "#912338",
  },
  subtitle: {
    fontSize: 18,
    textAlign: "center",
    marginBottom: 16,
    color: "#666",
  },
  carousel: {
    flex: 1,
  },
  floorCard: {
    margin: 10,
    padding: 20,
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  activeFloor: {
    backgroundColor: "#e6f3ff",
    borderColor: "#912338",
    borderWidth: 2,
  },
  floorNumber: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#333",
  },
  floorName: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 8,
    color: "#444",
  },
  floorDescription: {
    fontSize: 16,
    color: "#666",
  },
});

export default styles