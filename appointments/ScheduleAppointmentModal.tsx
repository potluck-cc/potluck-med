import React, { memo, useState, useContext } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Platform
} from "react-native";
import Modal from "react-native-modalbox";

import { Layout, Avatar, Button } from "react-native-ui-kitten";
import { Icon } from "react-native-elements";

import AppointmentInformationSection from "./AppointmentInformationSection";

import moment from "moment";
import {
  dateFormat,
  timeFormat,
  appsyncFetch,
  OperationType,
  createTimestamp
} from "@potluckmarket/ella";
import DateTimePicker from "react-native-modal-datetime-picker";
import client from "../client";
import { CreateAppointment } from "../mutations";
import { Colors, sendPushNotification, isIphoneXorAbove } from "../common";
import AppContext from "../AppContext";
import { Analytics } from "aws-amplify";

export default memo(function ScheduleAppointmentModal({
  isOpen = false,
  closeModal = () => {},
  patient = {},
  doctorId
}) {
  const { currentAuthenticatedUser } = useContext(AppContext);
  const [datetime, setDatetime] = useState(moment());
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  function handleDatePicked(date) {
    setDatetime(date);
    setIsDatePickerOpen(false);
  }

  async function createAppointment() {
    const timestamp = createTimestamp();

    const { createAppointment } =
      (await appsyncFetch({
        client,
        document: CreateAppointment,
        operationType: OperationType.mutation,
        variables: {
          doctor: doctorId,
          patient: patient.id,
          createdAt: timestamp,
          updatedAt: timestamp,
          status: "pending",
          date: moment(datetime).unix()
        }
      })) || null;

    return createAppointment;
  }

  async function submitAppointment() {
    setSubmitting(true);
    const appointment = await createAppointment();

    if (appointment) {
      Analytics.record({
        name: "appointmentScheduled",
        attributes: {
          appointmentId: appointment.id,
          doctorId: currentAuthenticatedUser.id,
          patientId: patient.id
        }
      });

      if (patient.token) {
        await sendPushNotification([
          {
            pushToken: patient.token,
            message: `${currentAuthenticatedUser.name} has scheduled an appointment with you.`,
            data: {
              screen: "Appointment",
              appointmentId: appointment.id
            }
          }
        ]);
      }
    }

    setSubmitting(false);
    closeModal();
  }

  return (
    <Modal
      isOpen={isOpen}
      onClosed={closeModal}
      coverScreen
      swipeToClose={false}
    >
      <Layout style={styles.container}>
        <TouchableOpacity onPress={closeModal} style={styles.closeContainer}>
          <Icon
            size={30}
            color="black"
            name="close"
            type="material-community"
          />
        </TouchableOpacity>

        <ScrollView>
          <AppointmentInformationSection
            renderIcon={() => (
              <Avatar
                style={{ marginRight: 15 }}
                size="small"
                source={require("../assets/images/user.png")}
              />
            )}
            title="PATIENT"
            description={`${patient && patient.firstname} ${patient &&
              patient.lastname}`}
            subtitle={patient && patient.phone}
            tertiaryText={patient && patient.email}
          />

          <TouchableOpacity
            onPress={() => setIsDatePickerOpen(!isDatePickerOpen)}
          >
            <AppointmentInformationSection
              renderIcon={() => (
                <Avatar
                  source={require("../assets/images/calendar.png")}
                  size="small"
                  shape="square"
                  style={{ marginRight: 15 }}
                />
              )}
              title="DATE & TIME"
              description={moment(datetime).format(dateFormat)}
              subtitle={moment(datetime).format(timeFormat)}
            />

            <DateTimePicker
              isVisible={isDatePickerOpen}
              onConfirm={handleDatePicked}
              onCancel={() => setIsDatePickerOpen(false)}
              is24Hour={false}
              mode="datetime"
            />
          </TouchableOpacity>

          {submitting ? (
            <ActivityIndicator size="small" color={Colors.blue} />
          ) : (
            <Button
              onPress={submitAppointment}
              activeOpacity={0.8}
              style={styles.btn}
            >
              Schedule Appointment
            </Button>
          )}
        </ScrollView>
      </Layout>
    </Modal>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  closeContainer: {
    alignSelf: "flex-end",
    marginLeft: 15,
    marginRight: 15,
    marginTop: Platform.select({
      android: 15,
      ios: isIphoneXorAbove() ? 30 : 25
    })
  },
  btn: {
    margin: 25,
    backgroundColor: Colors.blue,
    borderColor: Colors.blue
  }
});
