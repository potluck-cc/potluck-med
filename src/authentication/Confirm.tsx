import React, { useEffect, memo, useContext } from "react";
import { View, TouchableOpacity, ActivityIndicator } from "react-native";
import styles from "./defaultStyles";
import { Input, Button, Text } from "react-native-ui-kitten";
import { Icon } from "react-native-elements";
import { useAuth } from "@potluckmarket/ella";
import { Auth } from "aws-amplify";
import client from "client";
import { UpdateDoctor, UpdateUser } from "mutations";
import { isUserADoctor } from "utilities";
import AppContext from "appcontext";
import { Colors } from "common";
// import CreateDriver from "../mutations/CreateDriver";

type Props = {
  navigation: import("react-navigation").NavigationScreenProp<
    import("react-navigation").NavigationState,
    import("react-navigation").NavigationParams
  >;
};

function Confirm({ navigation: { navigate, goBack, getParam } }: Props) {
  const { isUserADoctor, currentAuthenticatedUser } = useContext(AppContext);
  const verifyAttribute = getParam("verifyAttribute", false);

  const {
    loading,
    handleConfirmAccount,
    handleResendConfirmationEmail,
    handleConfirmPasswordChange,
    handleVerifyChangeAttribute,
    username,
    password,
    code,
    error,
    forgotPassword,
    hidePassword,
    handleStateChange,
    americanizePhoneNumber,
    normalizePhoneStringInput
  } = useAuth(Auth);

  useEffect(() => {
    initialize();
  }, []);

  async function initialize(): Promise<void> {
    const { retrieveData } = await import("@potluckmarket/ella");
    const username = await retrieveData("username");
    const forgotPassword = await retrieveData("forgotPassword");

    if (username) {
      handleStateChange(
        "username",
        typeof username === "string" ? username : ""
      );
    }

    if (forgotPassword) {
      handleStateChange(
        "forgotPassword",
        forgotPassword === "true" ? true : false
      );
    }
  }

  async function onSubmit(): Promise<void> {
    if (forgotPassword && !verifyAttribute) {
      handleConfirmPasswordChange(
        {
          username: americanizePhoneNumber(normalizePhoneStringInput(username)),
          password: password,
          code: code
        },
        async () => {
          const { destroyData } = await import("@potluckmarket/ella");
          await destroyData("forgotPassword");
          navigate("Signin");
        },
        error =>
          handleStateChange(
            "error",
            typeof error === "string" ? error : error.message
          )
      );
    } else if (verifyAttribute) {
      handleVerifyChangeAttribute(
        {
          attribute: "phone_number",
          code: code
        },
        async res => {
          const {
            retrieveData,
            destroyData,
            appsyncFetch,
            OperationType
          } = await import("@potluckmarket/ella");

          const changeUsername = await retrieveData("changeUsernameRequested");
          const changeEmail = await retrieveData("changeEmail");

          if (changeUsername) {
            await appsyncFetch({
              client,
              document: isUserADoctor ? UpdateDoctor : UpdateUser,
              operationType: OperationType.mutation,
              variables: {
                id: currentAuthenticatedUser.id,
                phone: changeUsername
              }
            });

            await destroyData("changeUsernameRequested");
          }

          if (changeEmail) {
            await appsyncFetch({
              client,
              document: UpdateUser,
              operationType: OperationType.mutation,
              variables: {
                id: currentAuthenticatedUser.id,
                email: changeEmail
              }
            });
          }

          navigate("Signin");
        },
        error => {
          handleStateChange(
            "error",
            typeof error === "string" ? error : error.message
          );
        }
      );
    } else {
      handleConfirmAccount(
        {
          username: americanizePhoneNumber(normalizePhoneStringInput(username)),
          code: code,
          password: password
        },
        async () => {
          const { destroyData } = await import("@potluckmarket/ella");
          await destroyData("signedUp");
          navigate("AppLoading");
        },
        error =>
          handleStateChange(
            "error",
            typeof error === "string" ? error : error.message
          )
      );
    }
  }

  async function cancelForgotPassword(): Promise<void> {
    const { destroyData } = await import("@potluckmarket/ella");
    await destroyData("requestSent");
    goBack();
  }

  return (
    <View style={styles.container}>
      {!verifyAttribute ? (
        <Input
          size="large"
          label="Phone Number"
          onChangeText={text => handleStateChange("username", text)}
          style={styles.input}
          value={username}
          keyboardType="numeric"
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
      ) : null}

      {forgotPassword ? (
        <Input
          size="large"
          label={verifyAttribute ? "Password" : "New Password"}
          onChangeText={text => handleStateChange("password", text)}
          style={styles.input}
          value={password}
          secureTextEntry={hidePassword}
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
      ) : null}

      <Input
        size="large"
        label="Code"
        onChangeText={text => handleStateChange("code", text)}
        style={styles.input}
        value={code}
        keyboardType="numeric"
        returnKeyType="done"
        icon={({ tintColor }) => (
          <Icon
            name="numeric"
            type="material-community"
            color={error ? "red" : tintColor}
            size={30}
          />
        )}
      />

      {loading ? (
        <ActivityIndicator size="small" color={Colors.blue} />
      ) : (
        <Button
          onPress={() => onSubmit()}
          style={styles.btn}
          activeOpacity={0.5}
        >
          CONFIRM
        </Button>
      )}

      <Text style={styles.errorText}>{error}</Text>

      {forgotPassword && !verifyAttribute ? (
        <TouchableOpacity onPress={() => cancelForgotPassword()}>
          <Text>Cancel Forgot Password Request</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          onPress={() =>
            handleResendConfirmationEmail(
              {
                username: americanizePhoneNumber(
                  normalizePhoneStringInput(username)
                )
              },
              () => {},
              error =>
                handleStateChange(
                  "error",
                  typeof error === "string" ? error : error.message
                )
            )
          }
        >
          <Text>Resend Code</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity onPress={() => navigate("SignIn")}>
        <Text>Sign In</Text>
      </TouchableOpacity>
    </View>
  );
}

export default memo(Confirm);
