import React from "react";
import RoomToRoomNavigation from "../../../components/IndoorNavigation/RoomToRoomNavigation";
import { render } from "@testing-library/react-native";

describe("RoomToRoomNavigation", () => {
  it("checks to see if the RoomToRoomNavigation component renders correctly", () => {
    const { getByText } = render(<RoomToRoomNavigation />);
    expect(getByText("Room to Room Navigation Component")).toBeTruthy();
  });
});
