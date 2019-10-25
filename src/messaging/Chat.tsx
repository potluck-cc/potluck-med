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
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";

import AppContext from "appcontext";

import client from "client";
import {
  ListAllMessagesInAConversation,
  ListUserConversationsByDoctor,
  GetConversation
} from "queries";
import {
  CreateMessage,
  CreateConversation,
  UpdateConversation
} from "mutations";
import { SubscribeToNewMessagesInAConversation } from "subscriptions";
import {
  useLazyAppSyncQuery,
  appsyncFetch,
  OperationType,
  createTimestamp
} from "@potluckmarket/ella";
import { sendPushNotification, AvoidKeyboard } from "common";
import { Analytics } from "aws-amplify";

export default memo(function Chat({ navigation: { getParam } }) {
  const previousConversationId = getParam("conversationId", null);
  // let doctor = getParam("doctor", null);
  // let patient = getParam("patient", null);
  const newConversation = getParam("newConversation", false);
  const setConversations = getParam("setConversations", () => {});
  const itemIsUnread = getParam("itemIsUnread", false);
  const initialMessages = getParam("messages", []);
  const initialMessagesNextToken = getParam("messagesNextToken", null);
  const medToken = getParam("medToken", null);
  const fromPushNotification = getParam("fromPushNotification", false);
  const setIsChat = getParam("setIsChat", () => {});

  const [doctor, setDoctor] = useState(getParam("doctor", null));
  const [patient, setPatient] = useState(getParam("patient", null));

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
          setDoctor(getConversation.doctor);
          setPatient(getConversation.patient);
          // if (!subscribed) {
          //   subscribeToNewMessages(conversationId);
          // }
        }
      }
    }

    if (isNewConversation) {
      await findConversation();
    }

    if (!subscribed && conversationId) {
      subscribeToNewMessages(conversationId);
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
    const { getConversationsByPatient } =
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
      getConversationsByPatient &&
      getConversationsByPatient.items &&
      getConversationsByPatient.items.length
    ) {
      setIsNewConversation(false);

      setConversationId(getConversationsByPatient.items[0].id);

      await fetchMessages({
        conversationId: getConversationsByPatient.items[0].id
      });

      if (!subscribed) {
        subscribeToNewMessages(getConversationsByPatient.items[0].id);
      }
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
            patient: JSON.stringify(currentAuthenticatedUser),
            doctorId: doctor.id,
            doctor: JSON.stringify(doctor)
          }
        });

        if (conversation) {
          setIsNewConversation(false);

          if (!subscribed) {
            subscribeToNewMessages(conversation.createConversation.id);
          }
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
          read: false,
          doctorId: isUserADoctor ? currentAuthenticatedUser.id : doctor.id,
          patientId: isUserADoctor ? patient.id : currentAuthenticatedUser.id
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

        if (medToken) {
          await sendPushNotification([
            {
              pushToken: medToken,
              message: `(${
                isUserADoctor
                  ? currentAuthenticatedUser.name
                  : `${currentAuthenticatedUser.firstname} ${currentAuthenticatedUser.lastname}`
              }): ${text}`,
              data: {
                screen: "Chat",
                conversationId,
                medToken: currentAuthenticatedUser.medToken
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
    try {
      if (!subscribed) {
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

        setSubscribed(true);
      }
    } catch {
      if (subscribed) {
        setSubscribed(false);
      }
    }
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
