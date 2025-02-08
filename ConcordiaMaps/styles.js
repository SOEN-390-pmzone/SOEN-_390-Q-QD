import { StyleSheet } from "react-native";
// import { Dimensions} from "react-native";

// const { width, height } = Dimensions.get("window");

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
    zIndex: 1, // Ensures the logo appears on top
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
    zIndex: 1,
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
    backgroundColor: "#fff", // White color for hamburger lines
    marginVertical: 4,
  },
  menu: {
    backgroundColor: "#912338",
    position: "absolute",
    top: 50,
    left: -21,
    minHeight: 737, // Adjust height as needed
    zIndex: 10,
  },
  menuItem: {
    fontSize: 20,
    padding: 8,
    width: "100%",
    color: "white", // Red color for menu items
    fontWeight: "bold",
  },
  customMarkerImage: {
    width: 30,
    height: 30,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  colorBox: {
    width: 20,
    height: 20,
    marginRight: 10,
  },
  label: {
    fontSize: 14,
  },
  title: {
    fontWeight: "bold",
    marginBottom: 5,
  },
  legendContainer: {
    position: "absolute",
    top: 740,
    right: 230,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    padding: 2,
    borderRadius: 5,
    opacity: 0.8,
  },
});

export default styles;
