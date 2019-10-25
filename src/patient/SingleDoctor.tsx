import React, { memo, Fragment, useContext, useEffect } from "react";
import {
  ScrollView,
  ImageBackground,
  Dimensions,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Platform
} from "react-native";
import { Layout, Text, Button } from "react-native-ui-kitten";
import { Colors } from "common";
import AppContext from "appcontext";
import { Analytics } from "aws-amplify";

const { width, height } = Dimensions.get("window");

const Header = memo(({ doctor = {}, initiateConversation = () => {} }) => (
  <Layout style={styles.headerContainer}>
    <ImageBackground
      source={
        doctor.image
          ? { uri: doctor.image }
          : require("assets/images/surgeon.png")
      }
      style={{ width, height: height / 2 }}
    />
    <Layout style={styles.headerActionContainer}>
      <Layout style={styles.headerSection}>
        <Text category="h5">{doctor.name}</Text>
        <Text category="s1">{doctor.specialty}</Text>
      </Layout>
      <Layout style={styles.headerSection}>
        <Text category="s1">
          {`First Visit: ${
            doctor.firstVisit ? `$${doctor.firstVisit}` : "N/A"
          }`}
        </Text>
        <Text category="s1">
          {`Follow Up: ${doctor.followUp ? `$${doctor.followUp}` : "N/A"}`}
        </Text>
        <Text category="s1">
          {`Renewal: ${doctor.renewal ? `$${doctor.renewal}` : "N/A"}`}
        </Text>
        <Text category="s1">
          {`Booking Fee: ${
            doctor.bookingFee ? `$${doctor.bookingFee}` : "N/A"
          }`}
        </Text>
        <Text category="s1">
          {`Visit Length: ${
            doctor.visitLength ? `${doctor.visitLength} minutes` : "N/A"
          }`}
        </Text>
        <Text category="s1">
          {`Insurance Accepted: ${doctor.insuranceAccpeted ? "Yes" : "No"}`}
        </Text>
      </Layout>
      <Layout style={styles.headerSection}>
        <TouchableOpacity
          onPress={() => {
            if (Platform.OS === "ios") {
              Linking.openURL(
                `http://maps.apple.com/maps?daddr=${doctor.latitude},${doctor.longitude}`
              );
            } else {
              Linking.openURL(
                `http://maps.google.com/maps?daddr=${doctor.latitude},${doctor.longitude}`
              );
            }
          }}
        >
          <Text style={styles.headerText} category="s1">
            {doctor.address}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => Linking.openURL(`tel:${doctor.phone}`)}
        >
          <Text style={styles.headerText} category="s1">
            {doctor.phone}
          </Text>
        </TouchableOpacity>
      </Layout>
      <Layout style={styles.headerSection}>
        <Button
          style={
            doctor.receiveChats ? styles.headerBtn : styles.headerBtnDisabled
          }
          onPress={initiateConversation}
          disabled={!doctor.receiveChats}
          activeOpacity={0.4}
        >
          CHAT NOW
        </Button>
      </Layout>
    </Layout>
  </Layout>
));

export default memo(function SingleDoctor({
  navigation: { getParam, navigate }
}) {
  const { selectConversation, currentAuthenticatedUser } = useContext(
    AppContext
  );
  const doctor = getParam("doctor", null);

  useEffect(() => {
    initialize();
  }, []);

  function initialize() {
    if (doctor) {
      Analytics.record({
        name: "doctorView",
        attributes: { doctorId: doctor.id }
      });
    }
  }

  function initiateConversation() {
    selectConversation({
      doctor: doctor,
      patient: currentAuthenticatedUser
    });

    navigate("Chat", {
      doctor,
      newConversation: true,
      medToken: doctor.medToken
    });
  }

  return (
    <Layout>
      <ScrollView>
        <Header doctor={doctor} initiateConversation={initiateConversation} />
        <Layout style={styles.bioContainer}>
          {doctor.bio && (
            <Fragment>
              <Text style={styles.bioHeader} category="h4">
                About
              </Text>
              <Text style={styles.bioText} category="c1">
                {doctor.bio}
              </Text>
            </Fragment>
          )}
        </Layout>
      </ScrollView>
    </Layout>
  );
});

const styles = StyleSheet.create({
  headerContainer: {
    alignItems: "center",
    justifyContent: "center"
  },
  headerActionContainer: {
    width,
    borderRadius: 25,
    marginTop: -100,
    borderWidth: 1,
    borderColor: Colors.gray,
    justifyContent: "flex-start"
  },
  headerSection: {
    width: "100%",
    borderTopWidth: 1,
    borderTopColor: Colors.gray,
    justifyContent: "center",
    alignItems: "center",
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    minHeight: 80,
    padding: 10
  },
  headerText: {
    textAlign: "center"
  },
  headerBtn: {
    alignSelf: "center",
    backgroundColor: Colors.blue,
    borderColor: Colors.blue
  },
  headerBtnDisabled: {
    alignSelf: "center",
    backgroundColor: Colors.silver,
    borderColor: Colors.silver
  },
  bioContainer: {
    padding: 25
  },
  bioHeader: {
    paddingBottom: 10
  },
  bioText: {}
});
