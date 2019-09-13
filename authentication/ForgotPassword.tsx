import React, { useEffect, memo } from "react";
import { View, ActivityIndicator, TouchableOpacity } from "react-native";

import styles from "./defaultStyles";
import { Input, Button, Text } from "react-native-ui-kitten";
import { Icon } from "react-native-elements";

import { useAuth } from "@potluckmarket/ella";
import { Auth } from "aws-amplify";
import { Colors } from "../common";

type Props = {
  navigation: import("react-navigation").NavigationScreenProp<
    import("react-navigation").NavigationState,
    import("react-navigation").NavigationParams
  >;
};

function ForgotPassword({ navigation: { navigate, goBack } }: Props) {
  const {
    handleForgotPasswordRequest,
    loading,
    handleStateChange,
    americanizePhoneNumber,
    username,
    error,
    normalizePhoneStringInput
  } = useAuth(Auth);

  useEffect(() => {
    initialize();
  }, []);

  async function initialize(): Promise<void> {
    const { retrieveData } = await import("@potluckmarket/ella");
    const username = await retrieveData("username");

    if (username) {
      handleStateChange(
        "username",
        typeof username === "string" ? username : ""
      );
    }
  }

  return (
    <View style={styles.container}>
      <Input
        size="large"
        label="Phone Number"
        onChangeText={text => handleStateChange("username", text)}
        style={styles.input}
        value={username}
        keyboardType="numeric"
        returnKeyType="done"
        icon={({ tintColor }) => {
          return (
            <Icon
              name="cellphone"
              type="material-community"
              color={error ? "red" : tintColor}
              size={30}
            />
          );
        }}
      />

      {loading ? (
        <ActivityIndicator color={Colors.blue} style={styles.loader} />
      ) : (
        <Button
          onPress={() =>
            handleForgotPasswordRequest(
              {
                username: americanizePhoneNumber(
                  normalizePhoneStringInput(username)
                )
              },
              async () => {
                const { storeData } = await import("@potluckmarket/ella");
                await storeData("forgotPassword", "true");
                navigate("Confirm");
              },
              error =>
                handleStateChange(
                  "error",
                  typeof error === "string" ? error : error.message
                )
            )
          }
          style={styles.btn}
          activeOpacity={0.5}
        >
          REQUEST PASSWORD CHANGE
        </Button>
      )}

      <Text style={styles.errorText}>{error}</Text>

      <TouchableOpacity onPress={() => goBack()}>
        <Text>Go Back</Text>
      </TouchableOpacity>
    </View>
  );
}

export default memo(ForgotPassword);
