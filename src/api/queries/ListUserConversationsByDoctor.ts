import gql from "graphql-tag";

export default gql`
  query ListUserConversations($patientId: ID!, $doctorId: ID) {
    getConversationsByPatient(
      patientId: $patientId
      filter: { doctorId: { eq: $doctorId } }
    ) {
      items {
        id
      }
    }
  }
`;
