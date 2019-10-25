import React, { useEffect, memo, useContext } from "react";
import { View, TouchableOpacity, ActivityIndicator } from "react-native";

import styles from "./defaultStyles";
import { Input, Button, Text } from "react-native-ui-kitten";
import { Icon } from "react-native-elements";

import { useAuth, storeData } from "@potluckmarket/ella";
import { Auth } from "aws-amplify";

import { isUserADoctor } from "utilities";
import { Colors } from "common";
import AppContext from "appcontext";

type Props = {
  navigation: import("react-navigation").NavigationScreenProp<
    import("react-navigation").NavigationState,
    import("react-navigation").NavigationParams
  >;
};

function SignIn({ navigation: { navigate } }: Props) {
  const { initializeApp } = useContext(AppContext);
  const {
    handleLogin,
    loading,
    handleStateChange,
    americanizePhoneNumber,
    username,
    error,
    hidePassword,
    password,
    normalizePhoneStringInput
  } = useAuth(Auth);

  useEffect(() => {
    initialize();
  }, []);

  async function initialize(): Promise<void> {
    const { retrieveData } = await import("@potluckmarket/ella");
    const username = await retrieveData("username");
    if (username) {
      handleStateChange("username", username);
    }
  }

  async function onSignIn(res) {
    const isADoctor: boolean = await isUserADoctor(res);

    if (isADoctor) {
      await storeData("isDoctor", "true");
    }

    const user = {
      ...res.attributes,
      doctor: isADoctor
    };

    await initializeApp(res);

    navigate("AppLoading", {
      user
    });
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
        status={error ? "danger" : null}
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

      <Input
        size="large"
        label="Password"
        onChangeText={text => handleStateChange("password", text)}
        secureTextEntry={hidePassword}
        style={styles.input}
        value={password}
        status={error ? "danger" : null}
        icon={({ tintColor }) => (
          <TouchableOpacity
            onPress={() => handleStateChange("hidePassword", !hidePassword)}
          >
            <Icon
              name={hidePassword ? "eye-off" : "eye"}
              type="material-community"
              color={error ? "red" : tintColor}
              size={25}
            />
          </TouchableOpacity>
        )}
      />

      {loading ? (
        <ActivityIndicator
          size="small"
          color={Colors.blue}
          style={styles.loader}
        />
      ) : (
        <Button
          onPress={async () =>
            await handleLogin(
              {
                username: americanizePhoneNumber(
                  normalizePhoneStringInput(username)
                ),
                password: password
              },
              async res => {
                if (
                  res.challengeName &&
                  res.challengeName === "NEW_PASSWORD_REQUIRED"
                ) {
                  const user = await Auth.completeNewPassword(res, password);
                  await onSignIn(user);
                } else {
                  await onSignIn(res);
                }
              },
              error => {
                if (typeof error === "string") {
                  handleStateChange("error", error);
                } else {
                  handleStateChange("error", error.message);
                }
              }
            )
          }
          style={styles.btn}
          activeOpacity={0.5}
        >
          SIGN IN
        </Button>
      )}

      <Text style={styles.errorText}>{error}</Text>

      <TouchableOpacity onPress={() => navigate("Signup")}>
        <Text>Sign Up</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigate("ForgotPassword")}>
        <Text>Forgot Password</Text>
      </TouchableOpacity>
    </View>
  );
}

export default memo(SignIn);
