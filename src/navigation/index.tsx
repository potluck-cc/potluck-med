import React from "react";
import {
  createDrawerNavigator,
  createStackNavigator,
  createSwitchNavigator,
  createBottomTabNavigator,
  createAppContainer
} from "react-navigation";

import { Icon } from "react-native-elements";
import AppLoading from "./AppLoading";
import { DoctorsList, SingleDoctor } from "patient";
import { Chat, ConversationsList } from "messaging";
import {
  AppointmentListRouter,
  AppointmentListDoctor,
  AppointmentListPatient,
  Appointment
} from "appointments";
import { Settings } from "doctor";
import { Drawer, Topbar } from "layout";
import {
  Signup,
  Signin,
  ForgotPassword,
  Confirm,
  ChangeUsername,
  ChangeAttributes
} from "auth";
import { IntroSlider } from "introduction";
import { Colors } from "common";
import Badge from "./Badge";
import { View } from "react-native";

const AuthStack = createStackNavigator(
  {
    Signin,
    Signup,
    ForgotPassword,
    Confirm
  },
  {
    defaultNavigationOptions: {
      header: null
    }
  }
);

const PatientStack = createStackNavigator(
  {
    DoctorsList,
    SingleDoctor,
    Chat,
    ChangeUsername,
    ForgotPassword,
    Confirm,
    ChangeAttributes
  },
  {
    navigationOptions: ({ navigation }) => {
      const tabBarVisible =
        navigation.state.routes.length === 2 &&
        navigation.state.routes[1].params &&
        navigation.state.routes[1].params.fromPushNotification
          ? false
          : navigation.state.index !== 2;

      return {
        tabBarIcon: ({ focused }) => (
          <Icon
            name="user-md"
            type="font-awesome"
            color={focused ? Colors.blue : Colors.gray}
            size={30}
          />
        ),
        tabBarVisible
      };
    },
    defaultNavigationOptions: {
      header: props => <Topbar {...props} />
    }
  }
);

const DoctorStack = createStackNavigator(
  {
    Settings,
    ChangeUsername,
    ForgotPassword,
    Confirm,
    ChangeAttributes,
    Chat
  },
  {
    navigationOptions: {
      tabBarIcon: ({ focused }) => (
        <Icon
          name="address-card"
          type="font-awesome"
          color={focused ? Colors.blue : Colors.gray}
          size={30}
        />
      )
    },
    defaultNavigationOptions: {
      header: props => <Topbar {...props} />
    }
  }
);

const MessagingStack = createStackNavigator(
  {
    ConversationsList,
    Chat,
    SingleDoctor
  },
  {
    navigationOptions: ({ navigation }) => {
      const tabBarVisible = navigation.state.index !== 1;
      return {
        tabBarIcon: ({ focused }) => (
          <View style={{ flexDirection: "row", position: "relative" }}>
            <Icon
              name="comment"
              type="font-awesome"
              color={focused ? Colors.blue : Colors.gray}
              size={30}
            />
            <Badge message focused={focused} />
          </View>
        ),
        tabBarVisible
      };
    },
    defaultNavigationOptions: {
      header: props => <Topbar {...props} />
    }
  }
);

const AppointmentStack = createStackNavigator(
  {
    AppointmentListRouter,
    AppointmentListDoctor,
    AppointmentListPatient,
    Appointment,
    SingleDoctor,
    Chat
  },
  {
    navigationOptions: ({ navigation }) => {
      const tabBarVisible = navigation.state.index !== 3;

      return {
        tabBarIcon: ({ focused }) => (
          <View style={{ flexDirection: "row", position: "relative" }}>
            <Icon
              name="calendar"
              type="font-awesome"
              color={focused ? Colors.blue : Colors.gray}
              size={30}
            />
            <Badge appointment focused={focused} />
          </View>
        ),
        tabBarVisible
      };
    },
    defaultNavigationOptions: {
      header: props => <Topbar {...props} />
    }
  }
);

const PatientApp = createBottomTabNavigator(
  {
    PatientStack,
    MessagingStack,
    AppointmentStack
  },
  {
    tabBarOptions: {
      showLabel: false,
      style: {
        backgroundColor: "white"
      }
    }
  }
);

const DoctorApp = createBottomTabNavigator(
  {
    DoctorStack,
    MessagingStack,
    AppointmentStack
  },
  {
    tabBarOptions: {
      showLabel: false,
      style: {
        backgroundColor: "white"
      }
    }
  }
);

const PatientAppWithDrawerAndTabs = createDrawerNavigator(
  {
    Main: {
      screen: PatientApp
    }
  },
  {
    contentComponent: props => <Drawer {...props} />
  }
);

const DoctorAppWithDrawerAndTabs = createDrawerNavigator(
  {
    Main: {
      screen: DoctorApp
    }
  },
  {
    contentComponent: props => <Drawer {...props} />
  }
);

export default createAppContainer(
  createSwitchNavigator(
    {
      DoctorApp: DoctorAppWithDrawerAndTabs,
      PatientApp: PatientAppWithDrawerAndTabs,
      Auth: AuthStack,
      IntroSlider,
      AppLoading
    },
    {
      initialRouteName: "AppLoading"
    }
  )
);
