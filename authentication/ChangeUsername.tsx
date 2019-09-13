import React, { memo, useEffect } from "react";
import { View, ActivityIndicator, Platform } from "react-native";

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

function ChangeUsername({ navigation: { navigate } }: Props) {
  const {
    handleChangeAttribute,
    loading,
    username,
    error,
    handleStateChange,
    normalizePhoneStringInput,
    americanizePhoneNumber
  } = useAuth(Auth);

  useEffect(() => {
    initialize();
  }, []);

  async function initialize(): Promise<void> {
    const { retrieveData } = await import("@potluckmarket/ella");

    const changeUsernameRequested = await retrieveData(
      "changeUsernameRequested"
    );

    if (changeUsernameRequested) {
      navigate("Confirm", {
        verifyAttribute: true
      });
    }
  }

  async function requestChangePhoneNumber(): Promise<void> {
    const { storeData } = await import("@potluckmarket/ella");
    const user = await Auth.currentAuthenticatedUser();

    handleChangeAttribute(
      {
        attributes: {
          phone_number: americanizePhoneNumber(
            normalizePhoneStringInput(username)
          )
        },
        user
      },
      async () => {
        await storeData(
          "changeUsernameRequested",
          `${americanizePhoneNumber(normalizePhoneStringInput(username))}`
        );
        navigate("Confirm", {
          verifyAttribute: true
        });
      },
      error =>
        handleStateChange(
          "error",
          typeof error === "string" ? error : error.message
        )
    );
  }

  return (
    <View style={styles.container}>
      <Input
        size="large"
        label="New Phone Number"
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

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      {loading ? (
        <ActivityIndicator size="small" color={Colors.blue} />
      ) : (
        <Button
          onPress={() => requestChangePhoneNumber()}
          style={[styles.btn, { width: Platform.select({ android: '100%' }) } ]}
          activeOpacity={0.5}
        >
          REQUEST PHONE NUMBER CHANGE
        </Button>
      )}
    </View>
  );
}

export default memo(ChangeUsername);
