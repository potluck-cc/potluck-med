import gql from "graphql-tag";

export default gql`
  query ListUserConversations($patientId: ID!, $doctorId: ID) {
    getConversationsFromAPatient(
      patientId: $patientId
      filter: { doctorId: { eq: $doctorId } }
    ) {
      items {
        id
      }
    }
  }
`;
