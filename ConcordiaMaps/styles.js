import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#912338",
  },
  map: {
    flex: 1,
  },
  bottom: {
    width: "100%",
    backgroundColor: "#912338",
    position: "absolute",
    bottom: 0,
    justifyContent: "center",
    flexDirection: "row",
    height: "5%",
    paddingTop: 15,
    zIndex: 1,
  },
  text: {
    color: "white",
    fontWeight: "bold",
    fontFamily: "Times New Roman",
    justifyContent: "center",
    fontSize: 10,
  },
  header: {
    marginTop: 40,
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#912338",
    padding: 10,
    position: "relative",
    zIndex: 1,
  },
  logo: {
    width: 50,
    height: 50,
  },
  headerText: {
    fontWeight: "bold",
    fontFamily: "Times New Roman",
    fontSize: 25,
    color: "white",
    marginLeft: 10,
  },
  navbar: {
    backgroundColor: "#912338",
    paddingHorizontal: 10,
    paddingVertical: 10,
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    zIndex: 2,
    position: "absolute",
    top: 60,
    left: 20,
    width: 70,
    height: 50,
  },
  hamburger: {
    padding: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  hamburgerLine: {
    width: 30,
    height: 4,
    backgroundColor: "#fff",
    marginVertical: 4,
  },
  menu: {
    backgroundColor: "#912338",
    position: "absolute",
    top: 50,
    left: -21,
    minHeight: 737,
    zIndex: 10,
  },
  menuItem: {
    fontSize: 20,
    padding: 8,
    width: "100%",
    color: "white",
    fontWeight: "bold",
  },
  customMarkerImage: {
    width: 30,
    height: 30,
  },
  buttonContainer: {
    marginTop: 10,
    borderRadius: 25,
    paddingVertical: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    backgroundColor: "transparent",
  },
  searchBarContainer: {
    position: "absolute",
    top: 120,
    left: 20,
    right: 20,
    zIndex: 1,
    width: "70%",
  },
  searchBar: {
    flexDirection: "row",
    backgroundColor: "white",
    padding: 10,
    borderRadius: 25,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    marginBottom: 10,
    left: 15,
  },
  input: {
    flex: 1,
    height: 40,
    marginLeft: 10,
  },
  list: {
    backgroundColor: "white",
    maxHeight: 200,
    marginTop: 5,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  icon: {
    marginRight: 10,
  },
  colorBox: {
    width: 20,
    height: 20,
    marginRight: 10,
  },
  label: {
    fontSize: 12,
  },
  title: {
    fontWeight: "bold",
    marginBottom: 5,
  },
  legendContainer: {
    position: "absolute",
    top: 720,
    right: 210,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    padding: 1,
    opacity: 0.8,
  },
  toggleView: {
    position: "absolute",
    bottom: 60,
    right: 20,
    width: 50,
    height: 50,
  },
  modes: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-evenly",
    flexWrap: "wrap",
    marginTop: 10,
  },
  button: {
    position: "absolute",
    bottom: 60,
    right: 20,
    width: 50,
    height: 50,
  },

  centeredView: {
    position: "absolute",
    bottom: 100, // Adjust this value to position the modal above the button
    right: 20,
    width: 200, // Adjust the width as needed
    height: 150, // Adjust the height as needed
    justifyContent: "center",
    alignItems: "center",
  },
  buttonImage: {
    width: "100%", // Make the image take the full width of the parent view
    height: "100%", // Make the image take the full height of the parent view
    borderRadius: 10, // Optional: Add rounded corners to the image
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20, // Adjust padding to fit content
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalText: {
    marginBottom: 15,
    fontFamily: "Times New Roman",
    textAlign: "center",
    flexShrink: 1,
  },

  textStyle: {
    color: "white",
    fontFamily: "Times New Roman",
    fontWeight: "bold",
    textAlign: "center",
  },
});

const BuildingSelectorStyles = StyleSheet.create({
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

const floorSelectorStyles = StyleSheet.create({
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

const tunnelNavigationStyles = StyleSheet.create({
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

export default {
  styles,
  BuildingSelectorStyles,
  floorSelectorStyles,
  tunnelNavigationStyles,
};
