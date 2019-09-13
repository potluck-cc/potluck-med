import React, { memo, ReactElement } from "react";
import { View, StyleSheet } from "react-native";
import { Text } from "react-native-ui-kitten";
import { Colors } from "../common";

function Welcome(): ReactElement {
  return (
    <View style={styles.container}>
      <Text style={styles.text} category="h2">
        Welcome to
      </Text>
      <Text style={styles.text} category="h1">
        Potluck (MED)
      </Text>
      <Text style={styles.text}>
        A directory of New Jersey Health Professionals who prescribe medical
        marijuana.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.blue
  },
  text: {
    textAlign: "center",
    marginBottom: 5,
    color: "white"
  }
});

export default memo(Welcome);
