import gql from "graphql-tag";

export default gql`
  mutation CreateMessage(
    $conversationId: ID!
    $createdAt: AWSTimestamp
    $sender: String
    $isSent: Boolean
    $text: String!
    $patientId: ID!
    $doctorId: ID!
  ) {
    createMessage(
      input: {
        text: $text
        createdAt: $createdAt
        isSent: $isSent
        sender: $sender
        conversationId: $conversationId
        patientId: $patientId
        doctorId: $doctorId
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
