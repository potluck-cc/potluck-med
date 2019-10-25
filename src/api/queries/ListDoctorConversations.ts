import gql from "graphql-tag";

export default gql`
  query ListDoctorConversations($doctorId: ID!) {
    getConversationsByDoctor(doctorId: $doctorId) {
      items {
        id
        updatedAt
        didDoctorRead
        didPatientRead
        patient {
          id
          firstname
          lastname
          phone
          email
          medToken
        }
        doctor {
          id
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
