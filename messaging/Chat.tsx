import React, {
  memo,
  useRef,
  useEffect,
  useState,
  useContext,
  Fragment
} from "react";
import { StyleSheet, Platform, Keyboard, StatusBar } from "react-native";
import { List } from "react-native-ui-kitten";
import AvoidKeyboard from "../common/AvoidKeyboard";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";

import AppContext from "../AppContext";

import client from "../client";
import {
  ListAllMessagesInAConversation,
  ListUserConversationsByDoctor,
  GetConversation
} from "../queries";
import {
  CreateMessage,
  CreateConversation,
  UpdateConversation
} from "../mutations";
import { SubscribeToNewMessagesInAConversation } from "../subscriptions";
import {
  useLazyAppSyncQuery,
  appsyncFetch,
  OperationType,
  createTimestamp
} from "@potluckmarket/ella";
import { sendPushNotification } from "../common";
import { Analytics } from "aws-amplify";

export default memo(function Chat({ navigation: { getParam } }) {
  const previousConversationId = getParam("conversationId", null);
  const doctor = getParam("doctor", null);
  const newConversation = getParam("newConversation", false);
  const setConversations = getParam("setConversations", () => {});
  const itemIsUnread = getParam("itemIsUnread", false);
  const initialMessages = getParam("messages", []);
  const initialMessagesNextToken = getParam("messagesNextToken", null);
  const token = getParam("token", null);
  const fromPushNotification = getParam("fromPushNotification", false);
  const setIsChat = getParam("setIsChat", () => {});

  const {
    currentAuthenticatedUser,
    isUserADoctor,
    selectConversation,
    selectedConversation
  } = useContext(AppContext);

  const list = useRef(null);

  const [isNewConversation, setIsNewConversation] = useState(newConversation);

  const [conversationId, setConversationId] = useState(previousConversationId);

  const [text, setText] = useState("");

  const [subscribed, setSubscribed] = useState(false);

  const [res, loading, fetchMessages] = useLazyAppSyncQuery({
    client,
    document: ListAllMessagesInAConversation,
    operationType: OperationType.query,
    fetchPolicy: "network-only"
  });

  const [messages, setMessages] = useState(initialMessages);

  useEffect(() => {
    initialize();
  }, []);

  useEffect(() => {
    if (
      res &&
      res.getMessagesFromAConversation &&
      res.getMessagesFromAConversation.items &&
      res.getMessagesFromAConversation.items.length
    ) {
      setMessages(res.getMessagesFromAConversation.items);
    }
  }, [res]);

  async function initialize() {
    if (fromPushNotification) {
      await fetchMessages({
        conversationId
      });

      if (!selectedConversation) {
        const { getConversation } =
          (await appsyncFetch({
            client,
            document: GetConversation,
            operationType: OperationType.query,
            variables: {
              id: conversationId
            }
          })) || null;

        if (getConversation) {
          await selectConversation(getConversation);
          setIsChat(true);
        }
      }
    }

    if (isNewConversation) {
      await findConversation();
    }

    if (!subscribed && conversationId) {
      subscribeToNewMessages();
      setSubscribed(true);
    }

    if (itemIsUnread) {
      updateConversationSoCurrentUserHasReadIt(
        null,
        updatedConversation => {
          setConversations(currentConversations => {
            const oldConversationIndex = currentConversations.findIndex(
              convos => convos.id === updatedConversation.id
            );

            let newState = [...currentConversations];
            newState[oldConversationIndex] = updatedConversation;

            return newState;
          });
        },
        false
      );
    }
  }

  async function findConversation() {
    const { getConversationsFromAPatient } =
      (await appsyncFetch({
        client,
        operationType: OperationType.query,
        document: ListUserConversationsByDoctor,
        variables: {
          patientId: currentAuthenticatedUser.id,
          doctorId: doctor.id
        },
        fetchPolicy: "network-only"
      })) || null;

    if (
      getConversationsFromAPatient &&
      getConversationsFromAPatient.items &&
      getConversationsFromAPatient.items.length
    ) {
      setIsNewConversation(false);

      setConversationId(getConversationsFromAPatient.items[0].id);

      await fetchMessages({
        conversationId: getConversationsFromAPatient.items[0].id
      });
    }
  }

  async function sendMessage() {
    let conversation;

    const timestamp = createTimestamp();

    if (text.length) {
      setMessages(currMessages => [
        {
          text,
          sender: currentAuthenticatedUser.id,
          createdAt: timestamp
        },
        ...currMessages
      ]);

      setText("");

      if (isNewConversation) {
        conversation = await appsyncFetch({
          client,
          operationType: OperationType.mutation,
          document: CreateConversation,
          variables: {
            createdAt: timestamp,
            updatedAt: timestamp,
            patientId: currentAuthenticatedUser.id,
            patient: currentAuthenticatedUser.id,
            doctorId: doctor.id,
            doctor: doctor.id
          }
        });

        if (conversation) {
          setIsNewConversation(false);
          subscribeToNewMessages(conversation.createConversation.id);
        }
      }

      const message = await appsyncFetch({
        client,
        operationType: OperationType.mutation,
        document: CreateMessage,
        variables: {
          conversationId:
            isNewConversation && conversation
              ? conversation.createConversation.id
              : conversationId,
          text,
          sender: currentAuthenticatedUser.id,
          isSent: true,
          createdAt: timestamp,
          read: false
        }
      });

      if (message && message.createMessage) {
        Analytics.record({
          name: "messageSent"
        });

        let attributes = {};
        if (doctor) {
          attributes["doctorCounty"] = doctor.county;
          attributes["doctorSpecialty"] = doctor.specialty;
        }

        if (isUserADoctor) {
          Analytics.record({
            name: "messageSentByDoctor",
            attributes
          });
        } else {
          Analytics.record({
            name: "messageSentByPatient",
            attributes
          });
        }

        if (token) {
          await sendPushNotification([
            {
              pushToken: token,
              message: `(${
                isUserADoctor
                  ? currentAuthenticatedUser.name
                  : `${currentAuthenticatedUser.firstname} ${currentAuthenticatedUser.lastname}`
              }): ${text}`,
              data: {
                screen: "Chat",
                conversationId,
                token: currentAuthenticatedUser.token
              }
            }
          ]);
        }

        if (!isNewConversation && !conversation) {
          updateConversationSoCurrentUserHasReadIt(
            timestamp,
            updatedConversation => {
              setConversations(currentConversations => [
                updatedConversation,
                ...currentConversations.filter(
                  convos => convos.id !== updatedConversation.id
                )
              ]);
            }
          );
        }
      }
    }
  }

  async function updateConversationSoCurrentUserHasReadIt(
    timestamp,
    onUpdate = updatedConversation => {},
    messageRecentlySent = true
  ) {
    const variables = {
      id: conversationId,
      didDoctorRead: isUserADoctor
        ? true
        : messageRecentlySent
        ? false
        : undefined,
      didPatientRead: !isUserADoctor
        ? true
        : messageRecentlySent
        ? false
        : undefined
    };

    if (timestamp) {
      variables["updatedAt"] = timestamp;
    }

    const updatedConversation = await appsyncFetch({
      client,
      operationType: OperationType.mutation,
      document: UpdateConversation,
      variables
    });

    if (updatedConversation && updatedConversation.updateConversation) {
      onUpdate(updatedConversation.updateConversation);
    }
  }

  async function subscribeToNewMessages(id = null) {
    await appsyncFetch({
      client,
      document: SubscribeToNewMessagesInAConversation,
      operationType: OperationType.subscribe,
      variables: {
        conversationId: id ? id : conversationId
      },
      next: ({ data: { onCreateMessage } }) => {
        if (
          onCreateMessage &&
          onCreateMessage.sender !== currentAuthenticatedUser.id
        ) {
          setMessages(currMessages => [onCreateMessage, ...currMessages]);
          updateConversationSoCurrentUserHasReadIt(null);
        }
      }
    });
  }

  function onListContentSizeChange(): void {
    if (list) {
      setTimeout(() => list.current.scrollToEnd({ animated: true }), 0);
    }
  }

  function getKeyboardOffset(height: number): number {
    return Platform.select({
      ios: height,
      android: height + StatusBar.currentHeight
    });
  }

  function renderMessage({ item: { text, createdAt, sender } }) {
    return (
      <ChatMessage
        message={text}
        orientation={sender === currentAuthenticatedUser.id ? "right" : "left"}
      />
    );
  }

  if (Platform.OS === "web") {
    return (
      <Fragment>
        <List
          ref={list}
          inverted
          data={messages}
          renderItem={renderMessage}
          initialNumToRender={50}
          style={styles.chatContainer}
          onScroll={event => {
            const currentOffset = event.nativeEvent.contentOffset.y;
            if (currentOffset < 0) {
              Keyboard.dismiss();
            }
          }}
        />
        <ChatInput text={text} setText={setText} onSubmit={sendMessage} />
      </Fragment>
    );
  }

  return (
    <AvoidKeyboard
      autoDismiss={false}
      offset={getKeyboardOffset}
      style={styles.container}
    >
      <List
        ref={list}
        inverted
        data={messages}
        renderItem={renderMessage}
        style={styles.chatContainer}
        initialNumToRender={50}
        onEndReached={() => {
          if (initialMessagesNextToken) {
            fetchMessages({
              conversationId,
              nextToken: initialMessagesNextToken
            });
          } else if (
            res &&
            res.getMessagesFromAConversation &&
            res.getMessagesFromAConversation.nextToken
          ) {
            fetchMessages({
              conversationId,
              nextToken: res.getMessagesFromAConversation.nextToken
            });
          }
        }}
        onScroll={event => {
          const currentOffset = event.nativeEvent.contentOffset.y;
          if (currentOffset < 0) {
            Keyboard.dismiss();
          }
        }}
      />
      <ChatInput text={text} setText={setText} onSubmit={sendMessage} />
    </AvoidKeyboard>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative"
  },
  chatContainer: {
    paddingHorizontal: 16,
    backgroundColor: "white"
  }
});
