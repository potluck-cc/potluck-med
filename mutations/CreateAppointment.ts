import gql from "graphql-tag";

export default gql`
  mutation CreateAppointment(
    $doctor: ID!
    $patient: ID!
    $createdAt: AWSTimestamp!
    $updatedAt: AWSTimestamp
    $status: AppointmentStatus!
    $date: AWSTimestamp!
  ) {
    createAppointment(
      input: {
        doctor: $doctor
        patient: $patient
        createdAt: $createdAt
        updatedAt: $updatedAt
        status: $status
        date: $date
      }
    ) {
      id
    }
  }
`;
