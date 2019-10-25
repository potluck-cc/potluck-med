import { Platform } from "react-native";
import { Dimensions } from "./dimensions";

export function isIphoneXorAbove() {
  const { width, height } = Dimensions;
  return (
    Platform.OS === "ios" &&
    !Platform.isPad &&
    !Platform.isTVOS &&
    (height === 812 || width === 812 || (height === 896 || width === 896))
  );
}

// based on: https://stackoverflow.com/questions/52519478/react-native-how-to-check-for-iphone-xs-max
