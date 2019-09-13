import React, { memo } from "react";
import { View, StyleSheet, Image } from "react-native";
import { Colors, Dimensions } from "../common";
import { Text } from "react-native-ui-kitten";

export default memo(function Directory() {
  return (
    <View style={styles.container}>
      <Image
        source={require("../assets/images/filter.png")}
        style={{ width: Dimensions.width - 40, height: 225 }}
      />
      <Text category="h4" style={styles.text}>
        Filter your search by county
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
