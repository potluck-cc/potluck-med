import React, { memo, useEffect, useContext } from "react";
import {
  SafeAreaView,
  StyleSheet,
  View,
  TouchableOpacity,
  Platform,
  StatusBar
} from "react-native";
import { Text } from "react-native-ui-kitten";
import { Icon } from "react-native-elements";
import { Auth } from "aws-amplify";
import { Colors } from "../common";
import AppContext from "../AppContext";

type Props = {
  navigation: import("react-navigation").NavigationScreenProp<
    import("react-navigation").NavigationState,
    import("react-navigation").NavigationParams
  >;
};

function Settings({ navigation: { navigate } }: Props) {
  const { isUserADoctor } = useContext(AppContext);

  useEffect(() => {
    initialize();
  }, []);

  async function initialize(): Promise<void> {}

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={styles.singleActionContainer}
          onPress={(): void => {
            navigate("ForgotPassword");
          }}
        >
          <Icon name="lock-reset" type="material-community" color="white" />
          <Text style={styles.actionText} category="s1">
            Change Password
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.singleActionContainer}
          onPress={(): void => {
            navigate("ChangeUsername");
          }}
        >
          <Icon
            name="cellphone-settings"
            type="material-community"
            color="white"
          />
          <Text style={styles.actionText} category="s1">
            Change Phone Number
          </Text>
        </TouchableOpacity>

        {!isUserADoctor && (
          <TouchableOpacity
            style={styles.singleActionContainer}
            onPress={(): void => {
              navigate("ChangeAttributes");
            }}
          >
            <Icon
              name="settings-outline"
              type="material-community"
              color="white"
            />
            <Text style={styles.actionText} category="s1">
              Edit Account
            </Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.singleActionContainer}
          onPress={async (): Promise<void> => {
            // await destroyData('doctor');
            await Auth.signOut();
            await navigate("Auth");
          }}
        >
          <Icon name="logout" type="material-community" color="white" />
          <Text style={styles.actionText} category="s1">
            Logout
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.silver,
    marginTop: Platform.select({
      ios: 0,
      android: StatusBar.currentHeight
    })
  },
  avatarContainer: {
    paddingTop: 50,
    alignItems: "center"
  },
  driverName: {
    color: "white",
    paddingTop: 20
  },
  companyName: {
    color: "white",
    paddingTop: 5
  },
  actionsContainer: {
    marginTop: 20
  },
  singleActionContainer: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    padding: 10,
    marginLeft: 30,
    marginRight: 30,
    marginBottom: 8,
    backgroundColor: Colors.darkBlue,
    borderRadius: 5
  },
  actionText: {
    color: "white",
    textAlign: "left",
    paddingLeft: 5
  }
});

export default memo(Settings);
