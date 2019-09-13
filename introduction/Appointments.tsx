import React, { memo } from "react";
import { View, StyleSheet, Image } from "react-native";
import { Text } from "react-native-ui-kitten";
import { Colors, Dimensions } from "../common";

export default memo(function Appointments() {
  return (
    <View style={styles.container}>
      <Image
        source={require("../assets/images/medical-history.png")}
        style={{ width: Dimensions.width - 50, height: 350 }}
        resizeMode="contain"
      />
      <Text category="h4" style={styles.text}>
        Schedule appointments
      </Text>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.silver
  },
  text: {
    textAlign: "center",
    marginBottom: 5,
    padding: 25
  }
});
