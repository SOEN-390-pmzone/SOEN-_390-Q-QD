import React, {useState, useEffect} from "react";
import { render, act } from "@testing-library/react-native";
import TemporaryModal from "../components/temporaryModal"; // Adjust the import path as needed

describe("TemporaryModal", () => {
  
  it("should render the modal with the provided text", () => {
    const { getByText } = render(
      <TemporaryModal text="Hello, World!" modalState = {true} onRequestClose={() =>{}} />,
    );

    // Check if the modal text is rendered
    expect(getByText("Hello, World!")).toBeTruthy();
  });

  
});
