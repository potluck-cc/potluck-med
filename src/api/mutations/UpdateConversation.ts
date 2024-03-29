import gql from "graphql-tag";

export default gql`
  mutation UpdateConversation(
    $id: ID!
    $updatedAt: AWSTimestamp
    $didDoctorRead: Boolean
    $didPatientRead: Boolean
  ) {
    updateConversation(
      input: {
        id: $id
        updatedAt: $updatedAt
        didPatientRead: $didPatientRead
        didDoctorRead: $didDoctorRead
      }
    ) {
      id
      updatedAt
      patientId
      doctorId
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
