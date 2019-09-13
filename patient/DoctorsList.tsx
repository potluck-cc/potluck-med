import React, { memo, useEffect, useContext, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { Layout, List, ListItem, Avatar, Text } from "react-native-ui-kitten";

import client from "../client";
import { ListDoctors, ListDoctorsByCounty } from "../queries";
import { useLazyAppSyncQuery, OperationType } from "@potluckmarket/ella";
import AppContext from "../AppContext";
import { Colors } from "../common";

const DoctorListItem = memo(({ doctor, onPress }) => (
  <ListItem
    title={doctor.name}
    description={doctor.specialty}
    onPress={() => onPress()}
    style={styles.listItem}
  >
    <Avatar
      size="small"
      source={
        doctor.image
          ? { uri: doctor.image }
          : require("../assets/images/stethoscope.png")
      }
      style={{ backgroundColor: null }}
    />
    <View style={{ paddingLeft: 20 }}>
      <Text category="s1">{doctor.name}</Text>
      <Text category="c1">{doctor.specialty}</Text>
    </View>
  </ListItem>
));

export default memo(function DoctorsList({ navigation: { navigate } }) {
  const { countyFilter } = useContext(AppContext);

  const [res, loading, fetchDoctors] = useLazyAppSyncQuery({
    client,
    operationType: OperationType.query,
    document: countyFilter ? ListDoctorsByCounty : ListDoctors
  });

  const [doctors, setDoctors] = useState([]);

  useEffect(() => {
    setDoctors([]);

    fetchDoctors({
      county: countyFilter
    });
  }, [countyFilter]);

  useEffect(() => {
    initialize();
  }, []);

  useEffect(() => {
    if (res && res.listDoctors && res.listDoctors.items) {
      setDoctors(currDoctors => [...currDoctors, ...res.listDoctors.items]);
    }
  }, [res]);

  function initialize(): void {
    fetchDoctors();
  }

  function renderItem({ item }) {
    return (
      <DoctorListItem
        doctor={item}
        onPress={() => {
          navigate("SingleDoctor", {
            doctor: item
          });
        }}
      />
    );
  }

  if (!res && loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="small" color={Colors.blue} />
      </View>
    );
  }

  return (
    <Layout>
      <List
        data={doctors}
        renderItem={renderItem}
        initialNumToRender={20}
        ListFooterComponent={() => {
          if (loading) {
            return (
              <Layout style={styles.loader}>
                <ActivityIndicator size="small" color={Colors.blue} />
              </Layout>
            );
          } else {
            return null;
          }
        }}
        onEndReachedThreshold={0.8}
        onEndReached={() => {
          if (res && res.listDoctors && res.listDoctors.nextToken) {
            fetchDoctors({
              nextToken: res.listDoctors.nextToken
            });
          }
        }}
      />
    </Layout>
  );
});

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 20,
    paddingBottom: 20
  },
  listItem: {
    borderBottomColor: Colors.gray,
    borderBottomWidth: 1,
    alignItems: "center",
    justifyContent: "flex-start",
    paddingLeft: 15
  }
});
