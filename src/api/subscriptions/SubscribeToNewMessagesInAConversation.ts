import gql from "graphql-tag";

export default gql`
  subscription SubscribeToNewMessagesInAConversation($conversationId: ID) {
    onCreateMessage(conversationId: $conversationId) {
      id
      text
      sender
      createdAt
      conversationId
    }
  }
`;
