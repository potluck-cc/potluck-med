import React, { memo } from "react";
import { View } from "react-native";
import { Text } from "react-native-ui-kitten";
import styles from "./styles";

export default memo(function AppointmentInformationSection({
  title,
  renderIcon = () => {},
  description,
  subtitle,
  tertiaryText
}) {
  return (
    <View style={styles.container}>
      <View style={styles.block}>
        <Text style={styles.blockHeading} category="h5">
          {title}
        </Text>
        <View style={styles.blockDetailsContainer}>
          {renderIcon()}
          <View>
            <Text category="s1">{description}</Text>
            <Text category="h6">{subtitle}</Text>
            <Text category="h6">{tertiaryText}</Text>
          </View>
        </View>
      </View>
    </View>
  );
});
