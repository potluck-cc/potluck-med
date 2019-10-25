import { Dimensions as D } from "react-native";

const { width, height } = D.get("window");

export interface Dimensions {
  width: number;
  height: number;
}

export const Dimensions: Dimensions = {
  width,
  height
};
