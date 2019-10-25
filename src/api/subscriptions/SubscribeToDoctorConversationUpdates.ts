import gql from "graphql-tag";

export default gql`
  subscription SubscribeToConversationUpdates($doctorId: ID) {
    onUpdateConversation(doctorId: $doctorId) {
      id
      updatedAt
      patientId
      doctorId
      patient {
        id
        firstname
        lastname
        phone
        email
        medToken
      }
      messages(limit: 10) {
        items {
          id
          text
          createdAt
          sender
        }
        nextToken
      }
    }
  }
`;
