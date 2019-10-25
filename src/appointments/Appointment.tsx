import React, { memo, useState, Fragment, useEffect } from "react";
import {
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  View,
  RefreshControl
} from "react-native";
import { Avatar, Button } from "react-native-ui-kitten";
import { TouchableOpacity } from "react-native-gesture-handler";
import AppointmentInformationSection from "./AppointmentInformationSection";
import moment from "moment";
import {
  dateFormat,
  timeFormat,
  appsyncFetch,
  OperationType
} from "@potluckmarket/ella";
import client from "client";
import { UpdateAppointment } from "mutations";
import { GetAppointment } from "queries";
import { Colors } from "common";
import { Analytics } from "aws-amplify";

export default memo(function Appointment({
  navigation: { getParam, navigate }
}) {
  const appointmentFromInitialListQuery = getParam("appointment", {});
  const updateAppointmentsList = getParam("setAppointments", null);
  const fromPushNotification = getParam("fromPushNotification", false);
  const appointmentId = getParam("appointmentId", null);

  const [appointment, setAppointment] = useState(
    appointmentFromInitialListQuery
  );

  const { patient, date, status, id, doctor } = appointment;

  const [appointmentStatus, updateAppointmentStatus] = useState(status);

  const [updating, setUpdating] = useState(false);

  const [loading, setLoading] = useState(false);

  const [refetching, setRefetching] = useState(false);

  useEffect(() => {
    initialize();
  }, []);

  async function initialize(refresh: boolean = false) {
    if (fromPushNotification && appointmentId) {
      setLoading(true);

      const { getAppointment } =
        (await appsyncFetch({
          client,
          document: GetAppointment,
          operationType: OperationType.query,
          variables: {
            id: appointmentId
          },
          fetchPolicy: refresh ? "network-only" : null
        })) || null;

      if (getAppointment) {
        setAppointment(getAppointment);
        updateAppointmentStatus(getAppointment.status);
      }

      setLoading(false);
    }
  }

  function determineStatusMessage(status) {
    switch (status) {
      case "pending":
        if (doctor) {
          return "You need to confirm your appointment.";
        } else {
          return "Awaiting patient confirmation";
        }
      case "confirmed":
        if (doctor) {
          return "You've confirmed your appointment.";
        } else {
          return "Patient has confirmed.";
        }
      case "cancelled":
        return "This appointment has been cancelled.";
      default:
        return "Something went wrong. Try again in a few minutes.";
    }
  }

  function determineStatusIcon(status) {
    switch (status) {
      case "pending":
        return require("assets/images/hourglass.png");
      case "confirmed":
        return require("assets/images/checked.png");
      case "cancelled":
        return require("assets/images/cancel.png");
      default:
        return require("assets/images/exclamation-mark.png");
    }
  }

  function handleAnalytics(status) {
    Analytics.record({
      name: "appointmentUpdated",
      attributes: {
        appointmentId: appointment.id,
        status
      }
    });
  }

  async function updateAppointment(status = "cancelled") {
    setUpdating(true);

    const updatedAppointment = await appsyncFetch({
      client,
      document: UpdateAppointment,
      operationType: OperationType.mutation,
      variables: {
        id,
        status
      }
    });

    if (updatedAppointment && updatedAppointment.updateAppointment) {
      handleAnalytics(status);

      updateAppointmentStatus(updatedAppointment.updateAppointment.status);

      if (updateAppointmentsList) {
        updateAppointmentsList(currAppointments => {
          const newState = [...currAppointments];

          const indexOfUpdatedAppointments: number = newState.findIndex(app => {
            return app.id === updatedAppointment.updateAppointment.id;
          });

          newState[indexOfUpdatedAppointments].status =
            updatedAppointment.updateAppointment.status;

          return newState;
        });
      }
    }

    setUpdating(false);
  }

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="small" color={Colors.blue} />
      </View>
    );
  }

  return (
    <ScrollView
      refreshControl={
        <RefreshControl
          refreshing={refetching}
          onRefresh={async () => {
            setRefetching(true);
            await initialize(true);
            setRefetching(false);
          }}
        />
      }
    >
      {doctor ? (
        <TouchableOpacity
          onPress={() => {
            navigate("SingleDoctor", {
              doctor
            });
          }}
        >
          <AppointmentInformationSection
            renderIcon={() => (
              <Avatar
                style={styles.blockAvatar}
                size="giant"
                source={
                  doctor.image
                    ? { uri: doctor.image }
                    : require("assets/images/stethoscope.png")
                }
              />
            )}
            title="DOCTOR"
            description={doctor.name}
            subtitle={doctor.specialty}
          />
        </TouchableOpacity>
      ) : (
        <AppointmentInformationSection
          renderIcon={() => (
            <Avatar
              style={styles.blockAvatar}
              size="small"
              source={require("assets/images/user.png")}
            />
          )}
          title="PATIENT"
          description={`${patient && patient.firstname} ${patient &&
            patient.lastname}`}
          subtitle={patient && patient.phone}
          tertiaryText={patient && patient.email}
        />
      )}

      <AppointmentInformationSection
        renderIcon={() => (
          <Avatar
            source={require("assets/images/calendar.png")}
            size="small"
            shape="square"
            style={styles.blockAvatar}
          />
        )}
        title="DATE & TIME"
        description={moment.unix(date).format(dateFormat)}
        subtitle={moment.unix(date).format(timeFormat)}
      />

      {doctor ? (
        <AppointmentInformationSection
          renderIcon={() => (
            <Avatar
              source={require("assets/images/map-location.png")}
              size="small"
              style={styles.blockAvatar}
              shape="square"
            />
          )}
          title="LOCATION"
          description={doctor.address}
          subtitle={doctor.phone}
        />
      ) : null}

      <AppointmentInformationSection
        renderIcon={() => (
          <Avatar
            source={determineStatusIcon(status)}
            size="small"
            style={styles.blockAvatar}
          />
        )}
        title="STATUS"
        description={
          appointmentStatus
            ? appointmentStatus.toUpperCase()
            : "Something went wrong!"
        }
        subtitle={determineStatusMessage(appointmentStatus)}
      />

      <View style={styles.btnContainer}>
        {updating ? (
          <ActivityIndicator size="small" />
        ) : (
          <Fragment>
            {status !== "cancelled" && (
              <Button onPress={() => updateAppointment()} status="danger">
                CANCEL
              </Button>
            )}

            {doctor && status !== "confirmed" && (
              <Button
                onPress={() => updateAppointment("confirmed")}
                activeOpacity={0.8}
                style={styles.btn}
              >
                CONFIRM
              </Button>
            )}
          </Fragment>
        )}
      </View>
    </ScrollView>
  );
});

const styles = StyleSheet.create({
  block: {
    padding: 20,
    borderBottomColor: "#ddd",
    borderBottomWidth: 1
  },
  blockDetailsContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 15
  },
  blockHeading: {},
  blockAvatar: {
    marginRight: 15
  },
  btnContainer: {
    margin: 25
  },
  btn: {
    marginTop: 5,
    backgroundColor: Colors.blue,
    borderColor: Colors.blue
  }
});
