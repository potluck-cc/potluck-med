import gql from "graphql-tag";

export default gql`
  query GetAppointmentsForDoctor(
    $doctor: ID!
    $from: AWSTimestamp!
    $to: AWSTimestamp!
  ) {
    getAppointmentsForDoctor(doctor: $doctor, from: $from, to: $to) {
      items {
        id
        date
        status
        patient {
          firstname
          lastname
          phone
          email
          token
        }
      }
      nextToken
    }
  }
`;
