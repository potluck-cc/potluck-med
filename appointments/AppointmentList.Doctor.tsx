import React, { memo, useState, useContext, useEffect } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Text, Avatar } from "react-native-ui-kitten";
import { Agenda } from "react-native-calendars";

import moment from "moment";
import AppContext from "../AppContext";

import client from "../client";
import { appsyncFetch, OperationType, timeFormat } from "@potluckmarket/ella";
import { GetAppointmentsForDoctor } from "../queries";

const CalendarListItem = memo(
  ({ onPress = () => {}, patient = {}, date = "" }) => {
    return (
      <TouchableOpacity style={styles.item} onPress={() => onPress()}>
        <Avatar size="small" source={require("../assets/images/user.png")} />
        <Text category="c1">{`${patient.firstname} ${patient.lastname}`}</Text>
        <Text category="c1">{date}</Text>
      </TouchableOpacity>
    );
  }
);

export default memo(function AppointmentList({ navigation: { navigate } }) {
  const { currentAuthenticatedUser } = useContext(AppContext);
  const [dates, setDates] = useState({});
  const [monthsLoaded, addMonthsLoaded] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(null);

  function timeToString(time) {
    const date = new Date(time);
    return date.toISOString().split("T")[0];
  }

  function getDaysArrayByMonth(month, appointments) {
    let daysInMonth = moment(month).daysInMonth();

    let days = {};

    while (daysInMonth) {
      const current = moment(month).date(daysInMonth);

      const currDateString = timeToString(current);

      const appointmentsArr: [] = appointments.filter(
        appointment =>
          currDateString === moment.unix(appointment.date).format("YYYY-MM-DD")
      );

      if (appointmentsArr.length) {
        days[currDateString] = appointmentsArr;
      } else {
        days[currDateString] = [];
      }

      daysInMonth--;
    }

    return days;
  }

  async function getAppointments(timestamp: number, refresh: boolean = false) {
    const res = await appsyncFetch({
      client,
      document: GetAppointmentsForDoctor,
      operationType: OperationType.query,
      fetchPolicy: refresh ? "network-only" : "cache-first",
      variables: {
        doctor: currentAuthenticatedUser.id,
        from: getFirstOfMonth(timestamp)
          .subtract(3, "day")
          .unix(),
        to: getEndOfMonth(timestamp)
          .add(3, "days")
          .unix()
      }
    });

    if (
      res &&
      res.getAppointmentsForDoctor &&
      res.getAppointmentsForDoctor.items
    ) {
      return res.getAppointmentsForDoctor.items;
    } else {
      return [];
    }
  }

  function loadAppointments(timestamp, appointments) {
    const items = getDaysArrayByMonth(timestamp, appointments);
    setDates(currDates => ({ ...currDates, ...items }));
  }

  function getEndOfMonth(date) {
    return moment(date).endOf("month");
  }

  function getFirstOfMonth(date) {
    return moment(date).startOf("month");
  }

  function getNextMonthFromDate(date) {
    return moment(date).add(1, "month");
  }

  async function loadItems({
    timestamp,
    refresh
  }: {
    timestamp: number;
    refresh?: boolean;
  }) {
    if (refresh) {
      const appointments = await getAppointments(timestamp, refresh);
      return loadAppointments(getEndOfMonth(timestamp), appointments);
    }

    setCurrentMonth(timestamp);

    if (!monthsLoaded.includes(timestamp)) {
      const appointments = await getAppointments(timestamp);

      loadAppointments(getEndOfMonth(timestamp), appointments);

      addMonthsLoaded([...monthsLoaded, timestamp]);
    }
  }

  function fetchNextMonthsApointments({ timestamp }) {
    setCurrentMonth(timestamp);

    const firstDayOfNextMonth = getEndOfMonth(
      getNextMonthFromDate(timestamp)
    ).valueOf();

    if (!monthsLoaded.includes(firstDayOfNextMonth)) {
      loadItems({ timestamp: firstDayOfNextMonth });
    }
  }

  function renderItem(item) {
    return (
      <CalendarListItem
        patient={item.patient}
        date={moment.unix(item.date).format(timeFormat)}
        onPress={() => {
          navigate("Appointment", {
            appointment: item
          });
        }}
      />
    );
  }

  function renderEmptyDate() {
    return <View style={styles.emptyDate} />;
  }

  function rowHasChanged(r1, r2) {
    if (r1 && r1) {
      return r1.id === r2.id;
    } else {
      return false;
    }
  }

  return (
    <Agenda
      items={dates}
      loadItemsForMonth={loadItems}
      renderItem={renderItem}
      renderEmptyDate={renderEmptyDate}
      onDayChange={fetchNextMonthsApointments}
      rowHasChanged={rowHasChanged}
      onRefresh={() => loadItems({ timestamp: currentMonth, refresh: true })}
    />
  );
});

const styles = StyleSheet.create({
  item: {
    backgroundColor: "white",
    flex: 1,
    borderRadius: 5,
    padding: 10,
    marginRight: 10,
    marginTop: 17,
    alignItems: "center",
    justifyContent: "space-around",
    flexDirection: "row",
    height: 50
  },
  emptyDate: {
    height: 15,
    flex: 1,
    paddingTop: 30
  }
});
