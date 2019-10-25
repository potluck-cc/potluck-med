import React, { memo, useState, useEffect, useContext } from "react";
import AppContext from "appcontext";

import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Dimensions,
  ImageBackground,
  Alert,
  ActivityIndicator
} from "react-native";

import {
  Avatar,
  Input,
  Toggle,
  Text,
  Layout,
  Button,
  CheckBox
} from "react-native-ui-kitten";
import { AvoidKeyboard, Colors } from "common";

import * as ImagePicker from "expo-image-picker";
import * as Permissions from "expo-permissions";
import Constants from "expo-constants";

import { Storage } from "aws-amplify";

import { appsyncFetch, OperationType, useForm } from "@potluckmarket/ella";
import { UpdateDoctor } from "mutations";
import client from "client";

import { getPublicBucketLink } from "common";

const { width, height } = Dimensions.get("window");

export default memo(function Settings() {
  const { currentAuthenticatedUser } = useContext(AppContext);

  const [submitting, setSubmitting] = useState(false);

  const [performingStorageOperation, setPerformingStorageOperation] = useState(
    false
  );

  const [recentlyUploadedImage, setRecentlyUploadedImage] = useState(null);

  const fields = [
    {
      type: "text",
      fieldName: "image",
      value: null,
      required: true,
      error: false
    },
    {
      type: "text",
      fieldName: "phone",
      value: "",
      required: true,
      error: false
    },
    {
      type: "text",
      fieldName: "bio",
      value: "",
      required: true,
      error: false
    },
    {
      type: "text",
      fieldName: "receiveChats",
      value: false,
      required: true,
      error: false
    },
    {
      type: "text",
      fieldName: "firstVisit",
      value: "",
      required: true,
      error: false
    },
    {
      type: "text",
      fieldName: "followUp",
      value: "",
      required: true,
      error: false
    },
    {
      type: "text",
      fieldName: "renewal",
      value: "",
      required: true,
      error: false
    },
    {
      type: "text",
      fieldName: "bookingFee",
      value: "",
      required: true,
      error: false
    },
    {
      type: "text",
      fieldName: "insuranceAccepted",
      value: false,
      required: true,
      error: false
    },
    {
      type: "text",
      fieldName: "visitLength",
      value: "",
      required: true,
      error: false
    }
  ];

  const { updateFieldByName, generateFieldValues } = useForm(fields);

  const {
    phone,
    bio,
    receiveChats,
    image,
    firstVisit,
    followUp,
    renewal,
    bookingFee,
    insuranceAccepted,
    visitLength
  } = generateFieldValues();

  useEffect(() => {
    initialize();
  }, []);

  async function initialize() {
    fields.forEach(field => {
      updateFieldByName(
        field.fieldName,
        currentAuthenticatedUser[field.fieldName]
      );
    });
  }

  async function getCameraPermissions(): Promise<string> {
    if (Constants.platform.ios) {
      const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL);
      return status;
    }
  }

  async function pickImage(): Promise<void> {
    setPerformingStorageOperation(true);

    const status = await getCameraPermissions();
    if (status !== "granted") {
      setPerformingStorageOperation(false);
      return Alert.alert(
        "You need provide access to your camera roll in order to upload an image!"
      );
    } else {
      const pickerResult = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0,
        exif: true,
        base64: true
      });

      if (!pickerResult.cancelled) {
        const imageName = pickerResult.uri.replace(/^.*[\\\/]/, "");
        const access = { level: "public", contentType: "image/jpeg" };
        const imageData = await fetch(pickerResult.uri);
        const blobData = await imageData.blob();

        await Storage.put(imageName, blobData, access);

        const newImage = getPublicBucketLink(imageName);

        await appsyncFetch({
          client,
          operationType: OperationType.mutation,
          document: UpdateDoctor,
          variables: {
            id: currentAuthenticatedUser.id,
            image: newImage
          }
        });

        setRecentlyUploadedImage(newImage);
      }
    }
    setPerformingStorageOperation(false);
  }

  function getKeyboardOffset(height: number): number {
    return Platform.select({
      ios: height / 2,
      android: height / 2
    });
  }

  async function updateDoctor() {
    const res = await appsyncFetch({
      client,
      document: UpdateDoctor,
      operationType: OperationType.mutation,
      variables: {
        id: currentAuthenticatedUser.id,
        phone,
        bio,
        receiveChats,
        image,
        firstVisit,
        followUp,
        renewal,
        bookingFee,
        insuranceAccepted,
        visitLength
      }
    });

    console.log(res);
  }

  async function submit() {
    setSubmitting(true);
    await updateDoctor();
    setSubmitting(false);
  }

  if (Platform.OS === "web") {
    return (
      <Layout style={styles.container}>
        <TouchableOpacity style={styles.avatarContainer}>
          <Avatar size="giant" source={require("assets/images/user.png")} />
        </TouchableOpacity>

        <Input
          size="large"
          label="Name"
          value="Harmony Walton"
          style={styles.input}
          returnKeyType="done"
          returnKeyLabel="save"
        />

        <Input
          size="large"
          label="Specialty"
          value="Ophthalmology"
          style={styles.input}
          returnKeyType="done"
          returnKeyLabel="save"
        />
        <Input
          size="large"
          label="Address"
          value="225 Sunset Road Willingboro, NJ 08046"
          style={styles.input}
          returnKeyType="done"
          returnKeyLabel="save"
        />

        <Input
          size="large"
          label="Phone Number"
          value="(609) 877-2800"
          style={styles.input}
          returnKeyType="done"
          returnKeyLabel="save"
        />

        <View style={styles.toggleContainer}>
          <Text category="s1" style={styles.toggleText}>
            Receive Chats
          </Text>

          <Toggle
            checked={receiveChats}
            onChange={() => updateFieldByName("receiveChats", !receiveChats)}
          />
        </View>
      </Layout>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Layout style={styles.layout}>
        <AvoidKeyboard autoDismiss={false} offset={getKeyboardOffset}>
          <TouchableOpacity
            style={styles.avatarContainer}
            onPress={() => pickImage()}
            disabled={performingStorageOperation}
          >
            {performingStorageOperation ? (
              <View
                style={{
                  width: width - 50,
                  height: height / 2,
                  justifyContent: "center",
                  alignItems: "center"
                }}
              >
                <ActivityIndicator size="small" color={Colors.blue} />
              </View>
            ) : (
              <ImageBackground
                source={
                  recentlyUploadedImage
                    ? { uri: recentlyUploadedImage }
                    : image
                    ? { uri: image }
                    : require("assets/images/surgeon.png")
                }
                resizeMode="contain"
                style={{ width: width - 50, height: height / 2 }}
              />
            )}
          </TouchableOpacity>
          <Input
            size="large"
            label="Phone Number"
            value={phone}
            onChangeText={text => updateFieldByName("phone", text)}
            style={styles.input}
            returnKeyType="done"
            returnKeyLabel="save"
          />

          <Input
            size="large"
            label="First Visit"
            value={firstVisit}
            onChangeText={text => updateFieldByName("firstVisit", text)}
            keyboardType="numeric"
            style={styles.input}
            returnKeyType="done"
            returnKeyLabel="save"
          />

          <Input
            size="large"
            label="Follow Up Visit"
            value={followUp}
            onChangeText={text => updateFieldByName("followUp", text)}
            keyboardType="numeric"
            style={styles.input}
            returnKeyType="done"
            returnKeyLabel="save"
          />

          <Input
            size="large"
            label="Renewal"
            value={renewal}
            onChangeText={text => updateFieldByName("renewal", text)}
            keyboardType="numeric"
            style={styles.input}
            returnKeyType="done"
            returnKeyLabel="save"
          />

          <Input
            size="large"
            label="Booking Fee"
            value={bookingFee}
            onChangeText={text => updateFieldByName("bookingFee", text)}
            keyboardType="numeric"
            style={styles.input}
            returnKeyType="done"
            returnKeyLabel="save"
          />

          <Input
            size="large"
            label="Visit Length (in minutes)"
            value={visitLength}
            onChangeText={text => updateFieldByName("visitLength", text)}
            keyboardType="numeric"
            style={styles.input}
            returnKeyType="done"
            returnKeyLabel="save"
          />

          <Input
            label="Bio"
            value={bio}
            onChangeText={text => updateFieldByName("bio", text)}
            style={styles.input}
            multiline
          />
        </AvoidKeyboard>

        <View style={styles.toggleContainer}>
          <Text category="s1" style={styles.toggleText}>
            Insurance Accepted
          </Text>

          <CheckBox
            checked={insuranceAccepted}
            status="success"
            onChange={() =>
              updateFieldByName("insuranceAccepted", !insuranceAccepted)
            }
          />
        </View>

        <View style={styles.toggleContainer}>
          <Text category="s1" style={styles.toggleText}>
            Receive Chats
          </Text>

          <Toggle
            checked={receiveChats}
            status="success"
            onChange={() => updateFieldByName("receiveChats", !receiveChats)}
          />
        </View>

        {submitting ? (
          <ActivityIndicator size="small" color={Colors.blue} />
        ) : (
          <Button
            style={styles.btn}
            activeOpacity={0.8}
            onPress={() => submit()}
          >
            SAVE
          </Button>
        )}
      </Layout>
    </ScrollView>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  layout: {
    paddingLeft: 25,
    paddingRight: 25,
    marginBottom: 15
  },
  avatarContainer: {
    alignSelf: "center",
    padding: 15
  },
  btn: {
    backgroundColor: Colors.blue,
    borderColor: Colors.blue
  },
  input: {
    marginTop: 10
  },
  toggleContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 15,
    marginBottom: 15
  },
  toggleText: {
    paddingRight: 10
  }
});
