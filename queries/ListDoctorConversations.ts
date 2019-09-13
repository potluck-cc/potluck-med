import gql from "graphql-tag";

export default gql`
  query ListDoctorConversations($doctorId: ID!) {
    getConversationsFromADoctor(doctorId: $doctorId) {
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
          token
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
