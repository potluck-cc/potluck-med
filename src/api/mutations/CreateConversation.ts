import gql from "graphql-tag";

export default gql`
  mutation CreateConversation(
    $createdAt: AWSTimestamp
    $updatedAt: AWSTimestamp
    $patientId: ID!
    $doctorId: ID!
    $patient: AWSJSON!
    $doctor: AWSJSON!
  ) {
    createConversation(
      input: {
        createdAt: $createdAt
        updatedAt: $updatedAt
        patientId: $patientId
        doctorId: $doctorId
        patient: $patient
        doctor: $doctor
        didDoctorRead: false
        didPatientRead: true
      }
    ) {
      id
    }
  }
`;
