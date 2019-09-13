import React, { memo, useState } from "react";
import { StatusBar } from "react-native";
import { mapping, light as lightTheme } from "@eva-design/eva";
import { ApplicationProvider } from "react-native-ui-kitten";
import Navigation from "./navigation";

import Amplify, { Auth } from "aws-amplify";
import awsConfig from "./aws-exports";

import { appsyncFetch, OperationType } from "@potluckmarket/ella";
import { GetUser, GetDoctor } from "./queries";
import { CreateUser, UpdateDoctor, UpdateUser } from "./mutations";
import client from "./client";
import AppContext from "./AppContext";

import { isUserADoctor as determineIfUserIsADoctor } from "./utilities";

import { AppLoading, Notifications } from "expo";

import { useScreens } from "react-native-screens";

import * as Permissions from "expo-permissions";

import { Asset } from "expo-asset";
// import * as Font from "expo-font";

Amplify.configure(awsConfig);
useScreens();

export default memo(function App() {
  const [appReady, setAppReady] = useState(false);
  const [isUserADoctor, setIsUserADoctor] = useState(false);
  const [currentAuthenticatedUser, setCurrentAuthenticatedUser] = useState(
    null
  );
  const [selectedConversation, selectConversation] = useState(null);
  const [countyFilter, setCountyFilter] = useState(null);
  const [appointmentNotifications, setAppointmentNotifications] = useState(0);
  const [messageNotifications, setMessageNotifications] = useState(0);

  async function loadResources() {
    return Promise.all([
      Asset.loadAsync([
        require("./assets/images/stethoscope.png"),
        require("./assets/images/surgeon.png"),
        require("./assets/images/doctor.png"),
        require("./assets/images/medical-history.png"),
        require("./assets/images/map-location.png"),
        require("./assets/images/user.png"),
        require("./assets/images/hourglass.png"),
        require("./assets/images/cancel.png"),
        require("./assets/images/calendar.png"),
        require("./assets/images/exclamation-mark.png"),
        require("./assets/images/filter.png")
      ])
      // Font.loadAsync({
      //   "Material Design Icons": require("./node_modules/react-native-vector-icons/Fonts/MaterialCommunityIcons.ttf"),
      //   "Material Icons": require("./node_modules/react-native-vector-icons/Fonts/MaterialIcons.ttf"),
      //   "Font Awesome": require("./node_modules/react-native-vector-icons/Fonts/FontAwesome.ttf")
      // })
    ]);
  }

  async function initialize(currentUser) {
    let currUser;
    let expoPushToken;
    let isADoctor;

    try {
      if (currentUser) {
        currUser = currentUser;
      } else {
        currUser = await Auth.currentAuthenticatedUser();
      }

      expoPushToken = await registerForPushNotificationsAsync();
      isADoctor = determineIfUserIsADoctor(currUser);
    } catch {}

    try {
      if (currUser) {
        if (isADoctor) {
          setIsUserADoctor(true);

          const { getDoctor } =
            (await appsyncFetch({
              client,
              document: GetDoctor,
              operationType: OperationType.query,
              variables: {
                id: "0046c062-32ed-48e9-81ef-35b62ac54ef2"
              },
              fetchPolicy: "network-only"
            })) || null;

          if (getDoctor) {
            if (!getDoctor.token || getDoctor.token !== expoPushToken) {
              if (expoPushToken) {
                await appsyncFetch({
                  client,
                  document: UpdateDoctor,
                  operationType: OperationType.mutation,
                  variables: {
                    id: getDoctor.id,
                    token: expoPushToken
                  }
                });

                await setCurrentAuthenticatedUser({
                  ...getDoctor,
                  token: expoPushToken
                });
              }
            } else {
              await setCurrentAuthenticatedUser(getDoctor);
            }
          }
        } else {
          const { getUser } =
            (await appsyncFetch({
              client,
              document: GetUser,
              operationType: OperationType.query,
              variables: {
                id: currUser.attributes.sub
              },
              fetchPolicy: "network-only"
            })) || null;

          if (getUser) {
            if (!getUser.token || getUser.token !== expoPushToken) {
              await appsyncFetch({
                client,
                document: UpdateUser,
                operationType: OperationType.mutation,
                variables: {
                  id: getUser.id,
                  token: expoPushToken
                }
              });
              await setCurrentAuthenticatedUser({
                ...getUser,
                token: expoPushToken
              });
            } else {
              await setCurrentAuthenticatedUser(getUser);
            }
          } else {
            const { createUser } =
              (await appsyncFetch({
                client,
                document: CreateUser,
                operationType: OperationType.mutation,
                variables: {
                  id: currUser.attributes.sub,
                  phone: currUser.attributes.phone_number,
                  token: expoPushToken,
                  firstname: currUser.attributes["custom:firstname"],
                  lastname: currUser.attributes["custom:lastname"],
                  email: currUser.attributes["custom:email"]
                }
              })) || null;

            if (createUser) {
              await setCurrentAuthenticatedUser({
                ...createUser,
                token: expoPushToken
              });
            } else {
              await setCurrentAuthenticatedUser({
                id: currUser.attributes.sub,
                phone: currUser.attributes.phone_number,
                firstname: currUser.attributes["custom:firstname"],
                lastname: currUser.attributes["custom:lastname"],
                email: currUser.attributes["custom:email"]
              });
            }
          }
        }
      }
    } catch {
      if (currUser) {
        setCurrentAuthenticatedUser({
          id: currUser.attributes.sub,
          phone: currUser.attributes.phone_number,
          token: expoPushToken,
          firstname: currUser.attributes["custom:firstname"],
          lastname: currUser.attributes["custom:lastname"],
          email: currUser.attributes["custom:email"]
        });
      }
    }
  }

  async function registerForPushNotificationsAsync() {
    const { status: existingStatus } = await Permissions.getAsync(
      Permissions.NOTIFICATIONS
    );
    let finalStatus = existingStatus;

    // only ask if permissions have not already been determined, because
    // iOS won't necessarily prompt the user a second time.
    if (existingStatus !== "granted") {
      // Android remote notification permissions are granted during the app
      // install, so this will only ask on iOS
      const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS);
      finalStatus = status;
    }

    // Stop here if the user did not grant permissions
    if (finalStatus !== "granted") {
      return;
    }

    // Get the token that uniquely identifies this device
    let token = await Notifications.getExpoPushTokenAsync();

    return token;
  }

  if (!appReady) {
    return (
      <AppLoading
        startAsync={async () => {
          await initialize();
          await loadResources();
        }}
        onFinish={() => setAppReady(true)}
      />
    );
  }

  return (
    <ApplicationProvider mapping={mapping} theme={lightTheme}>
      <AppContext.Provider
        value={{
          isUserADoctor,
          currentAuthenticatedUser,
          setCurrentAuthenticatedUser,
          selectedConversation,
          selectConversation,
          countyFilter,
          setCountyFilter,
          appointmentNotifications,
          messageNotifications,
          setAppointmentNotifications,
          setMessageNotifications,
          initializeApp: initialize
        }}
      >
        <StatusBar barStyle="dark-content" />
        <Navigation />
      </AppContext.Provider>
    </ApplicationProvider>
  );
});
