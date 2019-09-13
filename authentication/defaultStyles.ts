import { StyleSheet } from "react-native";
import { Colors } from "../common";

export default StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingLeft: 25,
    paddingRight: 25,
    backgroundColor: "white"
  },
  input: {
    marginTop: 5,
    marginBottom: 5
  },
  btn: {
    backgroundColor: Colors.blue,
    borderColor: Colors.blue,
    width: 300,
    marginTop: 10
  },
  errorText: {
    color: "red",
    marginTop: 10,
    marginBottom: 10
  },
  loader: {
    paddingTop: 10
  },
  center: {
    alignSelf: "center"
  }
});
