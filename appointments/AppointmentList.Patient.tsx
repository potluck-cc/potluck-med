import React, { memo, useEffect, useState, useContext } from "react";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  ActivityIndicator,
  ImageBackground,
  ScrollView,
  RefreshControl
} from "react-native";

import AppContext from "../AppContext";

import client from "../client";
import {
  useLazyAppSyncQuery,
  OperationType,
  dateFormat
} from "@potluckmarket/ella";
import { GetAppointmentsForPatient } from "../queries";

import { List, Layout, Text, Avatar } from "react-native-ui-kitten";

import moment from "moment";
import { Colors, Dimensions } from "../common";

export default memo(function AppointmentListPatient({
  navigation: { navigate }
}) {
  const { currentAuthenticatedUser } = useContext(AppContext);

  const [res, loading, fetchAppointments] = useLazyAppSyncQuery({
    client,
    document: GetAppointmentsForPatient,
    operationType: OperationType.query
  });

  const [appointments, setAppointments] = useState([]);

  const [refetching, setRefetching] = useState(false);

  useEffect(() => {
    initialize();
  }, []);

  useEffect(() => {
    if (
      res &&
      res.getAppointmentsForPatient &&
      res.getAppointmentsForPatient.items.length
    )
      setAppointments(res.getAppointmentsForPatient.items);
  }, [res]);

  async function initialize() {
    fetchAppointments({
      patient: currentAuthenticatedUser.id
    });
  }

  function renderAppointmentListItem({ item }) {
    const {
      date,
      doctor: { name, image }
    } = item;
    return (
      <TouchableOpacity
        style={styles.item}
        onPress={() =>
          navigate("Appointment", {
            appointment: item,
            setAppointments
          })
        }
      >
        <Avatar
          size="small"
          source={
            image ? { uri: image } : require("../assets/images/stethoscope.png")
          }
        />
        <Text category="c1">{name}</Text>
        <Text category="c1">{moment.unix(date).format(dateFormat)}</Text>
      </TouchableOpacity>
    );
  }

  if (!appointments.length && loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="small" color={Colors.blue} />
      </View>
    );
  }

  if (
    !appointments.length &&
    !loading &&
    res &&
    res.getAppointmentsForPatient &&
    !res.getAppointmentsForPatient.items.length
  ) {
    const { width, height } = Dimensions;

    return (
      <ScrollView
        style={[styles.container, styles.noAppointmentsContainer]}
        refreshControl={
          <RefreshControl
            refreshing={refetching}
            onRefresh={async () => {
              setRefetching(true);
              await initialize();
              setRefetching(false);
            }}
          />
        }
      >
        <ImageBackground
          source={require("../assets/images/medical-history.png")}
          style={{ width, height: height / 2 }}
          resizeMode="contain"
        />

        <Text category="s1" style={styles.noAppointmentsText}>
          You don't have any appointments yet!
        </Text>
      </ScrollView>
    );
  }

  return (
    <Layout style={styles.container}>
      <List
        data={appointments}
        renderItem={renderAppointmentListItem}
        refreshing={refetching}
        onRefresh={async () => {
          setRefetching(true);
          await initialize();
          setRefetching(false);
        }}
        onEndReached={() => {
          if (
            res &&
            res.getAppointmentsForPatient &&
            res.getAppointmentsForPatient.nextToken
          ) {
            fetchAppointments({
              patient: currentAuthenticatedUser.id,
              nextToken: res.getAppointmentsForPatient.nextToken
            });
          }
        }}
        ListFooterComponent={() => {
          if (loading) {
            return (
              <View style={styles.loader}>
                <ActivityIndicator size="small" color={Colors.blue} />
              </View>
            );
          } else {
            return null;
          }
        }}
      />
    </Layout>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20
  },
  item: {
    backgroundColor: "white",
    flex: 1,
    borderRadius: 5,
    padding: 10,
    alignItems: "center",
    justifyContent: "space-around",
    flexDirection: "row",
    height: 70,
    borderBottomColor: "#eee",
    borderBottomWidth: 1
  },
  noAppointmentsContainer: {
    paddingTop: 15
  },
  noAppointmentsText: {
    alignSelf: "center",
    paddingTop: 15
  }
});
