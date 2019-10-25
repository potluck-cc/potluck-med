import React, { memo } from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import { Text } from "react-native-ui-kitten";
import { Colors } from "common";

export default memo(function ChatMessage({
  message,
  orientation
}: {
  message: string;
  orientation: "right" | "left";
}) {
  if (orientation === "left") {
    return (
      <View style={styles.cloudContainer}>
        <View style={[styles.triangle, styles.triangleLeft]} />
        <View style={[styles.cloud, styles.cloudLeft]}>
          <Text style={styles.messageLabelLeft}>{message}</Text>
        </View>
      </View>
    );
  } else {
    return (
      <View style={[styles.cloudContainer, { alignSelf: "flex-end" }]}>
        <View style={[styles.cloud, styles.cloudRight]}>
          <Text style={styles.messageLabelRight}>{message}</Text>
        </View>
        <View style={[styles.triangle, styles.triangleRight]} />
      </View>
    );
  }
});

const styles = StyleSheet.create({
  triangle: {
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderBottomWidth: 15,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    backgroundColor: "transparent"
  },
  triangleLeft: {
    transform: [{ rotate: "-90deg" }],
    borderBottomColor: Colors.gray
  },
  triangleRight: {
    transform: [{ rotate: "90deg" }],
    borderBottomColor: Colors.blue
  },
  cloudContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 12
  },
  dateLabel: {},
  cloud: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 8,
    maxWidth: Dimensions.get("window").width - 120
  },
  cloudLeft: {
    left: -3,
    backgroundColor: Colors.gray,
    marginRight: 16
  },
  cloudRight: {
    left: 3,
    backgroundColor: Colors.blue,
    marginLeft: 16
  },
  messageLabelLeft: {
    color: "black"
  },
  messageLabelRight: {
    color: "white"
  }
});
