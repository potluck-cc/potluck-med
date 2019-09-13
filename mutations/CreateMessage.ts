import gql from "graphql-tag";

export default gql`
  mutation CreateMessage(
    $conversationId: ID!
    $createdAt: AWSTimestamp
    $sender: String
    $isSent: Boolean
    $text: String!
  ) {
    createMessage(
      input: {
        text: $text
        createdAt: $createdAt
        isSent: $isSent
        sender: $sender
        conversationId: $conversationId
      }
    ) {
      id
      sender
      conversationId
      text
      createdAt
    }
  }
`;
