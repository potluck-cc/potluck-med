import gql from "graphql-tag";

export default gql`
  query ListAllMessagesInAConversation($conversationId: ID!) {
    getMessagesFromAConversation(conversationId: $conversationId) {
      items {
        id
        text
        sender
        createdAt
      }
      nextToken
    }
  }
`;
