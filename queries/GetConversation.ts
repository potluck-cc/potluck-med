import gql from "graphql-tag";

export default gql`
  query GetConversation($id: ID!) {
    getConversation(id: $id) {
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
      doctor {
        id
        name
        image
        token
      }
    }
  }
`;
