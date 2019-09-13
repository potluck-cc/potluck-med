import React, { memo, useEffect, useContext, useState, Fragment } from "react";
import {
  StyleSheet,
  ActivityIndicator,
  View,
  ImageBackground,
  ScrollView,
  RefreshControl
} from "react-native";
import { Layout, List, ListItem, Avatar, Text } from "react-native-ui-kitten";
import { Icon } from "react-native-elements";

import client from "../client";
import { ListDoctorConversations, ListUserConversations } from "../queries";
import {
  SubscribeToDoctorConversationUpdates,
  SubscribeToPatientConversationUpdates
} from "../subscriptions";
import {
  useLazyAppSyncQuery,
  OperationType,
  timeFormat,
  appsyncFetch
} from "@potluckmarket/ella";
import moment from "moment";

import AppContext from "../AppContext";

import { Dimensions, Colors } from "../common";

export default memo(function ConversationsList({ navigation: { navigate } }) {
  const {
    isUserADoctor,
    currentAuthenticatedUser,
    selectConversation
  } = useContext(AppContext);

  const [res, loading, fetchConversations] = useLazyAppSyncQuery({
    client,
    document: isUserADoctor ? ListDoctorConversations : ListUserConversations,
    operationType: OperationType.query,
    fetchPolicy: "network-only"
  });

  const [conversations, setConversations] = useState([]);

  const [refetching, setRefetching] = useState(false);

  useEffect(() => {
    initialize();
  }, []);

  useEffect(() => {
    if (isUserADoctor) {
      setConversations(
        res &&
          res.getConversationsFromADoctor &&
          res.getConversationsFromADoctor.items
          ? res.getConversationsFromADoctor.items
          : []
      );
    } else {
      setConversations(
        res &&
          res.getConversationsFromAPatient &&
          res.getConversationsFromAPatient.items
          ? res.getConversationsFromAPatient.items
          : []
      );
    }
  }, [res]);

  function getUserVariables() {
    if (isUserADoctor) {
      return { doctorId: currentAuthenticatedUser.id };
    } else {
      return { patientId: currentAuthenticatedUser.id };
    }
  }

  async function initialize() {
    const variables = getUserVariables();

    await fetchConversations(variables);

    await subscribeToConversationUpdates(variables);
  }

  async function getMoreConversations() {
    if (isUserADoctor) {
      if (
        res &&
        res.getConversationsFromADoctor &&
        res.getConversationsFromADoctor.nextToken
      ) {
        fetchConversations({
          ...getUserVariables(),
          nextToken: res.getConversationsFromADoctor.nextToken
        });
      }
    } else {
      if (
        res &&
        res.getConversationsFromAPatient &&
        res.getConversationsFromAPatient.nextToken
      ) {
        fetchConversations({
          ...getUserVariables(),
          nextToken: res.getConversationsFromAPatient.nextToken
        });
      }
    }
  }

  function truncate(
    str: string,
    maxLength: number = 150,
    ending: string = "..."
  ): string {
    if (str.length <= maxLength) {
      return str;
    } else {
      return str.substring(0, maxLength - ending.length) + ending;
    }
  }

  function renderConversationsList({ item }) {
    const itemIsUnread: boolean =
      isUserADoctor && item.didDoctorRead
        ? false
        : !isUserADoctor && item.didPatientRead
        ? false
        : true;

    return (
      <ListItem
        onPress={() => {
          selectConversation(item);

          navigate("Chat", {
            setConversations,
            messages:
              item.messages && item.messages.items.length
                ? item.messages.items
                : [],
            messagesNextToken: item.messages ? item.messages.nextToken : null,
            itemIsUnread,
            conversationId: item.id,
            token: isUserADoctor ? item.patient.token : item.doctor.token
          });
        }}
        style={[styles.conversation, itemIsUnread ? styles.unread : null]}
      >
        <View style={styles.listItemInnerItemContainer}>
          <Avatar
            size="small"
            shape="round"
            source={
              isUserADoctor && item.patient
                ? require("../assets/images/user.png")
                : !isUserADoctor && item.doctor && item.doctor.image
                ? { uri: item.doctor.image }
                : require("../assets/images/stethoscope.png")
            }
            resizeMode="contain"
            style={{ backgroundColor: null }}
          />

          <View style={{ paddingLeft: 20 }}>
            <Text category="s1">
              {isUserADoctor
                ? `${item.patient.firstname} ${item.patient.lastname}`
                : item.doctor.name}
            </Text>

            <Text category="c1">
              {item.messages.items.length
                ? truncate(item.messages.items[0].text, 30)
                : null}
            </Text>
          </View>
        </View>

        {itemIsUnread ? (
          <Icon
            name="alert-circle"
            color="red"
            size={20}
            type="material-community"
          />
        ) : (
          <Text category="c1">
            {moment.unix(item.messages.items[0].createdAt).format(timeFormat)}
          </Text>
        )}
      </ListItem>
    );
  }

  async function subscribeToConversationUpdates(variables) {
    await appsyncFetch({
      client,
      document: isUserADoctor
        ? SubscribeToDoctorConversationUpdates
        : SubscribeToPatientConversationUpdates,
      operationType: OperationType.subscribe,
      variables,
      next: ({ data: { onUpdateConversation } }) => {
        setConversations(currentConversations => {
          let updatedConvos = currentConversations.filter(
            convo => convo.id !== onUpdateConversation.id
          );
          updatedConvos = [onUpdateConversation, ...updatedConvos];
          return updatedConvos;
        });
      }
    });
  }

  if (!conversations.length && loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="small" color={Colors.blue} />
      </View>
    );
  }

  if (
    (!conversations.length &&
      !loading &&
      res &&
      res.getConversationsFromAPatient &&
      !res.getConversationsFromAPatient.items.length) ||
    (!conversations.length &&
      !loading &&
      res &&
      res.getConversationsFromADoctor &&
      !res.getConversationsFromADoctor.items.length)
  ) {
    const { width, height } = Dimensions;

    return (
      <ScrollView
        style={[styles.container, styles.noMessagesContainer]}
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
        <View style={{ width }}>
          <ImageBackground
            source={require("../assets/images/doctor.png")}
            style={{ width, height: height / 2 }}
            resizeMode="contain"
          />

          <Text category="s1" style={styles.noMessagesText}>
            You don't have any messages yet!
          </Text>
        </View>
      </ScrollView>
    );
  }

  return (
    <Layout style={styles.container}>
      <List
        data={conversations}
        renderItem={renderConversationsList}
        refreshing={refetching}
        onEndReached={getMoreConversations}
        onRefresh={async () => {
          setRefetching(true);
          await initialize();
          setRefetching(false);
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
  conversation: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderBottomColor: "#ddd",
    borderBottomWidth: 1,
    alignItems: "center",
    justifyContent: "space-between",
    paddingLeft: 15
  },
  listItemInnerItemContainer: {
    flexDirection: "row",
    alignItems: "center"
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20
  },
  unread: {},
  noMessagesContainer: {
    paddingTop: 15
  },
  noMessagesText: {
    alignSelf: "center",
    paddingTop: 15,
    color: "black"
  }
});
