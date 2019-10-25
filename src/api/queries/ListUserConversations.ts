import gql from "graphql-tag";

export default gql`
  query ListUserConversations($patientId: ID!) {
    getConversationsByPatient(patientId: $patientId) {
      items {
        id
        updatedAt
        didDoctorRead
        didPatientRead
        patient {
          id
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
      nextToken
    }
  }
`;
