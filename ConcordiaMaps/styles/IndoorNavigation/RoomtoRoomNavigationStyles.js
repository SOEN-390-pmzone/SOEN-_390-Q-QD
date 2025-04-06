import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  sectionContainer: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 16,
    color: "#912338",
  },
  scrollContainer: {
    flex: 1,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  selectedCard: {
    borderColor: "#912338",
    borderWidth: 2,
    backgroundColor: "#f9f0f2",
  },
  buildingName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  buildingCode: {
    fontSize: 16,
    fontWeight: "500",
    color: "#912338",
    marginTop: 4,
  },
  buildingDescription: {
    fontSize: 14,
    color: "#666",
    marginTop: 8,
  },
  floorsContainer: {
    flex: 1,
    flexDirection: "row",
    gap: 12,
  },
  floorColumn: {
    flex: 1,
  },
  floorColumnTitle: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
    color: "#444",
  },
  floorCard: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  floorText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  floorDescription: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  roomCard: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  roomText: {
    fontSize: 16,
    textAlign: "center",
    color: "#333",
  },
  button: {
    backgroundColor: "#912338",
    borderRadius: 10,
    padding: 16,
    marginTop: 16,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  disabledButton: {
    backgroundColor: "#cccccc",
  },
  backButton: {
    marginTop: 12,
    padding: 8,
    alignItems: "center",
  },
  backButtonText: {
    color: "#666",
    fontSize: 14,
  },
  navigationContainer: {
    flex: 1,
  },
  floorPlanContainer: {
    flex: 1,
    position: "relative",
    marginBottom: 16,
  },
  expandButton: {
    position: "absolute",
    top: 0,
    right: 0,
    backgroundColor: "#912338",
    borderRadius: 4,
    padding: 4,
    zIndex: 2,
  },
  expandButtonText: {
    color: "white",
    fontSize: 12,
  },
  floorPlanWrapper: {
    flex: 1,
    borderRadius: 10,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#ddd",
    marginTop: 8,
  },
  floorPlan: {
    flex: 1,
    backgroundColor: "white",
  },
  stepsContainer: {
    marginTop: 16,
  },
  stepsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#333",
  },
  stepsList: {
    maxHeight: 200,
    backgroundColor: "white",
    borderRadius: 10,
    padding: 12,
  },
  stepItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  stepDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  stepText: {
    fontSize: 14,
    color: "#444",
    flex: 1,
  },
  expandedModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  expandedModalContent: {
    width: "90%",
    height: "80%",
    backgroundColor: "white",
    borderRadius: 10,
    overflow: "hidden",
  },
  expandedHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  expandedTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  closeExpandedButton: {
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  closeExpandedText: {
    fontSize: 24,
    color: "#666",
  },
  expandedWebViewContainer: {
    flex: 1,
  },
  expandedWebView: {
    flex: 1,
  },
});

export default styles;
