import gql from "graphql-tag";

export default gql`
  subscription SubscribeToConversationUpdates($patientId: ID) {
    onUpdateConversation(patientId: $patientId) {
      id
      updatedAt
      patientId
      doctorId
      patient {
        firstname
        lastname
      }
      doctor {
        id
        name
        image
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
