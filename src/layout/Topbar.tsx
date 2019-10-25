import React, { memo, Fragment, useState, useContext, useEffect } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  View,
  Platform,
  StatusBar
} from "react-native";
import { TopNavigation, Avatar } from "react-native-ui-kitten";
import { Icon } from "react-native-elements";
import AppContext from "appcontext";

import { ScheduleAppointmentModal } from "appointments";
import { DoctorsListFilterModal } from "patient";
import { Colors, isIphoneXorAbove } from "common";

import { Notifications } from "expo";

type Props = {
  navigation: import("react-navigation").NavigationScreenProp<
    import("react-navigation").NavigationState,
    import("react-navigation").NavigationParams
  >;
  authLayout: boolean;
};

const defaultTitle = "Potluck (MED)";

export default memo(function Topbar({
  navigation: { openDrawer, state, goBack, navigate },
  authLayout = false
}: Props) {
  const {
    selectedConversation,
    isUserADoctor,
    currentAuthenticatedUser,
    setCountyFilter,
    countyFilter,
    setAppointmentNotifications,
    setMessageNotifications
  } = useContext(AppContext);

  const hasNavigated: boolean = state.routes.length > 1;
  const [title, setTitle] = useState(defaultTitle);
  const [appointmentPanel, toggleAppointmentPanel] = useState(false);
  const [isChat, setIsChat] = useState(false);
  const [isDoctorsList, setIsDoctorsList] = useState(false);
  const [filtersPanel, toggleFiltersPanel] = useState(false);

  let notificationSubscription;

  function handleNotifications({ origin, data }) {
    if (origin === "selected") {
      if (data.screen === "Chat") {
        navigate(data.screen, {
          conversationId: data.conversationId,
          fromPushNotification: true,
          setIsChat,
          medToken: data.medToken
        });
      } else if (data.screen === "Appointment") {
        navigate(data.screen, {
          appointmentId: data.appointmentId,
          fromPushNotification: true
        });
      }
    } else if (origin === "received") {
      if (data.screen === "Appointment") {
        setAppointmentNotifications(1);
      } else if (data.screen === "Chat") {
        setMessageNotifications(1);
      }
    }
  }

  useEffect(() => {
    notificationSubscription = Notifications.addListener(handleNotifications);
  }, []);

  useEffect(() => {
    determineTitle();
  }, [isChat]);

  useEffect(() => {
    const onAChatScreen: boolean =
      (state.routeName === "PatientStack" && state.index === 2) ||
      (state.routeName === "AppointmentStack" && state.index === 3) ||
      (state.routeName === "MessagingStack" && state.index === 1);

    if (onAChatScreen) {
      setIsChat(true);
    } else {
      setIsChat(false);
      // selectConversation(null);
    }

    if (
      state &&
      state.routeName === "PatientStack" &&
      state.routes[0] &&
      state.routes[0].routeName === "DoctorsList" &&
      state.routes.length < 2
    ) {
      setIsDoctorsList(true);
    } else {
      if (isDoctorsList) {
        setIsDoctorsList(false);
      }
    }
  }, [state]);

  function renderLeftControl() {
    return (
      <Fragment>
        {hasNavigated ? (
          <TouchableOpacity
            onPress={() => goBack(null)}
            style={{ paddingRight: 10 }}
          >
            <Icon name="keyboard-arrow-left" size={30} color="black" />
          </TouchableOpacity>
        ) : null}
        {!authLayout ? (
          <TouchableOpacity onPress={openDrawer}>
            <Icon name="dehaze" size={30} color="black" />
          </TouchableOpacity>
        ) : (
          <View style={{ height: 35 }} />
        )}
      </Fragment>
    );
  }

  function renderRightControl() {
    if (isChat) {
      if (isUserADoctor) {
        return (
          <TouchableOpacity
            onPress={() => toggleAppointmentPanel(!appointmentPanel)}
          >
            <Icon name="calendar" type="font-awesome" />
          </TouchableOpacity>
        );
      } else {
        return (
          <Avatar
            size="small"
            source={
              selectedConversation &&
              selectedConversation.doctor &&
              selectedConversation.doctor.image
                ? { uri: selectedConversation.doctor.image }
                : require("assets/images/stethoscope.png")
            }
          />
        );
      }
    } else if (isDoctorsList) {
      if (!isUserADoctor) {
        return (
          <TouchableOpacity onPress={() => toggleFiltersPanel(true)}>
            <Icon name="sliders" type="font-awesome" />
          </TouchableOpacity>
        );
      } else {
        return null;
      }
    }
  }

  function determineTitle(): void {
    if (selectedConversation && selectedConversation.patient && isUserADoctor) {
      setTitle(
        `${selectedConversation.patient.firstname} ${selectedConversation.patient.lastname}`
      );
    } else if (
      selectedConversation &&
      selectedConversation.doctor &&
      !isUserADoctor
    ) {
      setTitle(selectedConversation.doctor.name);
    } else {
      return setTitle(defaultTitle);
    }
  }

  return (
    <Fragment>
      <TopNavigation
        title={title}
        alignment="center"
        titleStyle={styles.title}
        style={styles.container}
        leftControl={renderLeftControl()}
        rightControls={renderRightControl()}
      />
      {isChat ? (
        <ScheduleAppointmentModal
          isOpen={appointmentPanel}
          closeModal={() => toggleAppointmentPanel(false)}
          patient={selectedConversation && selectedConversation.patient}
          doctorId={currentAuthenticatedUser.id}
        />
      ) : null}

      {isDoctorsList ? (
        <DoctorsListFilterModal
          isOpen={filtersPanel}
          closeModal={() => toggleFiltersPanel(false)}
          setCountyFilter={setCountyFilter}
          countyFilter={countyFilter}
        />
      ) : null}
    </Fragment>
  );
});

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray,
    paddingTop: Platform.select({
      android: StatusBar.currentHeight,
      ios: isIphoneXorAbove() ? 35 : 30
    })
  },
  title: {
    paddingTop: Platform.select({
      android: StatusBar.currentHeight / 2,
      ios: isIphoneXorAbove() ? 30 : 20
    })
  },
  popoverContent: {
    position: "absolute",
    right: -25,
    top: 100,
    backgroundColor: "white"
  }
});
