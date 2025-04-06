// __mocks__/react-native-webview.js
import React from "react";
import { View } from "react-native";

const WebView = (props) => {
  return <View testID="mock-webview" {...props} />;
};

export default WebView;
