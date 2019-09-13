import gql from "graphql-tag";

export default gql`
  query GetAppointmentsForPatient($patient: ID!) {
    getAppointmentsForPatient(patient: $patient) {
      items {
        id
        date
        status
        doctor {
          id
          name
          address
          phone
          specialty
          receiveChats
          bio
          image
          token
          insuranceAccpeted
          firstVisit
          followUp
          renewal
          bookingFee
          visitLength
        }
      }
      nextToken
    }
  }
`;
