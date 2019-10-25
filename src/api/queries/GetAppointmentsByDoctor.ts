import gql from "graphql-tag";

export default gql`
  query getAppointmentsByDoctor(
    $doctorId: ID!
    $from: AWSTimestamp!
    $to: AWSTimestamp!
  ) {
    getAppointmentsByDoctor(doctorId: $doctorId, from: $from, to: $to) {
      items {
        id
        date
        status
        patient {
          firstname
          lastname
          phone
          email
          medToken
        }
      }
      nextToken
    }
  }
`;
