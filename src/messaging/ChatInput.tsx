import React, { memo } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Input } from "react-native-ui-kitten";
import { Icon } from "react-native-elements";
import { Colors } from "common";

export default memo(function ChatInput({
  setText = () => {},
  onSubmit = () => {},
  text = ""
}) {
  return (
    <View style={styles.container}>
      {/* <TouchableOpacity>
        <Icon name="camera" type="font-awesome" color="blue" size={25} />
      </TouchableOpacity> */}
      <Input
        style={styles.chatTextInput}
        size="medium"
        value={text}
        multiline
        onChangeText={text => setText(text)}
      />
      <TouchableOpacity onPress={() => onSubmit()}>
        <Icon
          name="paper-plane"
          type="font-awesome"
          color={Colors.blue}
          size={25}
        />
      </TouchableOpacity>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  chatTextInput: {
    flex: 1,
    marginHorizontal: 8
  }
});
