import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 350,
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  handle: {
    height: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: "#CCCCCC",
    borderRadius: 2,
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  instructionContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 4,
  },
  normalText: {
    fontSize: 16,
    color: "#333",
  },
  boldText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
  },
  distanceText: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  directionItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 18,
    marginTop: 10,
    color: "#555",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    width: 330,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  modalText: {
    fontSize: 12,
    marginBottom: 5,
  },
  modalText1: {
    fontSize: 12,
    marginBottom: 10,
  },
  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    width: "100%",
  },
  closeButton: {
    backgroundColor: "white",
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 5,
    borderWidth: 1.2,
    borderColor: "black",
    marginTop: 10,
    marginRight: 5,
  },
  closeButtonText: {
    color: "black",
    fontSize: 14,
    textAlign: "center",
  },
  getDirectionsButton: {
    backgroundColor: "#990033",
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 5,
    marginTop: 10,
    marginLeft: 5,
  },
  getDirectionsButton1: {
    backgroundColor: "#4285F4",
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 5,
    marginTop: 10,
    marginLeft: 5,
    borderColor: "black",
    borderWidth: 0.5,
  },
  getDirectionsButtonText: {
    color: "white",
    fontSize: 14,
    textAlign: "center",
  },
  scrollViewContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
  },
});

export default styles;
