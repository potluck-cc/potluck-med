import gql from "graphql-tag";

export default gql`
  mutation CreateAppointment(
    $doctorId: ID!
    $patientId: ID!
    $doctor: AWSJSON!
    $patient: AWSJSON!
    $createdAt: AWSTimestamp!
    $updatedAt: AWSTimestamp
    $status: AppointmentStatus!
    $date: AWSTimestamp!
  ) {
    createAppointment(
      input: {
        doctor: $doctor
        doctorId: $doctorId
        patient: $patient
        patientId: $patientId
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
