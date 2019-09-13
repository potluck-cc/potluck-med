import React, { memo, useEffect, useState, useContext } from "react";
import { View, ActivityIndicator, Platform } from "react-native";

import styles from "./defaultStyles";
import { Input, Button, Text } from "react-native-ui-kitten";
import { Icon } from "react-native-elements";

import { useAuth, useForm } from "@potluckmarket/ella";
import { UpdateUser } from "../mutations";
import { Auth } from "aws-amplify";
import client from "../client";
import AppContext from "../AppContext";
import { AvoidKeyboard, Colors } from "../common";

type Props = {
  navigation: import("react-navigation").NavigationScreenProp<
    import("react-navigation").NavigationState,
    import("react-navigation").NavigationParams
  >;
};

function ChangeUsername({ navigation: { navigate } }: Props) {
  const { currentAuthenticatedUser, setCurrentAuthenticatedUser } = useContext(
    AppContext
  );

  const { loading, error, handleChangeAttribute, handleStateChange } = useAuth(
    Auth
  );

  const fields = [
    {
      type: "text",
      fieldName: "firstname",
      value: null,
      required: true,
      error: false
    },
    {
      type: "text",
      fieldName: "lastname",
      value: "",
      required: true,
      error: false
    },
    {
      type: "text",
      fieldName: "email",
      value: "",
      required: true,
      error: false
    }
  ];

  const {
    generateFieldValues,
    updateFieldByName,
    areRequiredFieldsDirty
  } = useForm(fields);

  const { firstname, lastname, email } = generateFieldValues();

  const [requiredError, setRequiredError] = useState(false);

  useEffect(() => {
    initialize();
  }, []);

  async function initialize(): Promise<void> {
    fields.forEach(field => {
      updateFieldByName(
        field.fieldName,
        currentAuthenticatedUser[field.fieldName]
      );
    });
  }

  async function onSubmit() {
    if (!areRequiredFieldsDirty()) {
      const user = await Auth.currentAuthenticatedUser();

      handleChangeAttribute(
        {
          attributes: {
            "custom:email": email.toLowerCase(),
            "custom:firstname": firstname,
            "custom:lastname": lastname
          },
          user
        },
        async () => {
          const { appsyncFetch, OperationType } = await import(
            "@potluckmarket/ella"
          );

          const { updateUser } = await appsyncFetch({
            client,
            operationType: OperationType.mutation,
            document: UpdateUser,
            variables: {
              id: currentAuthenticatedUser.id,
              email: email.toLowerCase(),
              firstname,
              lastname
            }
          });

          if (updateUser) {
            setCurrentAuthenticatedUser(updateUser);
          }
        },
        error => handleStateChange("error", error)
      );

      setRequiredError(false);
    } else {
      setRequiredError(true);
    }
  }

  function getKeyboardOffset(height: number): number {
    return Platform.select({
      ios: height / 2.3,
      android: height / 2.3
    });
  }

  return (
    <AvoidKeyboard autoDismiss={false} offset={getKeyboardOffset}>
      <View style={styles.container}>
        <Input
          size="large"
          label="Email"
          onChangeText={text => updateFieldByName("email", text)}
          value={email}
          style={styles.input}
          returnKeyType="done"
          icon={({ tintColor }) => (
            <Icon
              name="at"
              type="material-community"
              color={error ? "red" : requiredError ? "red" : tintColor}
              size={30}
            />
          )}
        />

        <Input
          size="large"
          label="First Name"
          onChangeText={text => updateFieldByName("firstname", text)}
          value={firstname}
          style={styles.input}
          returnKeyType="done"
          icon={({ tintColor }) => (
            <Icon
              name="format-color-text"
              type="material-community"
              color={error ? "red" : requiredError ? "red" : tintColor}
              size={30}
            />
          )}
        />
        <Input
          size="large"
          label="Last Name"
          onChangeText={text => updateFieldByName("lastname", text)}
          value={lastname}
          style={styles.input}
          returnKeyType="done"
          icon={({ tintColor }) => (
            <Icon
              name="format-color-text"
              type="material-community"
              color={error ? "red" : requiredError ? "red" : tintColor}
              size={30}
            />
          )}
        />

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        {loading ? (
          <ActivityIndicator size="small" color={Colors.blue} />
        ) : (
          <Button
            onPress={() => onSubmit()}
            style={styles.btn}
            activeOpacity={0.5}
          >
            SAVE
          </Button>
        )}
      </View>
    </AvoidKeyboard>
  );
}

export default memo(ChangeUsername);
