import React, { memo } from "react";
import { View, StyleSheet, Image } from "react-native";
import { Text } from "react-native-ui-kitten";
import { Colors, Dimensions } from "../common";

export default memo(function Messages({ isUserADoctor = false }) {
  return (
    <View style={styles.container}>
      <Image
        source={require("../assets/images/doctor.png")}
        style={{ width: Dimensions.width - 50, height: 350 }}
        resizeMode="contain"
      />
      <Text style={styles.text} category="h4">
        {isUserADoctor
          ? "Chat with patients"
          : "Chat with participating doctors"}
      </Text>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.darkBlue
  },
  text: {
    textAlign: "center",
    marginBottom: 5,
    color: "white",
    padding: 25
  }
});
